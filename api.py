"""
KEMET SOCIAL - REST API Server
Flask backend connecting web & mobile to SQLite database
Run: python3 api.py
Base URL: http://localhost:5000/api
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'database'))

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import wraps
from db import KemetDB, init_db, seed_data, get_conn

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── DB per request ────────────────────────────────────────
def get_db():
    if 'db' not in g:
        g.db = KemetDB()
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db:
        db.close()

# ── Auth decorator ────────────────────────────────────────
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
        if not token:
            return jsonify({'ok': False, 'error': 'مطلوب تسجيل الدخول'}), 401
        user = get_db().validate_token(token)
        if not user:
            return jsonify({'ok': False, 'error': 'جلسة منتهية الصلاحية'}), 401
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

# ══════════════════════════════════════════════════════════
# AUTH ROUTES
# ══════════════════════════════════════════════════════════
@app.route('/api/auth/register', methods=['POST'])
def register():
    b = request.get_json() or {}
    required = ['email', 'password', 'name', 'nickname']
    for field in required:
        if not b.get(field, '').strip():
            return err(f'الحقل مطلوب: {field}')
    if len(b['password']) < 6:
        return err('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    db = get_db()
    result = db.register(
        email=b['email'], password=b['password'],
        name=b['name'], nickname=b['nickname'],
        avatar_emoji=b.get('avatar_emoji', '👑'),
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
        return err('البريد وكلمة المرور مطلوبان')
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
    return ok({'message': 'تم تسجيل الخروج'})

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    return ok(request.current_user)

# ══════════════════════════════════════════════════════════
# USER ROUTES
# ══════════════════════════════════════════════════════════
@app.route('/api/users/<user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    user = get_db().get_user(user_id)
    if not user:
        return err('المستخدم غير موجود', 404)
    return ok(user)

@app.route('/api/users/profile', methods=['PUT'])
@require_auth
def update_profile():
    b = request.get_json() or {}
    uid = request.current_user['id']
    allowed = ['name', 'nickname', 'avatar_emoji', 'country', 'phone', 'bio']
    updates = {k: v for k, v in b.items() if k in allowed}
    if not updates:
        return err('لا يوجد بيانات للتحديث')
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

# ══════════════════════════════════════════════════════════
# POSTS ROUTES
# ══════════════════════════════════════════════════════════
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
        return err('محتوى المنشور مطلوب')
    if len(b['content']) > 500:
        return err('المنشور لا يتجاوز 500 حرف')
    uid = request.current_user['id']
    result = get_db().create_post(
        user_id=uid,
        content=b['content'],
        content_en=b.get('content_en', ''),
        image_emoji=b.get('image_emoji', ''),
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
        return err('محتوى التعليق مطلوب')
    uid = request.current_user['id']
    result = get_db().add_comment(
        uid, post_id, b['content'],
        parent_id=b.get('parent_id')
    )
    return ok(result), 201

# ══════════════════════════════════════════════════════════
# MESSAGES ROUTES
# ══════════════════════════════════════════════════════════
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
        return err('محتوى الرسالة مطلوب')
    uid = request.current_user['id']
    result = get_db().send_message(uid, receiver_id, b['content'])
    return ok(result), 201

# ══════════════════════════════════════════════════════════
# NOTIFICATIONS ROUTES
# ══════════════════════════════════════════════════════════
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
    return ok({'message': 'تم تحديد الكل كمقروء'})

# ══════════════════════════════════════════════════════════
# STORE ROUTES
# ══════════════════════════════════════════════════════════
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
        return err('الرحلة غير موجودة', 404)
    return ok(tour)

@app.route('/api/store/nicknames', methods=['GET'])
def get_nicknames():
    return ok(get_db().get_pharaoh_nicknames())

# ══════════════════════════════════════════════════════════
# BOOKINGS ROUTES
# ══════════════════════════════════════════════════════════
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
        return err('معرّف الرحلة مطلوب')
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
        return err('طريقة الدفع مطلوبة')
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

# ══════════════════════════════════════════════════════════
# REVIEWS ROUTES
# ══════════════════════════════════════════════════════════
@app.route('/api/reviews/<tour_id>', methods=['POST'])
@require_auth
def add_review(tour_id):
    b = request.get_json() or {}
    rating = int(b.get('rating', 0))
    if rating not in range(1, 6):
        return err('التقييم يجب أن يكون بين 1 و5')
    uid = request.current_user['id']
    result = get_db().add_review(
        user_id=uid, tour_id=tour_id,
        rating=rating, comment=b.get('comment', ''),
        booking_id=b.get('booking_id')
    )
    if not result['ok']:
        return err(result['error'])
    return ok(result), 201

# ══════════════════════════════════════════════════════════
# STATS (admin)
# ══════════════════════════════════════════════════════════
@app.route('/api/stats', methods=['GET'])
def get_stats():
    return ok(get_db().get_stats())

# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════

# NEWS ENDPOINTS
@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM news ORDER BY created_at DESC LIMIT 50")
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
        news = [dict(zip(cols, row)) for row in rows]
        conn.close()
        return ok(news)
    except Exception as e:
        return ok([])

@app.route('/api/news', methods=['POST'])
@require_auth
def create_news():
    if request.current_user.get('email') != 'mido704@gmail.com':
        return err('غير مصرح', 403)
    b = request.json or {}
    if not b.get('title_ar') or not b.get('title_en'):
        return err('العنوان مطلوب')
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO news (title_ar, title_en, summary_ar, summary_en, content_ar, content_en, category, image, image_url, keywords, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()) RETURNING id
        """, (b.get('title_ar'), b.get('title_en'), b.get('summary_ar',''), b.get('summary_en',''),
              b.get('content_ar',''), b.get('content_en',''), b.get('category','tourism'),
              b.get('image','🏛️'), b.get('image_url',''), b.get('keywords','')))
        news_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'news_id': news_id}), 201
    except Exception as e:
        return err(str(e))

