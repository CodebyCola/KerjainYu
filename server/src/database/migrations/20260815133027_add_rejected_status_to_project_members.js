/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.raw(`
    ALTER TABLE project_members
    DROP CONSTRAINT IF EXISTS project_members_status_check
  `);
    await knex.raw(`
    ALTER TABLE project_members
    ADD CONSTRAINT project_members_status_check
    CHECK (status IN ('invited', 'active', 'removed', 'rejected'))
  `);
};

exports.down = async function (knex) {
    await knex.raw(`
    ALTER TABLE project_members
    DROP CONSTRAINT IF EXISTS project_members_status_check
  `);
    await knex.raw(`
    ALTER TABLE project_members
    ADD CONSTRAINT project_members_status_check
    CHECK (status IN ('invited', 'active', 'removed'))
  `);
};