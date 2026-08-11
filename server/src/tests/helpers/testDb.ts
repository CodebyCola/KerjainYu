// src/tests/helpers/testDb.ts
import { db } from '../../database/db';

export async function cleanDatabase() {
    // console.log(`[${new Date().toISOString()}] cleanDatabase() START`);
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