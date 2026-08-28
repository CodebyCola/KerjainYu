/**
 * Seed data MASSAL — untuk testing FE dengan volume data besar (pagination,
 * infinite scroll, list panjang, dsb). Dijalankan lewat Knex CLI, bypass
 * wrapIdentifier di db.ts, jadi SEMUA nama kolom di file ini WAJIB snake_case
 * sesuai kolom asli database (bukan camelCase).
 *
 * PENTING: file ini menghapus SEMUA data yang ada sebelum generate ulang.
 * Kalau ada seed file lain (mis. 01_seed_kerjainyu.js), HAPUS atau ganti nama
 * file itu supaya tidak konflik (Knex menjalankan semua file *.js di folder
 * seeds/ secara berurutan sesuai nama file, dan del() di file ini akan
 * menghapus data yang di-insert file lain kalau urutannya salah).
 *
 * Cara jalanin:
 *   npm run db:seed           (development)
 *   npm run test:db:seed      (kalau ada script serupa untuk test db)
 *
 * Sesuaikan angka di bagian CONFIG kalau mau lebih banyak/sedikit.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const bcrypt = require("bcrypt");
const crypto = require("crypto");

// ─────────────────────────────────────────────
// CONFIG — atur volume data di sini
// ─────────────────────────────────────────────
const CONFIG = {
    USERS: 80,
    PROJECTS: 25,
    MEMBERS_PER_PROJECT: [4, 10], // [min, max]
    LINKS_PER_PROJECT: [1, 4],
    TASKS_PER_PROJECT: [15, 40],
    COMMENTS_PER_TASK: [0, 6],
    SWAP_REQUESTS: 150,
    APPEALS: 50,
    NOTIFICATIONS: 600,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
    return arr[randomInt(0, arr.length - 1)];
}
function pickMany(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}
function weightedPick(pairs) {
    const total = pairs.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;
    for (const [value, w] of pairs) {
        if (r < w) return value;
        r -= w;
    }
    return pairs[pairs.length - 1][0];
}
function randomDate(daysFromNow) {
    const [minDays, maxDays] = daysFromNow;
    const days = randomInt(minDays, maxDays);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}
function uuid() {
    return crypto.randomUUID();
}

const FIRST_NAMES = ["Budi", "Sari", "Andi", "Citra", "Eko", "Dewi", "Rian", "Nadia", "Fajar", "Lina", "Agus", "Rina", "Dedi", "Wulan", "Bayu", "Indah", "Fikri", "Putri", "Hendra", "Maya", "Rizky", "Sinta", "Doni", "Farah", "Iwan", "Tania", "Yoga", "Vina", "Adi", "Kartika"];
const LAST_NAMES = ["Santoso", "Wijaya", "Pratama", "Dewi", "Prasetyo", "Kurniawan", "Saputra", "Utami", "Hidayat", "Lestari", "Setiawan", "Anggraini", "Nugroho", "Wardani", "Firmansyah"];
const PROJECT_ADJ = ["Redesign", "Revamp", "MVP", "Platform", "System", "Dashboard", "App", "Portal", "Tools", "Migration"];
const PROJECT_NOUN = ["Website", "Mobile", "Internal", "Marketing", "Sales", "HR", "Inventory", "Customer Support", "Analytics", "Payment", "Booking", "E-Commerce"];
const TASK_VERBS = ["Implement", "Design", "Fix", "Setup", "Refactor", "Test", "Optimize", "Write", "Review", "Deploy", "Integrate", "Document"];
const TASK_NOUNS = ["navbar component", "login page", "database schema", "API endpoint", "CI/CD pipeline", "unit tests", "landing page", "payment flow", "user dashboard", "notification system", "search feature", "onboarding flow", "email templates", "error handling", "caching layer"];
const LINK_LABELS = [["Figma Design", "design"], ["GitHub Repo", "development"], ["Requirement Doc", "docs"], ["Staging Server", "development"], ["Design System", "design"], ["API Documentation", "docs"], ["Trello Board", "other"]];
const COMMENT_TEMPLATES = [
    "Progress gimana? deadline udah dekat",
    "Masih dikerjain, kemungkinan selesai besok",
    "Sudah aku update, cek lagi ya",
    "Ada blocker nih, nunggu asset dari tim lain",
    "Oke siap, lanjut kerjain",
    "Bisa dijelasin lagi requirement-nya?",
    "Udah sesuai belum ya sama design-nya?",
    "Perlu bantuan buat bagian ini",
    "Sip, mantap kerjaannya",
    "Ini kayaknya perlu direvisi dikit",
];

exports.seed = async function (knex) {
    console.log("🧹 Membersihkan data lama...");
    // await knex("notifications").del();
    await knex("comments_task").del();
    await knex("task_appeals").del();
    await knex("submission_attachments").del();
    await knex("task_submissions").del();
    await knex("task_swap_requests").del();
    await knex("task_ownership_log").del();
    await knex("tasks").del();
    await knex("project_links").del();
    await knex("project_members").del();
    await knex("projects").del();
    await knex("users").del();

    const passwordHash = await bcrypt.hash("Password123", 10);

    // ─────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────
    console.log(`👤 Generate ${CONFIG.USERS} users...`);
    const usernamesUsed = new Set();
    const userRows = [];
    for (let i = 0; i < CONFIG.USERS; i++) {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        let username = `${first.toLowerCase()}${last.toLowerCase()}${randomInt(1, 999)}`;
        while (usernamesUsed.has(username)) {
            username = `${first.toLowerCase()}${last.toLowerCase()}${randomInt(1, 9999)}`;
        }
        usernamesUsed.add(username);
        userRows.push({
            username,
            password: passwordHash,
            email: `${username}@mail.com`,
            full_name: `${first} ${last}`,
            avatar_url: Math.random() > 0.4 ? `https://i.pravatar.cc/150?u=${username}` : null,
        });
    }
    // user khusus buat login manual pas testing FE
    userRows.unshift({
        username: "demo",
        password: passwordHash,
        email: "demo@mail.com",
        full_name: "Demo User",
        avatar_url: "https://i.pravatar.cc/150?u=demo",
    });
    const users = await knex("users").insert(userRows).returning(["id", "username"]);
    const userIds = users.map((u) => u.id);
    console.log(`   ✓ ${users.length} users dibuat (login demo: username "demo", password "Password123")`);

    // ─────────────────────────────────────────────
    // PROJECTS + PROJECT_MEMBERS + PROJECT_LINKS
    // ─────────────────────────────────────────────
    console.log(`📁 Generate ${CONFIG.PROJECTS} projects...`);
    const projectRows = [];
    for (let i = 0; i < CONFIG.PROJECTS; i++) {
        const status = weightedPick([["ongoing", 7], ["completed", 3]]);
        const isArchived = status === "completed" && Math.random() > 0.5;
        projectRows.push({
            title: `${pick(PROJECT_NOUN)} ${pick(PROJECT_ADJ)}`,
            status,
            allow_free_swap: Math.random() > 0.5,
            deadline: randomDate([-30, 90]),
            is_archived: isArchived,
            is_archived_at: isArchived ? randomDate([-20, -1]) : null,
        });
    }
    const projects = await knex("projects").insert(projectRows).returning(["id"]);

    const allTaskIds = [];
    const allSubmissions = []; // { id, taskId, projectId, submittedBy }
    const projectMemberMap = {}; // projectId -> { leaderId, memberIds: [] (active only) }

    for (const project of projects) {
        const projectId = project.id;
        const memberCount = randomInt(...CONFIG.MEMBERS_PER_PROJECT);
        const chosenUsers = pickMany(userIds, memberCount);
        const leaderId = chosenUsers[0];
        const otherUsers = chosenUsers.slice(1);

        const memberRows = [
            { project_id: projectId, user_id: leaderId, role: "leader", status: "active", joined_at: randomDate([-90, -30]) },
        ];
        const activeMemberIds = [leaderId];
        for (const uid of otherUsers) {
            const status = weightedPick([["active", 8], ["invited", 1], ["removed", 0.5], ["rejected", 0.5]]);
            memberRows.push({
                project_id: projectId,
                user_id: uid,
                role: "member",
                status,
                joined_at: randomDate([-90, -1]),
            });
            if (status === "active") activeMemberIds.push(uid);
        }
        await knex("project_members").insert(memberRows);
        projectMemberMap[projectId] = { leaderId, memberIds: activeMemberIds };

        // LINKS
        const linkCount = randomInt(...CONFIG.LINKS_PER_PROJECT);
        const linkRows = pickMany(LINK_LABELS, linkCount).map(([label, category]) => ({
            project_id: projectId,
            label,
            url: `https://example.com/${uuid()}`,
            category,
            added_by: pick(activeMemberIds),
        }));
        if (linkRows.length > 0) await knex("project_links").insert(linkRows);

        // TASKS
        const taskCount = randomInt(...CONFIG.TASKS_PER_PROJECT);
        const taskRows = [];
        for (let i = 0; i < taskCount; i++) {
            const status = weightedPick([
                ["unclaimed", 2], ["todo", 3], ["ongoing", 3],
                ["submitted", 2], ["in_revision", 1], ["approved", 2], ["rejected", 1],
            ]);
            const isUnclaimed = status === "unclaimed";
            taskRows.push({
                title: `${pick(TASK_VERBS)} ${pick(TASK_NOUNS)}`,
                description: Math.random() > 0.3 ? `Detail pekerjaan untuk task ini, sesuaikan dengan requirement project.` : null,
                status,
                priority: Math.random() > 0.4 ? randomInt(1, 5) : null,
                display_order: i,
                project_id: projectId,
                deadline: Math.random() > 0.2 ? randomDate([-15, 45]) : null,
                assignee_id: isUnclaimed ? null : pick(activeMemberIds),
                created_by: leaderId,
                is_claimable: isUnclaimed || Math.random() > 0.7,
                created_at: randomDate([-60, -1]),
            });
        }
        const insertedTasks = await knex("tasks").insert(taskRows).returning(["id", "status", "assignee_id"]);
        allTaskIds.push(...insertedTasks.map((t) => t.id));

        // TASK_OWNERSHIP_LOG untuk task yang punya assignee
        const ownershipLogRows = insertedTasks
            .filter((t) => t.assignee_id)
            .map((t) => ({
                task_id: t.id,
                from_user_id: null,
                to_user_id: t.assignee_id,
                reason: weightedPick([["assigned", 6], ["claimed", 4]]),
                changed_at: randomDate([-60, -1]),
            }));
        if (ownershipLogRows.length > 0) await knex("task_ownership_log").insert(ownershipLogRows);

        // TASK_SUBMISSIONS untuk task yang statusnya butuh submission
        const tasksNeedingSubmission = insertedTasks.filter((t) =>
            ["submitted", "in_revision", "approved", "rejected"].includes(t.status)
        );
        for (const task of tasksNeedingSubmission) {
            const reviewStatus = task.status === "submitted" ? "pending" : task.status === "in_revision" ? "revision_requested" : task.status;
            const [submission] = await knex("task_submissions")
                .insert({
                    task_id: task.id,
                    submitted_by: task.assignee_id,
                    note: "Sudah selesai dikerjakan, mohon direview.",
                    review_status: reviewStatus,
                    review_note: reviewStatus !== "pending" ? "Catatan review dari leader untuk submission ini." : null,
                    reviewed_by: reviewStatus !== "pending" ? leaderId : null,
                    reviewed_at: reviewStatus !== "pending" ? randomDate([-10, -1]) : null,
                    submitted_at: randomDate([-20, -1]),
                })
                .returning(["id"]);
            allSubmissions.push({ id: submission.id, taskId: task.id, projectId, submittedBy: task.assignee_id });
        }

        // COMMENTS
        const commentRows = [];
        for (const task of insertedTasks) {
            const commentCount = randomInt(...CONFIG.COMMENTS_PER_TASK);
            for (let c = 0; c < commentCount; c++) {
                commentRows.push({
                    user_id: pick(activeMemberIds),
                    task_id: task.id,
                    comment: pick(COMMENT_TEMPLATES),
                    created_at: randomDate([-30, -1]),
                });
            }
        }
        if (commentRows.length > 0) await knex("comments_task").insert(commentRows);
    }
    console.log(`   ✓ ${projects.length} projects, ${allTaskIds.length} tasks, ${allSubmissions.length} submissions dibuat`);

    // ─────────────────────────────────────────────
    // SUBMISSION_ATTACHMENTS
    // ─────────────────────────────────────────────
    console.log("📎 Generate submission attachments...");
    const attachmentRows = [];
    for (const sub of allSubmissions) {
        const count = randomInt(0, 3);
        for (let i = 0; i < count; i++) {
            const type = weightedPick([["link", 3], ["text", 2], ["image", 3], ["file", 2]]);
            if (type === "link") {
                attachmentRows.push({ submission_id: sub.id, type, content: `https://figma.com/file/${uuid()}`, object_key: null, file_name: null, mime_type: null, file_size: null });
            } else if (type === "text") {
                attachmentRows.push({ submission_id: sub.id, type, content: "Catatan tambahan terkait submission ini.", object_key: null, file_name: null, mime_type: null, file_size: null });
            } else if (type === "image") {
                attachmentRows.push({ submission_id: sub.id, type, content: null, object_key: `submissions/${sub.taskId}/${uuid()}.png`, file_name: "screenshot.png", mime_type: "image/png", file_size: randomInt(50_000, 3_000_000) });
            } else {
                attachmentRows.push({ submission_id: sub.id, type, content: null, object_key: `submissions/${sub.taskId}/${uuid()}.pdf`, file_name: "dokumen.pdf", mime_type: "application/pdf", file_size: randomInt(100_000, 5_000_000) });
            }
        }
    }
    if (attachmentRows.length > 0) await knex("submission_attachments").insert(attachmentRows);
    console.log(`   ✓ ${attachmentRows.length} attachments dibuat`);

    // ─────────────────────────────────────────────
    // TASK_APPEALS
    // ─────────────────────────────────────────────
    console.log(`⚖️  Generate ${CONFIG.APPEALS} appeals...`);
    const rejectedSubs = allSubmissions.filter(() => Math.random() > 0.7).slice(0, CONFIG.APPEALS);
    const appealRows = rejectedSubs.map((sub) => {
        const status = weightedPick([["pending", 4], ["accepted", 3], ["rejected", 3]]);
        return {
            task_id: sub.taskId,
            submission_id: sub.id,
            raised_by: sub.submittedBy,
            reason: "Saya rasa hasil kerjaan ini sudah sesuai requirement, mohon ditinjau ulang.",
            status,
            resolved_by: status !== "pending" ? projectMemberMap[sub.projectId].leaderId : null,
            resolution_note: status !== "pending" ? "Sudah ditinjau ulang oleh leader." : null,
            resolved_at: status !== "pending" ? randomDate([-5, -1]) : null,
        };
    });
    if (appealRows.length > 0) await knex("task_appeals").insert(appealRows);
    console.log(`   ✓ ${appealRows.length} appeals dibuat`);

    // ─────────────────────────────────────────────
    // TASK_SWAP_REQUESTS — hanya antar task dalam project yang sama
    // ─────────────────────────────────────────────
    console.log(`🔄 Generate ${CONFIG.SWAP_REQUESTS} swap requests...`);
    const swapRows = [];
    const projectIds = Object.keys(projectMemberMap);
    for (let i = 0; i < CONFIG.SWAP_REQUESTS; i++) {
        const projectId = pick(projectIds);
        const { leaderId, memberIds } = projectMemberMap[projectId];
        if (memberIds.length < 2) continue;

        const [taskRow] = await knex("tasks")
            .where({ project_id: projectId })
            .whereNotNull("assignee_id")
            .whereIn("status", ["todo", "ongoing"])
            .orderByRaw("RANDOM()")
            .limit(1);
        if (!taskRow) continue;

        const requestedBy = taskRow.assignee_id;
        const candidateTargets = memberIds.filter((id) => id !== requestedBy);
        if (candidateTargets.length === 0) continue;
        const requestedTo = pick(candidateTargets);

        const status = weightedPick([["pending", 4], ["approved", 3], ["rejected", 2], ["cancelled", 1]]);
        const isOneWay = Math.random() > 0.5;

        let targetTaskId = null;
        if (!isOneWay) {
            const [targetTaskRow] = await knex("tasks")
                .where({ project_id: projectId, assignee_id: requestedTo })
                .whereIn("status", ["todo", "ongoing"])
                .orderByRaw("RANDOM()")
                .limit(1);
            targetTaskId = targetTaskRow ? targetTaskRow.id : null;
        }

        swapRows.push({
            task_id: taskRow.id,
            target_task_id: targetTaskId,
            requested_by: requestedBy,
            requested_to: requestedTo,
            status,
            resolved_by: status !== "pending" ? (Math.random() > 0.5 ? leaderId : null) : null,
            resolved_at: status !== "pending" ? randomDate([-10, -1]) : null,
            created_at: randomDate([-20, -1]),
        });
    }
    if (swapRows.length > 0) await knex("task_swap_requests").insert(swapRows);
    console.log(`   ✓ ${swapRows.length} swap requests dibuat`);

    // ─────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────
    // console.log(`🔔 Generate ${CONFIG.NOTIFICATIONS} notifications...`);
    // const notifTypes = ["deadline_reminder", "task_assigned", "task_swapped", "swap_requested", "submission_pending", "submission_reviewed", "comment_added", "appeal_updated", "member_added", "member_invited"];
    // const notifMessages = {
    //     deadline_reminder: "Deadline task kamu tinggal 1 hari lagi",
    //     task_assigned: "Kamu ditugaskan untuk sebuah task baru",
    //     task_swapped: "Task kamu berhasil ditukar dengan member lain",
    //     swap_requested: "Ada member yang mengajukan swap task ke kamu",
    //     submission_pending: "Ada submission baru menunggu review",
    //     submission_reviewed: "Submission kamu sudah direview",
    //     comment_added: "Ada komentar baru di task kamu",
    //     appeal_updated: "Appeal yang kamu ajukan sudah diproses",
    //     member_added: "Kamu telah menjadi member baru di sebuah project",
    //     member_invited: "Kamu diundang bergabung ke sebuah project",
    // };
    // const notificationRows = [];
    // for (let i = 0; i < CONFIG.NOTIFICATIONS; i++) {
    //     const type = pick(notifTypes);
    //     notificationRows.push({
    //         user_id: pick(userIds),
    //         type,
    //         reference_type: pick(["task", "project", "submission", "appeal", "swap_request"]),
    //         reference_id: pick(allTaskIds),
    //         message: notifMessages[type],
    //         is_read: Math.random() > 0.4,
    //         created_at: randomDate([-30, 0]),
    //     });
    // }
    // await knex("notifications").insert(notificationRows);
    // console.log(`   ✓ ${notificationRows.length} notifications dibuat`);

    console.log("\n✅ Seed massal selesai!");
    console.log(`   Login untuk testing: username "demo", password "Password123"`);
    console.log(`   Total: ${users.length} users, ${projects.length} projects, ${allTaskIds.length} tasks,`);
    console.log(`   ${allSubmissions.length} submissions, ${attachmentRows.length} attachments, ${swapRows.length} swap requests,`);
    // console.log(`   ${appealRows.length} appeals, ${notificationRows.length} notifications`);
};