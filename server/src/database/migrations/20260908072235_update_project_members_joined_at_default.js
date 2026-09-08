/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("project_members", (table) => {
        table.timestamp("joined_at").nullable().defaultTo(null).alter();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("project_members", (table) => {
        table.timestamp("joined_at").defaultTo(null).alter();
    });
};
