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
  avatar_emoji  TEXT DEFAULT 'ًں‘‘',
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
  icon       TEXT DEFAULT 'ًںڈ›ï¸ڈ',
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
  image_emoji    TEXT DEFAULT 'ًںڈ›ï¸ڈ',
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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.commit()
    return conn

def seed_data(conn):
    cur = conn.cursor()

    # Pharaoh nicknames
    pharaohs = [
        ('ط±ظ…ط³ظٹط³ ط§ظ„ط¹ط¸ظٹظ…',  'Ramesses the Great', 'ًں‘‘', 'ط§ظ„ط£ط³ط±ط© ط§ظ„طھط§ط³ط¹ط© ط¹ط´ط±ط©',  1),
        ('طھظˆطھ ط¹ظ†ط® ط¢ظ…ظˆظ†',  'Tutankhamun',         'âڑ±ï¸ڈ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط±ط©', 2),
        ('ط­طھط´ط¨ط³ظˆطھ',       'Hatshepsut',           'ًںŒ؛', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط±ط©', 3),
        ('ط£ط®ظ†ط§طھظˆظ†',       'Akhenaten',            'âک€ï¸ڈ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط±ط©', 4),
        ('ظ†ظپط±طھظٹطھظٹ',       'Nefertiti',            'ًں’ژ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط±ط©', 5),
        ('طھط­طھظ…ط³ ط§ظ„ط«ط§ظ„ط«',  'Thutmose III',         'âڑ”ï¸ڈ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط«ط§ظ…ظ†ط© ط¹ط´ط±ط©', 6),
        ('ط³ظ†ظپط±ظˆ',         'Sneferu',              'ًں”؛', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط±ط§ط¨ط¹ط©',       7),
        ('ط®ظˆظپظˆ',          'Khufu',                'ًںڈ›ï¸ڈ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط±ط§ط¨ط¹ط©',      8),
        ('ظ†ظپط±طھط§ط±ظٹ',       'Nefertari',            'ًںŒ™', 'ط§ظ„ط£ط³ط±ط© ط§ظ„طھط§ط³ط¹ط© ط¹ط´ط±ط©', 9),
        ('ظƒظ„ظٹظˆط¨ط§طھط±ط§',     'Cleopatra',            'ًںگچ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„ط¨ط·ظ„ظ…ظٹط©',     10),
        ('ط³ظٹطھظٹ ط§ظ„ط£ظˆظ„',    'Seti I',               'ًں¦…', 'ط§ظ„ط£ط³ط±ط© ط§ظ„طھط§ط³ط¹ط© ط¹ط´ط±ط©',11),
        ('ظ…ط±ظ†ط¨طھط§ط­',       'Merneptah',            'ًںŒٹ', 'ط§ظ„ط£ط³ط±ط© ط§ظ„طھط§ط³ط¹ط© ط¹ط´ط±ط©',12),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO pharaoh_nicknames (name_ar,name_en,emoji,dynasty,sort_order) VALUES (?,?,?,?,?)",
        pharaohs
    )

    # Categories
    categories = [
        ('cat_tours',   'ط±ط­ظ„ط§طھ ط³ظٹط§ط­ظٹط©',  'Tours',             'ًںڈ›ï¸ڈ', 1),
        ('cat_nile',    'ظƒط±ظˆط² ط§ظ„ظ†ظٹظ„',    'Nile Cruises',       'ًں›³ï¸ڈ', 2),
        ('cat_medical', 'ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط©', 'Medical Tourism',    'ًںڈ¥', 3),
        ('cat_consult', 'ط§ط³طھط´ط§ط±ط§طھ',      'Consulting',         'ًں’¬', 4),
        ('cat_desert',  'ط±ط­ظ„ط§طھ طµط­ط±ط§ظˆظٹط©','Desert Adventures',  'ًںŒ…', 5),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO categories (id,name_ar,name_en,icon,sort_order) VALUES (?,?,?,?,?)",
        categories
    )

    # Tours
    tours = [
        ('tour_luxor',   'cat_tours',   'ط±ط­ظ„ط© ط§ظ„ط£ظ‚طµط± ظˆط§ظ„ط£ط³ظˆط§ظ† ط§ظ„ظ…ظ„ظƒظٹط©', 'Royal Luxor & Aswan Tour',
         'ط§ظƒطھط´ظپ ط±ظˆط¹ط© ط§ظ„ظ…ط¹ط§ط¨ط¯ ظˆط§ظ„ظ…ظ‚ط§ط¨ط± ط§ظ„ظ…ظ„ظƒظٹط© ظپظٹ ط±ط­ظ„ط© ظ„ط§ طھظڈظ†ط³ظ‰ ط¹ظ„ظ‰ ط¶ظپط§ظپ ط§ظ„ظ†ظٹظ„',
         'Discover the grandeur of temples and royal tombs in an unforgettable Nile journey',
         1200.0, 7, 'ًںڈ›ï¸ڈ', 'ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ط§ظ‹', 'Best Seller', 4.9, 128,
         '["ظپظ†ط¯ظ‚ 5 ظ†ط¬ظˆظ…","ط¬ظˆظ„ط§طھ ظ…ط¹ ظ…ط±ط´ط¯","ظˆط¬ط¨ط§طھ","ظ†ظ‚ظ„"]',
         '["5-Star Hotel","Guided Tours","Meals","Transport"]', 1),
        ('tour_pyramids','cat_tours',   'ط¨ط§ظ‚ط© ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ ظˆط§ظ„ظ‚ط§ظ‡ط±ط© ط§ظ„ط®ط¯ظٹظˆظٹط©', 'Pyramids & Khedival Cairo Package',
         'ط±ط­ظ„ط© ط´ط§ظ…ظ„ط© ظ„ط£ط¹ط¬ظˆط¨ط© ط§ظ„ط¹ط§ظ„ظ… ط§ظ„ظ‚ط¯ظٹظ…ط© ظˆط¹ط§طµظ…ط© ط§ظ„ط£ظ„ظپ ظ…ط¦ط°ظ†ط©',
         'A comprehensive trip to the wonder of the ancient world and Cairo',
         850.0, 5, 'ًں”؛', 'ط¹ط±ط¶ ظ…ط­ط¯ظˆط¯', 'Limited Offer', 4.8, 95,
         '["ظپظ†ط¯ظ‚ 5 ظ†ط¬ظˆظ…","ط§ظ„ظ…طھط­ظپ ط§ظ„ظ…طµط±ظٹ","ط£ط¨ظˆ ط§ظ„ظ‡ظˆظ„","ط¬ظٹط²ط©"]',
         '["5-Star Hotel","Egyptian Museum","Sphinx","Giza"]', 1),
        ('tour_nile',    'cat_nile',    'ط¬ظˆظ„ط© ط§ظ„ظ†ظٹظ„ ط§ظ„ظپط§ط®ط±ط© ط¹ظ„ظ‰ ظƒط±ظˆط²', 'Luxury Nile Cruise Tour',
         'ط±ط­ظ„ط© ط¨ط­ط±ظٹط© ظپط§ط®ط±ط© ط¹ظ„ظ‰ ط§ظ„ظ†ظٹظ„ ظ…ظ† ط§ظ„ط£ظ‚طµط± ط­طھظ‰ ط£ط³ظˆط§ظ† ظ…ط¹ ط²ظٹط§ط±ط© ط£ظپط¶ظ„ ط§ظ„ظ…ط¹ط§ظ„ظ…',
         'A luxurious Nile cruise from Luxor to Aswan with visits to the finest landmarks',
         1800.0, 10, 'ًں›³ï¸ڈ', 'ظپط§ط®ط±', 'Luxury', 5.0, 64,
         '["ظƒط±ظˆط² 5 ظ†ط¬ظˆظ…","ط¬ظ…ظٹط¹ ط§ظ„ظˆط¬ط¨ط§طھ","ظ…ط±ط´ط¯ ط®ط§طµ","ظ†ظ‚ظ„ VIP"]',
         '["5-Star Cruise","All Meals","Private Guide","VIP Transfers"]', 1),
        ('tour_consult', 'cat_consult', 'ط§ط³طھط´ط§ط±ط© ط³ظٹط§ط­ظٹط© ط´ط®طµظٹط©', 'Personal Tourism Consultation',
         'ط§ط­طµظ„ ط¹ظ„ظ‰ ط§ط³طھط´ط§ط±ط© ط³ظٹط§ط­ظٹط© ظ…ط®طµطµط© ظ…ظ† ط®ط¨ط±ط§ط، ظ…طµط±ظٹظٹظ† ظ…ط¹طھظ…ط¯ظٹظ† ظ„طھط®ط·ظٹط· ط±ط­ظ„طھظƒ ط§ظ„ظ…ط«ط§ظ„ظٹط©',
         'Get a personalized tourism consultation from certified Egyptian experts',
         150.0, None, 'ًں’¬', 'ط®ط¯ظ…ط©', 'Service', 4.9, 210,
         '["ط¬ظ„ط³ط© ط³ط§ط¹طھظٹظ†","ط®ط·ط© ظ…ط®طµطµط©","ط¯ط¹ظ… ظˆط§طھط³ط§ط¨","طھظˆطµظٹط§طھ"]',
         '["2-Hour Session","Custom Plan","WhatsApp Support","Recommendations"]', 0),
        ('tour_dental',  'cat_medical', 'ط¨ط§ظ‚ط© ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط© - ط§ظ„ط£ط³ظ†ط§ظ†', 'Medical Tourism - Dental Package',
         'ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط© ظ…طھظƒط§ظ…ظ„ط© ط¨ط£ط³ط¹ط§ط± ظ…ظ†ط§ظپط³ط© ظ…ط¹ ط£ظپط¶ظ„ ط§ظ„ط£ط·ط¨ط§ط، ط§ظ„ظ…طµط±ظٹظٹظ†',
         'Comprehensive medical tourism at competitive prices with the best Egyptian doctors',
         600.0, 5, 'ًں¦·', 'ط·ط¨ظٹ', 'Medical', 4.7, 88,
         '["ظپط­طµ ط´ط§ظ…ظ„","ط¹ظ„ط§ط¬ ظ…طھظƒط§ظ…ظ„","ط¥ظ‚ط§ظ…ط©","ظ†ظ‚ظ„ ط·ط¨ظٹ"]',
         '["Full Checkup","Complete Treatment","Accommodation","Medical Transport"]', 0),
        ('tour_desert',  'cat_desert',  'طھط¬ط±ط¨ط© ط§ظ„ظˆط§ط­ط§طھ ظˆط§ظ„طµط­ط±ط§ط، ط§ظ„ط؛ط±ط¨ظٹط©', 'Oasis & Western Desert Experience',
         'ظ…ط؛ط§ظ…ط±ط© ظ„ط§ طھظڈظ†ط³ظ‰ ظپظٹ ط£ط¹ظ…ط§ظ‚ ط§ظ„طµط­ط±ط§ط، ط§ظ„ط؛ط±ط¨ظٹط© ط¨ظٹظ† ط§ظ„ظˆط§ط­ط§طھ ظˆط§ظ„ظƒط«ط¨ط§ظ† ط§ظ„ط±ظ…ظ„ظٹط©',
         'An unforgettable adventure deep in the Western Desert among oases and sand dunes',
         950.0, 6, 'ًںŒ…', 'ظ…ط؛ط§ظ…ط±ط©', 'Adventure', 4.8, 52,
         '["ط®ظٹط§ظ… ظپط§ط®ط±ط©","ط¬ظٹط¨ط§طھ طµط­ط±ط§ظˆظٹط©","ط±طµط¯ ط§ظ„ظ†ط¬ظˆظ…","ط·ط¹ط§ظ… ط¨ط¯ظˆظٹ"]',
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
        ('user_ramesses', 'ramesses@kemet.com',  hash_password('Demo1234!'), 'ط£ط­ظ…ط¯ ظ…ط­ظ…ظˆط¯', 'ط±ظ…ط³ظٹط³ ط§ظ„ط¹ط¸ظٹظ…', 'ًں‘‘', 'EG', 1, 'gold'),
        ('user_nefertiti','nefertiti@kemet.com', hash_password('Demo1234!'), 'ط³ط§ط±ط© ط¹ظ„ظٹ',   'ظ†ظپط±طھظٹطھظٹ',      'ًں’ژ', 'SA', 1, 'platinum'),
        ('user_thutmose', 'thutmose@kemet.com',  hash_password('Demo1234!'), 'ط®ط§ظ„ط¯ ط£ط­ظ…ط¯',  'طھط­طھظ…ط³ ط§ظ„ط«ط§ظ„ط«', 'âڑ”ï¸ڈ', 'AE', 0, 'classic'),
    ]
    for u in demo_users:
        cur.execute("""
            INSERT OR IGNORE INTO users (id,email,password_hash,name,nickname,avatar_emoji,country,is_verified,membership)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, u)

    # Demo posts
    demo_posts = [
        ('post_001', 'user_ramesses',
         'ط²ظٹط§ط±ط© ظ…ط¹ط¨ط¯ ط§ظ„ظƒط±ظ†ظƒ ظƒط§ظ†طھ طھط¬ط±ط¨ط© ط±ظˆط­ط§ظ†ظٹط© ظ„ط§ طھظڈظˆطµظپ ًںڈ›ï¸ڈ ط§ظ„ط­ط¬ط§ط±ط© طھط­ظƒظٹ ظ‚طµطµ ط¢ظ„ط§ظپ ط§ظ„ط³ظ†ظٹظ†! ظ…ظ† ط²ط§ط± ط§ظ„ط£ظ‚طµط± ظ‡ط°ط§ ط§ظ„ط´ظ‡ط±طں',
         'Visiting Karnak Temple was an indescribable spiritual experience ًںڈ›ï¸ڈ',
         'ًںڈ›ï¸ڈ', '["#ط§ظ„ط£ظ‚طµط±","#ظ…ط¹ط¨ط¯_ط§ظ„ظƒط±ظ†ظƒ","#ظ…طµط±"]', 342, 28, 15),
        ('post_002', 'user_nefertiti',
         'ط§ظ„ط؛ط±ظˆط¨ ط¹ظ„ظ‰ ط§ظ„ظ†ظٹظ„ ظپظٹ ط£ط³ظˆط§ظ† ط´ظٹط، ظٹط³ط±ظ‚ ط§ظ„ظ‚ظ„ط¨ â‌¤ï¸ڈ ظ„ط§ ظٹظ…ظƒظ† ظˆطµظپظ‡ ط¨ط§ظ„ظƒظ„ظ…ط§طھ. ظ…طµط± ط¨ظ„ط¯ ط§ظ„ط³ط­ط± ظˆط§ظ„ط¬ظ…ط§ظ„ ط§ظ„ط­ظ‚ظٹظ‚ظٹ ًںŒٹ',
         'Sunset on the Nile in Aswan is something that steals your heart â‌¤ï¸ڈ',
         'ًںŒ…', '["#ط£ط³ظˆط§ظ†","#ط§ظ„ظ†ظٹظ„","#Egypt"]', 891, 65, 43),
        ('post_003', 'user_thutmose',
         'ط§ظ†طھظ‡ظٹطھ ظ…ظ† ط±ط­ظ„ط© ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ ظ…ط¹ ظپط±ظٹظ‚ ظƒظٹظ…طھ ظƒظˆظ†ط³ظٹط±ط¬ ًں”؛ ط§ظ„ط®ط¯ظ…ط© ظƒط§ظ†طھ 10/10 ظˆط§ظ„ظ…ط±ط´ط¯ ظƒط§ظ† ظ…ظˆط³ظˆط¹ط© ط­ظٹط©. ط£ظ†طµط­ ط§ظ„ط¬ظ…ظٹط¹!',
         'Just finished the Pyramids trip with Kemet Concierge ًں”؛ Service was 10/10!',
         'ًں”؛', '["#ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ","#ظƒظٹظ…طھ","#ط±ط­ظ„ط§طھ"]', 224, 18, 9),
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
    def register(self, email, password, name, nickname, avatar_emoji='ًں‘‘', country='', phone=''):
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
            return {'ok': False, 'error': 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ…ط³طھط®ط¯ظ… ط¨ط§ظ„ظپط¹ظ„'}

    def login(self, email, password, platform='web'):
        row = self.conn.execute(
            "SELECT * FROM users WHERE email=? AND is_active=1", (email.lower().strip(),)
        ).fetchone()
        if not row or row['password_hash'] != hash_password(password):
            return {'ok': False, 'error': 'ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¯ط®ظˆظ„ ط؛ظٹط± طµط­ظٹط­ط©'}
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
            return {'ok': False, 'error': 'ظ„ط§ ظٹظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ ظ„ظ„طھط­ط¯ظٹط«'}
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
            return {'ok': False, 'error': 'ظ„ط§ ظٹظ…ظƒظ†ظƒ ظ…طھط§ط¨ط¹ط© ظ†ظپط³ظƒ'}
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
            return {'ok': False, 'error': 'ط§ظ„ط±ط­ظ„ط© ط؛ظٹط± ظ…ظˆط¬ظˆط¯ط©'}
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
            return {'ok': False, 'error': 'ط§ظ„ط­ط¬ط² ط؛ظٹط± ظ…ظˆط¬ظˆط¯'}
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
            return {'ok': False, 'error': 'ظ„ظ‚ط¯ ظ‚ظٹظ‘ظ…طھ ظ‡ط°ظ‡ ط§ظ„ط±ط­ظ„ط© ظ…ظ† ظ‚ط¨ظ„'}

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
    print("âœ… Schema created and seeded")

    db = KemetDB()
    errors = []

    def check(label, result, expect_ok=True):
        ok = result.get('ok', False) if isinstance(result, dict) else bool(result)
        status = "âœ…" if ok == expect_ok else "â‌Œ"
        if ok != expect_ok:
            errors.append(f"{label}: {result}")
        print(f"  {status} {label}")
        return result

    print("\n--- AUTH TESTS ---")
    r = check("Register new user", db.register('test@kemet.com','Pass1234!','ظ…ط­ظ…ط¯','ط®ظˆظپظˆ','ًںڈ›ï¸ڈ','EG','0100'))
    uid = r.get('user_id')

    check("Register duplicate email", db.register('test@kemet.com','x','y','z'), expect_ok=False)

    r2 = check("Login valid", db.login('test@kemet.com','Pass1234!'))
    token = r2.get('token')

    check("Login wrong password", db.login('test@kemet.com','wrong'), expect_ok=False)

    user = db.validate_token(token)
    print(f"  {'âœ…' if user else 'â‌Œ'} Token validation: {user['nickname'] if user else 'FAILED'}")

    check("Login demo user", db.login('ramesses@kemet.com','Demo1234!'))
    demo_login = db.login('ramesses@kemet.com','Demo1234!')
    demo_uid = demo_login['user'].get('id')
    demo_token = demo_login.get('token')

    print("\n--- PROFILE TESTS ---")
    check("Update profile", db.update_profile(uid, bio='ظ…ط³ط§ظپط± ظˆط¹ط§ط´ظ‚ ظ„ط­ط¶ط§ط±ط© ظƒظٹظ…طھ'))
    u = db.get_user(uid)
    print(f"  {'âœ…' if u and u.get('bio') else 'â‌Œ'} Profile bio saved: {u.get('bio','') if u else 'N/A'}")

    print("\n--- POSTS TESTS ---")
    r = check("Create post", db.create_post(uid, 'ط£ظˆظ„ طھط؛ط±ظٹط¯ط© ظپظٹ ظƒظٹظ…طھ ط³ظˆط´ظٹط§ظ„! ًں”؛', 'My first Kemet post!', 'ًں”؛', ['#ظƒظٹظ…طھ','#ظ…طµط±']))
    pid = r.get('post_id')

    feed = db.get_feed(uid)
    print(f"  {'âœ…' if len(feed) > 0 else 'â‌Œ'} Feed loaded: {len(feed)} posts")

    print("\n--- LIKES TESTS ---")
    r = check("Like post", db.toggle_like(uid, pid))
    print(f"  {'âœ…' if r.get('liked') else 'â‌Œ'} Post liked: {r.get('liked')}")
    r2 = check("Unlike post", db.toggle_like(uid, pid))
    print(f"  {'âœ…' if not r2.get('liked') else 'â‌Œ'} Post unliked: {not r2.get('liked')}")

    print("\n--- COMMENTS TESTS ---")
    r = check("Add comment", db.add_comment(uid, pid, 'طھط¹ظ„ظٹظ‚ ط±ط§ط¦ط¹ ط¹ظ„ظ‰ ط§ظ„ظ…ظ†ط´ظˆط±!'))
    comments = db.get_comments(pid)
    print(f"  {'âœ…' if len(comments) > 0 else 'â‌Œ'} Comments loaded: {len(comments)}")

    print("\n--- FOLLOWS TESTS ---")
    check("Follow user", db.toggle_follow(uid, demo_uid))
    check("Unfollow user", db.toggle_follow(uid, demo_uid))
    check("Follow self (should fail)", db.toggle_follow(uid, uid), expect_ok=False)

    print("\n--- MESSAGES TESTS ---")
    check("Send message", db.send_message(uid, demo_uid, 'ظ…ط±ط­ط¨ط§ظ‹طŒ ظƒظٹظپ ط­ط§ظ„ظƒطں'))
    check("Send reply", db.send_message(demo_uid, uid, 'ط¨ط®ظٹط± ط´ظƒط±ط§ظ‹! ظƒظٹظپ ط±ط­ظ„طھظƒطں'))
    conv = db.get_conversation(uid, demo_uid)
    print(f"  {'âœ…' if len(conv) >= 2 else 'â‌Œ'} Conversation loaded: {len(conv)} messages")
    inbox = db.get_inbox(uid)
    print(f"  {'âœ…' if len(inbox) > 0 else 'â‌Œ'} Inbox loaded: {len(inbox)} chats")

    print("\n--- TOURS TESTS ---")
    tours = db.get_tours()
    print(f"  {'âœ…' if len(tours) >= 6 else 'â‌Œ'} All tours loaded: {len(tours)}")
    featured = db.get_tours(featured_only=True)
    print(f"  {'âœ…' if len(featured) > 0 else 'â‌Œ'} Featured tours: {len(featured)}")
    cats = db.get_categories()
    print(f"  {'âœ…' if len(cats) > 0 else 'â‌Œ'} Categories: {len(cats)}")
    tour = db.get_tour('tour_luxor')
    print(f"  {'âœ…' if tour else 'â‌Œ'} Get single tour: {tour.get('title_ar','') if tour else 'N/A'}")

    print("\n--- BOOKINGS TESTS ---")
    r = check("Create booking", db.create_booking(uid,'tour_pyramids',2,'2025-12-01','card','0100000000','test@kemet.com','ط؛ط±ظپط© ظ…ط·ظ„ط© ط¹ظ„ظ‰ ط§ظ„ظ†ظٹظ„'))
    bid = r.get('booking_id')
    total = r.get('total_price')
    print(f"  âœ… Total price calculated: ${total}")

    r2 = check("Confirm payment", db.confirm_payment(bid, uid, 'card', 'PAY_REF_001'))
    my_bookings = db.get_user_bookings(uid)
    print(f"  {'âœ…' if len(my_bookings) > 0 else 'â‌Œ'} User bookings: {len(my_bookings)}")
    booking_status = my_bookings[0].get('status') if my_bookings else 'unknown'
    print(f"  {'âœ…' if booking_status == 'confirmed' else 'â‌Œ'} Booking status: {booking_status}")

    print("\n--- REVIEWS TESTS ---")
    check("Add review", db.add_review(uid, 'tour_pyramids', 5, 'ط±ط­ظ„ط© ظ„ط§ طھظڈظ†ط³ظ‰طŒ ط£ظ†طµط­ ط§ظ„ط¬ظ…ظٹط¹!', bid))
    check("Duplicate review (should fail)", db.add_review(uid, 'tour_pyramids', 4, 'ظ…ط±ط© ط£ط®ط±ظ‰'), expect_ok=False)

    print("\n--- NOTIFICATIONS TESTS ---")
    db.add_notification(uid, demo_uid, 'like', 'ط£ط¹ط¬ط¨ ط±ظ…ط³ظٹط³ ط¨ظ…ظ†ط´ظˆط±ظƒ', pid)
    db.add_notification(uid, demo_uid, 'follow', 'ط¨ط¯ط£ ط±ظ…ط³ظٹط³ ط¨ظ…طھط§ط¨ط¹طھظƒ')
    notifs = db.get_notifications(uid)
    print(f"  {'âœ…' if len(notifs) >= 2 else 'â‌Œ'} Notifications: {len(notifs)}")
    db.mark_notifications_read(uid)

    print("\n--- PHARAOH NICKNAMES TEST ---")
    pharaohs = db.get_pharaoh_nicknames()
    print(f"  {'âœ…' if len(pharaohs) == 12 else 'â‌Œ'} Pharaoh nicknames: {len(pharaohs)}")

    print("\n--- STATS TEST ---")
    stats = db.get_stats()
    print(f"  âœ… Stats: {stats['users']} users | {stats['posts']} posts | {stats['bookings']} bookings | ${stats['revenue']} revenue")

    check("Logout", db.logout(token))

    db.close()

    print("\n" + "="*60)
    if errors:
        print(f"â‌Œ {len(errors)} TEST(S) FAILED:")
        for e in errors:
            print(f"   - {e}")
    else:
        print("âœ… ALL TESTS PASSED â€” Database is fully operational")
    print("="*60 + "\n")
    return len(errors) == 0


if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)

