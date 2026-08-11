/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("task_submissions", (table) => {
    table.bigIncrements("id").primary();

    table.bigInteger("task_id").notNullable().references("id").inTable("tasks");

    table
      .bigInteger("from_user_id")
      .nullable()
      .references("id")
      .inTable("users");

    table
      .bigInteger("to_user_id")
      .notNullable()
      .references("id")
      .inTable("users");

    table
      .enu("reason", ["claimed", "assigned", "reassigned", "swapped"])
      .notNullable();

    table.timestamp("changed_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("task_submissions");
};
