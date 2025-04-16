import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const lobbiesTable = pgTable("lobbies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  hostId: uuid("host_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  maxPlayers: integer("max_players").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
  isGameStarted: boolean("is_game_started").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const lobbyMembersTable = pgTable("lobby_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  lobbyId: uuid("lobby_id")
    .notNull()
    .references(() => lobbiesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
export type InsertLobby = typeof lobbiesTable.$inferInsert;
export type SelectLobby = typeof lobbiesTable.$inferSelect;
export type InsertLobbyMember = typeof lobbyMembersTable.$inferInsert;
export type SelectLobbyMember = typeof lobbyMembersTable.$inferSelect;
