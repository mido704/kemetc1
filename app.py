"""
KEMET SOCIAL - REST API Server
Flask backend connecting web & mobile to SQLite database
Run: python3 api.py
Base URL: http://localhost:5000/api
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import wraps
from db import KemetDB, init_db, seed_data, get_conn

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# أ¢â€‌â‚¬أ¢â€‌â‚¬ DB per request أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
def get_db():
    if 'db' not in g:
        g.db = KemetDB()
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db:
        db.close()

# أ¢â€‌â‚¬أ¢â€‌â‚¬ Auth decorator أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
        if not token:
            return jsonify({'ok': False, 'error': 'ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨ ط·ع¾ط·آ³ط·آ¬ط¸ظ¹ط¸â€‍ ط·آ§ط¸â€‍ط·آ¯ط·آ®ط¸ث†ط¸â€‍'}), 401
        user = get_db().validate_token(token)
        if not user:
            return jsonify({'ok': False, 'error': 'ط·آ¬ط¸â€‍ط·آ³ط·آ© ط¸â€¦ط¸â€ ط·ع¾ط¸â€،ط¸ظ¹ط·آ© ط·آ§ط¸â€‍ط·آµط¸â€‍ط·آ§ط·آ­ط¸ظ¹ط·آ©'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def ok(data=None, **kwargs):
    r = {'ok': True}
    if data is not None:
        r['data'] = data
    r.update(kwargs)
    return jsonify(r)

def err(msg, code=400):
    return jsonify({'ok': False, 'error': msg}), code

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# AUTH ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/auth/register', methods=['POST'])
def register():
    b = request.get_json() or {}
    required = ['email', 'password', 'name', 'nickname']
    for field in required:
        if not b.get(field, '').strip():
            return err(f'ط·آ§ط¸â€‍ط·آ­ط¸â€ڑط¸â€‍ ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨: {field}')
    if len(b['password']) < 6:
        return err('ط¸ئ’ط¸â€‍ط¸â€¦ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ± ط¸ظ¹ط·آ¬ط·آ¨ ط·آ£ط¸â€  ط·ع¾ط¸ئ’ط¸ث†ط¸â€  6 ط·آ£ط·آ­ط·آ±ط¸ظ¾ ط·آ¹ط¸â€‍ط¸â€° ط·آ§ط¸â€‍ط·آ£ط¸â€ڑط¸â€‍')
    db = get_db()
    result = db.register(
        email=b['email'], password=b['password'],
        name=b['name'], nickname=b['nickname'],
        avatar_emoji=b.get('avatar_emoji', 'ظ‹ع؛â€کâ€ک'),
        country=b.get('country', ''), phone=b.get('phone', '')
    )
    if not result['ok']:
        return err(result['error'])
    login_r = db.login(b['email'], b['password'],
                       platform=b.get('platform', 'web'))
    return ok(login_r.get('data') or {'token': login_r['token'], 'user': login_r['user']}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    b = request.get_json() or {}
    if not b.get('email') or not b.get('password'):
        return err('ط·آ§ط¸â€‍ط·آ¨ط·آ±ط¸ظ¹ط·آ¯ ط¸ث†ط¸ئ’ط¸â€‍ط¸â€¦ط·آ© ط·آ§ط¸â€‍ط¸â€¦ط·آ±ط¸ث†ط·آ± ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨ط·آ§ط¸â€ ')
    result = get_db().login(b['email'], b['password'],
                            platform=b.get('platform', 'web'))
    if not result['ok']:
        return err(result['error'], 401)
    return ok({'token': result['token'], 'user': result['user']})

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    get_db().logout(token)
    return ok({'message': 'ط·ع¾ط¸â€¦ ط·ع¾ط·آ³ط·آ¬ط¸ظ¹ط¸â€‍ ط·آ§ط¸â€‍ط·آ®ط·آ±ط¸ث†ط·آ¬'})

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    return ok(request.current_user)

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# USER ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/users/<user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    user = get_db().get_user(user_id)
    if not user:
        return err('ط·آ§ط¸â€‍ط¸â€¦ط·آ³ط·ع¾ط·آ®ط·آ¯ط¸â€¦ ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط¸ث†ط·آ¬ط¸ث†ط·آ¯', 404)
    return ok(user)

@app.route('/api/users/profile', methods=['PUT'])
@require_auth
def update_profile():
    b = request.get_json() or {}
    uid = request.current_user['id']
    allowed = ['name', 'nickname', 'avatar_emoji', 'avatar_url', 'country', 'phone', 'bio']
    updates = {k: v for k, v in b.items() if k in allowed}
    if not updates:
        return err('ط¸â€‍ط·آ§ ط¸ظ¹ط¸ث†ط·آ¬ط·آ¯ ط·آ¨ط¸ظ¹ط·آ§ط¸â€ ط·آ§ط·ع¾ ط¸â€‍ط¸â€‍ط·ع¾ط·آ­ط·آ¯ط¸ظ¹ط·آ«')
    result = get_db().update_profile(uid, **updates)
    user = get_db().get_user(uid)
    return ok(user)

@app.route('/api/users/<user_id>/follow', methods=['POST'])
@require_auth
def follow_user(user_id):
    uid = request.current_user['id']
    result = get_db().toggle_follow(uid, user_id)
    if not result['ok']:
        return err(result['error'])
    return ok(result)


@app.route('/api/users/following', methods=['GET'])
@require_auth
    uid = request.current_user['id']
    db = get_db()
    cur = db.conn.cursor()
    cur.execute('SELECT u.id, u.nickname, u.name, u.avatar_emoji, u.avatar_url FROM users u INNER JOIN follows f ON f.following_id = u.id WHERE f.follower_id = ? AND u.is_active = 1', (uid,))
    users = [dict(r) for r in cur.fetchall()]
    return ok(users)
        WHERE f.follower_id = ? AND u.is_active = 1''', (uid,))
    users = [dict(r) for r in cur.fetchall()]
    return ok(users)
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# POSTS ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/posts', methods=['GET'])
@require_auth
def get_feed():
    limit = min(int(request.args.get('limit', 20)), 50)
    offset = int(request.args.get('offset', 0))
    posts = get_db().get_feed(request.current_user['id'], limit, offset)
    return ok(posts)

@app.route('/api/posts', methods=['POST'])
@require_auth
def create_post():
    b = request.get_json() or {}
    if not b.get('content', '').strip():
        return err('ط¸â€¦ط·آ­ط·ع¾ط¸ث†ط¸â€° ط·آ§ط¸â€‍ط¸â€¦ط¸â€ ط·آ´ط¸ث†ط·آ± ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨')
    if len(b['content']) > 500:
        return err('ط·آ§ط¸â€‍ط¸â€¦ط¸â€ ط·آ´ط¸ث†ط·آ± ط¸â€‍ط·آ§ ط¸ظ¹ط·ع¾ط·آ¬ط·آ§ط¸ث†ط·آ² 500 ط·آ­ط·آ±ط¸ظ¾')
    uid = request.current_user['id']
    result = get_db().create_post(
        user_id=uid,
        content=b['content'],
        content_en=b.get('content_en', ''),
        image_emoji=b.get('image_emoji', ''),
        image_url=b.get('image_url', ''),
        hashtags=b.get('hashtags', []),
        language=b.get('language', 'ar')
    )
    return ok(result), 201

@app.route('/api/posts/<post_id>', methods=['DELETE'])
@require_auth
def delete_post(post_id):
    uid = request.current_user['id']
    result = get_db().delete_post(post_id, uid)
    return ok(result)

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@require_auth
def like_post(post_id):
    uid = request.current_user['id']
    result = get_db().toggle_like(uid, post_id)
    return ok(result)

@app.route('/api/posts/<post_id>/comments', methods=['GET'])
@require_auth
def get_comments(post_id):
    comments = get_db().get_comments(post_id)
    return ok(comments)

@app.route('/api/posts/<post_id>/comments', methods=['POST'])
@require_auth
def add_comment(post_id):
    b = request.get_json() or {}
    if not b.get('content', '').strip():
        return err('ط¸â€¦ط·آ­ط·ع¾ط¸ث†ط¸â€° ط·آ§ط¸â€‍ط·ع¾ط·آ¹ط¸â€‍ط¸ظ¹ط¸â€ڑ ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨')
    uid = request.current_user['id']
    result = get_db().add_comment(
        uid, post_id, b['content'],
        parent_id=b.get('parent_id')
    )
    return ok(result), 201

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# MESSAGES ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/messages/inbox', methods=['GET'])
@require_auth
def inbox():
    uid = request.current_user['id']
    return ok(get_db().get_inbox(uid))

@app.route('/api/messages/<other_user_id>', methods=['GET'])
@require_auth
def conversation(other_user_id):
    uid = request.current_user['id']
    limit = min(int(request.args.get('limit', 50)), 100)
    msgs = get_db().get_conversation(uid, other_user_id, limit)
    return ok(msgs)

@app.route('/api/messages/<receiver_id>', methods=['POST'])
@require_auth
def send_message(receiver_id):
    b = request.get_json() or {}
    if not b.get('content', '').strip():
        return err('ط¸â€¦ط·آ­ط·ع¾ط¸ث†ط¸â€° ط·آ§ط¸â€‍ط·آ±ط·آ³ط·آ§ط¸â€‍ط·آ© ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨')
    uid = request.current_user['id']
    result = get_db().send_message(uid, receiver_id, b['content'])
    return ok(result), 201

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# NOTIFICATIONS ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/notifications', methods=['GET'])
@require_auth
def notifications():
    uid = request.current_user['id']
    limit = min(int(request.args.get('limit', 20)), 50)
    notifs = get_db().get_notifications(uid, limit)
    return ok(notifs)

@app.route('/api/notifications/read', methods=['POST'])
@require_auth
def mark_read():
    get_db().mark_notifications_read(request.current_user['id'])
    return ok({'message': 'ط·ع¾ط¸â€¦ ط·ع¾ط·آ­ط·آ¯ط¸ظ¹ط·آ¯ ط·آ§ط¸â€‍ط¸ئ’ط¸â€‍ ط¸ئ’ط¸â€¦ط¸â€ڑط·آ±ط¸ث†ط·طŒ'})

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# STORE ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/store/categories', methods=['GET'])
def get_categories():
    cats = get_db().get_categories()
    return ok(cats)

@app.route('/api/store/tours', methods=['GET'])
def get_tours():
    cat = request.args.get('category')
    featured = request.args.get('featured') == 'true'
    tours = get_db().get_tours(category_id=cat, featured_only=featured)
    return ok(tours)

@app.route('/api/store/tours/<tour_id>', methods=['GET'])
def get_tour(tour_id):
    tour = get_db().get_tour(tour_id)
    if not tour:
        return err('ط·آ§ط¸â€‍ط·آ±ط·آ­ط¸â€‍ط·آ© ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط¸ث†ط·آ¬ط¸ث†ط·آ¯ط·آ©', 404)
    return ok(tour)

@app.route('/api/store/nicknames', methods=['GET'])
def get_nicknames():
    return ok(get_db().get_pharaoh_nicknames())

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# BOOKINGS ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/bookings', methods=['GET'])
@require_auth
def my_bookings():
    uid = request.current_user['id']
    return ok(get_db().get_user_bookings(uid))

@app.route('/api/bookings', methods=['POST'])
@require_auth
def create_booking():
    b = request.get_json() or {}
    if not b.get('tour_id'):
        return err('ط¸â€¦ط·آ¹ط·آ±ط¸â€کط¸ظ¾ ط·آ§ط¸â€‍ط·آ±ط·آ­ط¸â€‍ط·آ© ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨')
    uid = request.current_user['id']
    result = get_db().create_booking(
        user_id=uid,
        tour_id=b['tour_id'],
        guests_count=max(1, int(b.get('guests_count', 1))),
        travel_date=b.get('travel_date', ''),
        payment_method=b.get('payment_method', ''),
        contact_phone=b.get('contact_phone', ''),
        contact_email=b.get('contact_email', request.current_user.get('email', '')),
        special_requests=b.get('special_requests', '')
    )
    if not result['ok']:
        return err(result['error'])
    return ok(result), 201

@app.route('/api/bookings/<booking_id>/pay', methods=['POST'])
@require_auth
def pay_booking(booking_id):
    b = request.get_json() or {}
    if not b.get('payment_method'):
        return err('ط·آ·ط·آ±ط¸ظ¹ط¸â€ڑط·آ© ط·آ§ط¸â€‍ط·آ¯ط¸ظ¾ط·آ¹ ط¸â€¦ط·آ·ط¸â€‍ط¸ث†ط·آ¨ط·آ©')
    uid = request.current_user['id']
    result = get_db().confirm_payment(
        booking_id=booking_id,
        user_id=uid,
        payment_method=b['payment_method'],
        payment_ref=b.get('payment_ref', '')
    )
    if not result['ok']:
        return err(result['error'])
    return ok(result)

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# REVIEWS ROUTES
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/reviews/<tour_id>', methods=['POST'])
@require_auth
def add_review(tour_id):
    b = request.get_json() or {}
    rating = int(b.get('rating', 0))
    if rating not in range(1, 6):
        return err('ط·آ§ط¸â€‍ط·ع¾ط¸â€ڑط¸ظ¹ط¸ظ¹ط¸â€¦ ط¸ظ¹ط·آ¬ط·آ¨ ط·آ£ط¸â€  ط¸ظ¹ط¸ئ’ط¸ث†ط¸â€  ط·آ¨ط¸ظ¹ط¸â€  1 ط¸ث†5')
    uid = request.current_user['id']
    result = get_db().add_review(
        user_id=uid, tour_id=tour_id,
        rating=rating, comment=b.get('comment', ''),
        booking_id=b.get('booking_id')
    )
    if not result['ok']:
        return err(result['error'])
    return ok(result), 201

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# STATS (admin)
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/stats', methods=['GET'])
def get_stats():
    return ok(get_db().get_stats())

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# HEALTH CHECK
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
@app.route('/api/health', methods=['GET'])
def health():
    return ok({'status': 'online', 'service': 'Kemet Social API', 'version': '1.0.0'})

@app.errorhandler(404)
def not_found(e):
    return err('ط·آ§ط¸â€‍ط¸â€¦ط·آ³ط·آ§ط·آ± ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط¸ث†ط·آ¬ط¸ث†ط·آ¯', 404)

@app.errorhandler(405)
def method_not_allowed(e):
    return err('ط·آ§ط¸â€‍ط·آ·ط·آ±ط¸ظ¹ط¸â€ڑط·آ© ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط·آ³ط¸â€¦ط¸ث†ط·آ­ ط·آ¨ط¸â€،ط·آ§', 405)

@app.errorhandler(500)
def server_error(e):
    return err('ط·آ®ط·آ·ط·آ£ ط¸ظ¾ط¸ظ¹ ط·آ§ط¸â€‍ط·آ®ط·آ§ط·آ¯ط¸â€¦', 500)

# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
# INIT & RUN
# أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯أ¢â€¢ع¯
def init_app():
    conn = init_db()
    seed_data(conn)
    conn.close()

with app.app_context():
    conn = init_db()
    seed_data(conn)
    conn.close()
@app.route('/api/admin/stats', methods=['GET'])
@require_auth
def admin_stats():
    uid = request.current_user['id']
    # Check if admin
    if request.current_user.get('email') not in ['mido704@gmail.com']:
        return err('غير مصرح'), 403
    db = get_db()
    cur = db.conn.cursor()
    cur.execute("SELECT COUNT(*) as c FROM users")
    users_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) as c FROM posts WHERE is_deleted=0")
    posts_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) as c FROM likes")
    likes_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) as c FROM follows")
    follows_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) as c FROM sessions")
    sessions_count = cur.fetchone()['c']
    return ok({
        'users': users_count,
        'posts': posts_count,
        'likes': likes_count,
        'follows': follows_count,
        'sessions': sessions_count
    })

@app.route('/api/admin/users', methods=['GET'])
@require_auth
def admin_users():
    if request.current_user.get('email') not in ['mido704@gmail.com']:
        return err('غير مصرح'), 403
    db = get_db()
    cur = db.conn.cursor()
    cur.execute("SELECT id, email, name, nickname, membership, is_verified, is_active, created_at FROM users ORDER BY created_at DESC")
    users = [dict(r) for r in cur.fetchall()]
    return ok(users)

@app.route('/api/admin/users/<user_id>/toggle', methods=['POST'])
@require_auth
def admin_toggle_user(user_id):
    if request.current_user.get('email') not in ['mido704@gmail.com']:
        return err('غير مصرح'), 403
    db = get_db()
    cur = db.conn.cursor()
    cur.execute("UPDATE users SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=%s", (user_id,))
    db.conn.commit()
    return ok({'toggled': True})
    
if __name__ == '__main__':
    init_app()
    print("\nظ‹ع؛â€‌ط› Kemet Social API starting on http://localhost:5000")
    print("   Docs: GET /api/health\n")
    app.run(debug=False, host='0.0.0.0', port=5000)

