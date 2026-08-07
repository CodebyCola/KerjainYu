import type { Knex } from 'knex';
import 'dotenv/config';

const config: Knex.Config = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
        directory: './src/migrations',
        extension: 'ts',
    },
    seeds: {
        directory: './src/seeds',
    },
};

export default config;