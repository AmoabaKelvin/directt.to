import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id", {
      length: 32,
    }).primaryKey(),
    name: text("name", { length: 255 }),
    email: text("email", { length: 255 }).unique(),
    createdLinksCount: integer("created_links_count", { mode: "number" }).notNull().default(0),
    lemonSqueezySubscriptionId: text("lemonSqueezy_subscription_id"),
    lemonSqueezyPriceId: text("lemonSqueezy_price_id"),
    lemonSqueezyCustomerId: text("lemonSqueezy_customer_id"),
    lemonSqueezyCurrentPeriodEnd: integer("lemonSqueezy_current_period_end", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("user_id_idx").on(table.id),
    emailIdx: index("user_email_idx").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    subdomain: text("subdomain"),
    customDomain: text("custom_domain"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("project_user_idx").on(table.userId),
  }),
);

export const androidApps = sqliteTable(
  "android_apps",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    packageName: text("package_name").notNull(),
    sha256CertFingerprints: text("sha256_cert_fingerprints").notNull(), // Stored as JSON string
    storeLink: text("store_link").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    projectIdIdx: index("android_app_project_id_idx").on(table.projectId),
  }),
);

export const iosApps = sqliteTable(
  "ios_apps",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").references(() => projects.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    bundleId: text("bundle_id").notNull(),
    teamId: text("team_id").notNull(),
    storeLink: text("store_link").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    projectIdIdx: index("ios_app_project_id_idx").on(table.projectId),
  }),
);

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    domain: text("domain").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    metaImage: text("meta_image"),
    shortUrl: text("short_url").notNull().unique(),
    longUrl: text("long_url").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    clicks: integer("clicks").notNull().default(0),
    androidReferrer: text("android_referrer"), // used for android app referrals to play store
    playStoreRedirects: integer("play_store_redirects").notNull().default(0),
    appStoreRedirects: integer("app_store_redirects").notNull().default(0),
    generalRedirects: integer("general_redirects").notNull().default(0),
  },
  (table) => ({
    projectIdIdx: index("link_project_id_idx").on(table.projectId),
    shortUrlIdx: index("link_short_url_idx").on(table.shortUrl),
  }),
);

export const customDomains = sqliteTable(
  "custom_domains",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    domain: text("domain").notNull(),
    challenges: text("challenges").notNull(), // Stored as JSON string
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("custom_domain_user_idx").on(table.userId),
    domainIdx: index("custom_domain_domain_idx").on(table.domain),
  }),
);

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    token: text("token").notNull().unique(),
    firstFourChars: text("first_four_chars").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  },
  (table) => ({
    userIdx: index("api_token_user_idx").on(table.userId),
    tokenIdx: index("api_token_token_idx").on(table.token),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  androidApp: one(androidApps, {
    fields: [projects.id],
    references: [androidApps.projectId],
  }),
  iosApp: one(iosApps, {
    fields: [projects.id],
    references: [iosApps.projectId],
  }),
  links: many(links),
}));

export const linkRelations = relations(links, ({ one }) => ({
  project: one(projects, {
    fields: [links.projectId],
    references: [projects.id],
  }),
}));

export const androidAppRelations = relations(androidApps, ({ one }) => ({
  project: one(projects, {
    fields: [androidApps.projectId],
    references: [projects.id],
  }),
}));

export const iosAppRelations = relations(iosApps, ({ one }) => ({
  project: one(projects, {
    fields: [iosApps.projectId],
    references: [projects.id],
  }),
}));

export const apiTokenRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, {
    fields: [apiTokens.userId],
    references: [users.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type AndroidApp = typeof androidApps.$inferSelect;
export type NewAndroidApp = typeof androidApps.$inferInsert;

export type IOSApp = typeof iosApps.$inferSelect;
export type NewIOSApp = typeof iosApps.$inferInsert;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type APIToken = typeof apiTokens.$inferSelect;
export type NewAPIToken = typeof apiTokens.$inferInsert;
