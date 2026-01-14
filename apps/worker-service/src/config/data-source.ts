import { DataSource } from "typeorm";
import { loadConfig } from "@packages/config";

const config = loadConfig();

/**
 * Worker Service DataSource Configuration
 * 
 * Worker service accesses all schemas (user, campaign, recipient, sender) via raw SQL queries.
 * This DataSource is used for database connections and QueryRunner operations.
 * 
 * Note: Worker service doesn't have its own schema - it accesses other service schemas
 * using schema-qualified table names (e.g., campaign.email_logs)
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: String(config.database.host),
  port: Number(config.database.port),
  username: String(config.database.userName),
  password: String(config.database.password),
  database: String(config.database.dbName),

  synchronize: false,
  logging: Boolean(config.database.logging),

  // Worker service uses raw SQL, so no entities are defined here
  entities: [],
  migrations: [],
});
