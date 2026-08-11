/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tasks", (table) => {
    table.bigIncrements("id").primary();

    table.string("title").notNullable();
    table.text("description");

    table
      .enum("status", [
        "unclaimed",
        "todo",
        "ongoing",
        "submitted",
        "in_revision",
        "approved",
        "rejected",
      ])
      .notNullable()
      .defaultTo("unclaimed");

    table.integer("priority").notNullable();
    table.integer("display_order")().defaultTo(0);

    table
      .bigInteger("project_id")
      .notNullable()
      .references("id")
      .inTable("projects");

    table.dateTime("deadline");

    table
      .bigInteger("assignee_id")
      .nullable()
      .references("id")
      .inTable("users");

    table
      .bigInteger("created_by")
      .notNullable()
      .references("id")
      .inTable("users");

    table.boolean("is_claimable").notNullable().defaultTo(false);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("tasks");
};
