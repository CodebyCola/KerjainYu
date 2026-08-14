/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("refresh_tokens", (table) => {
        table.bigIncrements("id").primary();
        table
            .bigInteger("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        table.string("token_hash", 255).notNullable();
        table.string("device_info", 255).nullable().defaultTo("Unknown Device");
        table.string("ip_address", 45).nullable();
        table.boolean("is_revoked").notNullable().defaultTo(false);
        table.timestamp("expires_at").notNullable();
        table.timestamps(true, true);

        table.index(["token_hash"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists("refresh_tokens");
};