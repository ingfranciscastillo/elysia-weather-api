import { defineConfig } from 'drizzle-kit';
import { config } from './src/config/env';

export default defineConfig({
  out: './drizzle',
  schema: './src/config/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: config.DB_FILE_NAME!,
  },
});
