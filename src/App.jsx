/**
 * KEMET SOCIAL - Main React App
 * Full social media + tourism store
 */
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { authAPI, postsAPI, storeAPI, bookingsAPI, messagesAPI, notificationsAPI, usersAPI, storage } from "./utils/api.js";

// ── App Context ───────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ── Constants ─────────────────────────────────────────────
const PHARAOH_NICKNAMES = [
  { id:1,  name_ar:"رمسيس العظيم",  name_en:"Ramesses the Great", emoji:"👑" },
  { id:2,  name_ar:"توت عنخ آمون", name_en:"Tutankhamun",         emoji:"⚱️" },
  { id:3,  name_ar:"حتشبسوت",      name_en:"Hatshepsut",           emoji:"🌺" },
  { id:4,  name_ar:"أخناتون",      name_en:"Akhenaten",            emoji:"☀️" },
  { id:5,  name_ar:"نفرتيتي",      name_en:"Nefertiti",            emoji:"💎" },
  { id:6,  name_ar:"تحتمس الثالث", name_en:"Thutmose III",         emoji:"⚔️" },
  { id:7,  name_ar:"سنفرو",        name_en:"Sneferu",              emoji:"🔺" },
  { id:8,  name_ar:"خوفو",         name_en:"Khufu",                emoji:"🏛️" },
  { id:9,  name_ar:"نفرتاري",      name_en:"Nefertari",            emoji:"🌙" },
  { id:10, name_ar:"كليوباترا",    name_en:"Cleopatra",            emoji:"🐍" },
  { id:11, name_ar:"سيتي الأول",   name_en:"Seti I",               emoji:"🦅" },
  { id:12, name_ar:"مرنبتاح",      name_en:"Merneptah",            emoji:"🌊" },
];

const DEMO_POSTS = [
  { id:"p1", user_id:"u1", nickname:"رمسيس العظيم", avatar_emoji:"👑", is_verified:1, membership:"gold",
    content:"زيارة معبد الكرنك كانت تجربة روحانية لا تُوصف 🏛️ الحجارة تحكي قصص آلاف السنين! من زار الأقصر هذا الشهر؟",
    content_en:"Visiting Karnak Temple was an indescribable spiritual experience 🏛️",
    image_emoji:"🏛️", hashtags:'["#الأقصر","#معبد_الكرنك","#مصر"]',
    likes_count:342, comments_count:28, shares_count:15, liked:false,
    created_at:"2025-01-13T10:00:00" },
  { id:"p2", user_id:"u2", nickname:"نفرتيتي", avatar_emoji:"💎", is_verified:1, membership:"platinum",
    content:"الغروب على النيل في أسوان شيء يسرق القلب ❤️ مصر بلد السحر والجمال الحقيقي 🌊",
    content_en:"Sunset on the Nile in Aswan is something that steals your heart ❤️",
    image_emoji:"🌅", hashtags:'["#أسوان","#النيل","#Egypt"]',
    likes_count:891, comments_count:65, shares_count:43, liked:false,
    created_at:"2025-01-13T08:00:00" },
  { id:"p3", user_id:"u3", nickname:"تحتمس الثالث", avatar_emoji:"⚔️", is_verified:0, membership:"classic",
    content:"انتهيت من رحلة الأهرامات مع فريق كيمت كونسيرج 🔺 الخدمة كانت 10/10 والمرشد موسوعة حية. أنصح الجميع!",
    content_en:"Finished the Pyramids trip with Kemet Concierge 🔺 Service was 10/10!",
    image_emoji:"🔺", hashtags:'["#الأهرامات","#كيمت","#رحلات"]',
    likes_count:224, comments_count:18, shares_count:9, liked:false,
    created_at:"2025-01-12T20:00:00" },
];

const DEMO_TOURS = [
  { id:"tour_luxor",   category_id:"cat_tours",   title_ar:"رحلة الأقصر والأسوان الملكية",     title_en:"Royal Luxor & Aswan Tour",            price:1200, duration_days:7,  image_emoji:"🏛️", badge_ar:"الأكثر مبيعاً", badge_en:"Best Seller", rating:4.9, reviews_count:128, is_featured:1, includes_ar:'["فندق 5 نجوم","جولات مع مرشد","وجبات","نقل"]',          includes_en:'["5-Star Hotel","Guided Tours","Meals","Transport"]',             description_ar:"اكتشف روعة المعابد والمقابر الملكية على ضفاف النيل", description_en:"Discover the grandeur of temples and royal tombs along the Nile" },
  { id:"tour_pyramids",category_id:"cat_tours",   title_ar:"باقة الأهرامات والقاهرة الخديوية", title_en:"Pyramids & Khedival Cairo Package",    price:850,  duration_days:5,  image_emoji:"🔺", badge_ar:"عرض محدود",    badge_en:"Limited Offer", rating:4.8, reviews_count:95,  is_featured:1, includes_ar:'["فندق 5 نجوم","المتحف المصري","أبو الهول","جيزة"]',        includes_en:'["5-Star Hotel","Egyptian Museum","Sphinx","Giza"]',               description_ar:"رحلة شاملة لأعجوبة العالم القديمة وعاصمة الألف مئذنة",     description_en:"A comprehensive trip to the wonder of the ancient world" },
  { id:"tour_nile",    category_id:"cat_nile",    title_ar:"جولة النيل الفاخرة على كروز",       title_en:"Luxury Nile Cruise Tour",             price:1800, duration_days:10, image_emoji:"🛳️", badge_ar:"فاخر",         badge_en:"Luxury",        rating:5.0, reviews_count:64,  is_featured:1, includes_ar:'["كروز 5 نجوم","جميع الوجبات","مرشد خاص","نقل VIP"]',       includes_en:'["5-Star Cruise","All Meals","Private Guide","VIP Transfers"]',    description_ar:"رحلة بحرية فاخرة على النيل من الأقصر حتى أسوان",          description_en:"A luxurious Nile cruise from Luxor to Aswan" },
  { id:"tour_consult", category_id:"cat_consult", title_ar:"استشارة سياحية شخصية",             title_en:"Personal Tourism Consultation",        price:150,  duration_days:null,image_emoji:"💬", badge_ar:"خدمة",         badge_en:"Service",       rating:4.9, reviews_count:210, is_featured:0, includes_ar:'["جلسة ساعتين","خطة مخصصة","دعم واتساب","توصيات"]',         includes_en:'["2-Hour Session","Custom Plan","WhatsApp Support","Recommendations"]', description_ar:"استشارة سياحية مخصصة من خبراء مصريين معتمدين",           description_en:"Personalized consultation from certified Egyptian experts" },
  { id:"tour_dental",  category_id:"cat_medical", title_ar:"باقة سياحة علاجية - الأسنان",      title_en:"Medical Tourism - Dental Package",     price:600,  duration_days:5,  image_emoji:"🦷", badge_ar:"طبي",          badge_en:"Medical",       rating:4.7, reviews_count:88,  is_featured:0, includes_ar:'["فحص شامل","علاج متكامل","إقامة","نقل طبي"]',             includes_en:'["Full Checkup","Complete Treatment","Accommodation","Medical Transport"]', description_ar:"سياحة علاجية متكاملة بأسعار منافسة",                       description_en:"Comprehensive medical tourism at competitive prices" },
  { id:"tour_desert",  category_id:"cat_desert",  title_ar:"تجربة الواحات والصحراء الغربية",   title_en:"Oasis & Western Desert Experience",   price:950,  duration_days:6,  image_emoji:"🌅", badge_ar:"مغامرة",       badge_en:"Adventure",     rating:4.8, reviews_count:52,  is_featured:0, includes_ar:'["خيام فاخرة","جيبات صحراوية","رصد النجوم","طعام بدوي"]', includes_en:'["Luxury Camping","Desert Jeeps","Stargazing","Bedouin Food"]',     description_ar:"مغامرة لا تُنسى في أعماق الصحراء الغربية",               description_en:"An unforgettable adventure in the Western Desert" },
];

