/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("project_links", (table) => {
    table.bigIncrements().primary();
    table
      .integer("project_id")
      .notNullable()
      .unsigned()
      .references("id")
      .inTable("projects");
    table.string("label").notNullable();
    table.string("url").notNullable();
    table
      .enum("category", ["design", "development", "docs", "other"])
      .notNullable()
      .defaultTo("other");
    table
      .bigInteger("added_by")
      .notNullable()
      .unsigned()
      .references("id")
      .inTable("users");
    table.timestamp("created_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("project_links")
};