@app.route('/api/news/<int:news_id>', methods=['PUT'])
@require_auth
def update_news(news_id):
    if request.current_user.get('email') != 'mido704@gmail.com':
        return err('غير مصرح', 403)
    b = request.json or {}
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("""
            UPDATE news SET title_ar=%s, title_en=%s, summary_ar=%s, summary_en=%s,
            content_ar=%s, content_en=%s, category=%s, image=%s, keywords=%s WHERE id=%s
        """, (b.get('title_ar'), b.get('title_en'), b.get('summary_ar'), b.get('summary_en'),
              b.get('content_ar'), b.get('content_en'), b.get('category'), b.get('image'),
              b.get('keywords',''), news_id))
        conn.commit()
        conn.close()
        return ok({'updated': True})
    except Exception as e:
        return err(str(e))

@app.route('/api/news/<int:news_id>', methods=['DELETE'])
@require_auth
def delete_news(news_id):
    if request.current_user.get('email') != 'mido704@gmail.com':
        return err('غير مصرح', 403)
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM news WHERE id=%s", (news_id,))
        conn.commit()
        conn.close()
        return ok({'deleted': True})
    except Exception as e:
        return err(str(e))
@app.route('/api/health', methods=['GET'])
def health():
    return ok({'status': 'online', 'service': 'Kemet Social API', 'version': '1.0.0'})

@app.errorhandler(404)
def not_found(e):
    return err('المسار غير موجود', 404)

@app.errorhandler(405)
def method_not_allowed(e):
    return err('الطريقة غير مسموح بها', 405)

@app.errorhandler(500)
def server_error(e):
    return err('خطأ في الخادم', 500)

# ══════════════════════════════════════════════════════════
# INIT & RUN
# ══════════════════════════════════════════════════════════
def init_app():
    conn = init_db()
    seed_data(conn)
    conn.close()

if __name__ == '__main__':
    init_app()
    print("\n🔺 Kemet Social API starting on http://localhost:5000")
    print("   Docs: GET /api/health\n")
    app.run(debug=False, host='0.0.0.0', port=5000)
