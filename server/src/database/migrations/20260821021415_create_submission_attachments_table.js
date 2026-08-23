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

        // Used for text and link attachments
        table.string("content").nullable();

        table.string("object_key").nullable();

        // Original filename uploaded by the user
        table.string("file_name").nullable();

        // MIME type
        table.string("mime_type").nullable();

        // File size in bytes
        table.bigInteger("file_size").nullable();

        table
            .timestamp("created_at")
            .notNullable()
            .defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("submission_attachments");
};