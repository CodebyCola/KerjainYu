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

        // Object Storage metadata
        // Example: submissions/123/8f92a-report.pdf
        table.string("object_key").nullable();

        // Original filename uploaded by the user
        // Example: report.pdf
        table.string("original_name").nullable();

        // MIME type
        // Example: application/pdf, image/png
        table.string("mime_type").nullable();

        // File size in bytes
        table.bigInteger("size").nullable();

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