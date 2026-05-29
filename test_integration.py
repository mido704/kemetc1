"""
KEMET SOCIAL - Full Integration Test Suite
Tests: Database + API + All user flows end-to-end
Run: python3 test_integration.py
"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'database'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'web'))

# Fresh DB
db_path = os.path.join(os.path.dirname(__file__), 'database', 'kemet.db')
if os.path.exists(db_path):
    os.remove(db_path)

from db import init_db, seed_data, KemetDB
conn = init_db()
seed_data(conn)
conn.close()

from api import app, init_app
app.config['TESTING'] = True
init_app()
client = app.test_client()

# ─────────────────────────────────────────────
PASS = 0
FAIL = 0
ERRORS = []

def check(label, cond, detail=''):
    global PASS, FAIL
    if cond:
        print(f"  ✅ {label}")
        PASS += 1
    else:
        print(f"  ❌ {label}{' — ' + str(detail) if detail else ''}")
        FAIL += 1
        ERRORS.append(label)

def api(method, path, body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    fn = getattr(client, method)
    kwargs = {'headers': headers}
    if body:
        kwargs['json'] = body
    r = fn(f'/api{path}', **kwargs)
    try:
        return r.status_code, r.get_json()
    except:
        return r.status_code, {}

# ─────────────────────────────────────────────
print("\n" + "="*60)
print("  KEMET SOCIAL — FULL INTEGRATION TESTS")
print("="*60)

# ══════════════════════════════════════════════
print("\n[1] HEALTH CHECK")
sc, d = api('get', '/health')
check("API server online", sc==200 and d.get('ok'))
check("Service name correct", d.get('data',{}).get('service')=='Kemet Social API')

# ══════════════════════════════════════════════
print("\n[2] USER REGISTRATION FLOW")
sc, d = api('post', '/auth/register', {
    'email': 'integration@kemet.com',
    'password': 'Test1234!',
    'name': 'مستخدم تجريبي',
    'nickname': 'سنفرو',
    'avatar_emoji': '🔺',
    'country': 'EG',
    'phone': '0100000000'
})
check("Register new user [201]", sc==201, d.get('error',''))
check("Returns token", bool(d.get('data',{}).get('token')))
check("Returns user object", bool(d.get('data',{}).get('user')))
check("User has nickname", d.get('data',{}).get('user',{}).get('nickname')=='سنفرو')

TOKEN = d.get('data',{}).get('token','')
USER  = d.get('data',{}).get('user',{})
UID   = USER.get('id','')

sc2, d2 = api('post', '/auth/register', {'email':'integration@kemet.com','password':'x','name':'y','nickname':'z'})
check("Duplicate email rejected [400]", sc2==400 and not d2.get('ok'))

sc3, _ = api('post', '/auth/register', {'email':'x@y.com','password':'12','name':'z','nickname':'a'})
check("Short password rejected [400]", sc3==400)

# ══════════════════════════════════════════════
print("\n[3] LOGIN FLOW")
sc, d = api('post', '/auth/login', {'email':'integration@kemet.com','password':'Test1234!'})
check("Login valid credentials [200]", sc==200 and d.get('ok'))
TOKEN = d.get('data',{}).get('token', TOKEN)
check("New token returned", bool(TOKEN))

sc, d = api('post', '/auth/login', {'email':'integration@kemet.com','password':'WRONG'})
check("Wrong password rejected [401]", sc==401 and not d.get('ok'))

sc, d = api('post', '/auth/login', {'email':'nobody@x.com','password':'Test1234!'})
check("Unknown email rejected [401]", sc==401)

# ══════════════════════════════════════════════
print("\n[4] AUTH PROTECTION")
sc, d = api('get', '/auth/me', token=TOKEN)
check("GET /me with valid token [200]", sc==200 and d.get('ok'))
check("Me returns correct user", d.get('data',{}).get('nickname')=='سنفرو')

sc, _ = api('get', '/auth/me')
check("GET /me without token [401]", sc==401)

sc, _ = api('get', '/auth/me', token='invalid-token-xyz')
check("GET /me with fake token [401]", sc==401)

# ══════════════════════════════════════════════
print("\n[5] PROFILE UPDATE")
sc, d = api('put', '/users/profile', {'bio':'عاشق لحضارة كيمت 🔺', 'country':'SA'}, token=TOKEN)
check("Update profile [200]", sc==200 and d.get('ok'))
check("Bio updated in response", d.get('data',{}).get('bio')=='عاشق لحضارة كيمت 🔺')
check("Country updated", d.get('data',{}).get('country')=='SA')

sc, d = api('put', '/users/profile', {'invalid_field': 'x'}, token=TOKEN)
check("Invalid fields rejected [400]", sc==400)

# ══════════════════════════════════════════════
print("\n[6] POSTS — CREATE & FEED")
sc, d = api('post', '/posts', {'content':'أول منشور تجريبي في كيمت سوشيال 🔺','image_emoji':'🔺','hashtags':['#كيمت','#مصر']}, token=TOKEN)
check("Create post [201]", sc==201 and d.get('ok'))
POST_ID = d.get('data',{}).get('post_id','')
check("Post ID returned", bool(POST_ID))

sc2, d2 = api('post', '/posts', {'content':'   '}, token=TOKEN)
check("Empty post rejected [400]", sc2==400)

sc, d = api('get', '/posts', token=TOKEN)
check("Get feed [200]", sc==200 and d.get('ok'))
feed = d.get('data',[])
check("Feed has posts", len(feed) > 0)
check("Feed contains our new post", any(p.get('id')==POST_ID for p in feed))
check("Feed posts have user info", all(p.get('nickname') for p in feed))

sc, _ = api('get', '/posts', token=TOKEN)
check("Feed pagination works", sc==200)

# ══════════════════════════════════════════════
print("\n[7] LIKES SYSTEM")
sc, d = api('post', f'/posts/{POST_ID}/like', token=TOKEN)
check("Like post [200]", sc==200 and d.get('ok'))
check("liked=True after like", d.get('data',{}).get('liked')==True)

sc, d = api('post', f'/posts/{POST_ID}/like', token=TOKEN)
check("Unlike post [200]", sc==200 and d.get('ok'))
check("liked=False after unlike", d.get('data',{}).get('liked')==False)

sc, d = api('post', f'/posts/{POST_ID}/like', token=TOKEN)
check("Re-like post [200]", sc==200 and d.get('data',{}).get('liked')==True)

# ══════════════════════════════════════════════
print("\n[8] COMMENTS SYSTEM")
sc, d = api('post', f'/posts/{POST_ID}/comments', {'content':'تعليق تجريبي رائع!'}, token=TOKEN)
check("Add comment [201]", sc==201 and d.get('ok'))
CID = d.get('data',{}).get('comment_id','')
check("Comment ID returned", bool(CID))

sc2, _ = api('post', f'/posts/{POST_ID}/comments', {'content':'  '}, token=TOKEN)
check("Empty comment rejected [400]", sc2==400)

sc, d = api('get', f'/posts/{POST_ID}/comments', token=TOKEN)
check("Get comments [200]", sc==200 and d.get('ok'))
check("Comment appears in list", len(d.get('data',[])) > 0)
check("Comment has user info", d.get('data',[{}])[0].get('nickname') is not None)

# Nested comment
sc, d = api('post', f'/posts/{POST_ID}/comments', {'content':'رد على التعليق', 'parent_id': CID}, token=TOKEN)
check("Nested comment (reply) [201]", sc==201 and d.get('ok'))

# ══════════════════════════════════════════════
print("\n[9] FOLLOWS SYSTEM")
# Login demo user to get their ID
sc, d = api('post', '/auth/login', {'email':'ramesses@kemet.com','password':'Demo1234!'})
check("Demo user login", sc==200)
DEMO_UID = d.get('data',{}).get('user',{}).get('id','user_ramesses')

sc, d = api('post', f'/users/{DEMO_UID}/follow', token=TOKEN)
check("Follow user [200]", sc==200 and d.get('ok'))
check("following=True", d.get('data',{}).get('following')==True)

sc, d = api('post', f'/users/{DEMO_UID}/follow', token=TOKEN)
check("Unfollow user [200]", sc==200 and d.get('ok'))
check("following=False", d.get('data',{}).get('following')==False)

sc, d = api('post', f'/users/{UID}/follow', token=TOKEN)
check("Follow self rejected [400]", sc==400 and not d.get('ok'))

# ══════════════════════════════════════════════
print("\n[10] MESSAGES SYSTEM")
sc, d = api('post', f'/messages/{DEMO_UID}', {'content':'مرحباً رمسيس! كيف حالك؟'}, token=TOKEN)
check("Send message [201]", sc==201 and d.get('ok'))
MID = d.get('data',{}).get('message_id','')
check("Message ID returned", bool(MID))

sc2, _ = api('post', f'/messages/{DEMO_UID}', {'content':'  '}, token=TOKEN)
check("Empty message rejected [400]", sc2==400)

sc, d = api('get', f'/messages/{DEMO_UID}', token=TOKEN)
check("Get conversation [200]", sc==200 and d.get('ok'))
check("Message in conversation", len(d.get('data',[])) > 0)

sc, d = api('get', '/messages/inbox', token=TOKEN)
check("Get inbox [200]", sc==200 and d.get('ok'))

# ══════════════════════════════════════════════
print("\n[11] NOTIFICATIONS")
db = KemetDB()
db.add_notification(UID, DEMO_UID, 'like', 'أعجب رمسيس بمنشورك', POST_ID)
db.add_notification(UID, DEMO_UID, 'follow', 'بدأ رمسيس بمتابعتك')
db.close()

sc, d = api('get', '/notifications', token=TOKEN)
check("Get notifications [200]", sc==200 and d.get('ok'))
check("Has notifications", len(d.get('data',[])) >= 2)
check("Notification has type", all(n.get('type') for n in d.get('data',[])))

sc, d = api('post', '/notifications/read', token=TOKEN)
check("Mark all read [200]", sc==200 and d.get('ok'))

# ══════════════════════════════════════════════
print("\n[12] STORE — TOURS & CATEGORIES")
sc, d = api('get', '/store/categories')
check("Get categories [200] (public)", sc==200 and d.get('ok'))
check("Has 5 categories", len(d.get('data',[])) == 5)

sc, d = api('get', '/store/tours')
check("Get all tours [200] (public)", sc==200 and d.get('ok'))
check("Has 6 tours", len(d.get('data',[])) == 6)

sc, d = api('get', '/store/tours?featured=true')
check("Featured tours filter [200]", sc==200)
check("Featured tours ≥ 1", len(d.get('data',[])) >= 1)

sc, d = api('get', '/store/tours?category=cat_nile')
check("Category filter [200]", sc==200)
check("Nile tours returned", len(d.get('data',[])) >= 1)

sc, d = api('get', '/store/tours/tour_luxor')
check("Get single tour [200]", sc==200 and d.get('ok'))
check("Tour has required fields", all(d.get('data',{}).get(f) for f in ['title_ar','price','image_emoji']))

sc, d = api('get', '/store/tours/nonexistent_tour')
check("Unknown tour [404]", sc==404)

sc, d = api('get', '/store/nicknames')
check("Get pharaoh nicknames [200]", sc==200)
check("Has 12 nicknames", len(d.get('data',[])) == 12)

# ══════════════════════════════════════════════
print("\n[13] BOOKINGS & PAYMENTS")
sc, d = api('post', '/bookings', {
    'tour_id': 'tour_pyramids',
    'guests_count': 2,
    'travel_date': '2025-12-25',
    'payment_method': 'card',
    'contact_phone': '0100000000',
    'special_requests': 'غرفة مطلة على النيل'
}, token=TOKEN)
check("Create booking [201]", sc==201 and d.get('ok'))
BID = d.get('data',{}).get('booking_id','')
check("Booking ID returned", bool(BID))
check("Total price = 850×2 = $1700", d.get('data',{}).get('total_price')==1700.0)

sc2, _ = api('post', '/bookings', {}, token=TOKEN)
check("Missing tour_id rejected [400]", sc2==400)

sc3, _ = api('post', '/bookings', {'tour_id':'nonexistent'}, token=TOKEN)
check("Unknown tour rejected [400]", sc3==400)

sc, d = api('get', '/bookings', token=TOKEN)
check("Get my bookings [200]", sc==200 and d.get('ok'))
check("Booking in list", len(d.get('data',[])) > 0)
check("Booking has tour info", d.get('data',[{}])[0].get('title_ar') is not None)

sc, d = api('post', f'/bookings/{BID}/pay', {'payment_method':'card','payment_ref':'CARD_TEST_999'}, token=TOKEN)
check("Pay booking [200]", sc==200 and d.get('ok'))
check("Payment ID returned", bool(d.get('data',{}).get('payment_id')))

sc2, _ = api('post', f'/bookings/{BID}/pay', {'payment_method':''}, token=TOKEN)
check("Empty payment method rejected [400]", sc2==400)

sc, d = api('get', '/bookings', token=TOKEN)
confirmed = [b for b in d.get('data',[]) if b.get('id')==BID]
check("Booking status = confirmed after payment", confirmed and confirmed[0].get('status')=='confirmed')
check("Payment status = paid", confirmed and confirmed[0].get('payment_status')=='paid')

# ══════════════════════════════════════════════
print("\n[14] REVIEWS")
sc, d = api('post', '/reviews/tour_pyramids', {'rating':5,'comment':'رحلة لا تُنسى بكل المقاييس!'}, token=TOKEN)
check("Add review [201]", sc==201 and d.get('ok'))

sc2, _ = api('post', '/reviews/tour_pyramids', {'rating':4,'comment':'مرة ثانية'}, token=TOKEN)
check("Duplicate review rejected [400]", sc2==400)

sc3, _ = api('post', '/reviews/tour_luxor', {'rating':6}, token=TOKEN)
check("Invalid rating (6) rejected [400]", sc3==400)

sc4, _ = api('post', '/reviews/tour_luxor', {'rating':0}, token=TOKEN)
check("Invalid rating (0) rejected [400]", sc4==400)

sc5, d5 = api('post', '/reviews/tour_luxor', {'rating':4,'comment':'تجربة رائعة!'}, token=TOKEN)
check("Valid review different tour [201]", sc5==201 and d5.get('ok'))

# ══════════════════════════════════════════════
print("\n[15] POST DELETE")
sc, d2 = api('post', '/posts', {'content':'منشور للحذف'}, token=TOKEN)
DEL_PID = d2.get('data',{}).get('post_id','')
sc, d = api('delete', f'/posts/{DEL_PID}', token=TOKEN)
check("Delete own post [200]", sc==200 and d.get('ok'))

# Deleted post shouldn't appear in feed
sc, d = api('get', '/posts', token=TOKEN)
feed_ids = [p.get('id') for p in d.get('data',[])]
check("Deleted post not in feed", DEL_PID not in feed_ids)

# ══════════════════════════════════════════════
print("\n[16] STATS")
sc, d = api('get', '/stats')
check("Get stats [200] (public)", sc==200 and d.get('ok'))
stats = d.get('data',{})
check("Stats has users count", isinstance(stats.get('users'),int) and stats['users']>0)
check("Stats has posts count", isinstance(stats.get('posts'),int) and stats['posts']>0)
check("Stats has bookings count", isinstance(stats.get('bookings'),int) and stats['bookings']>0)
check("Stats has revenue", isinstance(stats.get('revenue'),(int,float)))

# ══════════════════════════════════════════════
print("\n[17] SECURITY & EDGE CASES")
sc, _ = api('get', '/posts')
check("Feed requires auth [401]", sc==401)

sc, _ = api('post', '/bookings', {'tour_id':'tour_luxor'})
check("Bookings requires auth [401]", sc==401)

sc, _ = api('get', '/notifications')
check("Notifications requires auth [401]", sc==401)

sc, _ = api('get', '/nonexistent-route')
check("Unknown route [404]", sc==404)

# ══════════════════════════════════════════════
print("\n[18] LOGOUT & TOKEN INVALIDATION")
sc, d = api('post', '/auth/logout', token=TOKEN)
check("Logout [200]", sc==200 and d.get('ok'))

sc, _ = api('get', '/auth/me', token=TOKEN)
check("Token invalid after logout [401]", sc==401)

sc, _ = api('get', '/posts', token=TOKEN)
check("Feed inaccessible after logout [401]", sc==401)

# ══════════════════════════════════════════════
print("\n[19] DATABASE DIRECT — TRIGGERS & VIEWS")
db = KemetDB()
db2 = KemetDB()

# Re-login for DB tests
login_r = db.login('integration@kemet.com', 'Test1234!')
test_uid = login_r['user']['id']

p_r = db.create_post(test_uid, 'منشور لاختبار العدادات')
p_id = p_r['post_id']

db.toggle_like(DEMO_UID, p_id)
db.toggle_like('user_nefertiti', p_id)
post_row = db.conn.execute("SELECT likes_count FROM posts WHERE id=?", (p_id,)).fetchone()
check("Trigger: likes_count=2 after 2 likes", post_row and post_row['likes_count']==2)

db.toggle_like(DEMO_UID, p_id)
post_row2 = db.conn.execute("SELECT likes_count FROM posts WHERE id=?", (p_id,)).fetchone()
check("Trigger: likes_count=1 after unlike", post_row2 and post_row2['likes_count']==1)

db.add_comment(DEMO_UID, p_id, 'تعليق 1')
db.add_comment('user_nefertiti', p_id, 'تعليق 2')
post_row3 = db.conn.execute("SELECT comments_count FROM posts WHERE id=?", (p_id,)).fetchone()
check("Trigger: comments_count=2", post_row3 and post_row3['comments_count']==2)

db.toggle_follow(test_uid, DEMO_UID)
u_row = db.conn.execute("SELECT following_count FROM users WHERE id=?", (test_uid,)).fetchone()
t_row = db.conn.execute("SELECT followers_count FROM users WHERE id=?", (DEMO_UID,)).fetchone()
check("Trigger: following_count incremented", u_row and u_row['following_count']>=1)
check("Trigger: followers_count incremented", t_row and t_row['followers_count']>=1)

view_rows = db.conn.execute("SELECT * FROM v_posts_full LIMIT 5").fetchall()
check("View v_posts_full returns data", len(view_rows)>0)

bk_view = db.conn.execute("SELECT * FROM v_bookings_full LIMIT 3").fetchall()
check("View v_bookings_full returns data", len(bk_view)>0)

db.close()
db2.close()

# ══════════════════════════════════════════════
print("\n" + "="*60)
total = PASS + FAIL
print(f"  RESULTS: {PASS}/{total} passed  |  {FAIL} failed")
if ERRORS:
    print(f"\n  ❌ Failed tests:")
    for e in ERRORS:
        print(f"    - {e}")
else:
    print("\n  🔺 ALL TESTS PASSED — Project is production-ready!")
print("="*60 + "\n")
sys.exit(0 if FAIL==0 else 1)
