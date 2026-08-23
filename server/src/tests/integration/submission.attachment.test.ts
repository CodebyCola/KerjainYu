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

import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
    s3,
    STORAGE_BUCKET,
} from "../../config/storage";

import { PutObjectCommand } from "@aws-sdk/client-s3";


async function createTaskWithSubmission() {
    const leader = await registerAndLogin(
        `file_leader_${Date.now()}`,
    );

    const project = await createProject(
        leader.cookie,
    );

    const projectId =
        project.projectResult.body.data.id;

    const member = await inviteAndAccept(
        leader.cookie,
        projectId,
        `file_member_${Date.now()}`,
    );

    const taskRes = await createTask(
        leader.cookie,
        projectId,
        {
            title: "File Submission Task",
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
                note: "Submission with file.",
            },
        );

    expect(submissionRes.status).toBe(201);

    return {
        leader,
        member,
        projectId,
        taskId,
        submissionId:
            submissionRes.body.data.id,
    };
}

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

async function registerAttachment(
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
        .send(attachment);
}

afterAll(async () => {
    await closeDb();
});

describe(
    "Submission File Attachment Integration",
    () => {
        beforeEach(async () => {
            await cleanDatabase();
        });

        // =====================================================
        // REQUEST UPLOAD URL
        // =====================================================

        describe(
            "POST /api/v1/submissions/:id/attachments/upload-url",
            () => {
                it(
                    "should generate a presigned upload URL",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
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

                        expect(res.status)
                            .toBe(200);

                        expect(
                            res.body.success,
                        ).toBe(true);

                        expect(
                            res.body.data.uploadUrl,
                        ).toBeDefined();

                        expect(
                            typeof res.body
                                .data.uploadUrl,
                        ).toBe("string");

                        expect(
                            res.body.data.objectKey,
                        ).toBeDefined();

                        expect(
                            res.body.data.objectKey,
                        ).toMatch(
                            new RegExp(
                                `^submissions/${submissionId}/`,
                            ),
                        );
                    },
                );

                it(
                    "should reject upload URL request from non-assignee",
                    async () => {
                        const {
                            leader,
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const stranger =
                            await registerAndLogin(
                                `file_stranger_${Date.now()}`,
                            );

                        const res =
                            await requestUploadUrl(
                                stranger.cookie,
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

                        expect(res.status)
                            .toBe(403);

                        expect(
                            res.body.error.code,
                        ).toBe("FORBIDDEN");
                    },
                );

                it(
                    "should reject upload URL request for non-existent submission",
                    async () => {
                        const member =
                            await registerAndLogin(
                                `file_not_found_${Date.now()}`,
                            );

                        const res =
                            await requestUploadUrl(
                                member.cookie,
                                999999999,
                                {
                                    type: "file",
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize: 1000,
                                },
                            );

                        expect(res.status)
                            .toBe(404);

                        expect(
                            res.body.error.code,
                        ).toBe("NOT_FOUND");
                    },
                );

                it(
                    "should reject invalid file size",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const res =
                            await requestUploadUrl(
                                member.cookie,
                                submissionId,
                                {
                                    type: "file",
                                    fileName:
                                        "huge.zip",
                                    mimeType:
                                        "application/zip",
                                    fileSize:
                                        11 *
                                        1024 *
                                        1024,
                                },
                            );

                        expect(res.status)
                            .toBe(400);

                        expect(
                            res.body.error.code,
                        ).toBe(
                            "VALIDATION_ERROR",
                        );
                    },
                );
            },
        );

        // =====================================================
        // REGISTER FILE ATTACHMENT
        // =====================================================

        describe(
            "POST /api/v1/submissions/:id/attachments",
            () => {
                it(
                    "should register uploaded file metadata",
                    async () => {
                        const {
                            member,
                            submissionId: rawSubmissionId,
                        } = await createTaskWithSubmission();

                        const submissionId = Number(rawSubmissionId);
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

                        const {
                            uploadUrl,
                            objectKey,
                        } =
                            uploadRes.body.data;

                        const attachmentRes =
                            await registerAttachment(
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
                            attachmentRes.body.data,
                        ).toEqual(
                            expect.objectContaining(
                                {
                                    submissionId,
                                    type: "file",
                                    objectKey,
                                    fileName:
                                        "report.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize:
                                        2458123,
                                },
                            ),
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
                            await registerAttachment(
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
                                    fileSize:
                                        1000,
                                },
                            );

                        expect(res.status)
                            .toBe(403);

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
                            await registerAttachment(
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
                                    fileSize:
                                        1000,
                                },
                            );

                        expect(res.status)
                            .toBe(403);

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
                            await registerAttachment(
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
                                    fileSize:
                                        1000,
                                },
                            );

                        expect(res.status)
                            .toBe(409);

                        expect(
                            res.body.error.code,
                        ).toBe("CONFLICT");
                    },
                );
            },
        );

        // =====================================================
        // MULTIPLE FILES
        // =====================================================

        describe(
            "Multiple file attachments",
            () => {
                it(
                    "should allow multiple files on one submission",
                    async () => {
                        const {
                            member,
                            submissionId,
                        } =
                            await createTaskWithSubmission();

                        const files = [
                            {
                                type: "file" as const,
                                fileName:
                                    "report.pdf",
                                mimeType:
                                    "application/pdf",
                                fileSize: 1000,
                            },
                            {
                                type: "file" as const,
                                fileName:
                                    "source.zip",
                                mimeType:
                                    "application/zip",
                                fileSize: 2000,
                            },
                            {
                                type: "image" as const,
                                fileName:
                                    "preview.png",
                                mimeType:
                                    "image/png",
                                fileSize: 3000,
                            },
                        ];

                        const uploaded = [];

                        for (const file of files) {
                            const uploadRes =
                                await requestUploadUrl(
                                    member.cookie,
                                    submissionId,
                                    file,
                                );

                            expect(
                                uploadRes.status,
                            ).toBe(200);

                            const {
                                uploadUrl,
                                objectKey,
                            } =
                                uploadRes.body.data;

                            expect(
                                objectKey,
                            ).toMatch(
                                new RegExp(
                                    `^submissions/${submissionId}/`,
                                ),
                            );

                            const attachmentRes =
                                await registerAttachment(
                                    member.cookie,
                                    submissionId,
                                    {
                                        ...file,
                                        objectKey,
                                    },
                                );

                            expect(
                                attachmentRes.status,
                            ).toBe(201);

                            uploaded.push(
                                attachmentRes.body
                                    .data,
                            );
                        }

                        expect(
                            uploaded,
                        ).toHaveLength(3);

                        const attachments =
                            await db(
                                "submission_attachments",
                            )
                                .where({
                                    submissionId,
                                });

                        expect(
                            attachments,
                        ).toHaveLength(3);

                        expect(
                            attachments.map(
                                (a) =>
                                    a.fileName,
                            ),
                        ).toEqual(
                            expect.arrayContaining(
                                [
                                    "report.pdf",
                                    "source.zip",
                                    "preview.png",
                                ],
                            ),
                        );
                    },
                );
            },
        );

        // =====================================================
        // AUTHENTICATION
        // =====================================================

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
                                    fileSize:
                                        1000,
                                });

                        expect(res.status)
                            .toBe(401);
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
                                    type: "file",
                                    objectKey:
                                        "submissions/1/file.pdf",
                                    fileName:
                                        "file.pdf",
                                    mimeType:
                                        "application/pdf",
                                    fileSize:
                                        1000,
                                });

                        expect(res.status)
                            .toBe(401);
                    },
                );
            },
        );
    },
);

