// config/storage.ts
import { S3Client } from "@aws-sdk/client-s3";
import { config } from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: path.resolve(process.cwd(), envFile), override: true });
// console.log('🔍 S3 config:', { endpoint: process.env.S3_ENDPOINT, bucket: process.env.S3_BUCKET });


export const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});

export const STORAGE_BUCKET = process.env.S3_BUCKET!;