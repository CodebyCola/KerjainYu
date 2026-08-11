/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("task_appeals", (table) => {
    table.bigIncrements("id").primary();

    table.bigInteger("task_id").notNullable().references("id").inTable("tasks");

    table
      .bigInteger("submitted_by")
      .notNullable()
      .references("id")
      .inTable("users");

    table.string("note").nullable();

    table
      .enu("review_status", [
        "pending",
        "approved",
        "revision_requested",
        "rejected",
      ])
      .notNullable()
      .defaultTo("pending");

    table.string("review_note").nullable();

    table
      .bigInteger("reviewed_by")
      .nullable()
      .references("id")
      .inTable("users");

    table.timestamp("reviewed_at").nullable();

    table.timestamp("submitted_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("task_appeals");
};
