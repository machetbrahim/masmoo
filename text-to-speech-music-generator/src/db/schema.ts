import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Persisted history of generated voice-over files.
 * The audio bytes live on the local filesystem (storage/audio) while this
 * table keeps the metadata needed to re-download or delete them.
 */
export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  excerpt: varchar("excerpt", { length: 280 }).notNull(),
  voice: varchar("voice", { length: 120 }).notNull(),
  voiceName: varchar("voice_name", { length: 200 }).notNull(),
  locale: varchar("locale", { length: 20 }).notNull(),
  mood: varchar("mood", { length: 40 }).notNull().default("none"),
  musicSource: varchar("music_source", { length: 20 }).notNull().default("none"),
  format: varchar("format", { length: 10 }).notNull().default("mp3"),
  duration: real("duration").notNull().default(0),
  sizeBytes: integer("size_bytes").notNull().default(0),
  filePath: varchar("file_path", { length: 300 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type GenerationRow = typeof generations.$inferSelect;
