import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './prompt-vault-dev.db',
  },
});
