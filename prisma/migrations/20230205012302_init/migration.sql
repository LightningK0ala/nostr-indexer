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
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "supported_nips" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "admin_pubkey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "last_contact_information" INTEGER NOT NULL,
    "last_posted" INTEGER NOT NULL,
    "last_fetched" INTEGER NOT NULL,
    "last_suggested_kind2" INTEGER NOT NULL,
    "last_suggested_kind3" INTEGER NOT NULL,
    "last_suggested_nip23" INTEGER NOT NULL,
    "last_suggested_nip05" INTEGER NOT NULL,
    "last_suggested_bytag" INTEGER NOT NULL,
    "failed_post_attempts" INTEGER NOT NULL,
    "success_post_attempts" INTEGER NOT NULL
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
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    CONSTRAINT "Tag_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" TEXT NOT NULL,
    "event_signature" TEXT NOT NULL,
    "event_kind" INTEGER NOT NULL,
    "event_pubkey" TEXT NOT NULL,
    "event_content" TEXT,
    "event_created_at" DATETIME NOT NULL,
    "from_relay_id" INTEGER,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_from_relay_id_fkey" FOREIGN KEY ("from_relay_id") REFERENCES "Relay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "Event_event_id_key" ON "Event"("event_id");
