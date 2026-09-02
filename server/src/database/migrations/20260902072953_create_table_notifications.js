/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.raw(`
    CREATE TYPE notification_type AS ENUM (
      'deadline_reminder',
      'task_assigned',
      'task_swapped',
      'swap_requested',
      'submission_pending',
      'submission_reviewed',
      'comment_added',
      'appeal_updated',
      'member_added',
      'member_invited'
    );
  `);

    await knex.schema.createTable('notifications', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
        table.specificType('type', 'notification_type').notNullable();

        table.string('reference_type').nullable();
        table.bigInteger('reference_id').nullable();
        table.string('message').notNullable();
        table.boolean('is_read').notNullable().defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.index(['user_id']);
        table.index(['user_id', 'is_read']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('notifications');
    await knex.raw('DROP TYPE IF EXISTS notification_type;');
};
