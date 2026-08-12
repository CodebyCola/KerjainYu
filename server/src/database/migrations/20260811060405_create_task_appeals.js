/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("task_appeals", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("task_id")
      .notNullable()
      .references("id")
      .inTable("tasks");

    table
      .bigInteger("submission_id")
      .nullable()
      .references("id")
      .inTable("task_submissions");

    table
      .bigInteger("raised_by")
      .notNullable()
      .references("id")
      .inTable("users");

    table.string("reason").notNullable();

    table
      .enu("status", ["pending", "accepted", "rejected"])
      .notNullable()
      .defaultTo("pending");

    table
      .bigInteger("resolved_by")
      .nullable()
      .references("id")
      .inTable("users");

    table.string("resolution_note").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("resolved_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("task_appeals");
};