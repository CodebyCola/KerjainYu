/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("comments_task", (table) => {
        table.bigIncrements("id").primary()
        table.bigInteger("task_id").references("id").inTable("tasks").notNullable()
        table.bigInteger("user_id").references("id").inTable("users").notNullable()
        table.string("comment").notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('deleted_at').nullable().defaultTo(null)
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("comments_task");
};
