import { config } from 'dotenv';
import path from 'path';
import knex from 'knex';
import { snakeCase, camelCase, isPlainObject } from 'lodash';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: path.resolve(process.cwd(), envFile), override: true });

// console.log(`🔍 DB.TS loaded "${envFile}", DATABASE_URL:`, process.env.DATABASE_URL);
function toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    if (isPlainObject(obj)) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [snakeCase(key), value])
        );
    }
    return obj;
}

function toCamelCase(row: any): any {
    if (Array.isArray(row)) return row.map(toCamelCase);
    if (isPlainObject(row)) {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [camelCase(key), value])
        );
    }
    return row;
}

export const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    wrapIdentifier: (value, origImpl) => {
        if (value === '*') return origImpl(value); // jangan di-transform, biarin apa adanya
        return origImpl(snakeCase(value));
    },
    postProcessResponse: (result) => toCamelCase(result),
});