const HASHTAGS = [
  { tag:"#مصر_الفراعنة", count:"12.4K" }, { tag:"#الأقصر_والأسوان", count:"8.1K" },
  { tag:"#رحلات_مصر",    count:"6.7K" },  { tag:"#Egypt_Tourism",    count:"5.2K" },
  { tag:"#الأهرامات",    count:"4.9K" },  { tag:"#حضارة_كيمت",      count:"3.8K" },
  { tag:"#Nile_Cruise",  count:"3.2K" },  { tag:"#أبو_سمبل",        count:"2.9K" },
];

// ── CSS ───────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cairo:wght@300;400;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--g:#C9A84C;--gl:#F0D080;--gd:#8B6914;--gg:rgba(201,168,76,.25);
  --b:#000;--bc:#0A0A0A;--bh:#111;--bb:#1A1A1A;--bi:#0D0D0D;
  --tm:#666;--td:#444;--red:#E74C3C;--grn:#27AE60}
body{background:var(--b);color:var(--g);font-family:'Cairo',sans-serif;direction:rtl;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--gd);border-radius:2px}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes glow{0%,100%{box-shadow:0 0 10px var(--gg)}50%{box-shadow:0 0 30px var(--gg),0 0 60px rgba(201,168,76,.1)}}
@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}
.fi{animation:fadeIn .35s ease both}
.btn{border:none;cursor:pointer;font-family:'Cairo',sans-serif;font-size:14px;font-weight:700;border-radius:8px;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-g{background:linear-gradient(135deg,var(--gd),var(--g),var(--gl));color:#000;padding:10px 22px}
.btn-g:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 4px 18px var(--gg)}
.btn-g:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-o{background:transparent;color:var(--g);border:1px solid var(--gd);padding:10px 22px}
.btn-o:hover{background:rgba(201,168,76,.08);border-color:var(--g)}
.btn-gh{background:transparent;color:var(--tm);border:none;padding:8px 14px;font-weight:500}
.btn-gh:hover{color:var(--g);background:rgba(201,168,76,.05)}
.inp{background:var(--bi);border:1px solid var(--bb);color:var(--gl);padding:11px 14px;border-radius:8px;font-family:'Cairo',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s,box-shadow .2s}
.inp:focus{border-color:var(--gd);box-shadow:0 0 0 3px rgba(201,168,76,.07)}
.inp::placeholder{color:var(--td)}
select.inp option{background:var(--b);color:var(--g)}
textarea.inp{resize:none}
.card{background:var(--bc);border:1px solid var(--bb);border-radius:12px}
.card:hover{border-color:rgba(201,168,76,.2)}
.gdiv{height:1px;background:linear-gradient(90deg,transparent,var(--gd),var(--g),var(--gd),transparent);opacity:.4;margin:12px 0}
.badge{background:linear-gradient(135deg,var(--gd),var(--g));color:#000;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block}
.av{border-radius:50%;background:linear-gradient(135deg,var(--gd),var(--g));display:flex;align-items:center;justify-content:center;border:2px solid var(--gd);flex-shrink:0;cursor:pointer;transition:box-shadow .2s}
.av:hover{box-shadow:0 0 12px var(--gg)}
.tab{padding:10px 18px;border:none;background:transparent;color:var(--tm);font-family:'Cairo',sans-serif;font-size:14px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;font-weight:600}
.tab.on{color:var(--g);border-bottom-color:var(--g)}
.tab:hover{color:var(--gl)}
.si{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:all .2s;color:var(--tm);font-size:14px;font-weight:500}
.si:hover,.si.on{color:var(--g);background:rgba(201,168,76,.06)}
.logo{font-family:'Cinzel',serif;font-weight:900;background:linear-gradient(135deg,var(--gd),var(--gl),var(--g));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:3px}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease}
.modal{background:var(--bc);border:1px solid var(--gd);border-radius:16px;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;box-shadow:0 0 60px rgba(201,168,76,.1)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--gd),var(--g));color:#000;padding:11px 24px;border-radius:30px;font-weight:700;font-size:13px;z-index:9999;animation:fadeIn .3s ease;box-shadow:0 4px 20px var(--gg);white-space:nowrap;pointer-events:none}
.lang{background:var(--bb);border:1px solid var(--gd);color:var(--g);padding:3px 11px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'Cairo',sans-serif;transition:all .2s}
.lang:hover{background:var(--gd);color:#000}
.pcover{height:110px;background:linear-gradient(135deg,#0D0A02,#1A1200,#0D0A02);border-radius:12px 12px 0 0;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.hiero{color:var(--gd);opacity:.25;font-size:22px;letter-spacing:10px;white-space:nowrap;overflow:hidden}
.pharaoh-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;max-height:260px;overflow-y:auto}
.ph-opt{background:var(--bi);border:1px solid var(--bb);border-radius:8px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .2s;font-size:11px}
.ph-opt:hover,.ph-opt.sel{border-color:var(--g);background:rgba(201,168,76,.08);color:var(--g)}
.store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.tour-card{background:var(--bc);border:1px solid var(--bb);border-radius:14px;overflow:hidden;transition:all .3s;cursor:pointer}
.tour-card:hover{border-color:var(--gd);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
.app-layout{display:grid;grid-template-columns:230px 1fr 210px;min-height:calc(100vh - 52px);max-width:1180px;margin:0 auto}
@media(max-width:1100px){.app-layout{grid-template-columns:220px 1fr}.rs{display:none}}
@media(max-width:800px){.app-layout{grid-template-columns:1fr}.ls{display:none}}
.nav{background:rgba(0,0,0,.96);border-bottom:1px solid var(--bb);padding:10px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(10px)}
.notif-dot{width:7px;height:7px;background:var(--g);border-radius:50%;animation:pulse 2s infinite}
.post-card{background:var(--bc);border:1px solid var(--bb);border-radius:12px;padding:14px;margin-bottom:11px;transition:border-color .2s;animation:fadeIn .35s ease}
.post-card:hover{border-color:rgba(201,168,76,.18)}
.liked-anim{animation:heartPop .3s ease}
.pay-opt{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:8px;cursor:pointer;border:1px solid var(--bb);margin-bottom:8px;transition:all .2s}
.pay-opt:hover,.pay-opt.sel{border-color:var(--g);background:rgba(201,168,76,.06)}
.comment-box{background:var(--bi);border-radius:8px;padding:9px 13px;margin-bottom:6px;font-size:13px}
.msg-bubble{padding:9px 13px;border-radius:12px;font-size:13px;max-width:78%;margin-bottom:6px}
.msg-me{background:linear-gradient(135deg,var(--gd),rgba(201,168,76,.6));color:#000;margin-right:auto;border-radius:12px 12px 0 12px}
.msg-other{background:var(--bb);color:var(--gl);margin-left:auto;border-radius:12px 12px 12px 0}
`;

// ── Helpers ───────────────────────────────────────────────
function t(ar, en, lang) { return lang === 'ar' ? ar : en; }
function ts(arr, lang) {
  try { const p = JSON.parse(arr); return Array.isArray(p) ? p : []; } catch { return []; }
}
function timeAgo(dt, lang) {
  const d = new Date(dt), n = new Date();
  const m = Math.floor((n - d) / 60000);
  if (m < 1) return t('الآن', 'now', lang);
  if (m < 60) return `${t('منذ', '', lang)} ${m} ${t('دقيقة', 'min ago', lang)}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${t('منذ', '', lang)} ${h} ${t('ساعة', 'h ago', lang)}`;
  return `${t('منذ', '', lang)} ${Math.floor(h/24)} ${t('يوم', 'd ago', lang)}`;
}

// ── Small components ──────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 2600); return () => clearTimeout(id); }, []);
  return <div className="toast">{msg}</div>;
}

function Avatar({ emoji = '👑', size = 44, onClick, url }) {
  return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.45, overflow:'hidden', padding: url ? 0 : undefined }} onClick={onClick}>
      {url ? <img src={url} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : emoji}
    </div>
  );
}

function GoldDivider() { return <div className="gdiv" />; }

// ── LANDING PAGE ──────────────────────────────────────────
function Landing({ onLogin, onRegister, lang, setLang }) {
  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', direction:lang==='ar'?'rtl':'ltr' }}>
      
      {/* Background glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 30%,rgba(201,168,76,.1) 0%,transparent 65%)', pointerEvents:'none' }}/>
      
      {/* Floating pyramid */}
      <div style={{ position:'absolute', fontSize:420, opacity:.015, bottom:-80, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', lineHeight:1 }}>🔺</div>

      {/* Lang toggle */}
      <div style={{ position:'absolute', top:20, right:20, zIndex:20 }}>
        <button className="lang" onClick={()=>setLang(l=>l==='ar'?'en':'ar')}>{lang==='ar'?'EN':'عربي'}</button>
      </div>

      {/* Main content */}
      <div style={{ textAlign:'center', padding:'40px 24px', maxWidth:540, zIndex:1 }}>
        
        {/* Logo */}
        <div style={{ fontSize:72, lineHeight:1, marginBottom:16, animation:'float 5s ease-in-out infinite', filter:'drop-shadow(0 0 30px rgba(201,168,76,.6))' }}>🔺</div>
        
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:6 }}>
          <span style={{ color:'var(--gd)', fontSize:18 }}>𓂀</span>
          <div className="logo" style={{ fontSize:44, letterSpacing:5 }}>KEMET</div>
          <span style={{ color:'var(--gd)', fontSize:18 }}>𓂀</span>
        </div>
        
        <div style={{ fontSize:12, color:'var(--gd)', letterSpacing:4, marginBottom:32, textTransform:'uppercase' }}>
          {lang==='ar' ? 'كيمت ليجاسي' : 'Legacy'}
        </div>

        {/* Tagline */}
        <h1 style={{ fontSize:24, fontWeight:800, color:'var(--gl)', lineHeight:1.5, marginBottom:12 }}>
          {lang==='ar' 
            ? 'اكتشف أسرار الحضارة المصرية من خلال التواصل مع أبنائها'
            : 'Discover the Secrets of Egyptian Civilization Through Its People'}
        </h1>
        
        <p style={{ fontSize:14, color:'var(--tm)', lineHeight:1.9, marginBottom:36 }}>
          {lang==='ar'
            ? 'انضم إلى مجتمع حي من عشاق التاريخ والثقافة المصرية حول العالم'
            : 'Join a living community of history lovers and Egyptian culture enthusiasts worldwide'}
        </p>

        {/* CTA Buttons */}
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-g" style={{ minWidth:180, fontSize:16, padding:'14px 32px', borderRadius:12, boxShadow:'0 4px 28px rgba(201,168,76,.4)', letterSpacing:1 }} onClick={onRegister}>
            {lang==='ar' ? 'ابدأ رحلتك' : 'Join Now'}
          </button>
          <button className="btn btn-o" style={{ minWidth:150, fontSize:15, padding:'14px 24px', borderRadius:12 }} onClick={onLogin}>
            {lang==='ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>

        {/* Subtle tagline */}
        <div style={{ marginTop:40, color:'var(--td)', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>
          {lang==='ar' ? '𓂀 حضارة لا تموت 𓂀' : '𓂀 A Civilization That Never Dies 𓂀'}
        </div>

      </div>

      {/* Bottom line */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,var(--g),transparent)' }} />
    </div>
  );
}

// ── LOGIN MODAL ───────────────────────────────────────────
function LoginModal({ onClose, onSuccess, lang }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState('');

  const handle = async () => {
    if (!email || !pass) { setError(t('يرجى إدخال البيانات','Please fill all fields',lang)); return; }
    setLoading(true); setError('');
    const r = await authAPI.login(email, pass);
    setLoading(false);
    if (r.ok) onSuccess(r.data.user);
    else setError(r.error);
  };

  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ padding:28 }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:38 }}>𓂀</div>
          <div className="logo" style={{ fontSize:22 }}>{t('تسجيل الدخول','Login',lang)}</div>
        </div>
        <GoldDivider />
        {error && <div style={{ color:'var(--red)', fontSize:12, textAlign:'center', padding:'8px 0' }}>{error}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:11, marginTop:14 }}>
          <input className="inp" placeholder={t('البريد الإلكتروني','Email',lang)} value={email} onChange={e=>setEmail(e.target.value)} type="email" onKeyDown={e=>e.key==='Enter'&&handle()} />
          <input className="inp" placeholder={t('كلمة المرور','Password',lang)} value={pass} onChange={e=>setPass(e.target.value)} type="password" onKeyDown={e=>e.key==='Enter'&&handle()} />
          <div style={{ fontSize:11, color:'var(--tm)', textAlign:'center' }}>
            {t('تجريبي: ramesses@kemet.com / Demo1234!','Demo: ramesses@kemet.com / Demo1234!',lang)}
          </div>
          <button className="btn btn-g" onClick={handle} disabled={loading}>{loading ? '⏳' : t('دخول','Login',lang)}</button>
          <button className="btn btn-gh" onClick={onClose} style={{ textAlign:'center' }}>{t('إلغاء','Cancel',lang)}</button>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER MODAL ────────────────────────────────────────
function RegisterModal({ onClose, onSuccess, lang }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', country:'', phone:'', selectedPharaoh:null, customNick:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const nickname  = form.selectedPharaoh ? t(form.selectedPharaoh.name_ar,form.selectedPharaoh.name_en,lang) : (form.customNick||form.name);
  const avatarEmoji = form.selectedPharaoh?.emoji || '👑';

  const finish = async () => {
    setLoading(true); setError('');
    const nick = form.selectedPharaoh ? form.selectedPharaoh.name_ar : (form.customNick||form.name);
    const r = await authAPI.register({ name:form.name, email:form.email, password:form.password, nickname:nick, avatar_emoji:avatarEmoji, country:form.country, phone:form.phone });
    setLoading(false);
    if (r.ok) onSuccess(r.data.user);
    else setError(r.error);
  };

  const COUNTRIES = ['SA','AE','KW','QA','BH','OM','EG','JO','LB','US','GB','OTHER'];
  const CN = {SA:'السعودية',AE:'الإمارات',KW:'الكويت',QA:'قطر',BH:'البحرين',OM:'عُمان',EG:'مصر',JO:'الأردن',LB:'لبنان',US:'أمريكا',GB:'بريطانيا',OTHER:'أخرى'};

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ padding:26 }}>
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:18 }}>
          {[1,2,3].map(s=><div key={s} style={{ width:8,height:8,borderRadius:'50%',background:s<=step?'var(--g)':'var(--bb)',transition:'all .3s' }}/>)}
        </div>

        {step===1 && (
          <div className="fi">
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:32 }}>🔺</div>
              <div className="logo" style={{ fontSize:20 }}>{t('إنشاء حساب','Create Account',lang)}</div>
            </div>
            <GoldDivider />
            {error && <div style={{ color:'var(--red)', fontSize:12, padding:'6px 0', textAlign:'center' }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:14 }}>
              <input className="inp" placeholder={t('الاسم الكامل *','Full Name *',lang)} value={form.name} onChange={e=>set('name',e.target.value)} />
              <input className="inp" placeholder={t('البريد الإلكتروني *','Email *',lang)} value={form.email} onChange={e=>set('email',e.target.value)} type="email" />
              <input className="inp" placeholder={t('كلمة المرور * (6 أحرف+)','Password * (6+ chars)',lang)} value={form.password} onChange={e=>set('password',e.target.value)} type="password" />
              <input className="inp" placeholder={t('رقم الهاتف','Phone',lang)} value={form.phone} onChange={e=>set('phone',e.target.value)} />
              <select className="inp" value={form.country} onChange={e=>set('country',e.target.value)}>
                <option value="">{t('الدولة','Country',lang)}</option>
                {COUNTRIES.map(c=><option key={c} value={c}>{CN[c]}</option>)}
              </select>
              <button className="btn btn-g" onClick={()=>{
                if(!form.name||!form.email||!form.password){setError(t('يرجى إدخال البيانات المطلوبة','Please fill required fields',lang));return;}
                if(form.password.length<6){setError(t('كلمة المرور قصيرة','Password too short',lang));return;}
                setError(''); setStep(2);
              }}>{t('التالي ←','Next →',lang)}</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="fi">
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:28 }}>👑</div>
              <div style={{ color:'var(--g)', fontWeight:700, fontSize:15 }}>{t('اختر اسمك الفرعوني','Choose Your Pharaonic Name',lang)}</div>
              <div style={{ color:'var(--tm)', fontSize:12, marginTop:3 }}>{t('اختر من قائمة الملوك والملكات','Choose from Kings & Queens of Egypt',lang)}</div>
            </div>
            <GoldDivider />
            <div className="pharaoh-grid" style={{ marginTop:10 }}>
              {PHARAOH_NICKNAMES.map(p=>(
                <div key={p.id} className={`ph-opt ${form.selectedPharaoh?.id===p.id?'sel':''}`}
                  onClick={()=>set('selectedPharaoh',form.selectedPharaoh?.id===p.id?null:p)}>
                  <div style={{ fontSize:22, marginBottom:3 }}>{p.emoji}</div>
                  <div style={{ color:'var(--gl)' }}>{lang==='ar'?p.name_ar:p.name_en}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10, color:'var(--tm)', fontSize:12, textAlign:'center' }}>{t('أو اكتب نيكنيم مخصص','Or type your own nickname',lang)}</div>
            <input className="inp" style={{ marginTop:8 }} placeholder={t('نيكنيم مخصص (اختياري)','Custom nickname (optional)',lang)}
              value={form.customNick} onChange={e=>{set('customNick',e.target.value);set('selectedPharaoh',null)}} />
            <div style={{ display:'flex', gap:10, marginTop:13 }}>
              <button className="btn btn-o" onClick={()=>setStep(1)} style={{ flex:1 }}>{t('← رجوع','← Back',lang)}</button>
              <button className="btn btn-g" onClick={()=>setStep(3)} style={{ flex:1 }}>{t('التالي ←','Next →',lang)}</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="fi" style={{ textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:8, animation:'float 3s ease-in-out infinite' }}>{avatarEmoji}</div>
            <div style={{ color:'var(--g)', fontWeight:700, fontSize:18 }}>{nickname}</div>
            <div style={{ color:'var(--tm)', fontSize:13, marginTop:3 }}>{form.name} · {form.email}</div>
            {error && <div style={{ color:'var(--red)', fontSize:12, marginTop:8 }}>{error}</div>}
            <GoldDivider />
            <div style={{ color:'var(--tm)', fontSize:13, lineHeight:2, padding:'8px 0' }}>
              ✦ {t('مرحباً بك في مملكة كيمت','Welcome to the Kingdom of Kemet',lang)}<br/>
              ✦ {t('حسابك على وشك الإنشاء','Your account is ready to be created',lang)}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button className="btn btn-o" onClick={()=>setStep(2)} style={{ flex:1 }}>{t('← رجوع','← Back',lang)}</button>
              <button className="btn btn-g" onClick={finish} disabled={loading} style={{ flex:1 }}>
                {loading?'⏳':t('إنشاء الحساب 🔺','Create Account 🔺',lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── POST CARD ─────────────────────────────────────────────
function PostCard({ post, lang, onLike, currentUserId, user, onToast, onViewProfile }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.liked||false);
  const [likesCount, setLikesCount] = useState(post.likes_count||0);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async () => {
    setLikeAnim(true); setTimeout(()=>setLikeAnim(false), 350);
    const prev = liked;
    setLiked(!prev); setLikesCount(c => prev ? c-1 : c+1);
    const r = await postsAPI.likePost(post.id);
    if (!r.ok) { setLiked(prev); setLikesCount(c => prev ? c+1 : c-1); }
  };

  const loadComments = async () => {
    if (!showComments) {
      const r = await postsAPI.getComments(post.id);
      if (r.ok) setComments(r.data||[]);
    }
    setShowComments(v=>!v);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const r = await postsAPI.addComment(post.id, newComment);
    if (r.ok) {
      setComments(c=>[...c, { id:r.data.comment_id, content:newComment, nickname:t('أنت','You',lang), avatar_emoji:'👑', created_at:new Date().toISOString() }]);
      setNewComment('');
    }
  };

  const tags = ts(post.hashtags);

  return (
    <div className="post-card">
      <div style={{ display:'flex', gap:11, alignItems:'flex-start', marginBottom:11 }}>
       <Avatar emoji={post.avatar_emoji} size={42} url={post?.avatar_url} />
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
           <span style={{ fontWeight:700, fontSize:14, color:'var(--g)', cursor:'pointer' }} onClick={()=>onViewProfile && onViewProfile(post.user_id)}>{post.nickname}</span>
            {post.is_verified===1 && <span style={{ fontSize:13 }}>✓</span>}
            {post.membership==='gold' && <span className="badge" style={{ fontSize:10 }}>Gold</span>}
            {post.membership==='platinum' && <span className="badge" style={{ fontSize:10, background:'linear-gradient(135deg,#6B5B95,#9B8EC4)' }}>Platinum</span>}
          </div>
          <div style={{ fontSize:11, color:'var(--tm)', marginTop:1 }}>{timeAgo(post.created_at, lang)}</div>
               {post.user_id !== currentUserId && (
  <button className="btn btn-gh" style={{fontSize:11,padding:'2px 8px',color:'var(--gd)',border:'1px solid var(--gd)',borderRadius:20,marginTop:2}}
    onClick={async(e)=>{
      e.stopPropagation();
      const r = await usersAPI.follow(post.user_id);
      onToast && onToast(t('تمت المتابعة','Followed',lang));
    }}>
    + {t('متابعة','Follow',lang)}
  </button>
)}
        </div>
      </div>

      <div style={{ fontSize:14, lineHeight:1.85, color:'#D4B660', marginBottom:10 }}>
        {lang==='ar' ? post.content : (post.content_en||post.content)}
      </div>

      {post.image_url && (
         <img src={post.image_url} style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:10,marginBottom:10}} />
         )}

      {tags.length>0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {tags.map(h=><span key={h} style={{ color:'var(--gd)', fontSize:12, cursor:'pointer' }}>{h}</span>)}
        </div>
      )}

      <GoldDivider />

      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, color:'var(--tm)' }}>
        <span>❤️ {likesCount}</span>
        <span>💬 {post.comments_count+(comments.length>0?comments.length:0)}</span>
        <span>🔁 {post.shares_count}</span>
      </div>

      <div style={{ display:'flex', gap:4 }}>
        <button className="btn btn-gh" onClick={handleLike} style={{ flex:1, color:liked?'var(--red)':'var(--tm)', fontSize:13, className:likeAnim?'liked-anim':'' }}>
          {liked?'❤️':'🤍'} {t('إعجاب','Like',lang)}
        </button>
        <button className="btn btn-gh" onClick={loadComments} style={{ flex:1, fontSize:13 }}>
          💬 {t('تعليق','Comment',lang)}
        </button>
      <button className="btn btn-gh" style={{ flex:1, fontSize:13 }} onClick={async()=>{
        const r = await postsAPI.createPost({
         content: `🔁 ${post.nickname}: ${post.content}`,
          language: post.language || 'ar'
       });
        if (r.ok) onToast && onToast(t('تمت المشاركة','Shared',lang));
      }}>
      🔁 {t('مشاركة','Share',lang)}
    </button>

      {showComments && (
        <div className="fi" style={{ marginTop:11, borderTop:'1px solid var(--bb)', paddingTop:11 }}>
          {comments.map(c=>(
            <div key={c.id} className="comment-box">
              <span style={{ color:'var(--g)', fontWeight:700, fontSize:12 }}>{c.nickname} </span>
              <span style={{ color:'var(--gl)' }}>{c.content}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input className="inp" placeholder={t('اكتب تعليقاً...','Write a comment...',lang)}
              value={newComment} onChange={e=>setNewComment(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submitComment()}
              style={{ flex:1, padding:'8px 12px', fontSize:13 }} />
            <button className="btn btn-g" onClick={submitComment} style={{ padding:'8px 14px', fontSize:13 }}>
              {t('إرسال','Send',lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CREATE POST BOX ───────────────────────────────────────
function CreatePost({ user, lang, onPosted }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ['😊','❤️','🔺','🏛️','✈️','🌍','👑','⭐','🎉','🌅','🏖️','🐪','🦅','🌺','💎','⚔️','🌙','☀️','🎭','🏆'];

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setImageUrl(url);
    setUploading(false);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setPosting(true);
    const r = await postsAPI.createPost({ content:text, language:'ar', image_url: imageUrl });
    setPosting(false);
    if (r.ok) { onPosted(text, r.data?.post_id); setText(''); setImageUrl(''); setShowEmoji(false); }
  };

  return (
    <div className="card" style={{ padding:14, marginBottom:14 }}>
      <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
        <Avatar emoji={user?.avatar_emoji||'👑'} size={42} url={user?.avatar_url} />
        <div style={{ flex:1 }}>
          <textarea className="inp" placeholder={t('ما الذي تفكر فيه ؟ 🔺','What are you thinking? 🔺',lang)}
            value={text} onChange={e=>setText(e.target.value)} rows={3} />
          {imageUrl && <img src={imageUrl} style={{width:'100%',maxHeight:200,objectFit:'cover',borderRadius:8,marginTop:8}} />}
          {showEmoji && (
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8,background:'var(--bb)',padding:10,borderRadius:8}}>
              {emojis.map(em=><span key={em} style={{cursor:'pointer',fontSize:22}} onClick={()=>{setText(t=>t+em);setShowEmoji(false)}}>{em}</span>)}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:9 }}>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <label style={{cursor:'pointer',padding:'3px 8px',fontSize:16,color:'var(--tm)'}}>
                {uploading ? '⏳' : '📷'}
                <input type='file' accept='image/*,video/*' onChange={uploadImage} style={{display:'none'}} />
              </label>
              <button className="btn btn-gh" style={{padding:'3px 8px',fontSize:16}} onClick={()=>setShowEmoji(v=>!v)}>😊</button>
            </div>
            <button className="btn btn-g" onClick={submit} disabled={posting||!text.trim()} style={{ padding:'8px 20px' }}>
              {posting?'⏳':t('نشر','Post',lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── TOUR CARD ─────────────────────────────────────────────
function TourCard({ tour, lang, onBuy }) {
  const [open, setOpen] = useState(false);
  const incl = ts(lang==='ar'?tour.includes_ar:tour.includes_en);
  return (
    <div className="tour-card" onClick={()=>setOpen(v=>!v)}>
      <div style={{ background:'linear-gradient(135deg,#0D0A02,#1A1200)', padding:'22px 16px', textAlign:'center', position:'relative' }}>
        <span className="badge" style={{ position:'absolute', top:10, right:10, fontSize:10 }}>{t(tour.badge_ar,tour.badge_en,lang)}</span>
        <div style={{ fontSize:58, marginBottom:6 }}>{tour.image_emoji}</div>
        <div style={{ color:'var(--g)', fontSize:12 }}>{'⭐'.repeat(Math.floor(tour.rating))} {tour.rating} ({tour.reviews_count})</div>
      </div>
      <div style={{ padding:14 }}>
        <h3 style={{ color:'var(--g)', fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:4 }}>
          {t(tour.title_ar,tour.title_en,lang)}
        </h3>
        {tour.duration_days && <div style={{ fontSize:12, color:'var(--tm)', marginBottom:8 }}>📅 {tour.duration_days} {t('أيام','days',lang)}</div>}
        {open && (
          <div className="fi">
            <p style={{ fontSize:13, color:'#999', lineHeight:1.7, marginBottom:10 }}>
              {t(tour.description_ar,tour.description_en,lang)}
            </p>
            {incl.length>0 && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:12, color:'var(--gd)', marginBottom:6, fontWeight:600 }}>{t('يشمل:','Includes:',lang)}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {incl.map(i=><span key={i} style={{ fontSize:11, background:'rgba(201,168,76,.07)', border:'1px solid var(--bb)', padding:'3px 9px', borderRadius:20, color:'var(--gl)' }}>✓ {i}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
        <GoldDivider />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--g)', fontFamily:'Cinzel,serif' }}>${tour.price}</span>
            <span style={{ fontSize:11, color:'var(--tm)', marginRight:4 }}>{t('/ شخص','/ person',lang)}</span>
          </div>
          <button className="btn btn-g" style={{ padding:'8px 14px', fontSize:13 }}
            onClick={e=>{e.stopPropagation();onBuy(tour);}}>
            {t('احجز الآن','Book Now',lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAYMENT MODAL ─────────────────────────────────────────
function PaymentModal({ tour, lang, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('');
  const [card, setCard] = useState({ num:'', exp:'', cvv:'', name:'' });
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = [
    { id:'card',     label:t('بطاقة ائتمان / خصم','Credit / Debit Card',lang), icon:'💳' },
    { id:'paypal',   label:'PayPal',                                             icon:'🅿️' },
    { id:'vodafone', label:t('فودافون كاش','Vodafone Cash',lang),               icon:'📱' },
    { id:'instapay', label:'InstaPay',                                           icon:'⚡' },
    { id:'whatsapp', label:t('دفع عبر واتساب','Pay via WhatsApp',lang),         icon:'💬' },
  ];

  const total = tour.price * guests;

  const handlePay = async () => {
    setLoading(true); setError('');
    const bRes = await bookingsAPI.createBooking({
      tour_id:tour.id, guests_count:guests, travel_date:date,
      payment_method:method, contact_phone:user?.phone||'', contact_email:user?.email||''
    });
    if (!bRes.ok) { setError(bRes.error); setLoading(false); return; }
    const pRes = await bookingsAPI.payBooking(bRes.data.booking_id, method);
    setLoading(false);
    if (pRes.ok) onSuccess();
    else setError(pRes.error||t('خطأ في الدفع','Payment error',lang));
  };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontWeight:700, color:'var(--g)', fontSize:15 }}>🔺 {t('إتمام الحجز','Complete Booking',lang)}</div>
          <button className="btn btn-gh" onClick={onClose} style={{ fontSize:18, padding:'2px 8px' }}>×</button>
        </div>

        <div style={{ background:'rgba(201,168,76,.04)', border:'1px solid var(--bb)', borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:36, textAlign:'center', marginBottom:6 }}>{tour.image_emoji}</div>
          <div style={{ fontWeight:700, color:'var(--g)', fontSize:14, textAlign:'center' }}>{t(tour.title_ar,tour.title_en,lang)}</div>
          <GoldDivider />
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'var(--tm)' }}>{t('عدد الأشخاص','Guests',lang)}</label>
              <select className="inp" style={{ marginTop:4, padding:'7px 10px' }} value={guests} onChange={e=>setGuests(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'var(--tm)' }}>{t('تاريخ السفر','Travel Date',lang)}</label>
              <input className="inp" type="date" style={{ marginTop:4, padding:'7px 10px' }} value={date} onChange={e=>setDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontSize:13 }}>
            <span style={{ color:'var(--tm)' }}>{t('الإجمالي','Total',lang)}</span>
            <span style={{ color:'var(--g)', fontWeight:800, fontFamily:'Cinzel,serif' }}>${total}</span>
          </div>
        </div>

        {error && <div style={{ color:'var(--red)', fontSize:12, textAlign:'center', marginBottom:8 }}>{error}</div>}

        {step===1 && (
          <div className="fi">
            <div style={{ fontSize:13, color:'var(--gl)', marginBottom:10, fontWeight:600 }}>{t('اختر طريقة الدفع:','Choose payment method:',lang)}</div>
            {methods.map(m=>(
              <div key={m.id} className={`pay-opt ${method===m.id?'sel':''}`} onClick={()=>setMethod(m.id)}>
                <span style={{ fontSize:20 }}>{m.icon}</span>
                <span style={{ fontSize:13, color:'var(--gl)' }}>{m.label}</span>
                {method===m.id && <span style={{ marginRight:'auto', color:'var(--g)' }}>✓</span>}
              </div>
            ))}
            <button className="btn btn-g" style={{ width:'100%', marginTop:6 }} onClick={()=>method&&setStep(2)}>
              {t('التالي ←','Next →',lang)}
            </button>
          </div>
        )}

        {step===2 && (
          <div className="fi">
            {method==='card' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input className="inp" placeholder={t('اسم حامل البطاقة','Cardholder Name',lang)} value={card.name} onChange={e=>setCard(c=>({...c,name:e.target.value}))} />
                <input className="inp" placeholder="0000 0000 0000 0000" value={card.num} onChange={e=>setCard(c=>({...c,num:e.target.value}))} />
                <div style={{ display:'flex', gap:10 }}>
                  <input className="inp" placeholder="MM/YY" value={card.exp} onChange={e=>setCard(c=>({...c,exp:e.target.value}))} />
                  <input className="inp" placeholder="CVV" value={card.cvv} onChange={e=>setCard(c=>({...c,cvv:e.target.value}))} />
                </div>
              </div>
            )}
            {method!=='card' && (
              <div style={{ textAlign:'center', padding:'18px 0' }}>
                <div style={{ fontSize:48, marginBottom:10 }}>{methods.find(m=>m.id===method)?.icon}</div>
                <div style={{ color:'var(--gl)', fontSize:13, lineHeight:1.7 }}>
                  {method==='whatsapp'
                    ? t('سيتم تحويلك إلى واتساب لإتمام الحجز مع فريق كيمت كونسيرج','You will be redirected to WhatsApp to complete booking with Kemet Concierge',lang)
                    : t('ستتلقى تعليمات الدفع عبر البريد الإلكتروني','You will receive payment instructions via email',lang)}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button className="btn btn-o" onClick={()=>setStep(1)} style={{ flex:1 }}>{t('رجوع','Back',lang)}</button>
              <button className="btn btn-g" onClick={handlePay} disabled={loading} style={{ flex:1 }}>
                {loading?'⏳':t('تأكيد الحجز 🔺','Confirm 🔺',lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LEFT SIDEBAR ──────────────────────────────────────────
function LeftSidebar({ user, page, setPage, lang, onLogout }) {
  const navItems = [
    { icon:'🏠', ar:'الرئيسية',   en:'Home',          key:'feed' },
    { icon:'👤', ar:'البروفايل',  en:'Profile',       key:'profile' },
    { icon:'🏛️', ar:'الاستور',   en:'Store',         key:'store' },
    { icon:'🔔', ar:'الإشعارات', en:'Notifications', key:'notifications', dot:true },
    { icon:'💬', ar:'الرسائل',   en:'Messages',      key:'messages' },
    { icon:'🔍', ar:'البحث',      en:'Search',        key:'search' },
    { icon:'⚙️', ar:'الإعدادات', en:'Settings',      key:'settings' },
  ];
  return (
    <div style={{ borderLeft:'1px solid var(--bb)', padding:'18px 10px', position:'sticky', top:52, height:'calc(100vh - 52px)', overflowY:'auto', background:'var(--b)', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 8px', marginBottom:22 }}>
        <div className="logo" style={{ fontSize:18 }}>KEMET</div>
        <div style={{ fontSize:10, color:'var(--tm)', marginTop:1 }}>سوشيال</div>
      </div>
      {navItems.map(item=>(
        <div key={item.key} className={`si ${page===item.key?'on':''}`} onClick={()=>setPage(item.key)}>
          <span style={{ fontSize:17, width:22, textAlign:'center' }}>{item.icon}</span>
          <span>{t(item.ar,item.en,lang)}</span>
          {item.dot && <div className="notif-dot" style={{ marginRight:'auto' }}/>}
        </div>
      ))}
      <div style={{ marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--bb)' }}>
        {user && (
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 4px', cursor:'pointer' }} onClick={()=>setPage('profile')}>
            <Avatar emoji={user.avatar_emoji||'👑'} url={user?.avatar_url} size={34} />
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:12, color:'var(--g)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.nickname}</div>
              <div style={{ fontSize:10, color:'var(--tm)' }}>{user.email}</div>
            </div>
          </div>
        )}
        <button className="btn btn-gh" onClick={onLogout} style={{ width:'100%', marginTop:6, fontSize:12, color:'#E74C3C' }}>
          {t('تسجيل الخروج','Logout',lang)}
        </button>
      </div>
    </div>
  );
}

// ── RIGHT SIDEBAR ─────────────────────────────────────────
function RightSidebar({ lang }) {
  return (
    <div className="rs" style={{ borderRight:'1px solid var(--bb)', padding:'18px 12px', position:'sticky', top:52, height:'calc(100vh - 52px)', overflowY:'auto', background:'var(--b)' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:13, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
        🔥 {t('الأكثر تداولاً','Trending',lang)}
      </div>
      {HASHTAGS.map(h=>(
        <div key={h.tag} style={{ padding:'7px 0', borderBottom:'1px solid var(--bb)', cursor:'pointer' }}>
          <div style={{ color:'var(--g)', fontWeight:600, fontSize:13 }}>{h.tag}</div>
          <div style={{ fontSize:11, color:'var(--tm)' }}>{h.count} {t('منشور','posts',lang)}</div>
        </div>
      ))}
      <div className="card" style={{ padding:13, textAlign:'center', marginTop:16 }}>
        <div style={{ fontSize:28, marginBottom:5 }}>🏛️</div>
        <div style={{ color:'var(--g)', fontWeight:700, fontSize:12 }}>{t('كيمت كونسيرج','Kemet Concierge',lang)}</div>
        <div style={{ fontSize:11, color:'var(--tm)', marginTop:4, lineHeight:1.6 }}>{t('ترخيص سياحي طبي رسمي','Official Medical Tourism License',lang)}</div>
        <div style={{ marginTop:8 }}><span className="badge" style={{ fontSize:10 }}>✓ {t('معتمد','Certified',lang)}</span></div>
      </div>
    </div>
  );
}

// ── PAGES ─────────────────────────────────────────────────
function FeedPage({ user, lang, posts, setPosts, onToast }) {
  const handlePosted = (text, postId) => {
    const newPost = {
      id: postId || `p_${Date.now()}`,
      user_id: user.id, nickname: user.nickname,
      avatar_emoji: user.avatar_emoji, is_verified: user.is_verified||0,
      membership: user.membership||'free',
      content: text, content_en: text, image_emoji:'',
      hashtags:'[]', likes_count:0, comments_count:0, shares_count:0, liked:false,
      created_at: new Date().toISOString()
    };
    setPosts(p => [newPost, ...p]);
    onToast(t('تم نشر المنشور! 🔺','Post published! 🔺',lang));
  };

  const handleLike = async (postId) => {
    await postsAPI.likePost(postId);
  };

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:14 }}>
        <button className="tab on">{t('لك','For You',lang)}</button>
        <button className="tab">{t('الأصدقاء','Following',lang)}</button>
        <button className="tab">{t('مصر','Egypt',lang)}</button>
      </div>
      <CreatePost user={user} lang={lang} onPosted={handlePosted} />
      {posts.map(p=><PostCard key={p.id} post={p} lang={lang} onLike={handleLike} currentUserId={user?.id} user={user} onToast={onToast} />)}
    </div>
  );
}

function StorePage({ lang, user, onToast }) {
  const [tours, setTours] = useState(DEMO_TOURS);
  const [tab, setTab] = useState('all');
  const [buyTour, setBuyTour] = useState(null);

  useEffect(()=>{
    storeAPI.getTours().then(r=>{ if(r.ok && r.data?.length) setTours(r.data); });
  },[]);

  const filtered = tab==='all' ? tours : tours.filter(t2=>t2.category_id===`cat_${tab}`);

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ textAlign:'center', marginBottom:22, padding:'16px 0' }}>
        <div style={{ fontSize:48, marginBottom:7 }}>🏛️</div>
        <div className="logo" style={{ fontSize:24, display:'block', marginBottom:5 }}>{t('متجر كيمت السياحي','Kemet Tourism Store',lang)}</div>
        <p style={{ color:'var(--tm)', fontSize:13 }}>{t('رحلات فاخرة • استشارات • سياحة علاجية • ترخيص رسمي','Luxury Tours • Consulting • Medical Tourism • Official License',lang)}</p>
        <div style={{ marginTop:10, display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
          {['✓ ترخيص رسمي','✓ دفع آمن','✓ دعم 24/7'].map(b=><span key={b} className="badge" style={{ fontSize:11 }}>{b}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:18, gap:0 }}>
        {[['all',t('الكل','All',lang)],['tours',t('رحلات','Tours',lang)],['nile',t('كروز','Cruises',lang)],['consult',t('استشارات','Consult',lang)],['medical',t('علاجية','Medical',lang)]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="store-grid">
        {filtered.map(tour=><TourCard key={tour.id} tour={tour} lang={lang} onBuy={setBuyTour} />)}
      </div>
      {buyTour && <PaymentModal tour={buyTour} lang={lang} user={user} onClose={()=>setBuyTour(null)} onSuccess={()=>{ setBuyTour(null); onToast(t('تم تأكيد حجزك! سنتواصل معك قريباً 🔺','Booking confirmed! We will contact you soon 🔺',lang)); }} />}
    </div>
  );
}

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dnrfsmtbi/image/upload';
const CLOUDINARY_PRESET = 'kemet_upload';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  const r = await fetch(CLOUDINARY_URL, { method:'POST', body:fd });
  const d = await r.json();
  return d.secure_url;
}

  function ProfilePage({ user, lang, posts, onToast, onUpdateUser }) {
  const myPosts = posts.filter(p=>p.user_id===user?.id);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name||'', nickname: user?.nickname||'', bio: user?.bio||'' });
  const [uploading, setUploading] = useState(false);
  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setEditForm(f=>({...f, avatar_url: url}));
    setUploading(false);
    onToast && onToast(t('تم رفع الصورة','Image uploaded',lang));
  };
  const saveProfile = async () => {
    const token = storage.getToken();
    const payload = { name: editForm.name, nickname: editForm.nickname, bio: editForm.bio };
    if (editForm.avatar_url) payload.avatar_url = editForm.avatar_url;
    const r = await fetch('https://kemetc1-production.up.railway.app/api/users/profile', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
    const data = await r.json();
   if (data.ok) {
      const updatedUser = {...user, ...payload};
      onUpdateUser && onUpdateUser(updatedUser);
    }
    setEditMode(false);
    onToast && onToast(t('تم تحديث البروفايل','Profile updated',lang));

  };
  const [tab, setTab] = useState('posts');

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'0 14px 14px' }}>
      {editMode && (
        <div className='modal-bg' onClick={e=>e.target===e.currentTarget&&setEditMode(false)}>
          <div className='modal' style={{padding:24}}>
            <div style={{fontWeight:700,color:'var(--g)',fontSize:16,marginBottom:16}}>{t('تعديل البروفايل','Edit Profile',lang)}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{textAlign:'center',marginBottom:8}}>
                <label style={{cursor:'pointer',display:'inline-block',background:'rgba(201,168,76,.1)',border:'1px solid var(--gd)',borderRadius:8,padding:'8px 16px',color:'var(--g)',fontSize:13}}>
                  {uploading ? '⏳' : t('رفع صورة الأفاتار','Upload Avatar',lang)}
                  <input type='file' accept='image/*' onChange={uploadAvatar} style={{display:'none'}} />
                </label>
                {editForm.avatar_url && <img src={editForm.avatar_url} style={{width:60,height:60,borderRadius:'50%',marginTop:8,display:'block',margin:'8px auto 0'}} />}
              </div>
              <input className='inp' placeholder={t('الاسم','Name',lang)} value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
              <input className='inp' placeholder={t('النيكنيم','Nickname',lang)} value={editForm.nickname} onChange={e=>setEditForm(f=>({...f,nickname:e.target.value}))} />
              <textarea className='inp' placeholder={t('نبذة عنك','Bio',lang)} value={editForm.bio} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))} rows={3} />
              <div style={{display:'flex',gap:10,marginTop:6}}>
                <button className='btn btn-o' onClick={()=>setEditMode(false)} style={{flex:1}}>{t('إلغاء','Cancel',lang)}</button>
                <button className='btn btn-g' onClick={saveProfile} style={{flex:1}}>{t('حفظ','Save',lang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="pcover" style={{ marginBottom:0 }}><div className="hiero">𓂀 𓁿 𓆏 𓂋 𓆼 𓅓 𓂀 𓁿 𓆏 𓂋</div></div>
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderTop:'none', borderRadius:'0 0 12px 12px', padding:'0 16px 16px', marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:10 }}>
          <Avatar emoji={user?.avatar_emoji||'👑'} size={90} url={user?.avatar_url} />
          <button className="btn btn-o" style={{ marginBottom:8 }} onClick={()=>setEditMode(true)}>{t('تعديل البروفايل','Edit Profile',lang)}</button>
        </div>
        <div style={{ marginTop:10 }}>
          <div style={{ fontWeight:800, fontSize:20, color:'var(--g)' }}>{user?.nickname}</div>
          <div style={{ fontSize:13, color:'var(--tm)', marginTop:2 }}>{user?.name} · {user?.email}</div>
          <div style={{ marginTop:7 }}>
            <span className="badge">👑 {t('عضو مميز','Premium Member',lang)}</span>
            {user?.country && <span style={{ fontSize:12, color:'var(--tm)', marginRight:10 }}>🌍 {user.country}</span>}
          </div>
          <div style={{ display:'flex', gap:24, marginTop:14 }}>
            {[[myPosts.length, t('منشورات','Posts',lang)],[user?.followers_count||248,t('متابعون','Followers',lang)],[user?.following_count||89,t('متابَعون','Following',lang)]].map(([n,l])=>(
              <div key={l}><div style={{ fontWeight:800, fontSize:18, color:'var(--g)' }}>{n}</div><div style={{ fontSize:11, color:'var(--tm)' }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:14 }}>
        {[['posts',t('المنشورات','Posts',lang)],['media',t('الوسائط','Media',lang)],['likes',t('الإعجابات','Likes',lang)]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {myPosts.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>📝</div>
          <div>{t('لا توجد منشورات بعد. ابدأ بنشر أول تغريدة!','No posts yet. Start with your first tweet!',lang)}</div>
        </div>
      ) : myPosts.map(p=><PostCard key={p.id} post={p} lang={lang} onLike={()=>{}} user={user} onToast={onToast} currentUserId={user?.id} />{}} />)}
    </div>
  );
}

  function NotificationsPage({ lang, user, onToast, notifsList, setNotifsList }) {
     const icons = { like:'❤️', comment:'💬', follow:'👥', booking:'🏛️', system:'🔺' };

useEffect(()=>{
  const token = localStorage.getItem('kemet_token');
  console.log('token:', token);
  console.log('user:', user?.id);
  if (!token || !user) return;
  fetch('https://kemetc1-production.up.railway.app/api/notifications', {
    headers:{'Authorization': 'Bearer ' + token}
  }).then(r=>r.json()).then(d=>{
    console.log('notifs response:', d.ok, d.data?.length, d.data?.[0]?.actor_name);
    if(d.ok && d.data?.length > 0) setNotifsList(d.data);
  });
},[user]);
      
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>🔔 {t('الإشعارات','Notifications',lang)}</div>
      {notifsList.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🔔</div>
          <div>{t('لا توجد إشعارات بعد','No notifications yet',lang)}</div>
        </div>
      ) : notifsList.map(n=>(
        <div key={n.id} className="post-card" style={{ display:'flex', gap:12, alignItems:'center' }}>
          <Avatar emoji={n.actor_avatar||icons[n.type]||'🔔'} size={40} url={n.actor_url||null} />
          <div style={{ flex:1, textAlign:'right' }}>
            <div style={{ fontSize:13, color:'var(--g)', fontWeight:700 }}>{n.actor_name} {icons[n.type]||'🔔'}</div>
            <div style={{ fontSize:13, color:'var(--gl)', marginTop:2 }}>{n.content}</div>
            <div style={{ fontSize:11, color:'var(--tm)', marginTop:2 }}>{timeAgo(n.created_at, lang)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
      
function MessagesPage({ lang, user }) {
  const [inbox, setInbox] = useState([]);
  const [active, setActive] = useState(null);
  const [conv, setConv] = useState([]);
  const [msg, setMsg] = useState('');

 useEffect(()=>{
    messagesAPI.getInbox().then(r=>{ if(r.ok) setInbox(r.data||[]); });
  },[]);

  const openChat = async (item) => {
    setActive(item);
    const r = await messagesAPI.getConversation(item.other_id);
    if (r.ok) setConv(r.data||[]);
    else setConv([
      { id:'m1', sender_id:item.other_id, sender_name:item.other_name, content:item.last_message, created_at:new Date(Date.now()-3600000).toISOString() }
    ]);
  };

  const send = async () => {
    if (!msg.trim()||!active) return;
    const r = await messagesAPI.sendMessage(active.other_id, msg);
    setConv(c=>[...c, { id:r.data?.message_id||Date.now(), sender_id:user?.id, content:msg, created_at:new Date().toISOString() }]);
    setMsg('');
  };

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>💬 {t('الرسائل','Messages',lang)}</div>
      {!active ? (
        inbox.map(item=>(
          <div key={item.other_id} className="post-card" style={{ display:'flex', gap:12, alignItems:'center', cursor:'pointer' }} onClick={()=>openChat(item)}>
            <Avatar emoji={item.avatar_emoji} size={46} />
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, color:'var(--g)', fontSize:14 }}>{item.other_name}</span>
                <span style={{ fontSize:11, color:'var(--tm)' }}>{timeAgo(item.created_at, lang)}</span>
              </div>
              <div style={{ fontSize:13, color:'var(--tm)', marginTop:2 }}>{item.last_message}</div>
            </div>
            {item.unread>0 && <div style={{ background:'var(--g)', color:'#000', width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{item.unread}</div>}
          </div>
        ))
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 0', borderBottom:'1px solid var(--bb)' }}>
            <button className="btn btn-gh" onClick={()=>setActive(null)}>← {t('رجوع','Back',lang)}</button>
            <Avatar emoji={active.avatar_emoji} size={36} />
            <span style={{ fontWeight:700, color:'var(--g)' }}>{active.other_name}</span>
          </div>
          <div style={{ height:360, overflowY:'auto', marginBottom:12, display:'flex', flexDirection:'column' }}>
            {conv.map(m=>(
              <div key={m.id} className={`msg-bubble ${m.sender_id===user?.id?'msg-me':'msg-other'}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="inp" placeholder={t('اكتب رسالة...','Type a message...',lang)} value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} style={{ flex:1 }} />
            <button className="btn btn-g" onClick={send} style={{ padding:'10px 16px' }}>{t('إرسال','Send',lang)}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchPage({ lang }) {
  const [q, setQ] = useState('');
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>🔍 {t('البحث','Search',lang)}</div>
      <input className="inp" placeholder={t('ابحث عن أشخاص أو محتوى أو رحلات...','Search people, content or tours...',lang)} value={q} onChange={e=>setQ(e.target.value)} style={{ marginBottom:20 }} />
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:13, marginBottom:10 }}>🔥 {t('الهاشتاجات الرائجة','Trending Hashtags',lang)}</div>
      {HASHTAGS.map(h=>(
        <div key={h.tag} className="post-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'var(--g)', fontWeight:600, cursor:'pointer' }}>{h.tag}</span>
          <span style={{ fontSize:12, color:'var(--tm)' }}>{h.count}</span>
        </div>
      ))}
    </div>
  );
}

