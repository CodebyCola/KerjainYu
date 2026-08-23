import {
    describe,
    it,
    expect,
    beforeEach,
    afterAll,
} from "vitest";
import request from "supertest";

import app from "../../app";
import { db } from "../../database/db";

import {
    registerAndLogin,
} from "../helpers/auth";

import {
    createProject,
    inviteAndAccept,
} from "../helpers/project";

import {
    createTask,
    assignTask,
} from "../helpers/task";

import {
    createSubmission,
} from "../helpers/submission";

import {
    cleanDatabase,
    closeDb,
} from "../helpers/testDb";

import {
    HeadObjectCommand,
} from "@aws-sdk/client-s3";

import {
    s3,
    STORAGE_BUCKET,
} from "../../config/storage";

// ============================================================
// HELPERS
// ============================================================

async function createTaskWithSubmission() {
    const leader = await registerAndLogin(
        `attachment_leader_${Date.now()}`,
    );

    const project = await createProject(
        leader.cookie,
    );

    const projectId =
        project.projectResult.body.data.id;

    const member = await inviteAndAccept(
        leader.cookie,
        projectId,
        `attachment_member_${Date.now()}`,
    );

    const taskRes = await createTask(
        leader.cookie,
        projectId,
        {
            title: "Attachment Submission Task",
            isClaimable: false,
        },
    );

    const taskId =
        taskRes.body.data.id;

    await assignTask(
        leader.cookie,
        taskId,
        member.userId,
    );

    await db("tasks")
        .where({ id: taskId })
        .update({
            status: "ongoing",
        });

    const submissionRes =
        await createSubmission(
            member.cookie,
            taskId,
            {
                note: "Submission for attachment testing.",
            },
        );

    expect(submissionRes.status).toBe(201);

    return {
        leader,
        member,
        projectId,
        taskId,
        submissionId:
            Number(submissionRes.body.data.id),
    };
}

// ============================================================
// REQUEST PRESIGNED UPLOAD URL
// ============================================================

async function requestUploadUrl(
    cookie: string,
    submissionId: number,
    file: {
        type: "file" | "image";
        fileName: string;
        mimeType: string;
        fileSize: number;
    },
) {
    return request(app)
        .post(
            `/api/v1/submissions/${submissionId}/attachments/upload-url`,
        )
        .set("Cookie", cookie)
        .send(file);
}

// ============================================================
// REGISTER FILE ATTACHMENT
// ============================================================

async function registerFileAttachment(
    cookie: string,
    submissionId: number,
    attachment: {
        type: "file" | "image";
        objectKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
    },
) {
    return request(app)
        .post(
            `/api/v1/submissions/${submissionId}/attachments`,
        )
        .set("Cookie", cookie)
        .send({
            content: null,
            file: attachment,
        });
}

// ============================================================
// REGISTER CONTENT ATTACHMENT
// ============================================================

async function registerContentAttachment(
    cookie: string,
    submissionId: number,
    content: {
        type: "text" | "link";
        content: string;
    },
) {
    return request(app)
        .post(
            `/api/v1/submissions/${submissionId}/attachments`,
        )
        .set("Cookie", cookie)
        .send({
            content,
            file: null,
        });
}

// ============================================================
// TEST SUITE
// ============================================================

