import { drizzle } from 'drizzle-orm/bun-sqlite';
import { config } from '../env';

export const db = drizzle(config.DB_FILE_NAME!);