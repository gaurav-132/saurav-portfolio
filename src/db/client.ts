import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const url = process.env.DATABASE_URL;

export const db = url
  ? drizzle(postgres(url, { max: 1, prepare: false }), { schema })
  : null;