afterAll(async () => {
    await closeDb();
});
describe(
    "Submission Attachment Integration",
    () => {
        beforeEach(async () => {
            await cleanDatabase();
        });


        // ====================================================
        // POST /attachments
        // CONTENT ATTACHMENT
        // ====================================================

        describe(
            "POST /api/v1/submissions/:id/attachments - Content",
            () => {
                it(
                    "should create a text content attachment",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content:
                                        "This is my submission.",
                                },
                            );

                        expect(res.status).toBe(201);

                        expect(
                            res.body.success,
                        ).toBe(true);

                        expect(
                            res.body.data.contentAttachment,
                        ).toEqual(
                            expect.objectContaining({
                                submissionId,
                                type: "text",
                                content:
                                    "This is my submission.",
                            }),
                        );

                        expect(
                            res.body.data.fileAttachment,
                        ).toBeNull();

                        const attachments =
                            await db(
                                "submission_attachments",
                            ).where({
                                submissionId,
                            });

                        expect(
                            attachments,
                        ).toHaveLength(1);

                        expect(
                            attachments[0],
                        ).toEqual(
                            expect.objectContaining({
                                submissionId:
                                    String(
                                        submissionId,
                                    ),
                                type: "text",
                                content:
                                    "This is my submission.",
                            }),
                        );
                    },
                );

                it(
                    "should create a link content attachment",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "link",
                                    content:
                                        "https://figma.com/design/test",
                                },
                            );

                        expect(res.status).toBe(201);

                        expect(
                            res.body.success,
                        ).toBe(true);

                        expect(
                            res.body.data.contentAttachment,
                        ).toEqual(
                            expect.objectContaining({
                                submissionId,
                                type: "link",
                                content:
                                    "https://figma.com/design/test",
                            }),
                        );

                        expect(
                            res.body.data.fileAttachment,
                        ).toBeNull();
                    },
                );

                it(
                    "should reject empty content",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content: "",
                                },
                            );

                        expect(res.status).toBe(400);

                        expect(
                            res.body.error.code,
                        ).toBe(
                            "VALIDATION_ERROR",
                        );
                    },
                );
            },
        );

        // ====================================================
        // POST /attachments
        // FILE ATTACHMENT
        // ====================================================

        describe(
            "POST /api/v1/submissions/:id/attachments - File",
            () => {
                it(
                    "should register uploaded file metadata",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        // ------------------------------------
                        // 1. Request presigned URL
                        // ------------------------------------

                        const uploadRes =
                            await requestUploadUrl(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize:
                                        2458123,
                                },
                            );

                        expect(
                            uploadRes.status,
                        ).toBe(200);

                        expect(
                            uploadRes.body.success,
                        ).toBe(true);

                        const {
                            uploadUrl,
                            objectKey,
                        } =
                            uploadRes.body.data;

                        expect(
                            uploadUrl,
                        ).toEqual(
                            expect.any(String),
                        );

                        expect(
                            objectKey,
                        ).toMatch(
                            new RegExp(
                                `^submissions/${submissionId}/`,
                            ),
                        );

                        // ------------------------------------
                        // 2. Register metadata
                        // ------------------------------------

                        const attachmentRes =
                            await registerFileAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey,
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize:
                                        2458123,
                                },
                            );

                        expect(
                            attachmentRes.status,
                        ).toBe(201);

                        expect(
                            attachmentRes.body.success,
                        ).toBe(true);

                        expect(
                            attachmentRes.body.data
                                .contentAttachment,
                        ).toBeNull();

                        expect(
                            attachmentRes.body.data
                                .fileAttachment,
                        ).toEqual(
                            expect.objectContaining({
                                submissionId,
                                type: "file",
                                objectKey,
                                fileName:
                                    "report.pdf",
                                mimeType:
                                    "application/pdf",
                                fileSize:
                                    2458123,
                            }),
                        );
                    },
                );

                it(
                    "should reject object key belonging to another submission",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await registerFileAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey:
                                        "submissions/999999/fake.pdf",
                                    fileName:
                                        "fake.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(res.status).toBe(403);

                        expect(
                            res.body.error.code,
                        ).toBe("FORBIDDEN");
                    },
                );

                it(
                    "should reject attachment from non-assignee",
                    async () => {
                        const {
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const stranger =
                            await registerAndLogin(
                                `attachment_stranger_${Date.now()}`,
                            );

                        const res =
                            await registerFileAttachment(
                                stranger.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey:
                                        `submissions/${submissionId}/fake.pdf`,
                                    fileName:
                                        "fake.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(res.status).toBe(403);

                        expect(
                            res.body.error.code,
                        ).toBe("FORBIDDEN");
                    },
                );

                it(
                    "should reject attachment on approved submission",
                    async () => {
                        const {
                            leader,
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const reviewRes =
                            await request(app)
                                .patch(
                                    `/api/v1/submissions/${submissionId}/review`,
                                )
                                .set(
                                    "Cookie",
                                    leader.cookie,
                                )
                                .send({
                                    reviewStatus:
                                        "approved",
                                });

                        expect(
                            reviewRes.status,
                        ).toBe(200);

                        const res =
                            await registerFileAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey:
                                        `submissions/${submissionId}/fake.pdf`,
                                    fileName:
                                        "fake.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(res.status).toBe(409);

                        expect(
                            res.body.error.code,
                        ).toBe("CONFLICT");
                    },
                );
            },
        );

        // ====================================================
        // VALIDATION
        // ====================================================

        describe(
            "POST /api/v1/submissions/:id/attachments - Validation",
            () => {
                it(
                    "should reject when both content and file are null",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app)
                                .post(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                )
                                .send({
                                    content: null,
                                    file: null,
                                });

                        expect(res.status).toBe(400);

                        expect(
                            res.body.error.code,
                        ).toBe(
                            "VALIDATION_ERROR",
                        );
                    },
                );

                it(
                    "should reject request without content and file",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app)
                                .post(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                )
                                .send({});

                        expect(res.status).toBe(400);

                        expect(
                            res.body.error.code,
                        ).toBe(
                            "VALIDATION_ERROR",
                        );
                    },
                );
            },
        );

        // ====================================================
        // MULTIPLE ATTACHMENTS
        // ====================================================

        describe(
            "Multiple attachments",
            () => {
                it(
                    "should allow multiple attachments on one submission",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const textRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content:
                                        "My submission text.",
                                },
                            );

                        expect(
                            textRes.status,
                        ).toBe(201);

                        const linkRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "link",
                                    content:
                                        "https://figma.com/design/test",
                                },
                            );

                        expect(
                            linkRes.status,
                        ).toBe(201);

                        const uploadRes =
                            await requestUploadUrl(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(
                            uploadRes.status,
                        ).toBe(200);

                        const {
                            objectKey,
                        } =
                            uploadRes.body.data;

                        const fileRes =
                            await registerFileAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey,
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(
                            fileRes.status,
                        ).toBe(201);

                        const attachments =
                            await db(
                                "submission_attachments",
                            ).where({
                                submissionId,
                            });

                        expect(
                            attachments,
                        ).toHaveLength(3);

                        expect(
                            attachments.map(
                                (attachment) =>
                                    attachment.type,
                            ),
                        ).toEqual(
                            expect.arrayContaining([
                                "text",
                                "link",
                                "file",
                            ]),
                        );
                    },
                );
            },
        );

        // ====================================================
        // GET /attachments
        // ====================================================

        describe(
            "GET /api/v1/submissions/:id/attachments",
            () => {
                it(
                    "should return all attachments for a submission",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        // Text
                        const textRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content:
                                        "This is my submission",
                                },
                            );

                        expect(
                            textRes.status,
                        ).toBe(201);

                        // Link
                        const linkRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "link",
                                    content:
                                        "https://figma.com/design/test",
                                },
                            );

                        expect(
                            linkRes.status,
                        ).toBe(201);

                        const res =
                            await request(app)
                                .get(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            res.status,
                        ).toBe(200);

                        expect(
                            res.body.success,
                        ).toBe(true);

                        expect(
                            res.body.data,
                        ).toHaveLength(2);

                        expect(
                            res.body.data,
                        ).toEqual(
                            expect.arrayContaining([
                                expect.objectContaining({
                                    submissionId,
                                    type: "text",
                                    content:
                                        "This is my submission",
                                }),

                                expect.objectContaining({
                                    submissionId,
                                    type: "link",
                                    content:
                                        "https://figma.com/design/test",
                                }),
                            ]),
                        );
                    },
                );

                it(
                    "should return empty array when submission has no attachments",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app)
                                .get(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            res.status,
                        ).toBe(200);

                        expect(
                            res.body.success,
                        ).toBe(true);

                        expect(
                            res.body.data,
                        ).toEqual([]);
                    },
                );

                it(
                    "should reject unauthenticated request",
                    async () => {
                        const {
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app).get(
                                `/api/v1/submissions/${submissionId}/attachments`,
                            );

                        expect(
                            res.status,
                        ).toBe(401);
                    },
                );

                it(
                    "should reject non-existent submission",
                    async () => {
                        const {
                            member,
                        } =
                            await createTaskWithSubmission();
                        const submissionId = Number(9999999)
                        const res =
                            await request(app)
                                .get(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            res.status,
                        ).toBe(404);
                    },
                );
            },
        );

        // ====================================================
        // DELETE /attachments/:attachmentId
        // ====================================================

        describe(
            "DELETE /api/v1/submissions/:id/attachments/:attachmentId",
            () => {
                it(
                    "should delete text attachment",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const createRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content:
                                        "Delete me",
                                },
                            );

                        expect(
                            createRes.status,
                        ).toBe(201);

                        const attachmentId =
                            createRes.body.data
                                .contentAttachment.id;

                        const deleteRes =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${submissionId}/attachments/${attachmentId}`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            deleteRes.status,
                        ).toBe(204);

                        const afterDelete =
                            await request(app)
                                .get(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            afterDelete.status,
                        ).toBe(200);

                        expect(
                            afterDelete.body.data,
                        ).toEqual([]);
                    },
                );

                it(
                    "should delete file attachment",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const uploadRes =
                            await requestUploadUrl(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    fileName:
                                        "delete-me.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(
                            uploadRes.status,
                        ).toBe(200);

                        const {
                            objectKey,
                        } =
                            uploadRes.body.data;

                        const createRes =
                            await registerFileAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    objectKey,
                                    fileName:
                                        "delete-me.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(
                            createRes.status,
                        ).toBe(201);

                        const attachmentId =
                            createRes.body.data
                                .fileAttachment.id;

                        const deleteRes =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${submissionId}/attachments/${attachmentId}`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            deleteRes.status,
                        ).toBe(204);

                        const afterDelete =
                            await request(app)
                                .get(
                                    `/api/v1/submissions/${submissionId}/attachments`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            afterDelete.body.data,
                        ).toEqual([]);
                    },
                );

                it(
                    "should reject deleting attachment belonging to another submission",
                    async () => {
                        const first =
                            await createTaskWithSubmission();

                        const second =
                            await createTaskWithSubmission();

                        const createRes =
                            await registerContentAttachment(
                                first.member.cookie,
                                first.submissionId,
                                {
                                    type: "text",
                                    content:
                                        "Private attachment",
                                },
                            );

                        expect(
                            createRes.status,
                        ).toBe(201);

                        const attachmentId =
                            createRes.body.data
                                .contentAttachment.id;

                        const deleteRes =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${second.submissionId}/attachments/${attachmentId}`,
                                )
                                .set(
                                    "Cookie",
                                    second.member.cookie,
                                );

                        expect(
                            deleteRes.status,
                        ).toBe(404);
                    },
                );

                it(
                    "should reject deleting attachment from unauthorized member",
                    async () => {
                        const {
                            leader,
                            member,
                            projectId,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const unauthorizedMember =
                            await inviteAndAccept(
                                leader.cookie,
                                projectId,
                                `unauthorized_${Date.now()}`,
                            );

                        const createRes =
                            await registerContentAttachment(
                                member.cookie,
                                submissionId,
                                {
                                    type: "text",
                                    content:
                                        "Private attachment",
                                },
                            );

                        expect(
                            createRes.status,
                        ).toBe(201);

                        const attachmentId =
                            createRes.body.data
                                .contentAttachment.id;

                        const deleteRes =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${submissionId}/attachments/${attachmentId}`,
                                )
                                .set(
                                    "Cookie",
                                    unauthorizedMember.cookie,
                                );

                        expect(
                            deleteRes.status,
                        ).toBe(403);
                    },
                );
                it("should delete file attachment from both database and object storage", async () => {
                    const {
                        member,
                        submissionId,
                    } = await createTaskWithSubmission();

                    const fileContent = Buffer.from(
                        "File to be deleted",
                        "utf-8",
                    );

                    const fileName = "delete-me.txt";
                    const mimeType = "text/plain";

                    // 1. Get presigned URL
                    const uploadUrlRes = await requestUploadUrl(
                        member.cookie,
                        submissionId,
                        {
                            type: "file",
                            fileName,
                            mimeType,
                            fileSize: fileContent.length,
                        },
                    );

                    expect(uploadUrlRes.status).toBe(200);

                    const {
                        uploadUrl,
                        objectKey,
                    } = uploadUrlRes.body.data;

                    // 2. Upload actual file
                    const uploadRes = await fetch(uploadUrl, {
                        method: "PUT",
                        headers: {
                            "Content-Type": mimeType,
                        },
                        body: fileContent,
                    });

                    expect(uploadRes.ok).toBe(true);

                    // 3. Verify object exists
                    const headBeforeDelete =
                        await s3.send(
                            new HeadObjectCommand({
                                Bucket: STORAGE_BUCKET,
                                Key: objectKey,
                            }),
                        );

                    expect(headBeforeDelete.ContentLength).toBe(
                        fileContent.length,
                    );

                    // 4. Register metadata
                    const attachmentRes =
                        await registerFileAttachment(
                            member.cookie,
                            submissionId,
                            {
                                type: "file",
                                objectKey,
                                fileName,
                                mimeType,
                                fileSize: fileContent.length,
                            },
                        );
                    expect(attachmentRes.status).toBe(201);

                    const attachmentId =
                        attachmentRes.body.data.fileAttachment.id;
                    // 5. Delete attachment
                    const deleteRes =
                        await request(app)
                            .delete(
                                `/api/v1/submissions/${submissionId}/attachments/${attachmentId}`,
                            )
                            .set(
                                "Cookie",
                                member.cookie,
                            );
                    console.log(deleteRes.body)
                    expect(deleteRes.status).toBe(204);

                    // 6. Verify DB metadata is gone
                    const dbAttachment =
                        await db("submission_attachments")
                            .where({ id: attachmentId })
                            .first();

                    expect(dbAttachment).toBeUndefined();

                    // 7. Verify object is gone
                    await expect(
                        s3.send(
                            new HeadObjectCommand({
                                Bucket: STORAGE_BUCKET,
                                Key: objectKey,
                            }),
                        ),
                    ).rejects.toThrow();
                });
                it(
                    "should reject unauthenticated delete",
                    async () => {
                        const {
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${submissionId}/attachments/1`,
                                );

                        expect(
                            res.status,
                        ).toBe(401);
                    },
                );

                it(
                    "should reject non-existent attachment",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await request(app)
                                .delete(
                                    `/api/v1/submissions/${submissionId}/attachments/999999`,
                                )
                                .set(
                                    "Cookie",
                                    member.cookie,
                                );

                        expect(
                            res.status,
                        ).toBe(404);
                    },
                );
            },

        );


        // ====================================================
        // AUTHENTICATION
        // ====================================================

        describe(
            "Authentication",
            () => {
                it(
                    "should reject unauthenticated upload URL request",
                    async () => {
                        const res =
                            await request(app)
                                .post(
                                    "/api/v1/submissions/1/attachments/upload-url",
                                )
                                .send({
                                    type: "file",
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                });

                        expect(
                            res.status,
                        ).toBe(401);
                    },
                );

                it(
                    "should reject unauthenticated attachment registration",
                    async () => {
                        const res =
                            await request(app)
                                .post(
                                    "/api/v1/submissions/1/attachments",
                                )
                                .send({
                                    content: {
                                        type: "text",
                                        content:
                                            "Unauthenticated",
                                    },
                                    file: null,
                                });

                        expect(
                            res.status,
                        ).toBe(401);
                    },
                );
            },
        );
    },
);

// ============================================================
// END-TO-END FILE UPLOAD
//
// Presigned URL
//      ↓
// Object Storage
//      ↓
// Register Metadata
// ============================================================

describe(
    "Submission File Upload End-to-End Integration",
    () => {
        beforeEach(async () => {
            await cleanDatabase();
        });

        it(
            "should upload the actual file to object storage and register its metadata",
            async () => {
                const {
                    member,
                    submissionId,
                } =
                    await createTaskWithSubmission();

                // ------------------------------------------------
                // Fake file content
                // ------------------------------------------------
                console.log("Submission Id : ", submissionId)
                const fileContent = Buffer.from(
                    "Hello from KerjainYu integration test!",
                    "utf-8",
                );

                const fileName = "report.txt";
                const mimeType = "text/plain";

                // ------------------------------------------------
                // 1. Request presigned upload URL
                // ------------------------------------------------

                const uploadUrlRes =
                    await requestUploadUrl(
                        member.cookie,
                        submissionId,
                        {
                            type: "file",
                            fileName,
                            mimeType,
                            fileSize:
                                fileContent.length,
                        },
                    );

                expect(
                    uploadUrlRes.status,
                ).toBe(200);

                expect(
                    uploadUrlRes.body.success,
                ).toBe(true);

                const {
                    uploadUrl,
                    objectKey,
                } =
                    uploadUrlRes.body.data;

                expect(
                    uploadUrl,
                ).toEqual(
                    expect.any(String),
                );

                expect(
                    objectKey,
                ).toEqual(
                    expect.stringContaining(
                        `submissions/${submissionId}/`,
                    ),
                );

                // ------------------------------------------------
                // 2. Upload actual binary
                // ------------------------------------------------

                const storageUploadRes =
                    await fetch(uploadUrl, {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                mimeType,
                        },
                        body: fileContent,
                    });

                expect(
                    storageUploadRes.ok,
                ).toBe(true);

                // ------------------------------------------------
                // 3. Verify object exists
                // ------------------------------------------------

                const headObject =
                    await s3.send(
                        new HeadObjectCommand({
                            Bucket:
                                STORAGE_BUCKET,
                            Key: objectKey,
                        }),
                    );

                expect(
                    headObject.ContentLength,
                ).toBe(
                    fileContent.length,
                );

                expect(
                    headObject.ContentType,
                ).toBe(mimeType);

                // ------------------------------------------------
                // 4. Register metadata
                // ------------------------------------------------

                const attachmentRes =
                    await registerFileAttachment(
                        member.cookie,
                        submissionId,
                        {
                            type: "file",
                            objectKey,
                            fileName,
                            mimeType,
                            fileSize:
                                fileContent.length,
                        },
                    );

                expect(
                    attachmentRes.status,
                ).toBe(201);

                expect(
                    attachmentRes.body.success,
                ).toBe(true);

                expect(
                    attachmentRes.body.data
                        .contentAttachment,
                ).toBeNull();

                expect(
                    attachmentRes.body.data
                        .fileAttachment,
                ).toEqual(
                    expect.objectContaining({
                        submissionId,
                        type: "file",
                        objectKey,
                        fileName,
                        mimeType,
                        fileSize:
                            fileContent.length,
                    }),
                );

                // ------------------------------------------------
                // 5. Verify database
                // ------------------------------------------------

                const attachment =
                    await db(
                        "submission_attachments",
                    )
                        .where({
                            id: Number(
                                attachmentRes.body
                                    .data
                                    .fileAttachment
                                    .id,
                            ),
                        })
                        .first();

                expect(
                    attachment,
                ).toEqual(
                    expect.objectContaining({
                        submissionId:
                            String(
                                submissionId,
                            ),
                        type: "file",
                        objectKey,
                        fileName,
                        mimeType,
                        fileSize:
                            String(
                                fileContent.length,
                            ),
                    }),
                );
            },
        );
    },
);