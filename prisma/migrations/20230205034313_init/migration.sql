-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pubkey" TEXT NOT NULL,
    "private_key" TEXT,
    "is_account" BOOLEAN NOT NULL DEFAULT false,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "lud16" TEXT,
    "website" TEXT,
    "nip05" TEXT,
    "picture" TEXT,
    "display_name" TEXT,
    "banner" TEXT,
    "about" TEXT,
    "name" TEXT,
    CONSTRAINT "Metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Metadata_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "contact" TEXT,
    "supported_nips" TEXT,
    "software" TEXT,
    "admin_pubkey" TEXT,
    "version" TEXT,
    "description" TEXT,
    "last_contact_information" INTEGER,
    "last_posted" INTEGER,
    "last_fetched" INTEGER,
    "last_suggested_kind2" INTEGER,
    "last_suggested_kind3" INTEGER,
    "last_suggested_nip23" INTEGER,
    "last_suggested_nip05" INTEGER,
    "last_suggested_bytag" INTEGER,
    "failed_post_attempts" INTEGER,
    "success_post_attempts" INTEGER
);

-- CreateTable
CREATE TABLE "UserRelay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "relay_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post" BOOLEAN NOT NULL,
    "last_posted" INTEGER NOT NULL,
    "last_fetched" INTEGER NOT NULL,
    "failed_post_attempts" INTEGER NOT NULL,
    "success_post_attempts" INTEGER NOT NULL,
    CONSTRAINT "UserRelay_relay_id_fkey" FOREIGN KEY ("relay_id") REFERENCES "Relay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRelay_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFollower" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "main_relay_url" TEXT,
    "pet_name" TEXT,
    CONSTRAINT "UserFollower_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserFollower_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" TEXT NOT NULL,
    "event_signature" TEXT NOT NULL,
    "event_kind" INTEGER NOT NULL,
    "event_pubkey" TEXT NOT NULL,
    "event_content" TEXT,
    "event_tags" TEXT,
    "event_created_at" DATETIME NOT NULL,
    "from_relay_url" TEXT,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_from_relay_url_fkey" FOREIGN KEY ("from_relay_url") REFERENCES "Relay" ("url") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pubkey_key" ON "User"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_user_id_key" ON "Metadata"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_event_id_key" ON "Metadata"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Relay_url_key" ON "Relay"("url");

-- CreateIndex
CREATE UNIQUE INDEX "UserRelay_user_id_relay_id_key" ON "UserRelay"("user_id", "relay_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollower_user_id_follower_id_key" ON "UserFollower"("user_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_event_id_key" ON "Event"("event_id");
