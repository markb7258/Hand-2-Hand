-- CreateTable: profiles
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "displayName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CreateTable: countries
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    population TEXT NOT NULL,
    groups INTEGER NOT NULL DEFAULT 12,
    "photoUrl" TEXT,
    "countryDetails" TEXT,
    "primaryContacts" TEXT,
    "adminNotes" TEXT,
    flag TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CreateTable: notes
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL,
    content TEXT NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("countrySlug") REFERENCES countries(slug) ON DELETE CASCADE,
    UNIQUE ("userId", "countrySlug")
);

-- CreateTable: gallery_images
CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    "countrySlug" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("countrySlug") REFERENCES countries(slug) ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_notes_userId" ON notes("userId");
CREATE INDEX IF NOT EXISTS "idx_notes_countrySlug" ON notes("countrySlug");
CREATE INDEX IF NOT EXISTS "idx_gallery_images_countrySlug" ON gallery_images("countrySlug");
