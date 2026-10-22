import type { Config } from "drizzle-kit";
import { ENV } from "varlock/env";

export default {
  out: "./drizzle",
  schema: "./src/lib/db/schema/index.ts",
  breakpoints: true,
  verbose: true,

  dialect: "postgresql",
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
} satisfies Config;
