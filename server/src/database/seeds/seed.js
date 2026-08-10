/**
 * Seed data lengkap untuk KerjainYu — dipakai buat testing manual (Thunder Client)
 * dan development, biar nggak perlu bikin data satu-satu lewat API tiap kali reset DB.
 *
 * PENTING: file ini dijalankan lewat Knex CLI (npx knex seed:run), yang membaca
 * knexfile.js langsung — TIDAK lewat db.ts, jadi TIDAK dapat konversi
 * camelCase <-> snake_case otomatis. Semua nama kolom di sini WAJIB snake_case
 * sesuai nama kolom asli di database.
 *
 * Cara jalanin:
 *   npx knex seed:run --knexfile src/database/knexfile.js
 * atau tambahkan script di package.json:
 *   "db:seed": "knex seed:run --knexfile src/database/knexfile.js"
 * lalu: npm run db:seed
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
    // await knex("notifications").del();
    // await knex("comments_task").del();
    // await knex("task_appeals").del();
    // await knex("submission_attachments").del();
    // await knex("task_submissions").del();
    // await knex("task_swap_requests").del();
    // await knex("task_ownership_log").del();
    // await knex("tasks").del();
    await knex("project_links").del();
    await knex("project_members").del();
    await knex("projects").del();
    await knex("users").del();

    // Password sama untuk semua user seed, biar gampang login manual saat testing
    const passwordHash = await bcrypt.hash("Password123", 10);

    // ─────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────
    const users = await knex("users")
        .insert([
            { username: "budi_leader", password: passwordHash, email: "budi@mail.com", full_name: "Budi Santoso" },
            { username: "sari_dev", password: passwordHash, email: "sari@mail.com", full_name: "Sari Wijaya" },
            { username: "andi_design", password: passwordHash, email: "andi@mail.com", full_name: "Andi Pratama" },
            { username: "citra_qa", password: passwordHash, email: "citra@mail.com", full_name: "Citra Dewi" },
            { username: "eko_solo", password: passwordHash, email: "eko@mail.com", full_name: "Eko Prasetyo" }, // user tanpa project, buat test "not a member"
        ])
        .returning("id");

    const [budiId, sariId, andiId, citraId, ekoId] = users.map((u) => u.id);

    // ─────────────────────────────────────────────
    // PROJECTS
    // ─────────────────────────────────────────────
    const projects = await knex("projects")
        .insert([
            {
                title: "Website Redesign",
                status: "ongoing",
                allow_free_swap: true,
                deadline: "2026-09-30",
                is_archived: false,
            },
            {
                title: "Mobile App MVP",
                status: "ongoing",
                allow_free_swap: false,
                deadline: "2026-10-15",
                is_archived: false,
            },
            {
                title: "Internal Tools (Selesai)",
                status: "completed",
                allow_free_swap: false,
                deadline: "2026-06-01",
                is_archived: true,
                is_archived_at: knex.fn.now(),
            },
        ])
        .returning("id");

    const [projectWebId, projectMobileId, projectDoneId] = projects.map((p) => p.id);

    // ─────────────────────────────────────────────
    // PROJECT MEMBERS
    // budi = leader di semua project, yang lain tersebar sebagai member
    // ─────────────────────────────────────────────
    await knex("project_members").insert([
        // Website Redesign
        { project_id: projectWebId, user_id: budiId, role: "leader", status: "active" },
        { project_id: projectWebId, user_id: sariId, role: "member", status: "active" },
        { project_id: projectWebId, user_id: andiId, role: "member", status: "active" },

        // Mobile App MVP
        { project_id: projectMobileId, user_id: budiId, role: "leader", status: "active" },
        { project_id: projectMobileId, user_id: citraId, role: "member", status: "active" },
        { project_id: projectMobileId, user_id: sariId, role: "member", status: "invited" }, // belum accept invite

        // Internal Tools (selesai/archived)
        { project_id: projectDoneId, user_id: budiId, role: "leader", status: "active" },
        { project_id: projectDoneId, user_id: andiId, role: "member", status: "removed" }, // pernah keluar
    ]);
    // catatan: ekoId sengaja TIDAK dimasukkan ke project manapun,
    // berguna buat test skenario "you're not a member of this project" (403)

    // ─────────────────────────────────────────────
    // PROJECT LINKS
    // ─────────────────────────────────────────────
    await knex("project_links").insert([
        { project_id: projectWebId, label: "Figma Design", url: "https://figma.com/file/website-redesign", category: "design", added_by: andiId },
        { project_id: projectWebId, label: "GitHub Repo", url: "https://github.com/kerjainyu/website", category: "development", added_by: budiId },
        { project_id: projectWebId, label: "Requirement Doc", url: "https://docs.google.com/document/website-req", category: "docs", added_by: budiId },
        { project_id: projectMobileId, label: "Figma Mobile", url: "https://figma.com/file/mobile-mvp", category: "design", added_by: budiId },
        { project_id: projectMobileId, label: "GitHub Mobile Repo", url: "https://github.com/kerjainyu/mobile", category: "development", added_by: citraId },
    ]);

    // // ─────────────────────────────────────────────
    // // TASKS
    // // ─────────────────────────────────────────────
    // const tasks = await knex("tasks")
    //     .insert([
    //         // Website Redesign
    //         { title: "Design homepage mockup", description: "Buat mockup homepage baru sesuai brand guideline", status: "approved", priority: 1, project_id: projectWebId, deadline: "2026-08-20", assignee_id: andiId, created_by: budiId, is_claimable: false },
    //         { title: "Implement navbar component", description: "Bikin komponen navbar responsive", status: "ongoing", priority: 2, project_id: projectWebId, deadline: "2026-08-25", assignee_id: sariId, created_by: budiId, is_claimable: false },
    //         { title: "Setup CI/CD pipeline", description: "Setup GitHub Actions buat testing otomatis", status: "unclaimed", priority: null, project_id: projectWebId, deadline: null, assignee_id: null, created_by: budiId, is_claimable: true }, // task pool, belum diambil siapapun
    //         { title: "Write footer copy", description: "Tulis copy untuk footer", status: "submitted", priority: 3, project_id: projectWebId, deadline: "2026-08-18", assignee_id: sariId, created_by: budiId, is_claimable: false },

    //         // Mobile App MVP
    //         { title: "Setup React Native project", description: "Init project + navigation", status: "todo", priority: 1, project_id: projectMobileId, deadline: "2026-09-01", assignee_id: citraId, created_by: budiId, is_claimable: false },
    //         { title: "Design onboarding screens", description: "3 layar onboarding pertama", status: "in_revision", priority: 2, project_id: projectMobileId, deadline: "2026-09-05", assignee_id: citraId, created_by: budiId, is_claimable: false },
    //     ])
    //     .returning("id");

    // const [taskMockupId, taskNavbarId, taskCiCdId, taskFooterId, taskRnSetupId, taskOnboardingId] = tasks.map((t) => t.id);

    // // ─────────────────────────────────────────────
    // // TASK OWNERSHIP LOG (audit trail siapa pegang task kapan)
    // // ─────────────────────────────────────────────
    // await knex("task_ownership_log").insert([
    //     { task_id: taskMockupId, from_user_id: null, to_user_id: andiId, reason: "assigned" },
    //     { task_id: taskNavbarId, from_user_id: null, to_user_id: sariId, reason: "assigned" },
    //     { task_id: taskFooterId, from_user_id: null, to_user_id: andiId, reason: "assigned" },
    //     { task_id: taskFooterId, from_user_id: andiId, to_user_id: sariId, reason: "swap" }, // contoh riwayat swap
    // ]);

    // // ─────────────────────────────────────────────
    // // TASK SUBMISSIONS
    // // ─────────────────────────────────────────────
    // const submissions = await knex("task_submissions")
    //     .insert([
    //         { task_id: taskMockupId, submitted_by: andiId, note: "Sudah selesai, mockup ada di Figma", review_status: "approved", review_note: "Bagus, lanjut ke development", reviewed_by: budiId, reviewed_at: knex.fn.now() },
    //         { task_id: taskFooterId, submitted_by: sariId, note: "Draft pertama footer copy", review_status: "pending" },
    //         { task_id: taskOnboardingId, submitted_by: citraId, note: "3 screen onboarding, minta feedback", review_status: "revision_requested", review_note: "Warna kurang sesuai brand guideline, tolong disesuaikan" },
    //     ])
    //     .returning("id");

    // const [submissionMockupId] = submissions.map((s) => s.id);

    // // ─────────────────────────────────────────────
    // // SUBMISSION ATTACHMENTS
    // // ─────────────────────────────────────────────
    // await knex("submission_attachments").insert([
    //     { submission_id: submissionMockupId, type: "link", content: "https://figma.com/file/website-redesign?node=homepage" },
    //     { submission_id: submissionMockupId, type: "text", content: "Sudah include versi mobile & desktop" },
    // ]);

    // ─────────────────────────────────────────────
    // TASK SWAP REQUESTS
    // ─────────────────────────────────────────────
    // await knex("task_swap_requests").insert([
    //     {
    //         task_id: taskNavbarId,
    //         target_task_id: null, // one-way, bukan tukar 2 arah
    //         requested_by: sariId,
    //         requested_to: andiId,
    //         status: "pending",
    //     },
    // ]);

    // ─────────────────────────────────────────────
    // TASK APPEALS
    // ─────────────────────────────────────────────
    // await knex("task_appeals").insert([
    //     {
    //         task_id: taskOnboardingId,
    //         submission_id: null,
    //         raised_by: citraId,
    //         reason: "Saya rasa revisi warna sudah sesuai brand guideline versi terbaru, mohon dicek ulang",
    //         status: "pending",
    //     },
    // ]);

    // ─────────────────────────────────────────────
    // COMMENTS
    // ─────────────────────────────────────────────
    // await knex("comments_task").insert([
    //     { user_id: budiId, task_id: taskNavbarId, comment: "Progress gimana? deadline udah dekat" },
    //     { user_id: sariId, task_id: taskNavbarId, comment: "Masih dikerjain, kemungkinan selesai besok" },
    //     { user_id: andiId, task_id: taskMockupId, comment: "Mockup udah aku update, cek Figma ya" },
    // ]);

    // ─────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────
    //     await knex("notifications").insert([
    //         { user_id: sariId, type: "task_assigned", reference_type: "task", reference_id: taskNavbarId, message: "Kamu ditugaskan untuk task 'Implement navbar component'", is_read: false },
    //         { user_id: budiId, type: "submission_pending", reference_type: "submission", reference_id: submissionMockupId, message: "Ada submission baru menunggu review", is_read: true },
    //         { user_id: andiId, type: "swap_requested", reference_type: "swap_request", reference_id: taskNavbarId, message: "Sari mengajukan swap task ke kamu", is_read: false },
    //         { user_id: citraId, type: "submission_reviewed", reference_type: "submission", reference_id: taskOnboardingId, message: "Submission kamu diminta revisi", is_read: false },
    //         { user_id: ekoId, type: "member_invited", reference_type: "project", reference_id: projectMobileId, message: "Kamu diundang bergabung ke sebuah project", is_read: false },
    //     ]);

    //     console.log("✅ Seed selesai:");
    //     console.log(`   Users: budi_leader, sari_dev, andi_design, citra_qa, eko_solo (semua password: "Password123")`);
    //     console.log(`   Projects: Website Redesign (id=${projectWebId}), Mobile App MVP (id=${projectMobileId}), Internal Tools (id=${projectDoneId}, archived)`);
    //     console.log(`   eko_solo TIDAK di project manapun — pakai buat test skenario 403 Forbidden`);
};