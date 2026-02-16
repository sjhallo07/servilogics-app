#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

import { connectMongo, ensureIndexes, getUserByEmailDb, createUserDb, DEFAULT_USERS, disconnectMongo } from '../src/utils/db.js';

async function main() {
    console.log('Connecting to MongoDB...');
    await connectMongo();
    console.log('Ensuring indexes...');
    try {
        await ensureIndexes();
    } catch (e) {
        console.warn('ensureIndexes failed (continuing):', e && e.message ? e.message : e);
    }

    for (const u of DEFAULT_USERS) {
        try {
            const existing = await getUserByEmailDb(u.email);
            if (existing) {
                console.log('User exists:', u.email);
                continue;
            }
            console.log('Creating user:', u.email);
            await createUserDb(u);
        } catch (err) {
            console.error('Failed to seed user', u.email, err && err.message ? err.message : err);
        }
    }

    await disconnectMongo();
    console.log('Done.');
}

main().catch((err) => {
    console.error('Seed script failed:', err && err.stack ? err.stack : err);
    process.exit(1);
});
