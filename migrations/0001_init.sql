-- Editable content: one JSON document per id ("site", "home", "project:<slug>").
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Each press of Publish.
CREATE TABLE publishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  build_uuid TEXT,
  by TEXT
);
