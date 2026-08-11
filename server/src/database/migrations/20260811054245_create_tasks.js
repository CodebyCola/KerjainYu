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

    // Nullable: null berarti diurutkan berdasarkan created_at (lihat DBML)
    table.integer("priority");
    table.integer("display_order").defaultTo(0);

    table
      .bigInteger("project_id")
      .notNullable()
      .references("id")
      .inTable("projects")
      .onDelete("CASCADE");

    table.dateTime("deadline");

    // null = unclaimed ("war tugas"); SET NULL kalau user-nya dihapus,
    // task balik ke pool alih-alih ikut terhapus
    table
      .bigInteger("assignee_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table
      .bigInteger("created_by")
      .notNullable()
      .references("id")
      .inTable("users");

    table.boolean("is_claimable").notNullable().defaultTo(false);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    // Nullable: null sampai task pertama kali diupdate (lihat Task.updatedAt)
    table.timestamp("updated_at");

    table.index("project_id");
    table.index("assignee_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("tasks");
};