describe("Submission File Upload End-to-End Integration", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    describe(
        "POST /api/v1/submissions/:id/attachments/upload-url → Object Storage → POST /attachments",
        () => {
            it("should upload the actual file to object storage and register its metadata", async () => {
                const {
                    member,
                    submissionId: rawSubmissionId,
                } = await createTaskWithSubmission();

                const submissionId = Number(rawSubmissionId);

                // ─────────────────────────────────────────────
                // Fake file content
                // ─────────────────────────────────────────────

                const fileContent = Buffer.from(
                    "Hello from KerjainYu integration test!",
                    "utf-8",
                );

                const fileName = "report.txt";
                const mimeType = "text/plain";

                // ─────────────────────────────────────────────
                // 1. Request presigned upload URL
                // ─────────────────────────────────────────────

                const uploadUrlRes =
                    await requestUploadUrl(
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

                expect(
                    uploadUrlRes.body.success,
                ).toBe(true);

                const {
                    uploadUrl,
                    objectKey,
                } = uploadUrlRes.body.data;

                expect(uploadUrl).toEqual(
                    expect.any(String),
                );

                expect(objectKey).toEqual(
                    expect.stringContaining(
                        `submissions/${submissionId}/`,
                    ),
                );

                // ─────────────────────────────────────────────
                // 2. Upload actual binary directly
                //    to object storage
                // ─────────────────────────────────────────────

                const storageUploadRes =
                    await fetch(uploadUrl, {
                        method: "PUT",
                        headers: {
                            "Content-Type": mimeType,
                        },
                        body: fileContent,
                    });

                expect(
                    storageUploadRes.ok,
                ).toBe(true);

                // ─────────────────────────────────────────────
                // 3. Verify object actually exists
                //    in object storage
                // ─────────────────────────────────────────────

                const headObject =
                    await s3.send(
                        new HeadObjectCommand({
                            Bucket: STORAGE_BUCKET,
                            Key: objectKey,
                        }),
                    );

                expect(headObject.ContentLength).toBe(
                    fileContent.length,
                );

                expect(
                    headObject.ContentType,
                ).toBe(mimeType);

                // ─────────────────────────────────────────────
                // 4. Register uploaded file metadata
                // ─────────────────────────────────────────────

                const attachmentRes =
                    await registerAttachment(
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

                // ─────────────────────────────────────────────
                // 5. Verify database metadata
                // ─────────────────────────────────────────────

                expect(
                    attachmentRes.body.data,
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
            });
        },
    );
});

describe(
    "GET /api/v1/submissions/:id/attachments",
    () => {
        beforeEach(async () => {
            await cleanDatabase();
        });
        it(
            "should return all attachments for a submission",
            async () => {
                const {
                    member,
                    submissionId,
                } = await createTaskWithSubmission();

                const textAttachment =
                    await request(app)
                        .post(
                            `/api/v1/submissions/${submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        )
                        .send({
                            type: "text",
                            content:
                                "This is my submission",
                        });

                const linkAttachment =
                    await request(app)
                        .post(
                            `/api/v1/submissions/${submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        )
                        .send({
                            type: "link",
                            content:
                                "https://figma.com/design/test",
                        });
                console.log(textAttachment.error)
                expect(
                    textAttachment.status,
                ).toBe(201);

                expect(
                    linkAttachment.status,
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

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(
                    res.body.data,
                ).toHaveLength(2);

                expect(
                    res.body.data,
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            submissionId:
                                Number(
                                    submissionId,
                                ),
                            type: "text",
                            content:
                                "This is my submission",
                        }),
                        expect.objectContaining({
                            submissionId:
                                Number(
                                    submissionId,
                                ),
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
                } = await createTaskWithSubmission();

                const res =
                    await request(app)
                        .get(
                            `/api/v1/submissions/${submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        );

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data).toEqual([]);
            },
        );

        it(
            "should reject unauthenticated request",
            async () => {
                const {
                    submissionId,
                } = await createTaskWithSubmission();

                const res =
                    await request(app).get(
                        `/api/v1/submissions/${submissionId}/attachments`,
                    );

                expect(res.status).toBe(401);
            },
        );

        it(
            "should reject non-existent submission",
            async () => {
                const {
                    member,
                } = await createTaskWithSubmission();

                const res =
                    await request(app)
                        .get(
                            "/api/v1/submissions/999999/attachments",
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        );

                expect(res.status).toBe(404);
            },
        );
    },
);

describe(
    "DELETE /api/v1/submissions/:id/attachments/:attachmentId",
    () => {
        beforeEach(async () => {
            await cleanDatabase();
        });
        it(
            "should delete text attachment",
            async () => {
                const {
                    member,
                    submissionId,
                } = await createTaskWithSubmission();

                const submissionRes =
                    await request(app)
                        .post(
                            `/api/v1/tasks/${submissionId}/submissions`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        )
                        .send({
                            note: "Submission",
                            contents: [
                                {
                                    type: "text",
                                    content:
                                        "Delete me",
                                },
                            ],
                        });

                expect(
                    submissionRes.status,
                ).toBe(201);

                const attachmentsRes =
                    await request(app)
                        .get(
                            `/api/v1/submissions/${submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        );

                const attachment =
                    attachmentsRes.body.data[0];

                const deleteRes =
                    await request(app)
                        .delete(
                            `/api/v1/submissions/${submissionId}/attachments/${attachment.id}`,
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

                const submissionRes =
                    await request(app)
                        .post(
                            `/api/v1/tasks/${first.taskId}/submissions`,
                        )
                        .set(
                            "Cookie",
                            first.member.cookie,
                        )
                        .send({
                            note: "Submission",
                            contents: [
                                {
                                    type: "text",
                                    content:
                                        "Private attachment",
                                },
                            ],
                        });

                expect(
                    submissionRes.status,
                ).toBe(201);

                const attachmentsRes =
                    await request(app)
                        .get(
                            `/api/v1/submissions/${first.submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            first.member.cookie,
                        );

                const attachment =
                    attachmentsRes.body.data[0];

                const deleteRes =
                    await request(app)
                        .delete(
                            `/api/v1/submissions/${second.submissionId}/attachments/${attachment.id}`,
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
                } = await createTaskWithSubmission();

                const unauthorizedMember =
                    await inviteAndAccept(
                        leader.cookie,
                        projectId,
                        `file_unauthorized_${Date.now()}`,
                    );

                const submissionRes =
                    await request(app)
                        .get(
                            `/api/v1/submissions/${submissionId}/attachments`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        );

                expect(submissionRes.status).toBe(200);

                const attachment =
                    submissionRes.body.data[0];

                const deleteRes =
                    await request(app)
                        .delete(
                            `/api/v1/submissions/${submissionId}/attachments/${attachment.id}`,
                        )
                        .set(
                            "Cookie",
                            unauthorizedMember.cookie,
                        );

                expect(deleteRes.status).toBe(403);
            },
        );
        it(
            "should reject unauthenticated delete",
            async () => {
                const {
                    submissionId,
                } = await createTaskWithSubmission();

                const res =
                    await request(app)
                        .delete(
                            `/api/v1/submissions/${submissionId}/attachments/1`,
                        );

                expect(res.status).toBe(401);
            },
        );

        it(
            "should reject non-existent attachment",
            async () => {
                const {
                    member,
                    submissionId,
                } = await createTaskWithSubmission();

                const res =
                    await request(app)
                        .delete(
                            `/api/v1/submissions/${submissionId}/attachments/999999`,
                        )
                        .set(
                            "Cookie",
                            member.cookie,
                        );

                expect(res.status).toBe(404);
            },
        );
    },
);