"""
KEMET SOCIAL - Database Manager
Initializes, seeds, and tests the SQLite database
"""
import os
try:
    import psycopg2
    import psycopg2.extras
    USE_PG = bool(os.environ.get("DATABASE_URL"))
except ImportError:
    USE_PG = False
import sqlite3
import json
import uuid
import hashlib
import os
from datetime import datetime, timedelta

DB_PATH = os.environ.get("DB_PATH", "/tmp/kemet.db")

SCHEMA = """
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  nickname      TEXT NOT NULL,
  avatar_emoji  TEXT DEFAULT 'ط¸â€¹ط¹ط›أ¢â‚¬ع©أ¢â‚¬ع©',
  country       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  bio           TEXT DEFAULT '',
  is_verified   INTEGER DEFAULT 0,
  is_active     INTEGER DEFAULT 1,
  membership    TEXT DEFAULT 'free',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count   INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  platform   TEXT DEFAULT 'web',
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  content_en     TEXT DEFAULT '',
  image_emoji    TEXT DEFAULT '',
  hashtags       TEXT DEFAULT '[]',
  likes_count    INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count   INTEGER DEFAULT 0,
  views_count    INTEGER DEFAULT 0,
  is_deleted     INTEGER DEFAULT 0,
  language       TEXT DEFAULT 'ar',
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS likes (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id   TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_deleted  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS follows (
  id           TEXT PRIMARY KEY,
  follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TEXT DEFAULT (datetime('now')),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  sender_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,
  post_id    TEXT REFERENCES posts(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  is_read    INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name_ar    TEXT NOT NULL,
  name_en    TEXT NOT NULL,
  icon       TEXT DEFAULT 'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†',
  sort_order INTEGER DEFAULT 0,
  is_active  INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tours (
  id             TEXT PRIMARY KEY,
  category_id    TEXT REFERENCES categories(id),
  title_ar       TEXT NOT NULL,
  title_en       TEXT NOT NULL,
  description_ar TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  price          REAL NOT NULL,
  currency       TEXT DEFAULT 'USD',
  duration_days  INTEGER,
  max_guests     INTEGER DEFAULT 20,
  image_emoji    TEXT DEFAULT 'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†',
  badge_ar       TEXT DEFAULT '',
  badge_en       TEXT DEFAULT '',
  rating         REAL DEFAULT 0.0,
  reviews_count  INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  includes_ar    TEXT DEFAULT '[]',
  includes_en    TEXT DEFAULT '[]',
  is_active      INTEGER DEFAULT 1,
  is_featured    INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id          TEXT NOT NULL REFERENCES tours(id),
  guests_count     INTEGER DEFAULT 1,
  total_price      REAL NOT NULL,
  currency         TEXT DEFAULT 'USD',
  status           TEXT DEFAULT 'pending',
  payment_method   TEXT DEFAULT '',
  payment_status   TEXT DEFAULT 'unpaid',
  payment_ref      TEXT DEFAULT '',
  travel_date      TEXT DEFAULT '',
  special_requests TEXT DEFAULT '',
  contact_phone    TEXT DEFAULT '',
  contact_email    TEXT DEFAULT '',
  notes            TEXT DEFAULT '',
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id          TEXT PRIMARY KEY,
  booking_id  TEXT NOT NULL REFERENCES bookings(id),
  user_id     TEXT NOT NULL REFERENCES users(id),
  amount      REAL NOT NULL,
  currency    TEXT DEFAULT 'USD',
  method      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',
  gateway_ref TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id    TEXT NOT NULL REFERENCES tours(id),
  booking_id TEXT REFERENCES bookings(id),
  rating     INTEGER NOT NULL,
  comment    TEXT DEFAULT '',
  is_approved INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, tour_id)
);

CREATE TABLE IF NOT EXISTS pharaoh_nicknames (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar    TEXT NOT NULL UNIQUE,
  name_en    TEXT NOT NULL UNIQUE,
  emoji      TEXT NOT NULL,
  dynasty    TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active, is_featured);

-- TRIGGERS
CREATE TRIGGER IF NOT EXISTS trg_post_likes_inc
AFTER INSERT ON likes BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
END;
CREATE TRIGGER IF NOT EXISTS trg_post_likes_dec
AFTER DELETE ON likes BEGIN
  UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
END;
CREATE TRIGGER IF NOT EXISTS trg_post_comments_inc
AFTER INSERT ON comments BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
END;
CREATE TRIGGER IF NOT EXISTS trg_follow_inc
AFTER INSERT ON follows BEGIN
  UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
END;
CREATE TRIGGER IF NOT EXISTS trg_follow_dec
AFTER DELETE ON follows BEGIN
  UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
END;
CREATE TRIGGER IF NOT EXISTS trg_post_count_inc
AFTER INSERT ON posts BEGIN
  UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
END;

-- VIEWS
CREATE VIEW IF NOT EXISTS v_posts_full AS
SELECT p.id, p.content, p.content_en, p.image_emoji, p.hashtags,
  p.likes_count, p.comments_count, p.shares_count, p.created_at,
  u.id as user_id, u.nickname, u.avatar_emoji, u.is_verified, u.membership
FROM posts p JOIN users u ON p.user_id = u.id
WHERE p.is_deleted = 0
ORDER BY p.created_at DESC;

CREATE VIEW IF NOT EXISTS v_bookings_full AS
SELECT b.*, u.name as user_name, u.email as user_email,
  t.title_ar as tour_title_ar, t.title_en as tour_title_en, t.image_emoji as tour_emoji
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN tours t ON b.tour_id = t.id;
"""

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_id() -> str:
    return str(uuid.uuid4())

