/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("projects", (table) => {
        table.bigIncrements("id").primary();
        table.string("title").notNullable();
        table.enum('status', ["ongoing", "completed"]).notNullable().defaultTo("ongoing")
        table.boolean("allow_free_swap").notNullable().defaultTo(false);
        table.dateTime("deadline").notNullable()
        table.boolean("is_archived").defaultTo(false)
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("projects")
};