function SettingsPage({ lang, setLang, onLogout }) {
  const items = [
    { icon:'🌐', ar:'اللغة',       en:'Language',     val:lang==='ar'?'العربية':'English', action:()=>setLang(l=>l==='ar'?'en':'ar') },
    { icon:'🔔', ar:'الإشعارات',   en:'Notifications',val:t('مفعّلة','Enabled',lang),      action:null },
    { icon:'🔒', ar:'الخصوصية',    en:'Privacy',       val:t('عام','Public',lang),          action:null },
    { icon:'🎨', ar:'المظهر',       en:'Appearance',   val:t('أسود / ذهبي','Black / Gold',lang), action:null },
    { icon:'💬', ar:'دعم العملاء', en:'Support',       val:'WhatsApp',                      action:null },
  ];
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:18 }}>⚙️ {t('الإعدادات','Settings',lang)}</div>
      {items.map(s=>(
        <div key={s.ar} className="post-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:s.action?'pointer':'default' }} onClick={s.action||undefined}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontSize:20 }}>{s.icon}</span>
            <span style={{ fontSize:14, color:'var(--gl)' }}>{t(s.ar,s.en,lang)}</span>
          </div>
          <span style={{ fontSize:12, color:'var(--tm)' }}>{s.val} ›</span>
        </div>
      ))}
      <div style={{ marginTop:20 }}>
        <button className="btn btn-o" style={{ width:'100%', borderColor:'var(--red)', color:'var(--red)' }} onClick={onLogout}>
          {t('تسجيل الخروج','Logout',lang)}
        </button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [page, setPage] = useState('feed');
  const [user, setUser] = useState(()=>storage.getUser());
  const [lang, setLang] = useState('ar');
  const [modal, setModal] = useState(null);
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [notifsList, setNotifsList] = useState([]);
  const [toast, setToast] = useState(null);

 useEffect(()=>{
    const u = storage.getUser();
    const tk = storage.getToken();
    if (u && tk) { 
      setUser(u); 
      setScreen('app');
    }
  },[]);
      
  // Load feed from API
  useEffect(()=>{
    if (screen==='app') {
      postsAPI.getFeed().then(r=>{ if(r.ok && r.data?.length) setPosts(r.data); });
    }
  },[screen]);

  const showToast = (msg) => { setToast(msg); };

  const handleLogin  = (u) => { setUser(u); setModal(null); setScreen('app'); showToast(t(`مرحباً بعودتك يا ${u.nickname} 👑`,`Welcome back, ${u.nickname} 👑`,lang)); };
  const handleReg    = (u) => { setUser(u); setModal(null); setScreen('app'); showToast(t(`أهلاً بك في مملكة كيمت يا ${u.nickname} 🔺`,`Welcome to the Kingdom of Kemet, ${u.nickname} 🔺`,lang)); };
  const handleLogout = async () => { await authAPI.logout(); setUser(null); setScreen('landing'); setPage('feed'); showToast(t('تم تسجيل الخروج','Logged out',lang)); };

  const navIcons = [['feed','🏠'],['store','🏛️'],['notifications','🔔'],['messages','💬']];

  if (screen==='landing') return (
    <>
      <style>{CSS}</style>
      <Landing onLogin={()=>setModal('login')} onRegister={()=>setModal('register')} lang={lang} setLang={setLang} />
      {modal==='login'    && <LoginModal    lang={lang} onClose={()=>setModal(null)} onSuccess={handleLogin} />}
      {modal==='register' && <RegisterModal lang={lang} onClose={()=>setModal(null)} onSuccess={handleReg} />}
      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Top Nav */}
      <div className="nav">
        <div className="logo" style={{ fontSize:18 }}>KEMET</div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {navIcons.map(([k,ic])=>(
            <button key={k} className="btn btn-gh" style={{ color:page===k?'var(--g)':'var(--tm)', fontSize:18, padding:'4px 10px' }} onClick={()=>setPage(k)}>{ic}</button>
          ))}
          <button className="lang" onClick={()=>setLang(l=>l==='ar'?'en':'ar')}>{lang==='ar'?'EN':'عربي'}</button>
         <Avatar emoji={user?.avatar_emoji||'👑'} size={34} url={user?.avatar_url} onClick={()=>setPage('profile')} />
         <button className="btn btn-gh" onClick={handleLogout} style={{fontSize:12,color:'var(--red)',padding:'4px 8px'}}>خروج</button>
        </div>
      </div>

      {/* Layout */}
      <div className="app-layout" style={{ direction:lang==='ar'?'rtl':'ltr' }}>
        <div className="ls" style={{ borderLeft:lang==='ar'?'1px solid var(--bb)':'none', borderRight:lang==='ar'?'none':'1px solid var(--bb)' }}>
          <LeftSidebar user={user} page={page} setPage={setPage} lang={lang} onLogout={handleLogout} />
        </div>

        <div style={{ minHeight:'calc(100vh - 52px)', borderLeft:'1px solid var(--bb)', borderRight:'1px solid var(--bb)' }}>
          {page==='feed'          && <FeedPage          user={user} lang={lang} posts={posts} setPosts={setPosts} onToast={showToast} />}
          {page==='store'         && <StorePage         lang={lang} user={user} onToast={showToast} />}
          {page==='profile' && <ProfilePage user={user} lang={lang} posts={posts} onToast={showToast} onUpdateUser={(u)=>{setUser(u); storage.setUser(u);}} />}
          {page==='notifications' && <NotificationsPage lang={lang} user={user} onToast={showToast} notifsList={notifsList} setNotifsList={setNotifsList} />}
          {page==='messages'      && <MessagesPage      lang={lang} user={user} />}
          {page==='search'        && <SearchPage        lang={lang} />}
          {page==='settings'      && <SettingsPage      lang={lang} setLang={setLang} onLogout={handleLogout} />}
        </div>

        <RightSidebar lang={lang} />
      </div>

      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
    </>
  );
}
