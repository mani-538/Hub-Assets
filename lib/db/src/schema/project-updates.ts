import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const projectUpdatesTable = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  updateText: text("update_text").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectUpdateSchema = createInsertSchema(projectUpdatesTable).omit({ id: true, date: true });
export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type ProjectUpdate = typeof projectUpdatesTable.$inferSelect;
