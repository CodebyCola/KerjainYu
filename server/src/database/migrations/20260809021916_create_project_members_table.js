/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("project_members", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger('project_id').unsigned().notNullable().references('id').inTable('projects');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users'); // tambahin ini
    table.enum("role", ["leader", "member"]).notNullable().defaultTo("member");
    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table
      .enum("status", ["invited", "active", "inactive"])
      .notNullable()
      .defaultTo("active");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("project_members");
};
