import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

config({ path: ".env" }); // or .env.local

const client = postgres(
  process.env.DATABASE_URL! ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
);

export const db = drizzle({
  client,
  schema,
});
