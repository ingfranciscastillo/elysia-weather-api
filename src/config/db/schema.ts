import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const weatherTable = sqliteTable("weather_table", {
  city: text().primaryKey(),
  data: text().notNull(),
  timestamp: int().notNull(),
});
