/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("submission_attachments", (table) => {
        table.bigIncrements("id").primary();

        table
            .bigInteger("submission_id")
            .notNullable()
            .references("id")
            .inTable("task_submissions");

        table
            .enu("type", ["text", "image", "file", "link"])
            .notNullable();

        table.string("content").notNullable(); // URL file, link, atau teks polos tergantung "type"

        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("submission_attachments");
};