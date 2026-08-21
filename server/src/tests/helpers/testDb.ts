// src/tests/helpers/testDb.ts
import { db } from '../../database/db';

export async function cleanDatabase() {
    // console.log(`[${new Date().toISOString()}] cleanDatabase() START`);
    await db('submission_attachments').del();
    await db('comments_task').del();
    await db('task_ownership_log').del();
    await db('task_appeals').del();
    await db('task_submissions').del();
    await db('task_swap_requests').del();
    await db('tasks').del();
    await db('project_links').del();
    await db('project_members').del();
    await db('projects').del();
    await db('users').del();
    // console.log(`[${new Date().toISOString()}] cleanDatabase() END`);
}

export async function closeDb() {
    console.log(`[${new Date().toISOString()}] closeDb() called`);
    await db.destroy();
}