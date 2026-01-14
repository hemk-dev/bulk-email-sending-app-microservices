import { DataSource } from "typeorm";
import { loadConfig } from "@packages/config";

const config = loadConfig();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: String(config.database.host),
  port: Number(config.database.port),
  username: String(config.database.userName),
  password: String(config.database.password),
  database: String(config.database.dbName),

  synchronize: false, 
  logging: true,

  entities: ["src/shared/entities/*.entity.{ts,js}"],
  migrations: ["migrations/*.{ts,js}"],

  migrationsTableName: "sender_migrations",
});