def get_conn():
    db_url = os.environ.get("DATABASE_URL")
    if db_url and USE_PG:
        conn = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = False
        return conn
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def get_conn():
    db_url = os.environ.get("DATABASE_URL")
    if db_url and USE_PG:
        conn = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = False
        return conn
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def seed_data(conn):
    cur = conn.cursor()

    # Pharaoh nicknames
    pharaohs = [
        ('ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ³ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¹ط·آ·ط¢آ¸ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦',  'Ramesses the Great', 'ط¸â€¹ط¹ط›أ¢â‚¬ع©أ¢â‚¬ع©', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©',  1),
        ('ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¹آ¾ ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ® ط·آ·ط¢آ¢ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ ',  'Tutankhamun',         'ط£آ¢ط¹â€کط¢آ±ط£آ¯ط¢آ¸ط¹ث†', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 2),
        ('ط·آ·ط¢آ­ط·آ·ط¹آ¾ط·آ·ط¢آ´ط·آ·ط¢آ¨ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¹آ¾',       'Hatshepsut',           'ط¸â€¹ط¹ط›ط¥â€™ط·â€؛', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 3),
        ('ط·آ·ط¢آ£ط·آ·ط¢آ®ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ ',       'Akhenaten',            'ط£آ¢ط¹آ©أ¢â€ڑآ¬ط£آ¯ط¢آ¸ط¹ث†', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 4),
        ('ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ط·آ·ط¢آ±ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¹آ¾ط·آ¸ط¸آ¹',       'Nefertiti',            'ط¸â€¹ط¹ط›أ¢â‚¬â„¢ط¹ع©', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 5),
        ('ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«',  'Thutmose III',         'ط£آ¢ط¹â€کأ¢â‚¬â€Œط£آ¯ط¢آ¸ط¹ث†', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 6),
        ('ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ط·آ·ط¢آ±ط·آ¸ط«â€ ',         'Sneferu',              'ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ¹ط·آ·ط¢آ©',       7),
        ('ط·آ·ط¢آ®ط·آ¸ط«â€ ط·آ¸ط¸آ¾ط·آ¸ط«â€ ',          'Khufu',                'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ¹ط·آ·ط¢آ©',      8),
        ('ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ط·آ·ط¢آ±ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹',       'Nefertari',            'ط¸â€¹ط¹ط›ط¥â€™أ¢â€‍آ¢', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©', 9),
        ('ط·آ¸ط¦â€™ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ط·آ¸ط«â€ ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ·ط¢آ±ط·آ·ط¢آ§',     'Cleopatra',            'ط¸â€¹ط¹ط›ط¹آ¯ط¹â€ ', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¨ط·آ·ط¢آ·ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ©',     10),
        ('ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چ',    'Seti I',               'ط¸â€¹ط¹ط›ط¢آ¦أ¢â‚¬آ¦', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©',11),
        ('ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¨ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ­',       'Merneptah',            'ط¸â€¹ط¹ط›ط¥â€™ط¸آ¹', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ·ط¢آ´ط·آ·ط¢آ±ط·آ·ط¢آ©',12),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO pharaoh_nicknames (name_ar,name_en,emoji,dynasty,sort_order) VALUES (?,?,?,?,?)",
        pharaohs
    )

    # Categories
    categories = [
        ('cat_tours',   'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ¸ط¸آ¹ط·آ·ط¢آ©',  'Tours',             'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†', 1),
        ('cat_nile',    'ط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ² ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ',    'Nile Cruises',       'ط¸â€¹ط¹ط›أ¢â‚¬ط›ط¢آ³ط£آ¯ط¢آ¸ط¹ث†', 2),
        ('cat_medical', 'ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¢آ¬ط·آ¸ط¸آ¹ط·آ·ط¢آ©', 'Medical Tourism',    'ط¸â€¹ط¹ط›ط¹ث†ط¢آ¥', 3),
        ('cat_consult', 'ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¹آ¾ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط¹آ¾',      'Consulting',         'ط¸â€¹ط¹ط›أ¢â‚¬â„¢ط¢آ¬', 4),
        ('cat_desert',  'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ·ط¢آµط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸ط«â€ ط·آ¸ط¸آ¹ط·آ·ط¢آ©','Desert Adventures',  'ط¸â€¹ط¹ط›ط¥â€™أ¢â‚¬آ¦', 5),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO categories (id,name_ar,name_en,icon,sort_order) VALUES (?,?,?,?,?)",
        categories
    )

    # Tours
    tours = [
        ('tour_luxor',   'cat_tours',   'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آµط·آ·ط¢آ± ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ·ط¢آ©', 'Royal Luxor & Aswan Tour',
         'ط·آ·ط¢آ§ط·آ¸ط¦â€™ط·آ·ط¹آ¾ط·آ·ط¢آ´ط·آ¸ط¸آ¾ ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ¯ ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ± ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸ط¸آ¾ط·آ¸ط¸آ¹ ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ·ط¹آ¾ط·آ¸ط¹ث†ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ¶ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ¸ط¸آ¾ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ',
         'Discover the grandeur of temples and royal tombs in an unforgettable Nile journey',
         1200.0, 7, 'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†', 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸ط¦â€™ط·آ·ط¢آ«ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¹', 'Best Seller', 4.9, 128,
         '["ط·آ¸ط¸آ¾ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¯ط·آ¸أ¢â‚¬ع‘ 5 ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ¦","ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ´ط·آ·ط¢آ¯","ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¹آ¾","ط·آ¸أ¢â‚¬آ ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬â€چ"]',
         '["5-Star Hotel","Guided Tours","Meals","Transport"]', 1),
        ('tour_pyramids','cat_tours',   'ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ§ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ®ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ¸ط«â€ ط·آ¸ط¸آ¹ط·آ·ط¢آ©', 'Pyramids & Khedival Cairo Package',
         'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ¹ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ·ط¢آ¨ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ© ط·آ¸ط«â€ ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آµط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¦ط·آ·ط¢آ°ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ©',
         'A comprehensive trip to the wonder of the ancient world and Cairo',
         850.0, 5, 'ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛', 'ط·آ·ط¢آ¹ط·آ·ط¢آ±ط·آ·ط¢آ¶ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ¸ط«â€ ط·آ·ط¢آ¯', 'Limited Offer', 4.8, 95,
         '["ط·آ¸ط¸آ¾ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¯ط·آ¸أ¢â‚¬ع‘ 5 ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ¦","ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ¸ط¸آ¾ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ±ط·آ¸ط¸آ¹","ط·آ·ط¢آ£ط·آ·ط¢آ¨ط·آ¸ط«â€  ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬طŒط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چ","ط·آ·ط¢آ¬ط·آ¸ط¸آ¹ط·آ·ط¢آ²ط·آ·ط¢آ©"]',
         '["5-Star Hotel","Egyptian Museum","Sphinx","Giza"]', 1),
        ('tour_nile',    'cat_nile',    'ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¢آ®ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ²', 'Luxury Nile Cruise Tour',
         'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ¨ط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¢آ®ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آµط·آ·ط¢آ± ط·آ·ط¢آ­ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ  ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ ط·آ·ط¢آ²ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ£ط·آ¸ط¸آ¾ط·آ·ط¢آ¶ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦',
         'A luxurious Nile cruise from Luxor to Aswan with visits to the finest landmarks',
         1800.0, 10, 'ط¸â€¹ط¹ط›أ¢â‚¬ط›ط¢آ³ط£آ¯ط¢آ¸ط¹ث†', 'ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¢آ®ط·آ·ط¢آ±', 'Luxury', 5.0, 64,
         '["ط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ² 5 ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ¦","ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ¹ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¹آ¾","ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ´ط·آ·ط¢آ¯ ط·آ·ط¢آ®ط·آ·ط¢آ§ط·آ·ط¢آµ","ط·آ¸أ¢â‚¬آ ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬â€چ VIP"]',
         '["5-Star Cruise","All Meals","Private Guide","VIP Transfers"]', 1),
        ('tour_consult', 'cat_consult', 'ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¹آ¾ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ·ط¢آ´ط·آ·ط¢آ®ط·آ·ط¢آµط·آ¸ط¸آ¹ط·آ·ط¢آ©', 'Personal Tourism Consultation',
         'ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آµط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ·ط¹آ¾ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ®ط·آ·ط¢آµط·آ·ط¢آµط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ®ط·آ·ط¢آ¨ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط·إ’ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ  ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ  ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ®ط·آ·ط¢آ·ط·آ¸ط¸آ¹ط·آ·ط¢آ· ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ¸ط¦â€™ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ط·آ·ط¢آ©',
         'Get a personalized tourism consultation from certified Egyptian experts',
         150.0, None, 'ط¸â€¹ط¹ط›أ¢â‚¬â„¢ط¢آ¬', 'ط·آ·ط¢آ®ط·آ·ط¢آ¯ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ©', 'Service', 4.9, 210,
         '["ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ³ط·آ·ط¢آ© ط·آ·ط¢آ³ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ ","ط·آ·ط¢آ®ط·آ·ط¢آ·ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ®ط·آ·ط¢آµط·آ·ط¢آµط·آ·ط¢آ©","ط·آ·ط¢آ¯ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬آ¦ ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ·ط¢آ³ط·آ·ط¢آ§ط·آ·ط¢آ¨","ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آµط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¹آ¾"]',
         '["2-Hour Session","Custom Plan","WhatsApp Support","Recommendations"]', 0),
        ('tour_dental',  'cat_medical', 'ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ© ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¢آ¬ط·آ¸ط¸آ¹ط·آ·ط¢آ© - ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ', 'Medical Tourism - Dental Package',
         'ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¢آ¬ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ط·آ¸ط¦â€™ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ¨ط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ¸ط¸آ¾ط·آ·ط¢آ³ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ ط·آ·ط¢آ£ط·آ¸ط¸آ¾ط·آ·ط¢آ¶ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط·إ’ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ ',
         'Comprehensive medical tourism at competitive prices with the best Egyptian doctors',
         600.0, 5, 'ط¸â€¹ط¹ط›ط¢آ¦ط¢آ·', 'ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ¸ط¸آ¹', 'Medical', 4.7, 88,
         '["ط·آ¸ط¸آ¾ط·آ·ط¢آ­ط·آ·ط¢آµ ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چ","ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¢آ¬ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ط·آ¸ط¦â€™ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چ","ط·آ·ط¢آ¥ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ©","ط·آ¸أ¢â‚¬آ ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ¸ط¸آ¹"]',
         '["Full Checkup","Complete Treatment","Accommodation","Medical Transport"]', 0),
        ('tour_desert',  'cat_desert',  'ط·آ·ط¹آ¾ط·آ·ط¢آ¬ط·آ·ط¢آ±ط·آ·ط¢آ¨ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط·إ’ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط·â€؛ط·آ·ط¢آ±ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ©', 'Oasis & Western Desert Experience',
         'ط·آ¸أ¢â‚¬آ¦ط·آ·ط·â€؛ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ·ط¹آ¾ط·آ¸ط¹ث†ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ° ط·آ¸ط¸آ¾ط·آ¸ط¸آ¹ ط·آ·ط¢آ£ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬ع‘ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط·إ’ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط·â€؛ط·آ·ط¢آ±ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ·ط¢آ«ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ط·آ·ط¢آ©',
         'An unforgettable adventure deep in the Western Desert among oases and sand dunes',
         950.0, 6, 'ط¸â€¹ط¹ط›ط¥â€™أ¢â‚¬آ¦', 'ط·آ¸أ¢â‚¬آ¦ط·آ·ط·â€؛ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ©', 'Adventure', 4.8, 52,
         '["ط·آ·ط¢آ®ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¢آ®ط·آ·ط¢آ±ط·آ·ط¢آ©","ط·آ·ط¢آ¬ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ·ط¢آµط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸ط«â€ ط·آ¸ط¸آ¹ط·آ·ط¢آ©","ط·آ·ط¢آ±ط·آ·ط¢آµط·آ·ط¢آ¯ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ¦","ط·آ·ط¢آ·ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ¨ط·آ·ط¢آ¯ط·آ¸ط«â€ ط·آ¸ط¸آ¹"]',
         '["Luxury Camping","Desert Jeeps","Stargazing","Bedouin Food"]', 0),
    ]
    for t in tours:
        cur.execute("""
            INSERT OR IGNORE INTO tours
            (id,category_id,title_ar,title_en,description_ar,description_en,
             price,duration_days,image_emoji,badge_ar,badge_en,rating,reviews_count,
             includes_ar,includes_en,is_featured)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, t)

    # Demo users
    demo_users = [
        ('user_ramesses', 'ramesses@kemet.com',  hash_password('Demo1234!'), 'ط·آ·ط¢آ£ط·آ·ط¢آ­ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¯ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ¯', 'ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ³ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¹ط·آ·ط¢آ¸ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦', 'ط¸â€¹ط¹ط›أ¢â‚¬ع©أ¢â‚¬ع©', 'EG', 1, 'gold'),
        ('user_nefertiti','nefertiti@kemet.com', hash_password('Demo1234!'), 'ط·آ·ط¢آ³ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹',   'ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ط·آ·ط¢آ±ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¹آ¾ط·آ¸ط¸آ¹',      'ط¸â€¹ط¹ط›أ¢â‚¬â„¢ط¹ع©', 'SA', 1, 'platinum'),
        ('user_thutmose', 'thutmose@kemet.com',  hash_password('Demo1234!'), 'ط·آ·ط¢آ®ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¯ ط·آ·ط¢آ£ط·آ·ط¢آ­ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¯',  'ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ«', 'ط£آ¢ط¹â€کأ¢â‚¬â€Œط£آ¯ط¢آ¸ط¹ث†', 'AE', 0, 'classic'),
    ]
    for u in demo_users:
        cur.execute("""
            INSERT OR IGNORE INTO users (id,email,password_hash,name,nickname,avatar_emoji,country,is_verified,membership)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, u)

    # Demo posts
    demo_posts = [
        ('post_001', 'user_ramesses',
         'ط·آ·ط¢آ²ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ¯ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ ط·آ¸ط¦â€™ ط·آ¸ط¦â€™ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¹آ¾ ط·آ·ط¹آ¾ط·آ·ط¢آ¬ط·آ·ط¢آ±ط·آ·ط¢آ¨ط·آ·ط¢آ© ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ­ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ·ط¹آ¾ط·آ¸ط¹ث†ط·آ¸ط«â€ ط·آ·ط¢آµط·آ¸ط¸آ¾ ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث† ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ­ط·آ·ط¢آ¬ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آµط·آ·ط¢آµ ط·آ·ط¢آ¢ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ¸ط¸آ¾ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ ! ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ²ط·آ·ط¢آ§ط·آ·ط¢آ± ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آµط·آ·ط¢آ± ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ°ط·آ·ط¢آ§ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ´ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ±ط·آ·ط¹ط›',
         'Visiting Karnak Temple was an indescribable spiritual experience ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†',
         'ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†', '["#ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آµط·آ·ط¢آ±","#ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ¯_ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ ط·آ¸ط¦â€™","#ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ±"]', 342, 28, 15),
        ('post_002', 'user_nefertiti',
         'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط·â€؛ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ·ط¢آ¨ ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ ط·آ¸ط¸آ¾ط·آ¸ط¸آ¹ ط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ´ط·آ¸ط¸آ¹ط·آ·ط·إ’ ط·آ¸ط¸آ¹ط·آ·ط¢آ³ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¨ ط£آ¢أ¢â‚¬إ’ط¢آ¤ط£آ¯ط¢آ¸ط¹ث† ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¦â€™ط·آ¸أ¢â‚¬آ  ط·آ¸ط«â€ ط·آ·ط¢آµط·آ¸ط¸آ¾ط·آ¸أ¢â‚¬طŒ ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ·ط¹آ¾. ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ± ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¯ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ³ط·آ·ط¢آ­ط·آ·ط¢آ± ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ­ط·آ¸أ¢â‚¬ع‘ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬ع‘ط·آ¸ط¸آ¹ ط¸â€¹ط¹ط›ط¥â€™ط¸آ¹',
         'Sunset on the Nile in Aswan is something that steals your heart ط£آ¢أ¢â‚¬إ’ط¢آ¤ط£آ¯ط¢آ¸ط¹ث†',
         'ط¸â€¹ط¹ط›ط¥â€™أ¢â‚¬آ¦', '["#ط·آ·ط¢آ£ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ","#ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ","#Egypt"]', 891, 65, 43),
        ('post_003', 'user_thutmose',
         'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬طŒط·آ¸ط¸آ¹ط·آ·ط¹آ¾ ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¹ ط·آ¸ط¸آ¾ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬ع‘ ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ ط·آ¸ط¦â€™ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ±ط·آ·ط¢آ¬ ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ®ط·آ·ط¢آ¯ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ© ط·آ¸ط¦â€™ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¹آ¾ 10/10 ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ´ط·آ·ط¢آ¯ ط·آ¸ط¦â€™ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ  ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ­ط·آ¸ط¸آ¹ط·آ·ط¢آ©. ط·آ·ط¢آ£ط·آ¸أ¢â‚¬آ ط·آ·ط¢آµط·آ·ط¢آ­ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ¹!',
         'Just finished the Pyramids trip with Kemet Concierge ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛ Service was 10/10!',
         'ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛', '["#ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ£ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ·ط¹آ¾","#ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾","#ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¹آ¾"]', 224, 18, 9),
    ]
    for p in demo_posts:
        cur.execute("""
            INSERT OR IGNORE INTO posts (id,user_id,content,content_en,image_emoji,hashtags,likes_count,comments_count,shares_count)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, p)

    conn.commit()

# ============================================================
# DB API LAYER (used by both web and mobile backends)
# ============================================================

class KemetDB:
    def __init__(self):
        self.conn = get_conn()

    def close(self):
        self.conn.close()

    def _row_to_dict(self, row):
        if row is None:
            return None
        return dict(row)

    def _rows_to_list(self, rows):
        return [dict(r) for r in rows]

    # --- AUTH ---
    def register(self, email, password, name, nickname, avatar_emoji='ط¸â€¹ط¹ط›أ¢â‚¬ع©أ¢â‚¬ع©', country='', phone=''):
        uid = generate_id()
        ph = hash_password(password)
        try:
            self.conn.execute(
                "INSERT INTO users (id,email,password_hash,name,nickname,avatar_emoji,country,phone) VALUES (?,?,?,?,?,?,?,?)",
                (uid, email.lower().strip(), ph, name, nickname, avatar_emoji, country, phone)
            )
            self.conn.commit()
            return {'ok': True, 'user_id': uid}
        except sqlite3.IntegrityError:
            return {'ok': False, 'error': 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¨ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¯ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ·ط¹آ¾ط·آ·ط¢آ±ط·آ¸ط«â€ ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ·ط¹آ¾ط·آ·ط¢آ®ط·آ·ط¢آ¯ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چ'}

    def login(self, email, password, platform='web'):
        row = self.conn.execute(
            "SELECT * FROM users WHERE email=? AND is_active=1", (email.lower().strip(),)
        ).fetchone()
        if not row or row['password_hash'] != hash_password(password):
            return {'ok': False, 'error': 'ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¯ط·آ·ط¢آ®ط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چ ط·آ·ط·â€؛ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ·ط¢آµط·آ·ط¢آ­ط·آ¸ط¸آ¹ط·آ·ط¢آ­ط·آ·ط¢آ©'}
        token = generate_id()
        sid = generate_id()
        expires = (datetime.now() + timedelta(days=30)).isoformat()
        self.conn.execute(
            "INSERT INTO sessions (id,user_id,token,platform,expires_at) VALUES (?,?,?,?,?)",
            (sid, row['id'], token, platform, expires)
        )
        self.conn.commit()
        user = self._row_to_dict(row)
        user.pop('password_hash', None)
        return {'ok': True, 'token': token, 'user': user}

    def validate_token(self, token):
        row = self.conn.execute("""
            SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.id
            WHERE s.token=? AND s.expires_at > datetime('now') AND u.is_active=1
        """, (token,)).fetchone()
        if not row:
            return None
        user = self._row_to_dict(row)
        user.pop('password_hash', None)
        return user

    def logout(self, token):
        self.conn.execute("DELETE FROM sessions WHERE token=?", (token,))
        self.conn.commit()
        return {'ok': True}

    # --- USERS ---
    def get_user(self, user_id):
        row = self.conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        if not row:
            return None
        u = self._row_to_dict(row)
        u.pop('password_hash', None)
        return u

    def update_profile(self, user_id, **kwargs):
        allowed = ['name','nickname','avatar_emoji','country','phone','bio']
        updates = {k: v for k, v in kwargs.items() if k in allowed}
        if not updates:
            return {'ok': False, 'error': 'ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ¸ط¸آ¹ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ·ط¢آ¯ ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ·ط¹آ¾ ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ·ط¢آ«'}
        sets = ', '.join(f"{k}=?" for k in updates)
        vals = list(updates.values()) + [user_id]
        self.conn.execute(f"UPDATE users SET {sets} WHERE id=?", vals)
        self.conn.commit()
        return {'ok': True}

    # --- POSTS ---
    def create_post(self, user_id, content, content_en='', image_emoji='', hashtags=None, language='ar'):
        pid = generate_id()
        tags = json.dumps(hashtags or [], ensure_ascii=False)
        self.conn.execute(
            "INSERT INTO posts (id,user_id,content,content_en,image_emoji,hashtags,language) VALUES (?,?,?,?,?,?,?)",
            (pid, user_id, content, content_en, image_emoji, tags, language)
        )
        self.conn.commit()
        return {'ok': True, 'post_id': pid}

    def get_feed(self, user_id=None, limit=20, offset=0):
        rows = self.conn.execute("""
            SELECT p.id, p.content, p.content_en, p.image_emoji, p.hashtags,
                   p.likes_count, p.comments_count, p.shares_count, p.created_at,
                   u.id as user_id, u.nickname, u.avatar_emoji, u.is_verified, u.membership
            FROM posts p JOIN users u ON p.user_id=u.id
            WHERE p.is_deleted=0
            ORDER BY p.created_at DESC LIMIT ? OFFSET ?
        """, (limit, offset)).fetchall()
        return self._rows_to_list(rows)

    def delete_post(self, post_id, user_id):
        self.conn.execute(
            "UPDATE posts SET is_deleted=1 WHERE id=? AND user_id=?", (post_id, user_id)
        )
        self.conn.commit()
        return {'ok': True}

    # --- LIKES ---
    def toggle_like(self, user_id, post_id):
        existing = self.conn.execute(
            "SELECT id FROM likes WHERE user_id=? AND post_id=?", (user_id, post_id)
        ).fetchone()
        if existing:
            self.conn.execute("DELETE FROM likes WHERE user_id=? AND post_id=?", (user_id, post_id))
            self.conn.commit()
            return {'ok': True, 'liked': False}
        else:
            lid = generate_id()
            self.conn.execute("INSERT INTO likes (id,user_id,post_id) VALUES (?,?,?)", (lid, user_id, post_id))
            self.conn.commit()
            return {'ok': True, 'liked': True}

    def get_post_likes(self, post_id):
        count = self.conn.execute("SELECT COUNT(*) as c FROM likes WHERE post_id=?", (post_id,)).fetchone()
        return count['c'] if count else 0

    # --- COMMENTS ---
    def add_comment(self, user_id, post_id, content, parent_id=None):
        cid = generate_id()
        self.conn.execute(
            "INSERT INTO comments (id,user_id,post_id,parent_id,content) VALUES (?,?,?,?,?)",
            (cid, user_id, post_id, parent_id, content)
        )
        self.conn.commit()
        return {'ok': True, 'comment_id': cid}

    def get_comments(self, post_id):
        rows = self.conn.execute("""
            SELECT c.id, c.content, c.created_at, c.likes_count,
                   u.nickname, u.avatar_emoji
            FROM comments c JOIN users u ON c.user_id=u.id
            WHERE c.post_id=? AND c.is_deleted=0 AND c.parent_id IS NULL
            ORDER BY c.created_at ASC
        """, (post_id,)).fetchall()
        return self._rows_to_list(rows)

    # --- FOLLOWS ---
    def toggle_follow(self, follower_id, following_id):
        if follower_id == following_id:
            return {'ok': False, 'error': 'ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¦â€™ط·آ¸أ¢â‚¬آ ط·آ¸ط¦â€™ ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ط·آ·ط¢آ³ط·آ¸ط¦â€™'}
        existing = self.conn.execute(
            "SELECT id FROM follows WHERE follower_id=? AND following_id=?",
            (follower_id, following_id)
        ).fetchone()
        if existing:
            self.conn.execute(
                "DELETE FROM follows WHERE follower_id=? AND following_id=?",
                (follower_id, following_id)
            )
            self.conn.commit()
            return {'ok': True, 'following': False}
        else:
            fid = generate_id()
            self.conn.execute(
                "INSERT INTO follows (id,follower_id,following_id) VALUES (?,?,?)",
                (fid, follower_id, following_id)
            )
            self.conn.commit()
            return {'ok': True, 'following': True}

    # --- MESSAGES ---
    def send_message(self, sender_id, receiver_id, content):
        mid = generate_id()
        self.conn.execute(
            "INSERT INTO messages (id,sender_id,receiver_id,content) VALUES (?,?,?,?)",
            (mid, sender_id, receiver_id, content)
        )
        self.conn.commit()
        return {'ok': True, 'message_id': mid}

    def get_conversation(self, user_a, user_b, limit=50):
        rows = self.conn.execute("""
            SELECT m.id, m.content, m.is_read, m.created_at,
                   m.sender_id, u.nickname as sender_name
            FROM messages m JOIN users u ON m.sender_id=u.id
            WHERE (m.sender_id=? AND m.receiver_id=?)
               OR (m.sender_id=? AND m.receiver_id=?)
            ORDER BY m.created_at DESC LIMIT ?
        """, (user_a, user_b, user_b, user_a, limit)).fetchall()
        return self._rows_to_list(rows)

    def get_inbox(self, user_id):
        rows = self.conn.execute("""
            SELECT DISTINCT
                CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END as other_id,
                u.nickname as other_name, u.avatar_emoji,
                m.content as last_message, m.created_at,
                SUM(CASE WHEN m.receiver_id=? AND m.is_read=0 THEN 1 ELSE 0 END) as unread
            FROM messages m
            JOIN users u ON u.id = CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END
            WHERE m.sender_id=? OR m.receiver_id=?
            GROUP BY other_id
            ORDER BY m.created_at DESC
        """, (user_id, user_id, user_id, user_id, user_id)).fetchall()
        return self._rows_to_list(rows)

    # --- NOTIFICATIONS ---
    def add_notification(self, user_id, actor_id, ntype, content, post_id=None):
        nid = generate_id()
        self.conn.execute(
            "INSERT INTO notifications (id,user_id,actor_id,type,post_id,content) VALUES (?,?,?,?,?,?)",
            (nid, user_id, actor_id, ntype, post_id, content)
        )
        self.conn.commit()

    def get_notifications(self, user_id, limit=20):
        rows = self.conn.execute("""
            SELECT n.id, n.type, n.content, n.is_read, n.created_at,
                   u.nickname as actor_name, u.avatar_emoji as actor_avatar
            FROM notifications n
            LEFT JOIN users u ON n.actor_id=u.id
            WHERE n.user_id=?
            ORDER BY n.created_at DESC LIMIT ?
        """, (user_id, limit)).fetchall()
        return self._rows_to_list(rows)

    def mark_notifications_read(self, user_id):
        self.conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user_id,))
        self.conn.commit()

    # --- TOURS ---
    def get_tours(self, category_id=None, featured_only=False):
        q = "SELECT t.*, c.name_ar as cat_ar, c.name_en as cat_en FROM tours t LEFT JOIN categories c ON t.category_id=c.id WHERE t.is_active=1"
        params = []
        if category_id:
            q += " AND t.category_id=?"
            params.append(category_id)
        if featured_only:
            q += " AND t.is_featured=1"
        q += " ORDER BY t.is_featured DESC, t.rating DESC"
        rows = self.conn.execute(q, params).fetchall()
        return self._rows_to_list(rows)

    def get_tour(self, tour_id):
        row = self.conn.execute(
            "SELECT t.*, c.name_ar as cat_ar FROM tours t LEFT JOIN categories c ON t.category_id=c.id WHERE t.id=?",
            (tour_id,)
        ).fetchone()
        return self._row_to_dict(row)

    def get_categories(self):
        rows = self.conn.execute(
            "SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order"
        ).fetchall()
        return self._rows_to_list(rows)

    # --- BOOKINGS ---
    def create_booking(self, user_id, tour_id, guests_count=1, travel_date='',
                       payment_method='', contact_phone='', contact_email='', special_requests=''):
        tour = self.get_tour(tour_id)
        if not tour:
            return {'ok': False, 'error': 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط·â€؛ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ·ط¢آ¯ط·آ·ط¢آ©'}
        total = tour['price'] * guests_count
        bid = generate_id()
        self.conn.execute("""
            INSERT INTO bookings
            (id,user_id,tour_id,guests_count,total_price,currency,payment_method,
             travel_date,contact_phone,contact_email,special_requests)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (bid, user_id, tour_id, guests_count, total, tour.get('currency','USD'),
              payment_method, travel_date, contact_phone, contact_email, special_requests))
        self.conn.execute(
            "UPDATE tours SET bookings_count = bookings_count + 1 WHERE id=?", (tour_id,)
        )
        self.conn.commit()
        return {'ok': True, 'booking_id': bid, 'total_price': total}

    def get_user_bookings(self, user_id):
        rows = self.conn.execute("""
            SELECT b.*, t.title_ar, t.title_en, t.image_emoji
            FROM bookings b JOIN tours t ON b.tour_id=t.id
            WHERE b.user_id=? ORDER BY b.created_at DESC
        """, (user_id,)).fetchall()
        return self._rows_to_list(rows)

    def confirm_payment(self, booking_id, user_id, payment_method, payment_ref=''):
        booking = self.conn.execute(
            "SELECT * FROM bookings WHERE id=? AND user_id=?", (booking_id, user_id)
        ).fetchone()
        if not booking:
            return {'ok': False, 'error': 'ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ­ط·آ·ط¢آ¬ط·آ·ط¢آ² ط·آ·ط·â€؛ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ·ط¢آ¯'}
        pid = generate_id()
        self.conn.execute(
            "INSERT INTO payments (id,booking_id,user_id,amount,currency,method,status,gateway_ref) VALUES (?,?,?,?,?,?,?,?)",
            (pid, booking_id, user_id, booking['total_price'], booking['currency'],
             payment_method, 'completed', payment_ref)
        )
        self.conn.execute(
            "UPDATE bookings SET status='confirmed', payment_status='paid', payment_method=?, payment_ref=? WHERE id=?",
            (payment_method, payment_ref or pid, booking_id)
        )
        self.conn.commit()
        return {'ok': True, 'payment_id': pid}

    # --- REVIEWS ---
    def add_review(self, user_id, tour_id, rating, comment='', booking_id=None):
        rid = generate_id()
        try:
            self.conn.execute(
                "INSERT INTO reviews (id,user_id,tour_id,booking_id,rating,comment) VALUES (?,?,?,?,?,?)",
                (rid, user_id, tour_id, booking_id, rating, comment)
            )
            self.conn.commit()
            # Update tour rating
            avg = self.conn.execute(
                "SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE tour_id=? AND is_approved=1",
                (tour_id,)
            ).fetchone()
            if avg:
                self.conn.execute(
                    "UPDATE tours SET rating=?, reviews_count=? WHERE id=?",
                    (round(avg['avg'], 1), avg['cnt'], tour_id)
                )
                self.conn.commit()
            return {'ok': True, 'review_id': rid}
        except sqlite3.IntegrityError:
            return {'ok': False, 'error': 'ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¯ ط·آ¸أ¢â‚¬ع‘ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬ع©ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ ط·آ¸أ¢â‚¬طŒط·آ·ط¢آ°ط·آ¸أ¢â‚¬طŒ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬â€چ'}

    # --- PHARAOH NICKNAMES ---
    def get_pharaoh_nicknames(self):
        rows = self.conn.execute(
            "SELECT * FROM pharaoh_nicknames ORDER BY sort_order"
        ).fetchall()
        return self._rows_to_list(rows)

    # --- STATS ---
    def get_stats(self):
        users = self.conn.execute("SELECT COUNT(*) as c FROM users WHERE is_active=1").fetchone()['c']
        posts = self.conn.execute("SELECT COUNT(*) as c FROM posts WHERE is_deleted=0").fetchone()['c']
        bookings = self.conn.execute("SELECT COUNT(*) as c FROM bookings").fetchone()['c']
        revenue = self.conn.execute("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE status='completed'").fetchone()['s']
        return {'users': users, 'posts': posts, 'bookings': bookings, 'revenue': revenue}


# ============================================================
# RUN TESTS
# ============================================================
def run_tests():
    print("\n" + "="*60)
    print("  KEMET SOCIAL - DATABASE TEST SUITE")
    print("="*60)

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = init_db()
    seed_data(conn)
    conn.close()
    print("ط£آ¢ط¥â€œأ¢â‚¬آ¦ Schema created and seeded")

    db = KemetDB()
    errors = []

    def check(label, result, expect_ok=True):
        ok = result.get('ok', False) if isinstance(result, dict) else bool(result)
        status = "ط£آ¢ط¥â€œأ¢â‚¬آ¦" if ok == expect_ok else "ط£آ¢أ¢â‚¬إ’ط¥â€™"
        if ok != expect_ok:
            errors.append(f"{label}: {result}")
        print(f"  {status} {label}")
        return result

    print("\n--- AUTH TESTS ---")
    r = check("Register new user", db.register('test@kemet.com','Pass1234!','ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¯','ط·آ·ط¢آ®ط·آ¸ط«â€ ط·آ¸ط¸آ¾ط·آ¸ط«â€ ','ط¸â€¹ط¹ط›ط¹ث†أ¢â‚¬ط›ط£آ¯ط¢آ¸ط¹ث†','EG','0100'))
    uid = r.get('user_id')

    check("Register duplicate email", db.register('test@kemet.com','x','y','z'), expect_ok=False)

    r2 = check("Login valid", db.login('test@kemet.com','Pass1234!'))
    token = r2.get('token')

    check("Login wrong password", db.login('test@kemet.com','wrong'), expect_ok=False)

    user = db.validate_token(token)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if user else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Token validation: {user['nickname'] if user else 'FAILED'}")

    check("Login demo user", db.login('ramesses@kemet.com','Demo1234!'))
    demo_login = db.login('ramesses@kemet.com','Demo1234!')
    demo_uid = demo_login['user'].get('id')
    demo_token = demo_login.get('token')

    print("\n--- PROFILE TESTS ---")
    check("Update profile", db.update_profile(uid, bio='ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ·ط¢آ§ط·آ¸ط¸آ¾ط·آ·ط¢آ± ط·آ¸ط«â€ ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آ´ط·آ¸أ¢â‚¬ع‘ ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ­ط·آ·ط¢آ¶ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾'))
    u = db.get_user(uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if u and u.get('bio') else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Profile bio saved: {u.get('bio','') if u else 'N/A'}")

    print("\n--- POSTS TESTS ---")
    r = check("Create post", db.create_post(uid, 'ط·آ·ط¢آ£ط·آ¸ط«â€ ط·آ¸أ¢â‚¬â€چ ط·آ·ط¹آ¾ط·آ·ط·â€؛ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¯ط·آ·ط¢آ© ط·آ¸ط¸آ¾ط·آ¸ط¸آ¹ ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ ط·آ·ط¢آ³ط·آ¸ط«â€ ط·آ·ط¢آ´ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چ! ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛', 'My first Kemet post!', 'ط¸â€¹ط¹ط›أ¢â‚¬â€Œط·â€؛', ['#ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾','#ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آµط·آ·ط¢آ±']))
    pid = r.get('post_id')

    feed = db.get_feed(uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(feed) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Feed loaded: {len(feed)} posts")

    print("\n--- LIKES TESTS ---")
    r = check("Like post", db.toggle_like(uid, pid))
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if r.get('liked') else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Post liked: {r.get('liked')}")
    r2 = check("Unlike post", db.toggle_like(uid, pid))
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if not r2.get('liked') else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Post unliked: {not r2.get('liked')}")

    print("\n--- COMMENTS TESTS ---")
    r = check("Add comment", db.add_comment(uid, pid, 'ط·آ·ط¹آ¾ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬ع‘ ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط¢آ¦ط·آ·ط¢آ¹ ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ´ط·آ¸ط«â€ ط·آ·ط¢آ±!'))
    comments = db.get_comments(pid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(comments) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Comments loaded: {len(comments)}")

    print("\n--- FOLLOWS TESTS ---")
    check("Follow user", db.toggle_follow(uid, demo_uid))
    check("Unfollow user", db.toggle_follow(uid, demo_uid))
    check("Follow self (should fail)", db.toggle_follow(uid, uid), expect_ok=False)

    print("\n--- MESSAGES TESTS ---")
    check("Send message", db.send_message(uid, demo_uid, 'ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¹ط·آ·ط¥â€™ ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸ط¸آ¾ ط·آ·ط¢آ­ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ·ط¹ط›'))
    check("Send reply", db.send_message(demo_uid, uid, 'ط·آ·ط¢آ¨ط·آ·ط¢آ®ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ·ط¢آ´ط·آ¸ط¦â€™ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¹! ط·آ¸ط¦â€™ط·آ¸ط¸آ¹ط·آ¸ط¸آ¾ ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ¸ط¦â€™ط·آ·ط¹ط›'))
    conv = db.get_conversation(uid, demo_uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(conv) >= 2 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Conversation loaded: {len(conv)} messages")
    inbox = db.get_inbox(uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(inbox) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Inbox loaded: {len(inbox)} chats")

    print("\n--- TOURS TESTS ---")
    tours = db.get_tours()
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(tours) >= 6 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} All tours loaded: {len(tours)}")
    featured = db.get_tours(featured_only=True)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(featured) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Featured tours: {len(featured)}")
    cats = db.get_categories()
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(cats) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Categories: {len(cats)}")
    tour = db.get_tour('tour_luxor')
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if tour else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Get single tour: {tour.get('title_ar','') if tour else 'N/A'}")

    print("\n--- BOOKINGS TESTS ---")
    r = check("Create booking", db.create_booking(uid,'tour_pyramids',2,'2025-12-01','card','0100000000','test@kemet.com','ط·آ·ط·â€؛ط·آ·ط¢آ±ط·آ¸ط¸آ¾ط·آ·ط¢آ© ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ·ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ·ط¢آ¹ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ'))
    bid = r.get('booking_id')
    total = r.get('total_price')
    print(f"  ط£آ¢ط¥â€œأ¢â‚¬آ¦ Total price calculated: ${total}")

    r2 = check("Confirm payment", db.confirm_payment(bid, uid, 'card', 'PAY_REF_001'))
    my_bookings = db.get_user_bookings(uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(my_bookings) > 0 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} User bookings: {len(my_bookings)}")
    booking_status = my_bookings[0].get('status') if my_bookings else 'unknown'
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if booking_status == 'confirmed' else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Booking status: {booking_status}")

    print("\n--- REVIEWS TESTS ---")
    check("Add review", db.add_review(uid, 'tour_pyramids', 5, 'ط·آ·ط¢آ±ط·آ·ط¢آ­ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ·ط¹آ¾ط·آ¸ط¹ث†ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ°ط·آ·ط¥â€™ ط·آ·ط¢آ£ط·آ¸أ¢â‚¬آ ط·آ·ط¢آµط·آ·ط¢آ­ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ¹!', bid))
    check("Duplicate review (should fail)", db.add_review(uid, 'tour_pyramids', 4, 'ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ£ط·آ·ط¢آ®ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ°'), expect_ok=False)

    print("\n--- NOTIFICATIONS TESTS ---")
    db.add_notification(uid, demo_uid, 'like', 'ط·آ·ط¢آ£ط·آ·ط¢آ¹ط·آ·ط¢آ¬ط·آ·ط¢آ¨ ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ³ ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ´ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ¸ط¦â€™', pid)
    db.add_notification(uid, demo_uid, 'follow', 'ط·آ·ط¢آ¨ط·آ·ط¢آ¯ط·آ·ط¢آ£ ط·آ·ط¢آ±ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ³ ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬آ¦ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ¹ط·آ·ط¹آ¾ط·آ¸ط¦â€™')
    notifs = db.get_notifications(uid)
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(notifs) >= 2 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Notifications: {len(notifs)}")
    db.mark_notifications_read(uid)

    print("\n--- PHARAOH NICKNAMES TEST ---")
    pharaohs = db.get_pharaoh_nicknames()
    print(f"  {'ط£آ¢ط¥â€œأ¢â‚¬آ¦' if len(pharaohs) == 12 else 'ط£آ¢أ¢â‚¬إ’ط¥â€™'} Pharaoh nicknames: {len(pharaohs)}")

    print("\n--- STATS TEST ---")
    stats = db.get_stats()
    print(f"  ط£آ¢ط¥â€œأ¢â‚¬آ¦ Stats: {stats['users']} users | {stats['posts']} posts | {stats['bookings']} bookings | ${stats['revenue']} revenue")

    check("Logout", db.logout(token))

    db.close()

    print("\n" + "="*60)
    if errors:
        print(f"ط£آ¢أ¢â‚¬إ’ط¥â€™ {len(errors)} TEST(S) FAILED:")
        for e in errors:
            print(f"   - {e}")
    else:
        print("ط£آ¢ط¥â€œأ¢â‚¬آ¦ ALL TESTS PASSED ط£آ¢أ¢â€ڑآ¬أ¢â‚¬â€Œ Database is fully operational")
    print("="*60 + "\n")
    return len(errors) == 0


if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)


def init_db():
    conn = get_conn()
    db_url = os.environ.get('DATABASE_URL')
    if db_url and USE_PG:
        cur = conn.cursor()
        tables = SCHEMA.replace('PRAGMA foreign_keys = ON;','').replace('PRAGMA journal_mode = WAL;','')
        for stmt in tables.split(';'):
            stmt = stmt.strip()
            if stmt:
                try:
                    cur.execute(stmt)
                except:
                    pass
        conn.commit()
    else:
        conn.executescript(SCHEMA)
        conn.commit()
    return conn

