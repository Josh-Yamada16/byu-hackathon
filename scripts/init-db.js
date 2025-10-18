/* eslint-disable no-console */
// scripts/init-db.js
// Ensures the users table exists in the configured SQLite file.

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const sqliteFile = process.env.SQLITE_FILE || "./dev.sqlite";
console.log("Using sqlite file:", sqliteFile);

// Ensure directory exists for sqlite file
const dir = path.dirname(sqliteFile);
if (dir && dir !== "." && !fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(sqliteFile);

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create capitalized "User" table to match server schema (pgTable('User', ...))
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  id TEXT PRIMARY KEY,
  createdAt DATETIME NOT NULL,
  title TEXT NOT NULL,
  userId TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private',
  lastContext TEXT
);

-- Message_v2 table
CREATE TABLE IF NOT EXISTS "Message_v2" (
  id TEXT PRIMARY KEY,
  chatId TEXT NOT NULL,
  role TEXT NOT NULL,
  parts TEXT NOT NULL,
  attachments TEXT NOT NULL,
  createdAt DATETIME NOT NULL
);

-- Vote_v2 table
CREATE TABLE IF NOT EXISTS "Vote_v2" (
  chatId TEXT NOT NULL,
  messageId TEXT NOT NULL,
  isUpvoted INTEGER NOT NULL,
  PRIMARY KEY (chatId, messageId)
);

-- Document table
CREATE TABLE IF NOT EXISTS "Document" (
  id TEXT NOT NULL,
  createdAt DATETIME NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  kind TEXT NOT NULL DEFAULT 'text',
  userId TEXT NOT NULL,
  PRIMARY KEY (id, createdAt)
);

-- Suggestion table
CREATE TABLE IF NOT EXISTS "Suggestion" (
  id TEXT PRIMARY KEY,
  documentId TEXT NOT NULL,
  documentCreatedAt DATETIME NOT NULL,
  originalText TEXT NOT NULL,
  suggestedText TEXT NOT NULL,
  description TEXT,
  isResolved INTEGER NOT NULL DEFAULT 0,
  userId TEXT NOT NULL,
  createdAt DATETIME NOT NULL
);

-- Stream table
CREATE TABLE IF NOT EXISTS "Stream" (
  id TEXT PRIMARY KEY,
  chatId TEXT NOT NULL,
  createdAt DATETIME NOT NULL
);
`;

try {
  db.exec(sql);
  console.log("Ensured users table exists");
} catch (err) {
  console.error("Failed to create users table:", err);
  process.exit(1);
} finally {
  db.close();
}
