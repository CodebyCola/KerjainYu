import { describe, it, expect, afterAll, beforeEach } from "vitest";
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
    reviewSubmission,
    getPendingSubmissions,
} from "../helpers/submission";

import {
    cleanDatabase,
    closeDb,
} from "../helpers/testDb";

afterAll(async () => {
    await closeDb();
});
describe("Task Submission Integration", () => {

    beforeEach(async () => {
        await cleanDatabase();
    });


    // =========================================================
    // CREATE SUBMISSION
    // =========================================================

    describe("POST /api/v1/tasks/:id/submissions", () => {

        it("should create a submission successfully with a note", async () => {
            const leader = await registerAndLogin(
                "submission_leader_1",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_1",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Design Homepage ",
                isClaimable: false,
            },
            );

            expect(taskRes.status).toBe(201);

            const taskId = taskRes.body.data.id;

            const assignRes = await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            expect(assignRes.status).toBe(200);

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "ongoing",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Sudah selesai dikerjakan.",
                },
            );

            expect(submissionRes.status).toBe(201);
            expect(submissionRes.body.success).toBe(true);

            expect(submissionRes.body.data).toEqual(
                expect.objectContaining({
                    taskId,
                    submittedBy: member.userId,
                    note: "Sudah selesai dikerjakan.",
                    reviewStatus: "pending",
                }),
            );

            expect(
                submissionRes.body.data.id,
            ).toBeDefined();

            // Verify task status changed to submitted.
            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("submitted");
        });


        it("should create a submission without a note", async () => {
            const leader = await registerAndLogin(
                "submission_leader_2",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_2",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "No Note Task",
            },
            );

            const taskId = taskRes.body.data.id;

            const assignRes = await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            expect(assignRes.status).toBe(200);

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "ongoing",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
            );

            expect(submissionRes.status).toBe(201);
            expect(submissionRes.body.success).toBe(true);

            expect(submissionRes.body.data).toEqual(
                expect.objectContaining({
                    taskId,
                    submittedBy: member.userId,
                    reviewStatus: "pending",
                }),
            );

            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("submitted");
        });


        it("should allow submission when task is in_revision", async () => {
            const leader = await registerAndLogin(
                "submission_leader_3",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_3",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Revision Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "in_revision",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Sudah diperbaiki sesuai feedback.",
                },
            );

            expect(submissionRes.status).toBe(201);
            expect(submissionRes.body.success).toBe(true);

            expect(
                submissionRes.body.data.reviewStatus,
            ).toBe("pending");

            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("submitted");
        });


        it("should reject submission from a non-assignee", async () => {
            const leader = await registerAndLogin(
                "submission_leader_4",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const userA = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_4a",
            );

            const userB = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_4b",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Assigned Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                userA.userId,
            );

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "ongoing",
                });

            const submissionRes = await createSubmission(
                userB.cookie,
                taskId,
                {
                    note: "Saya mencoba submit task orang lain.",
                },
            );

            expect(submissionRes.status).toBe(403);

            expect(
                submissionRes.body.error.code,
            ).toBe("FORBIDDEN");
        });


        it("should reject submission when task is still todo", async () => {
            const leader = await registerAndLogin(
                "submission_leader_5",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_5",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Todo Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Task masih todo.",
                },
            );

            expect(submissionRes.status).toBe(409);

            expect(
                submissionRes.body.error.code,
            ).toBe("CONFLICT");
        });


        it("should reject submission when task is already submitted", async () => {
            const leader = await registerAndLogin(
                "submission_leader_6",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_6",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Already Submitted Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "submitted",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Trying again.",
                },
            );

            expect(submissionRes.status).toBe(409);

            expect(
                submissionRes.body.error.code,
            ).toBe("CONFLICT");
        });


        it("should reject submission when task is approved", async () => {
            const leader = await registerAndLogin(
                "submission_leader_7",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_7",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Approved Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "approved",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
            );

            expect(submissionRes.status).toBe(409);

            expect(
                submissionRes.body.error.code,
            ).toBe("CONFLICT");
        });


        it("should reject submission when task is rejected", async () => {
            const leader = await registerAndLogin(
                "submission_leader_8",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_8",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Rejected Task",
            },
            );

            const taskId = taskRes.body.data.id;

            await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );

            await db("tasks")
                .where({ id: taskId })
                .update({
                    status: "rejected",
                });

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
            );

            expect(submissionRes.status).toBe(409);

            expect(
                submissionRes.body.error.code,
            ).toBe("CONFLICT");
        });


        it("should reject submission for a non-existent task", async () => {
            const member = await registerAndLogin(
                "submission_member_9",
            );

            const submissionRes = await createSubmission(
                member.cookie,
                999999999,
                {
                    note: "Task does not exist.",
                },
            );

            expect(submissionRes.status).toBe(404);

            expect(
                submissionRes.body.error.code,
            ).toBe("NOT_FOUND");
        });


        it("should reject unauthenticated submission", async () => {
            const res = await request(app)
                .post("/api/v1/tasks/1/submissions")
                .send({
                    note: "Unauthenticated submission.",
                });

            expect(res.status).toBe(401);
        });


        it("should reject an invalid task id", async () => {
            const member = await registerAndLogin(
                "submission_member_10",
            );

            const res = await request(app)
                .post("/api/v1/tasks/not-a-number/submissions")
                .set("Cookie", member.cookie)
                .send({
                    note: "Invalid task ID.",
                });

            expect(res.status).toBe(400);
        });


        it("should reject a note longer than 1000 characters", async () => {
            const member = await registerAndLogin(
                "submission_member_11",
            );

            const res = await request(app)
                .post("/api/v1/tasks/1/submissions")
                .set("Cookie", member.cookie)
                .send({
                    note: "a".repeat(1001),
                });

            expect(res.status).toBe(400);
        });


        it("should reject unknown fields in the submission body", async () => {
            const member = await registerAndLogin(
                "submission_member_12",
            );

            const res = await request(app)
                .post("/api/v1/tasks/1/submissions")
                .set("Cookie", member.cookie)
                .send({
                    note: "Valid note.",
                    unexpectedField: "should fail",
                });

            expect(res.status).toBe(400);
        });


        it("should reject an empty note", async () => {
            const leader = await registerAndLogin(
                "submission_leader_1",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;


            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Design Homepage ",
                isClaimable: false,
            },
            );

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "submission_member_13",
            );

            expect(taskRes.status).toBe(201);

            const taskId = taskRes.body.data.id;

            const assignRes = await assignTask(
                leader.cookie,
                taskId,
                member.userId,
            );
            await request(app)
                .patch(`/api/v1/tasks/${taskId}/ongoing`)
                .set("Cookie", member.cookie);
            const res = await request(app)
                .post(`/api/v1/tasks/${taskId}/submissions`)
                .set("Cookie", member.cookie)
                .send({
                    note: "       ",
                });

            expect(res.status).toBe(400);
        });
    });


    // =========================================================
    // REVIEW SUBMISSION
    // =========================================================

    describe("PATCH /api/v1/submissions/:id/review", () => {

        async function createPendingSubmission() {
            const leader = await registerAndLogin(
                `review_leader_${Date.now()}`,
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                `review_member_${Date.now()}`,
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Review Task",
            },
            );

            const taskId = taskRes.body.data.id;

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

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Submission for review.",
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


        it("should approve a pending submission", async () => {
            const {
                leader,
                taskId,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );
            expect(reviewRes.status).toBe(200);
            expect(reviewRes.body.success).toBe(true);

            expect(reviewRes.body.data).toEqual(
                expect.objectContaining({
                    id: submissionId,
                    reviewStatus: "approved",
                    reviewedBy: leader.userId,
                }),
            );

            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("approved");
        });


        it("should request revision for a pending submission", async () => {
            const {
                leader,
                taskId,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "revision_requested",
                    reviewNote:
                        "Tolong perbaiki bagian responsive mobile.",
                },
            );

            expect(reviewRes.status).toBe(200);
            expect(reviewRes.body.success).toBe(true);

            expect(reviewRes.body.data).toEqual(
                expect.objectContaining({
                    id: submissionId,
                    reviewStatus: "revision_requested",
                    reviewNote:
                        "Tolong perbaiki bagian responsive mobile.",
                    reviewedBy: leader.userId,
                }),
            );

            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("in_revision");
        });


        it("should reject a pending submission", async () => {
            const {
                leader,
                taskId,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "rejected",
                    reviewNote:
                        "Requirement utama belum terpenuhi.",
                },
            );

            expect(reviewRes.status).toBe(200);
            expect(reviewRes.body.success).toBe(true);

            expect(reviewRes.body.data).toEqual(
                expect.objectContaining({
                    id: submissionId,
                    reviewStatus: "rejected",
                    reviewNote:
                        "Requirement utama belum terpenuhi.",
                    reviewedBy: leader.userId,
                }),
            );

            const task = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(task.status).toBe("rejected");
        });


        it("should reject review from a non-project leader", async () => {
            const {
                member,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                member.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );

            expect(reviewRes.status).toBe(403);

            expect(
                reviewRes.body.error.code,
            ).toBe("FORBIDDEN");
        });


        it("should reject review of a non-existent submission", async () => {
            const leader = await registerAndLogin(
                "review_leader_not_found",
            );

            const reviewRes = await reviewSubmission(
                leader.cookie,
                999999999,
                {
                    reviewStatus: "approved",
                },
            );

            expect(reviewRes.status).toBe(404);

            expect(
                reviewRes.body.error.code,
            ).toBe("NOT_FOUND");
        });


        it("should reject unauthenticated review", async () => {
            const res = await request(app)
                .patch("/api/v1/submissions/1/review")
                .send({
                    reviewStatus: "approved",
                });

            expect(res.status).toBe(401);
        });


        it("should reject invalid submission id", async () => {
            const leader = await registerAndLogin(
                "review_leader_invalid_id",
            );

            const res = await request(app)
                .patch(
                    "/api/v1/submissions/not-a-number/review",
                )
                .set("Cookie", leader.cookie)
                .send({
                    reviewStatus: "approved",
                });

            expect(res.status).toBe(400);
        });


        it("should reject invalid review status", async () => {
            const leader = await registerAndLogin(
                "review_leader_invalid_status",
            );

            const res = await request(app)
                .patch("/api/v1/submissions/1/review")
                .set("Cookie", leader.cookie)
                .send({
                    reviewStatus: "invalid_status",
                });

            expect(res.status).toBe(400);
        });


        it("should require reviewNote when requesting revision", async () => {
            const {
                leader,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "revision_requested",
                },
            );

            expect(reviewRes.status).toBe(400);
        });


        it("should require reviewNote when rejecting a submission", async () => {
            const {
                leader,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "rejected",
                },
            );

            expect(reviewRes.status).toBe(400);
        });


        it("should allow review without reviewNote when approving", async () => {
            const {
                leader,
                submissionId,
            } = await createPendingSubmission();

            const reviewRes = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );

            expect(reviewRes.status).toBe(200);
        });


        it("should reject reviewing an already approved submission", async () => {
            const {
                leader,
                submissionId,
            } = await createPendingSubmission();

            const firstReview = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );

            expect(firstReview.status).toBe(200);

            const secondReview = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "rejected",
                    reviewNote: "Trying to review again.",
                },
            );

            expect(secondReview.status).toBe(409);

            expect(
                secondReview.body.error.code,
            ).toBe("CONFLICT");
        });


        it("should reject reviewing an already rejected submission", async () => {
            const {
                leader,
                submissionId,
            } = await createPendingSubmission();

            const firstReview = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "rejected",
                    reviewNote: "Rejected.",
                },
            );

            expect(firstReview.status).toBe(200);

            const secondReview = await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );

            expect(secondReview.status).toBe(409);
        });
    });


    // =========================================================
    // PENDING SUBMISSIONS
    // =========================================================

    describe("GET /api/v1/projects/:id/pending-submissions", () => {

        it("should return pending submissions for project leader", async () => {
            const leader = await registerAndLogin(
                "pending_leader_1",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "pending_member_1",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId,
                {
                    title: "Pending Review task",
                    isClaimable: false,
                },
            );

            const taskId = taskRes.body.data.id;

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

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Waiting for review.",
                },
            );

            expect(submissionRes.status).toBe(201);

            const pendingRes = await getPendingSubmissions(
                leader.cookie,
                projectId,
            );

            expect(pendingRes.status).toBe(200);
            expect(pendingRes.body.success).toBe(true);

            expect(pendingRes.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: submissionRes.body.data.id,
                        taskId,
                        taskTitle: "Pending Review task",
                        reviewStatus: "pending",
                    }),
                ]),
            );
        });


        it("should not return reviewed submissions", async () => {
            const leader = await registerAndLogin(
                "pending_leader_2",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "pending_member_2",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Reviewed Task",
            },
            );

            const taskId = taskRes.body.data.id;

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

            const submissionRes = await createSubmission(
                member.cookie,
                taskId,
                {
                    note: "Ready for review.",
                },
            );

            const submissionId =
                submissionRes.body.data.id;

            await reviewSubmission(
                leader.cookie,
                submissionId,
                {
                    reviewStatus: "approved",
                },
            );

            const pendingRes = await getPendingSubmissions(
                leader.cookie,
                projectId,
            );

            expect(pendingRes.status).toBe(200);

            expect(
                pendingRes.body.data.some(
                    (submission: { id: number }) =>
                        submission.id === submissionId,
                ),
            ).toBe(false);
        });


        it("should reject pending submissions request from non-leader", async () => {
            const leader = await registerAndLogin(
                "pending_leader_3",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "pending_member_3",
            );

            const pendingRes =
                await getPendingSubmissions(
                    member.cookie,
                    projectId,
                );

            expect(pendingRes.status).toBe(403);

            expect(
                pendingRes.body.error.code,
            ).toBe("FORBIDDEN");
        });


        it("should reject unauthenticated pending submissions request", async () => {
            const leader = await registerAndLogin(
                "pending_leader_4",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const res = await request(app)
                .get(
                    `/api/v1/projects/${projectId}/pending-submissions`,
                );

            expect(res.status).toBe(401);
        });


        it("should reject a non-existent project", async () => {
            const leader = await registerAndLogin(
                "pending_leader_5",
            );

            const res = await getPendingSubmissions(
                leader.cookie,
                999999999,
            );

            expect(res.status).toBe(404);
        });


        it("should reject an invalid project id", async () => {
            const leader = await registerAndLogin(
                "pending_leader_6",
            );

            const res = await request(app)
                .get(
                    "/api/v1/projects/not-a-number/pending-submissions",
                )
                .set("Cookie", leader.cookie);

            expect(res.status).toBe(400);
        });
    });


    // =========================================================
    // RESUBMISSION AFTER REVISION
    // =========================================================

    describe("Submission revision flow", () => {

        it("should allow a member to resubmit after revision is requested", async () => {
            const leader = await registerAndLogin(
                "resubmit_leader",
            );

            const project = await createProject(
                leader.cookie,
            );

            const projectId =
                project.projectResult.body.data.id;

            const member = await inviteAndAccept(
                leader.cookie,
                projectId,
                "resubmit_member",
            );

            const taskRes = await createTask(
                leader.cookie,
                projectId, {
                title: "Resubmission Task",
            },
            );

            const taskId = taskRes.body.data.id;

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

            // First submission
            const firstSubmission =
                await createSubmission(
                    member.cookie,
                    taskId,
                    {
                        note: "First version.",
                    },
                );

            expect(firstSubmission.status).toBe(201);

            const firstSubmissionId =
                firstSubmission.body.data.id;

            // Leader requests revision
            const reviewRes = await reviewSubmission(
                leader.cookie,
                firstSubmissionId,
                {
                    reviewStatus: "revision_requested",
                    reviewNote:
                        "Tolong perbaiki bagian dashboard.",
                },
            );

            expect(reviewRes.status).toBe(200);

            // Task should now be in_revision
            const taskAfterReview = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(taskAfterReview.status).toBe(
                "in_revision",
            );

            // Member submits again
            const secondSubmission =
                await createSubmission(
                    member.cookie,
                    taskId,
                    {
                        note: "Dashboard sudah diperbaiki.",
                    },
                );

            expect(secondSubmission.status).toBe(201);
            expect(
                secondSubmission.body.success,
            ).toBe(true);

            expect(secondSubmission.body.data).toEqual(
                expect.objectContaining({
                    taskId,
                    submittedBy: member.userId,
                    note: "Dashboard sudah diperbaiki.",
                    reviewStatus: "pending",
                }),
            );

            expect(
                secondSubmission.body.data.id,
            ).not.toBe(firstSubmissionId);

            const finalTask = await db("tasks")
                .where({ id: taskId })
                .first();

            expect(finalTask.status).toBe("submitted");
        });
    });
});