/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("task_swap_requests", (table) => {
    table.bigIncrements("id").primary();

    table.bigInteger("task_id").notNullable().references("id").inTable("tasks");

    table
      .bigInteger("target_task_id")
      .nullable()
      .references("id")
      .inTable("tasks");

    table
      .bigInteger("requested_by")
      .notNullable()
      .references("id")
      .inTable("users");

    table
      .bigInteger("requested_to")
      .notNullable()
      .references("id")
      .inTable("users");

    table
      .enu("status", ["pending", "approved", "rejected", "cancelled"])
      .notNullable()
      .defaultTo("pending");

    table
      .bigInteger("resolved_by")
      .nullable()
      .references("id")
      .inTable("users");

    table.timestamp("resolved_at").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("task_swap_requests");
};
