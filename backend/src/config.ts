import { ClientConfig, PoolConfig } from "pg";

export const base_db_config: ClientConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_DB,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};
export const pool_config: PoolConfig = { ...base_db_config };
pool_config.max = 10;
export const port = process.env.PORT || 8080;
