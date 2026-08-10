import { db } from '../../database/db';

export async function cleanDatabase() {
    // urutan: tabel "anak" duluan, baru "induk" — sesuai foreign key
    // await db('notifications').del();
    // await db('comments_task').del();
    // await db('task_appeals').del();
    // await db('submission_attachments').del();
    // await db('task_submissions').del();
    // await db('task_swap_requests').del();
    // await db('task_ownership_log').del();
    // await db('tasks').del();
    await db('project_links').del();
    await db('project_members').del();
    await db('projects').del();
    await db('users').del();
}

export async function closeDb() {
    await db.destroy();
}