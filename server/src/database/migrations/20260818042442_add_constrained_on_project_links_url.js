/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable("project_links", (table) => {
        table.unique(
            ["project_id", "url"],
            "project_links_project_id_url_unique"
        );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable("project_links", (table) => {
        table.dropUnique(
            ["project_id", "url"],
            "project_links_project_id_url_unique"
        );
    });
};