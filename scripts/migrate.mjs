import { readdir, readFile } from 'node:fs/promises';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const directory = new URL('../drizzle/', import.meta.url);
  const migrations = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of migrations) await sql.unsafe(await readFile(new URL(file, directory), 'utf8'));
  console.log(`Applied ${migrations.length} SQL migration(s).`);
} finally {
  await sql.end();
}
