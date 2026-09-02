import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { registerAndLogin } from "../helpers/auth";
import { createProject } from "../helpers/project";
import { db } from "../../database/db";
import { cleanDatabase, closeDb } from "../helpers/testDb";


import { notificationEmitter } from '../../services/notification.emitter';
import { vi } from 'vitest';

afterAll(async () => {
    await cleanDatabase()
    await closeDb();
});



it('should create a notification when a member is invited', async () => {
    const leader = await registerAndLogin("budiman");
    const projectId = await createProject(leader.cookie);
    const invitee = await registerAndLogin("sari");
    const invitation = await request(app)
        .post(`/api/v1/projects/${projectId.projectResult.body.data.id}/invitations`)
        .set('Cookie', leader.cookie)
        .send({ userId: invitee.userId });

    const notification = await db('notifications')
        .where({ userId: invitee.userId })
        .first();
    expect(notification).toBeDefined();
    expect(notification.referenceId).toBe(projectId.projectResult.body.data.id);
    expect(notification.isRead).toBe(false);
});




it('should emit a real-time event when a member is invited', async () => {
    const leader = await registerAndLogin("budiman");
    const projectId = await createProject(leader.cookie);
    const invitee = await registerAndLogin("sari");

    const emitSpy = vi.spyOn(notificationEmitter, 'emit');

    await request(app)
        .post(`/api/v1/projects/${projectId.projectResult.body.data.id}/invitations`)
        .set('Cookie', leader.cookie)
        .send({ userId: invitee.userId });

    expect(emitSpy).toHaveBeenCalledWith(
        `user:${invitee.userId}`,
        expect.objectContaining({ type: 'member_invited' })
    );

    emitSpy.mockRestore();
});