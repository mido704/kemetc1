/**
 * KEMET SOCIAL - Main React App
 * Full social media + tourism store
 */
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { authAPI, postsAPI, storeAPI, bookingsAPI, messagesAPI, notificationsAPI, usersAPI, storage } from "./utils/api.js";
import EclipsePage from "./EclipsePage.jsx";

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
  { id:'tour_luxor', category_id:'cat_tours', title_ar:'رحلة الأقصر والأسوان الملكية', title_en:'Royal Luxor & Aswan Tour', price:1200, duration_days:7, image_emoji:'🏛️', image_url:'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800', gallery:['https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600','https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600','https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600'], badge_ar:'الأكثر مبيعاً', badge_en:'Best Seller', rating:4.9, reviews_count:128, is_featured:1, includes_ar:'["فندق 5 نجوم","جولات مع مرشد","وجبات","نقل"]', includes_en:'["5-Star Hotel","Guided Tours","Meals","Transport"]', description_ar:'اكتشف روعة المعابد والمقابر الملكية على ضفاف النيل في رحلة لا تُنسى تجمع بين التاريخ والفخامة', description_en:'Discover the grandeur of temples and royal tombs along the Nile in an unforgettable journey combining history and luxury', itinerary_en:['Day 1: Arrive Luxor, Check-in 5-Star Hotel','Day 2: Karnak & Luxor Temples','Day 3: Valley of the Kings & Queens','Day 4: Edfu & Kom Ombo Temples','Day 5: Aswan High Dam & Philae Temple','Day 6: Abu Simbel Day Trip','Day 7: Departure'], itinerary_ar:['اليوم 1: الوصول للأقصر والإقامة','اليوم 2: معابد الكرنك والأقصر','اليوم 3: وادي الملوك والملكات','اليوم 4: معبدا إدفو وكوم أمبو','اليوم 5: السد العالي ومعبد فيلة','اليوم 6: رحلة أبو سمبل','اليوم 7: المغادرة'] },
  { id:"tour_pyramids",category_id:"cat_tours",   title_ar:"باقة الأهرامات والقاهرة الخديوية", title_en:"Pyramids & Khedival Cairo Package",    price:850,  duration_days:5,  image_emoji:"🔺", badge_ar:"عرض محدود",    badge_en:"Limited Offer", rating:4.8, reviews_count:95,  is_featured:1, includes_ar:'["فندق 5 نجوم","المتحف المصري","أبو الهول","جيزة"]',        includes_en:'["5-Star Hotel","Egyptian Museum","Sphinx","Giza"]',               description_ar:"رحلة شاملة لأعجوبة العالم القديمة وعاصمة الألف مئذنة",     description_en:"A comprehensive trip to the wonder of the ancient world" },
  { id:"tour_nile",    category_id:"cat_nile",    title_ar:"جولة النيل الفاخرة على كروز",       title_en:"Luxury Nile Cruise Tour",             price:1800, duration_days:10, image_emoji:"🛳️", badge_ar:"فاخر",         badge_en:"Luxury",        rating:5.0, reviews_count:64,  is_featured:1, includes_ar:'["كروز 5 نجوم","جميع الوجبات","مرشد خاص","نقل VIP"]',       includes_en:'["5-Star Cruise","All Meals","Private Guide","VIP Transfers"]',    description_ar:"رحلة بحرية فاخرة على النيل من الأقصر حتى أسوان",          description_en:"A luxurious Nile cruise from Luxor to Aswan" },
  { id:"tour_consult", category_id:"cat_consult", title_ar:"استشارة سياحية شخصية",             title_en:"Personal Tourism Consultation",        price:150,  duration_days:null,image_emoji:"💬", badge_ar:"خدمة",         badge_en:"Service",       rating:4.9, reviews_count:210, is_featured:0, includes_ar:'["جلسة ساعتين","خطة مخصصة","دعم واتساب","توصيات"]',         includes_en:'["2-Hour Session","Custom Plan","WhatsApp Support","Recommendations"]', description_ar:"استشارة سياحية مخصصة من خبراء مصريين معتمدين",           description_en:"Personalized consultation from certified Egyptian experts" },
  { id:"tour_dental",  category_id:"cat_medical", title_ar:"باقة سياحة علاجية - الأسنان",      title_en:"Medical Tourism - Dental Package",     price:600,  duration_days:5,  image_emoji:"🦷", badge_ar:"طبي",          badge_en:"Medical",       rating:4.7, reviews_count:88,  is_featured:0, includes_ar:'["فحص شامل","علاج متكامل","إقامة","نقل طبي"]',             includes_en:'["Full Checkup","Complete Treatment","Accommodation","Medical Transport"]', description_ar:"سياحة علاجية متكاملة بأسعار منافسة",                       description_en:"Comprehensive medical tourism at competitive prices" },
  { id:"tour_desert",  category_id:"cat_desert",  title_ar:"تجربة الواحات والصحراء الغربية",   title_en:"Oasis & Western Desert Experience",   price:950,  duration_days:6,  image_emoji:"🌅", badge_ar:"مغامرة",       badge_en:"Adventure",     rating:4.8, reviews_count:52,  is_featured:0, includes_ar:'["خيام فاخرة","جيبات صحراوية","رصد النجوم","طعام بدوي"]', includes_en:'["Luxury Camping","Desert Jeeps","Stargazing","Bedouin Food"]',     description_ar:"مغامرة لا تُنسى في أعماق الصحراء الغربية",               description_en:"An unforgettable adventure in the Western Desert" },
];

const HASHTAGS_AR = [
  { tag:'#مصر_الفراعنة', count:'12.4K' }, { tag:'#الأقصر_والأسوان', count:'8.1K' },
  { tag:'#رحلات_مصر', count:'6.7K' }, { tag:'#حضارة_كيمت', count:'5.2K' },
  { tag:'#الأهرامات', count:'4.9K' }, { tag:'#أبو_سمبل', count:'3.8K' },
  { tag:'#النيل', count:'3.2K' }, { tag:'#فراعنة_مصر', count:'2.9K' },
];
const HASHTAGS_EN = [
  { tag:'#Egypt_Tourism', count:'12.4K' }, { tag:'#Luxor_Aswan', count:'8.1K' },
  { tag:'#Egypt_Travel', count:'6.7K' }, { tag:'#Kemet_Culture', count:'5.2K' },
  { tag:'#Pyramids', count:'4.9K' }, { tag:'#AbuSimbel', count:'3.8K' },
  { tag:'#NileCruise', count:'3.2K' }, { tag:'#AncientEgypt', count:'2.9K' },
];
const HASHTAGS = HASHTAGS_AR;

// ── CSS ───────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cairo:wght@300;400;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden;width:100%;max-width:100vw}
:root{--g:#C9A84C;--gl:#F0D080;--gd:#8B6914;--gg:rgba(201,168,76,.25);
  --b:#000;--bc:#0A0A0A;--bh:#111;--bb:#1A1A1A;--bi:#0D0D0D;
  --tm:#666;--td:#444;--red:#E74C3C;--grn:#27AE60}
body{background:var(--b);color:var(--g);font-family:'Cairo',sans-serif;direction:rtl;overflow-x:hidden;max-width:100vw;transition:background 0.3s,color 0.3s}
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
.card{background:var(--bc);border:1px solid var(--bb);border-radius:12px}.post-card{background:var(--bc);border:1px solid var(--bb);border-radius:12px;padding:16px;margin-bottom:12px;transition:border .2s}.post-card:hover{border-color:rgba(201,168,76,.15)}.comment-box{padding:6px 0;border-bottom:1px solid var(--bb)}
.card:hover{border-color:rgba(201,168,76,.2)}
.gdiv{height:1px;background:linear-gradient(90deg,transparent,var(--gd),var(--g),var(--gd),transparent);opacity:.4;margin:12px 0}
.badge{background:linear-gradient(135deg,var(--gd),var(--g));color:#000;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block}
.av{border-radius:50%;background:linear-gradient(135deg,var(--gd),var(--g));display:flex;align-items:center;justify-content:center;border:2px solid var(--gd);flex-shrink:0;cursor:pointer;transition:box-shadow .2s}
.av:hover{box-shadow:0 0 12px var(--gg)}
.tab{padding:10px 12px;border:none;background:transparent;color:var(--tm);font-family:'Cairo',sans-serif;font-size:14px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;font-weight:600}
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
.store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}@media(max-width:800px){.store-grid{grid-template-columns:1fr}.tour-card{max-width:100%}}
.tour-card{background:var(--bc);border:1px solid var(--bb);border-radius:14px;overflow:hidden;transition:all .3s;cursor:pointer;max-width:100%;box-sizing:border-box}
.tour-card:hover{border-color:var(--gd);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
.app-layout{display:grid;grid-template-columns:230px 1fr 210px;min-height:calc(100vh - 52px);max-width:1180px;margin:0 auto}
@media(max-width:1100px){.app-layout{grid-template-columns:220px 1fr}.rs{display:none}}
@media(max-width:800px){.app-layout{grid-template-columns:1fr}.ls{display:none}.bottom-nav{display:flex!important}.hide-mobile{display:none!important}}
.nav{position:sticky;top:0;z-index:500;background:rgba(0,0,0,.95);border-bottom:1px solid var(--bb);padding:0 16px;height:52px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(10px);width:100%;max-width:100vw;overflow:hidden;box-sizing:border-box}.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,.97);border-top:1px solid var(--bb);padding:6px 0 10px;z-index:999;justify-content:space-around;align-items:center;backdrop-filter:blur(10px)}
.bottom-nav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--tm);font-size:10px;padding:4px 12px;cursor:pointer;border:none;background:transparent;font-family:'Cairo',sans-serif}
.bottom-nav-btn.on{color:var(--g)}
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
      {url ? <img src={url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',borderRadius:'50%'}} /> : emoji}
    </div>
  );
}

function GoldDivider() { return <div className="gdiv" />; }

// ── LANDING PAGE ──────────────────────────────────────────
function Landing({ onLogin, onRegister, lang, setLang }) {
  const [phase, setPhase] = useState(0);
  useEffect(()=>{ const t1=setTimeout(()=>setPhase(1),500); const t2=setTimeout(()=>setPhase(2),3000); const t3=setTimeout(()=>setPhase(3),5500); return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);}; },[]);
  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', direction:lang==='ar'?'rtl':'ltr' }}>
      
      {/* Background glow */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 30%,rgba(201,168,76,.1) 0%,transparent 65%)', pointerEvents:'none' }}/>
      
      {/* Floating pyramid */}
      {/* Pharaoh Animation */}
      {phase<3 && (<div style={{position:'fixed',inset:0,zIndex:100,background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        <video autoPlay muted playsInline onEnded={()=>setPhase(3)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.9}} src='https://res.cloudinary.com/dnrfsmtbi/video/upload/KEMET_vxthiy.mp4' />
        <div style={{position:'relative',zIndex:2,textAlign:'center',padding:'0 40px',color:'var(--gl)',fontWeight:800,fontSize:phase===2?28:0,transition:'font-size 1s',lineHeight:1.8}}>
          {lang==='ar'?'مرحباً بك في أرض الحضارة':'Welcome to the Land of Civilization'}<br/>
          <span style={{fontSize:phase===2?16:0,color:'var(--tm)',fontWeight:400,transition:'font-size 1s 0.5s'}}>{lang==='ar'?'ادخل لتكتشف التاريخ بنفسك':'Enter to discover history yourself'}</span>
        </div>
      </div>)}
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
const GOOGLE_CLIENT_ID = '289013959333-tql6lc08dvtn5cc9mvmpb7af3vvp8unl.apps.googleusercontent.com';

function LoginModal({ onClose, onSuccess, lang }) {
  const [email, setEmail] = useState('');
  useEffect(()=>{
    if(window.google){
      window.google.accounts.id.initialize({
        client_id:'289013959333-tql6lc08dvtn5cc9mvmpb7af3vvp8unl.apps.googleusercontent.com',
        callback: window.handleGoogleLogin
      });
    }
  },[]);
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
          <div id='g_id_onload' data-client_id='289013959333-tql6lc08dvtn5cc9mvmpb7af3vvp8unl.apps.googleusercontent.com' data-callback='handleGoogleLogin' data-auto_prompt='false'></div>
          <button className='btn' style={{width:'100%',background:'white',color:'#333',border:'1px solid #ddd',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontSize:14,fontWeight:600,borderRadius:8,marginBottom:8}} onClick={()=>window.google?.accounts.id.prompt()}>🔴 Sign in with Google</button>
          <div style={{textAlign:'center',fontSize:12,color:'var(--tm)',margin:'4px 0'}}>── {t('أو','or',lang)} ──</div>
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

  const COUNTRIES = [['EG','مصر','Egypt'],['SA','السعودية','Saudi Arabia'],['AE','الإمارات','UAE'],['KW','الكويت','Kuwait'],['QA','قطر','Qatar'],['BH','البحرين','Bahrain'],['OM','عُمان','Oman'],['JO','الأردن','Jordan'],['LB','لبنان','Lebanon'],['SY','سوريا','Syria'],['IQ','العراق','Iraq'],['YE','اليمن','Yemen'],['LY','ليبيا','Libya'],['TN','تونس','Tunisia'],['DZ','الجزائر','Algeria'],['MA','المغرب','Morocco'],['SD','السودان','Sudan'],['SO','الصومال','Somalia'],['MR','موريتانيا','Mauritania'],['US','أمريكا','USA'],['GB','بريطانيا','UK'],['DE','ألمانيا','Germany'],['FR','فرنسا','France'],['IT','إيطاليا','Italy'],['ES','إسبانيا','Spain'],['NL','هولندا','Netherlands'],['BE','بلجيكا','Belgium'],['SE','السويد','Sweden'],['NO','النرويج','Norway'],['DK','الدنمارك','Denmark'],['CH','سويسرا','Switzerland'],['AT','النمسا','Austria'],['PL','بولندا','Poland'],['PT','البرتغال','Portugal'],['GR','اليونان','Greece'],['TR','تركيا','Turkey'],['RU','روسيا','Russia'],['CA','كندا','Canada'],['AU','أستراليا','Australia'],['NZ','نيوزيلندا','New Zealand'],['JP','اليابان','Japan'],['CN','الصين','China'],['IN','الهند','India'],['PK','باكستان','Pakistan'],['BD','بنغلاديش','Bangladesh'],['ID','إندونيسيا','Indonesia'],['MY','ماليزيا','Malaysia'],['SG','سنغافورة','Singapore'],['ZA','جنوب أفريقيا','South Africa'],['NG','نيجيريا','Nigeria'],['KE','كينيا','Kenya'],['OTHER','أخرى','Other']];
  const CN = Object.fromEntries(COUNTRIES.map(([k,ar,en])=>[k, lang==='ar'?ar:en]));

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
                {COUNTRIES.map(([k,ar,en])=><option key={k} value={k}>{en}</option>)}
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
  const [replyTo, setReplyTo] = useState(null);
  const [liked, setLiked] = useState(post.liked||false);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyUploading, setReplyUploading] = useState(false);
  const [showReplyEmoji, setShowReplyEmoji] = useState(false);
  const submitReply = async () => {
    if (!replyText.trim() && !replyImage) return;
    const imgUrl = replyImage;
    const r = await postsAPI.addComment(post.id, replyText, replyTo?.id, imgUrl);
    if (r.ok) { setComments(c=>[...c, {id:r.data.comment_id,content:replyText,image_url:imgUrl,nickname:user?.nickname||t('أنت','You',lang),avatar_emoji:user?.avatar_emoji||'👑',avatar_url:user?.avatar_url,created_at:new Date().toISOString(),parent_id:replyTo?.id}]); setReplyText(''); setReplyImage(''); setReplyTo(null); }
  };
  const uploadReplyImg = async (e) => { const file=e.target.files[0]; if(!file) return; setReplyUploading(true); const url=await uploadToCloudinary(file); setReplyImage(url); setReplyUploading(false); };
  const [likeAnim, setLikeAnim] = useState(false);
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const translatePost = async (targetLang) => {
    setShowLangs(false);
    setTranslating(true);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json','x-api-key':import.meta.env.VITE_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body: JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:500,messages:[{role:'user',content:'Translate this text to '+targetLang+'. Return ONLY the translation, nothing else: '+post.content}]})
      });
      const d = await r.json();
      setTranslated(d.content?.[0]?.text || '');
    } catch(e) { setTranslated('Translation error'); }
    setTranslating(false);
  };
  const [likesCount, setLikesCount] = useState(post.likes_count||0);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);

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

  const [commentImage, setCommentImage] = useState('');
  const [commentUploading, setCommentUploading] = useState(false);
  const uploadCommentImg = async (e) => { const file=e.target.files[0]; if(!file) return; setCommentUploading(true); const url=await uploadToCloudinary(file); setCommentImage(url); setCommentUploading(false); };
  const submitComment = async () => {
    if (!newComment.trim() && !commentImage) return;
    const imgUrl = commentImage;
    const r = await postsAPI.addComment(post.id, newComment, null, imgUrl);
    if (r.ok) {
      setComments(c=>[...c, { id:r.data.comment_id, content:newComment, image_url:imgUrl, nickname:user?.nickname||t('أنت','You',lang), avatar_emoji:user?.avatar_emoji||'👑', avatar_url:user?.avatar_url, created_at:new Date().toISOString() }]);
      setNewComment(''); setCommentImage('');
    }
  };
  const tags = ts(post.hashtags);
  return (
    <div className='post-card' id={'post-'+post.id}>
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

      {translating && <div style={{fontSize:13,color:'var(--tm)',padding:'8px 0'}}>⏳ Translating...</div>}
      {translated && <div style={{fontSize:14,lineHeight:1.85,color:'#8BC4E0',marginBottom:10,padding:'10px 12px',background:'rgba(139,196,224,0.06)',borderRadius:8,borderRight:'3px solid #4A9EC4'}}>{translated}<button onClick={()=>setTranslated(String())} style={{background:'none',border:'none',color:'var(--tm)',cursor:'pointer',fontSize:11,marginRight:8}}>x</button></div>}
      {post.image_url && <img src={post.image_url} style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:10,marginBottom:10}} />}
      {post.video_url && <video src={post.video_url} controls style={{width:'100%',maxHeight:300,borderRadius:10,marginBottom:10}} />}


      {tags.length>0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {tags.map(h=><span key={h} style={{ color:'var(--gd)', fontSize:12, cursor:'pointer', marginLeft:4 }} onClick={()=>{ if(window.setHashtagFilter) window.setHashtagFilter(h); }}>{h}</span>)}
        </div>
      )}

      <GoldDivider />

      <div style={{ display:'flex', gap:4 }}>
        <button className='btn btn-gh' onClick={handleLike} style={{ flex:1, color:liked?'var(--red)':'var(--tm)', fontSize:13 }}>
          {liked?'❤️':'🤍'} {t('إعجاب','Like',lang)} {likesCount>0&&<span style={{fontSize:11,opacity:.7}}>({likesCount})</span>}
        </button>
        <button className='btn btn-gh' onClick={loadComments} style={{ flex:1, fontSize:13 }}>
          💬 {t('تعليق','Comment',lang)} {post.comments_count>0&&<span style={{fontSize:11,opacity:.7}}>({post.comments_count})</span>}
        </button>
      <div style={{position:"relative",flex:1}}>
        <button className="btn btn-gh" style={{width:"100%",fontSize:13}} onClick={()=>setShowLangs(v=>!v)}>🌐 {lang==='ar'?'ترجمة':'Translate'}</button>
        {showLangs && <div style={{position:"absolute",bottom:"100%",left:0,background:"var(--bc)",border:"1px solid var(--gd)",borderRadius:10,padding:8,zIndex:100,display:"flex",flexDirection:"column",gap:4,minWidth:120}}>
          {[['English','English'],['Arabic','العربية'],['French','Français'],['German','Deutsch'],['Italian','Italiano'],['Russian','Русский']].map(([code,label])=>(
            <button key={code} className="btn btn-gh" style={{fontSize:12,padding:"4px 8px",textAlign:"right"}} onClick={()=>translatePost(code)}>{label}</button>
          ))}
        </div>}
      </div>
      <button className="btn btn-gh" style={{ flex:1, fontSize:13 }} onClick={async()=>{
        const r = await postsAPI.createPost({
         content: `🔁 ${post.nickname}: ${post.content}`,
          language: post.language || 'ar'
       });
        if (r.ok) onToast && onToast(t('تمت المشاركة','Shared',lang));
      }}>
      🔁 {t('مشاركة','Share',lang)}
    </button>

      </div>
      {showComments && (
        <div className='fi' style={{marginTop:11,borderTop:'1px solid var(--bb)',paddingTop:11}}>
          {replyTo && (<div style={{background:"var(--bi)",border:"1px solid var(--gd)",borderRadius:12,padding:12,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--gd)"}}>↩ Reply to <b>{replyTo.nickname}</b></span><button onClick={()=>{setReplyTo(null);setReplyText("");}} style={{background:"none",border:"none",color:"var(--tm)",cursor:"pointer",fontSize:14}}>✕</button></div><div style={{fontSize:12,color:"var(--tm)",padding:"4px 8px",background:"var(--bb)",borderRadius:6,marginBottom:8}}>{replyTo.content}</div>{showReplyEmoji&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{["😊","❤️","😂","👍","🔥","😍","🙏","💎","👑","🏛️"].map(e=>(<button key={e} onClick={()=>{setReplyText(t=>t+e);setShowReplyEmoji(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>{e}</button>))}</div>}{replyImage&&<img src={replyImage} style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:8,marginBottom:8}} />}<textarea className="inp" placeholder="Write reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} rows={2} style={{marginBottom:8}} /><div style={{display:"flex",gap:8,alignItems:"center"}}><button className="btn btn-gh" onClick={()=>setShowReplyEmoji(v=>!v)} style={{fontSize:18,padding:"4px 8px"}}>😊</button><label className="btn btn-gh" style={{cursor:"pointer",fontSize:13,padding:"4px 8px"}}>{replyUploading?"...":"🖼️"}<input type="file" accept="image/*,video/*" onChange={uploadReplyImg} style={{display:"none"}} /></label><button className="btn btn-g" onClick={submitReply} style={{marginRight:"auto",padding:"8px 16px"}}>إرسال</button></div></div>)}
          {comments.filter(c=>!c.parent_id).map(c=>(<div key={c.id} style={{marginBottom:8,padding:'6px 0',borderBottom:'1px solid var(--bb)'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
              <Avatar emoji={c.avatar_emoji||'👑'} size={26} url={c.avatar_url} />
              <div style={{flex:1}}>
                <span style={{color:'var(--g)',fontWeight:700,fontSize:12}}>{c.nickname} </span>
                <span style={{color:'var(--gl)',fontSize:13}}>{c.content}</span>
                <span style={{color:'var(--gl)',fontSize:13}}>{c.content}</span>
                {c.image_url && <img src={c.image_url} style={{width:'100%',maxHeight:400,objectFit:'contain',borderRadius:8,marginTop:6,background:'var(--bi)'}} />}
              </div>
            </div>
            {comments.filter(r=>r.parent_id===c.id).map(r=>(<div key={r.id} style={{marginRight:32,marginTop:6,padding:'6px 8px',background:'var(--bi)',borderRadius:8,borderRight:'2px solid var(--gd)'}}><span style={{color:'var(--g)',fontWeight:700,fontSize:11}}>{r.nickname} </span><span style={{color:'var(--gl)',fontSize:12}}>{r.content}</span></div>))}
          </div>))}
          <div style={{display:'flex',gap:8,marginTop:8,flexDirection:'column'}}>
            {showCommentEmoji && <div style={{display:'flex',flexWrap:'wrap',gap:4,background:'var(--bi)',borderRadius:8,padding:6}}>{['😊','❤️','😂','👍','🔥','😍','🙏','💎','👑'].map(e=>(<button key={e} onClick={()=>{setNewComment(c=>c+e);setShowCommentEmoji(false);}} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>{e}</button>))}</div>}
            {commentImage && <img src={commentImage} style={{width:'100%',maxHeight:200,objectFit:'cover',borderRadius:8}} />}
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className='btn btn-gh' onClick={()=>setShowCommentEmoji(v=>!v)} style={{padding:'6px 10px',fontSize:16}}>😊</button>
              <label className='btn btn-gh' style={{cursor:'pointer',fontSize:13,padding:'6px 8px'}}>{commentUploading?'...':'🖼️'}<input type='file' accept='image/*,video/*' onChange={uploadCommentImg} style={{display:'none'}} /></label>
              <input className='inp' placeholder='اكتب تعليقاً...' value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitComment()} style={{flex:1,padding:'8px 12px',fontSize:13}} />
              <button className='btn btn-g' onClick={submitComment} style={{padding:'8px 14px',fontSize:13}}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatePost({ user, lang, onPosted }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const emojis = ['😊','❤️','🔺','🏛️','✈️','🌍','👑','⭐','🎉','🌅','🏖️','🐪','🦅','🌺','💎','⚔️','🌙','☀️','🎭','🏆'];
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setIsVideo(file.type.startsWith('video/'));
    const url = await uploadToCloudinary(file);
    setImageUrl(url);
    setUploading(false);
  };
  const submit = async () => {
    if (!text.trim() && !imageUrl) return;
    setPosting(true);
    const content = text.trim() || (isVideo ? '🎥' : '📷');
    const hashtags = JSON.stringify((content.match(/#[\w\u0600-\u06FF]+/g)||[]));
    const r = await postsAPI.createPost({ content, language:'ar', image_url: isVideo?'':imageUrl, video_url: isVideo?imageUrl:'', hashtags });
  };

  return (
    <div className="card" style={{ padding:14, marginBottom:14 }}>
      <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
        <Avatar emoji={user?.avatar_emoji||'👑'} size={42} url={user?.avatar_url} />
        <div style={{ flex:1 }}>
          <textarea className="inp" placeholder={t('ما الذي تفكر فيه ؟ 🔺','What are you thinking? 🔺',lang)}
            value={text} onChange={e=>setText(e.target.value)} rows={3} />
          {imageUrl && !isVideo && <img src={imageUrl} style={{width:'100%',maxHeight:200,objectFit:'cover',borderRadius:8,marginTop:8}} />}
          {imageUrl && isVideo && <video src={imageUrl} controls style={{width:'100%',maxHeight:200,borderRadius:8,marginTop:8}} />}
          {showEmoji && (
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8,background:'var(--bb)',padding:10,borderRadius:8}}>
              {emojis.map(em=><span key={em} style={{cursor:'pointer',fontSize:22}} onClick={()=>{setText(t=>t+em);setShowEmoji(false)}}>{em}</span>)}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:9 }}>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <label style={{cursor:'pointer',padding:'3px 8px',fontSize:16,color:'var(--tm)',title:'صورة'}}>
                {uploading ? '⏳' : '🖼️'}
                <input type='file' accept='image/*' onChange={uploadImage} style={{display:'none'}} />
              </label>
              <label style={{cursor:'pointer',padding:'3px 8px',fontSize:16,color:'var(--tm)'}}>
                🎥
                <input type='file' accept='video/*' onChange={uploadImage} style={{display:'none'}} />
              </label>
            </div>
            <button className='btn btn-g' onClick={submit} disabled={posting||(!text.trim()&&!imageUrl)} style={{ padding:'8px 20px' }}>
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
  const incl = ts(lang==='ar'?tour.includes_ar:tour.includes_en);
  return (
    <div className='tour-card' onClick={()=>onBuy(tour)} style={{cursor:'pointer'}}>
      <div style={{ background:'linear-gradient(135deg,#0D0A02,#1A1200)', padding:'22px 16px', textAlign:'center', position:'relative', minHeight:160, overflow:'hidden' }}>
        {tour.image_url && <img src={tour.image_url} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.4}} />}
        {(tour.badge_ar||tour.badge_en) && <span className='badge' style={{position:'absolute',top:10,right:10,fontSize:10,zIndex:2}}>{t(tour.badge_ar,tour.badge_en,lang)}</span>}
        <div style={{fontSize:58,marginBottom:6,position:'relative',zIndex:1}}>{tour.image_emoji||'🏛️'}</div>
        <div style={{color:'var(--g)',fontSize:12,position:'relative',zIndex:1}}>{'⭐'.repeat(Math.floor(tour.rating||0))} {tour.rating||0} ({tour.reviews_count||0})</div>
      </div>
      <div style={{ padding:14 }}>
        <h3 style={{ color:'var(--g)', fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:4 }}>{t(tour.title_ar,tour.title_en,lang)}</h3>
        {tour.duration_days && <div style={{ fontSize:12, color:'var(--tm)', marginBottom:8 }}>📅 {tour.duration_days} {t('أيام','days',lang)}</div>}
        <GoldDivider />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{ fontSize:20, fontWeight:800, color:'var(--g)' }}>{tour.price||0}</span>
            <span style={{ fontSize:11, color:'var(--tm)' }}> $ / person</span>
          </div>
          <button className='btn btn-g' style={{ padding:'8px 14px', fontSize:13 }} onClick={e=>{e.stopPropagation();onBuy(tour);}}>
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
    { icon:'⚙️', ar:'الإعدادات', en:'Settings', key:'settings' },
    { icon:'🌑', ar:'كسوف 2027', en:'Eclipse 2027', key:'eclipse' },
  ];
  const isAdmin = user?.email === 'mido704@gmail.com';
  const isStoreManager = user?.role === 'store_manager' || isAdmin;
       
  return (
    <div style={{ borderLeft:'1px solid var(--bb)', padding:'18px 10px', position:'sticky', top:52, height:'calc(100vh - 52px)', overflowY:'auto', background:'var(--b)', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 8px', marginBottom:22 }}>
        <div className="logo" style={{ fontSize:18 }}>KEMET</div>
        <button className="btn btn-gh" style={{fontSize:12,padding:"5px 12px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:20,color:"var(--g)",display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,0.06)",fontWeight:700,letterSpacing:1}} onClick={()=>setPage("eclipse")}>🌑 Eclipse 2027</button>
        <div style={{ fontSize:10, color:'var(--tm)', marginTop:1 }}>سوشيال</div>
      </div>
      {isAdmin && (
        <div className={`si ${page==='admin'?'on':''}`} onClick={()=>setPage('admin')}>
          <span style={{ fontSize:17, width:22, textAlign:'center' }}>🛡️</span>
          <span>{t('الإدارة','Admin',lang)}</span>
        </div>
      )}
      {isStoreManager && (
        <div className={`si ${page===('store_manager')?'on':''}`} onClick={()=>setPage('store_manager')}>
          <span style={{ fontSize:17, width:22, textAlign:'center' }}>🏛️</span>
          <span>{t('إدارة المتجر','Store Mgr',lang)}</span>
        </div>
      )}
      
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
      {(lang==='ar'?HASHTAGS_AR:HASHTAGS_EN).map(h=>(
        <div key={h.tag} style={{ padding:'7px 0', borderBottom:'1px solid var(--bb)', cursor:'pointer' }} onClick={()=>{ if(window.setHashtagFilter) window.setHashtagFilter(h.tag); }}>
          <div style={{ color:'var(--g)', fontWeight:600, fontSize:13 }}>{h.tag}</div>
          <div style={{ color:'var(--tm)', fontSize:11 }}>{h.count} {t('منشور','posts',lang)}</div>
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
function FeedPage({ user, lang, posts, setPosts, onToast, onViewProfile }) {
  const [hashFilter, setHashFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(()=>{ window.setHashtagFilter=(h)=>setHashFilter(h); return ()=>delete window.setHashtagFilter; },[]);
  const handlePosted = (text, postId, imageUrl, videoUrl) => {
    const newPost = {
      id: postId || `p_${Date.now()}`,
      user_id: user.id, nickname: user.nickname,
      avatar_emoji: user.avatar_emoji, is_verified: user.is_verified||0,
      membership: user.membership||'free',
      content: text, content_en: text, image_emoji:'',
      image_url: imageUrl||'', video_url: videoUrl||'', hashtags:'[]', likes_count:0, comments_count:0, shares_count:0, liked:false,
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
      {hashFilter && <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,padding:'6px 12px',background:'rgba(201,168,76,.1)',borderRadius:20}}><span style={{color:'var(--gd)',fontSize:13}}>{hashFilter}</span><button onClick={()=>setHashFilter('')} style={{background:'none',border:'none',color:'var(--tm)',cursor:'pointer',fontSize:14}}>✕</button></div>}
      <CreatePost user={user} lang={lang} onPosted={handlePosted} />
      {(hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).slice(0,visibleCount).map(p=><PostCard key={p.id} post={p} lang={lang} onLike={handleLike} currentUserId={user?.id} user={user} onToast={onToast} onViewProfile={onViewProfile} />)}
      {loadingMore && <div style={{textAlign:'center',padding:'20px 0',color:'var(--gd)',fontSize:22}}>⏳</div>}
      {!loadingMore && visibleCount < (hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).length && (
        <div onClick={()=>{setLoadingMore(true);setTimeout(()=>{setVisibleCount(c=>c+10);setLoadingMore(false);},600);}} style={{textAlign:'center',padding:'16px 0',color:'var(--gd)',fontSize:14,cursor:'pointer',border:'1px solid var(--gd)',borderRadius:20,margin:'10px 0',fontWeight:700}}>
          ↓ {lang==='ar'?'تحميل المزيد':'Load More'}
        </div>
      )}
      {!loadingMore && visibleCount < (hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).length && <div style={{textAlign:'center',padding:'16px 0',color:'var(--tm)',fontSize:13}}>↓ {lang==='ar'?'اسحب للمزيد':'Scroll for more'}</div>}
    </div>
  );
}

function TourDetailPage({ tour, lang, user, onBack, onToast }) {
  const [guests, setGuests] = useState(1);
  const [buyTour, setBuyTour] = useState(null);
  const incl = ts(lang==='ar'?tour.includes_ar:tour.includes_en);
  const total = tour.price * guests;
  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'14px 14px' }}>
      <button className="btn btn-gh" onClick={onBack} style={{ marginBottom:14 }}>← {t('رجوع','Back',lang)}</button>
      <div style={{ background:'linear-gradient(135deg,#0D0A02,#1A1200)', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
        {tour.image_url ? (
          <img src={tour.image_url} style={{ width:'100%', maxHeight:280, objectFit:'cover' }} />
        ) : (
          <div style={{ textAlign:'center', padding:'40px 0', fontSize:80 }}>{tour.image_emoji||'🏛️'}</div>
        )}
      </div>
      {tour.gallery && tour.gallery.length>0 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'8px 0', marginBottom:16 }}>
          {tour.gallery.map((img,idx)=>(<img key={idx} src={img} style={{ height:120, minWidth:160, objectFit:'cover', borderRadius:10, border:'1px solid var(--bb)', cursor:'pointer', flexShrink:0 }} onClick={()=>window.open(img,'_blank')} />))}
        </div>
      )}
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderRadius:14, padding:20, marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
          <div>
            <h2 style={{ color:'var(--g)', fontSize:20, fontWeight:800, marginBottom:6 }}>{t(tour.title_ar,tour.title_en,lang)}</h2>
            <div style={{ color:'var(--g)', fontSize:13 }}>{'⭐'.repeat(Math.floor(tour.rating))} {tour.rating} ({tour.reviews_count} {t('تقييم','reviews',lang)})</div>
          </div>
          <span className="badge" style={{ fontSize:11 }}>{t(tour.badge_ar,tour.badge_en,lang)}</span>
        </div>
        <GoldDivider />
        {tour.duration_days && <div style={{ fontSize:13, color:'var(--tm)', marginBottom:10 }}>📅 {tour.duration_days} {t('أيام','days',lang)}</div>}
        <p style={{ fontSize:14, color:'#aaa', lineHeight:1.8, marginBottom:14 }}>{t(tour.description_ar,tour.description_en,lang)}</p>
        {incl.length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--gd)', fontWeight:700, marginBottom:8 }}>✦ {t('يشمل البرنامج:','Program Includes:',lang)}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {incl.map(i=><span key={i} style={{ fontSize:12, background:'rgba(201,168,76,.08)', border:'1px solid var(--bb)', padding:'4px 12px', borderRadius:20, color:'var(--gl)' }}>✓ {i}</span>)}
            </div>
          </div>
        )}
      </div>
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderRadius:14, padding:20 }}>
        <div style={{ fontWeight:700, color:'var(--g)', fontSize:16, marginBottom:14 }}>🎫 {t('تفاصيل الحجز','Booking Details',lang)}</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ color:'var(--tm)', fontSize:13 }}>{t('عدد الأفراد:','Number of guests:',lang)}</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className='btn btn-gh' style={{ width:34, height:34, fontSize:18, padding:0 }} onClick={()=>setGuests(g=>Math.max(1,g-1))}>−</button>
            <span style={{ fontWeight:800, fontSize:20, color:'var(--g)', minWidth:30, textAlign:'center' }}>{guests}</span>
            <button className='btn btn-gh' style={{ width:34, height:34, fontSize:18, padding:0 }} onClick={()=>setGuests(g=>Math.min(9,g+1))}>+</button>
          </div>
          <div style={{ fontSize:12, color:'var(--tm)' }}>{t('(حد أقصى 9)','(max 9)',lang)}</div>
        </div>
        {(lang==='ar'?tour.itinerary_ar:tour.itinerary_en) && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--gd)', fontWeight:700, marginBottom:10 }}>🗓️ {t('البرنامج اليومي:','Daily Itinerary:',lang)}</div>
            {(lang==='ar'?tour.itinerary_ar:tour.itinerary_en).map((day,i)=>(<div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}><span style={{ background:'var(--gd)', color:'#000', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span><span style={{ fontSize:13, color:'var(--gl)', lineHeight:1.6 }}>{day}</span></div>))}
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
          <div>
            <div style={{ fontSize:13, color:'var(--tm)' }}>{guests} × ${tour.price}</div>
            <div style={{ fontSize:26, fontWeight:800, color:'var(--g)', fontFamily:'Cinzel,serif' }}>${total}</div>
          </div>
          <button className="btn btn-g" style={{ padding:'12px 28px', fontSize:15 }} onClick={()=>setBuyTour({...tour, guests_count:guests, total_price:total})}>
            🔺 {t('احجز الآن','Book Now',lang)}
          </button>
        </div>
      </div>
      {buyTour && <PaymentModal tour={buyTour} lang={lang} user={user} onClose={()=>setBuyTour(null)} onSuccess={()=>{ setBuyTour(null); onToast(t('تم تأكيد حجزك! 🔺','Booking confirmed! 🔺',lang)); onBack(); }} />}
    </div>
  );
}
function FlightSearch({ lang }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const search = () => {
    const url = `https://www.skyscanner.net/transport/flights/${from}/${to}/${date.replace(/-/g,'')}/?affilid=kemet`;
    window.open(url, '_blank');
  };
  return (
    <div className='card' style={{padding:24,maxWidth:500,margin:'0 auto',textAlign:'center'}}>
      <div style={{fontSize:48,marginBottom:10}}>✈️</div>
      <div style={{fontWeight:800,fontSize:20,color:'var(--g)',marginBottom:6}}>{lang==='ar'?'ابحث عن رحلات الطيران':'Search Flights'}</div>
      <div style={{fontSize:12,color:'var(--tm)',marginBottom:20}}>{lang==='ar'?'بالتعاون مع Skyscanner':'Powered by Skyscanner'}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        <input className='inp' placeholder={lang==='ar'?'من (مثال: CAI)':'From (e.g. CAI)'} value={from} onChange={e=>setFrom(e.target.value)} />
        <input className='inp' placeholder={lang==='ar'?'إلى (مثال: DXB)':'To (e.g. DXB)'} value={to} onChange={e=>setTo(e.target.value)} />
        <input className='inp' type='date' value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <button className='btn btn-g' style={{width:'100%',padding:'12px 0',fontSize:15}} onClick={search}>🔍 {lang==='ar'?'ابحث الآن':'Search Now'}</button>
      <div style={{marginTop:12,fontSize:11,color:'var(--tm)'}}>{lang==='ar'?'ستنتقل لموقع Skyscanner للحجز':'You will be redirected to Skyscanner to book'}</div>
    </div>
  );
}
function HotelSearch({ lang }) {
  const [city, setCity] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const search = () => {
    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}&aid=kemet`;
    window.open(url, '_blank');
  };
  return (
    <div className='card' style={{padding:24,maxWidth:500,margin:'0 auto',textAlign:'center'}}>
      <div style={{fontSize:48,marginBottom:10}}>🏨</div>
      <div style={{fontWeight:800,fontSize:20,color:'var(--g)',marginBottom:6}}>{lang==='ar'?'ابحث عن فنادق':'Search Hotels'}</div>
      <div style={{fontSize:12,color:'var(--tm)',marginBottom:20}}>{lang==='ar'?'بالتعاون مع Booking.com':'Powered by Booking.com'}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        <input className='inp' placeholder={lang==='ar'?'المدينة (مثال: القاهرة)':'City (e.g. Cairo)'} value={city} onChange={e=>setCity(e.target.value)} />
        <input className='inp' type='date' placeholder={lang==='ar'?'تاريخ الوصول':'Check-in'} value={checkin} onChange={e=>setCheckin(e.target.value)} />
        <input className='inp' type='date' placeholder={lang==='ar'?'تاريخ المغادرة':'Check-out'} value={checkout} onChange={e=>setCheckout(e.target.value)} />
      </div>
      <button className='btn btn-g' style={{width:'100%',padding:'12px 0',fontSize:15}} onClick={search}>🔍 {lang==='ar'?'ابحث الآن':'Search Now'}</button>
      <div style={{marginTop:12,fontSize:11,color:'var(--tm)'}}>{lang==='ar'?'ستنتقل لموقع Booking.com للحجز':'You will be redirected to Booking.com to book'}</div>
    </div>
  );
}
function StorePage({ lang, user, onToast }) {
  const [tours, setTours] = useState(DEMO_TOURS);
  const [tab, setTab] = useState('all');
  const [selectedTour, setSelectedTour] = useState(null);
  const [buyTour, setBuyTour] = useState(null);

  useEffect(()=>{
    storeAPI.getTours().then(r=>{ if(r.ok && r.data?.length) setTours(r.data); });
  },[]);

  const filtered = tab==='all' ? tours : tours.filter(t2=>t2.category_id===`cat_${tab}`);

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ textAlign:'center', marginBottom:22, padding:'16px 0', overflow:'hidden', width:'100%' }}>
        <div style={{ fontSize:48, marginBottom:7 }}>🏛️</div>
        <div className="logo" style={{ fontSize:24, display:'block', marginBottom:5 }}>{t('متجر كيمت السياحي','Kemet Tourism Store',lang)}</div>
        <p style={{ color:'var(--tm)', fontSize:12, padding:'0 8px', wordBreak:'break-word' }}>{t('رحلات فاخرة • استشارات • سياحة علاجية • ترخيص رسمي','Luxury Tours • Consulting • Medical Tourism • Official License',lang)}</p>
        <div style={{ marginTop:10, display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
          {['✓ ترخيص رسمي','✓ دفع آمن','✓ دعم 24/7'].map(b=><span key={b} className="badge" style={{ fontSize:11 }}>{b}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:18, gap:0, overflowX:'auto', WebkitOverflowScrolling:'touch', msOverflowStyle:'none', scrollbarWidth:'none' }}>
        {[['all',t('الكل','All',lang)],['tours',t('رحلات','Tours',lang)],['consult',t('استشارات','Consult',lang)],['medical',t('علاجية','Medical',lang)],['flights',t('طيران','Flights',lang)],['hotels',t('فنادق','Hotels',lang)]].map(([k,l])=>(<button key={k} className={'tab '+(tab===k?'on':'')} onClick={()=>setTab(k)}>{l}</button>))}

      </div>
      {selectedTour ? (
        <TourDetailPage tour={selectedTour} lang={lang} user={user} onBack={()=>setSelectedTour(null)} onToast={onToast} />
      ) : (
        <div className='store-grid'>
          {tab!=='flights' && tab!=='hotels' && filtered.map(tour=><TourCard key={tour.id} tour={tour} lang={lang} onBuy={()=>setSelectedTour(tour)} />)}
          {tab==='flights' && <FlightSearch lang={lang} />}
          {tab==='hotels' && <HotelSearch lang={lang} />}
        </div>
      )}
    </div>
  );
}

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dnrfsmtbi/auto/upload';
const CLOUDINARY_PRESET = 'kemet_upload';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  const r = await fetch(CLOUDINARY_URL, { method:'POST', body:fd });
  const d = await r.json();
  return d.secure_url;
}

function ViewProfilePage({ userId, lang, user, onBack, onStartChat }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const toggleFollow = async () => {
    const r = await fetch(API+'/users/'+userId+'/follow', {method:'POST',headers:{'Authorization':'Bearer '+token}});
    const d = await r.json();
    if(d.ok){ setFollowing(d.data?.following); setProfile(p=>({...p,followers_count:(p.followers_count||0)+(d.data?.following?1:-1)})); }
  };
  const token = storage.getToken();
  const API = 'https://kemetc1-production.up.railway.app/api';
  useEffect(()=>{
    setLoading(true);
    fetch(API+'/users/'+userId, {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{ if(d.ok) setProfile(d.data); setLoading(false); });
  },[userId]);
  if(loading) return <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>⏳</div>;
  if(!profile) return <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>مش موجود</div>;
  return (
    <div style={{maxWidth:600,margin:'0 auto',padding:'0 14px 14px'}}>
      <button className='btn btn-gh' onClick={onBack} style={{marginBottom:14}}>← {t('رجوع','Back',lang)}</button>
      <div className='pcover' style={{marginBottom:0,position:'relative'}}>
        {profile.cover_url ? <img src={profile.cover_url} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0}} /> : <div className='hiero'>𓂀 𓁿 𓆏 𓂋 𓆼 𓅓 𓂀 𓁿 𓆏 𓂋</div>}
      </div>
      <div style={{background:'var(--bc)',border:'1px solid var(--bb)',borderTop:'none',borderRadius:'0 0 12px 12px',padding:'0 16px 16px',marginBottom:14}}>
        <div style={{marginTop:10}}>
          <Avatar emoji={profile.avatar_emoji||'👑'} size={72} url={profile.avatar_url} />
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>{profile.nickname}</div>
          <div style={{fontSize:13,color:'var(--tm)',marginTop:2}}>{profile.name}</div>
          {profile.bio && <div style={{fontSize:13,color:'var(--gl)',marginTop:6,lineHeight:1.6}}>{profile.bio}</div>}
          <div style={{display:'flex',gap:24,marginTop:14}}>
            <div><div style={{fontWeight:800,fontSize:18,color:'var(--g)'}}>{profile.followers_count||0}</div><div style={{fontSize:11,color:'var(--tm)'}}>{t('متابعون','Followers',lang)}</div></div>
            <div><div style={{fontWeight:800,fontSize:18,color:'var(--g)'}}>{profile.following_count||0}</div><div style={{fontSize:11,color:'var(--tm)'}}>{t('متابَعون','Following',lang)}</div></div>
          </div>
          {userId !== user?.id && <button className={following?'btn btn-gh':'btn btn-g'} onClick={toggleFollow} style={{marginTop:12,padding:'8px 24px'}}>{following?t('إلغاء المتابعة','Unfollow',lang):t('+ متابعة','+ Follow',lang)}</button>}
        </div>
      </div>
      {userId !== user?.id && (
        <div style={{background:'var(--bc)',border:'1px solid var(--bb)',borderRadius:12,padding:20,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:8}}>💬</div>
          <div style={{color:'var(--tm)',fontSize:13,marginBottom:14}}>{t('ابعت رسالة خاصة','Send a private message',lang)}</div>
          <button className='btn btn-g' style={{padding:'10px 28px'}} onClick={()=>onStartChat&&onStartChat({id:profile.id,nickname:profile.nickname,avatar_emoji:profile.avatar_emoji,avatar_url:profile.avatar_url})}>
            💬 {t('ارسل رسالة','Send Message',lang)}
          </button>
        </div>
      )}
    </div>
  );
}
function ProfilePage({ user, lang, posts, onToast, onUpdateUser, onSetPage, onStartChat }) {
  const myPosts = posts.filter(p=>p.user_id===user?.id);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name||'', nickname: user?.nickname||'', bio: user?.bio||'', cover_url: user?.cover_url||'' });
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
  const uploadCover = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setEditForm(f=>({...f, cover_url:url}));
    setUploading(false);
    onToast && onToast(t('تم رفع البنر','Cover uploaded',lang));
  };
  const saveProfile = async () => {
    const token = storage.getToken();
    const payload = { name: editForm.name, nickname: editForm.nickname, bio: editForm.bio };
    if (editForm.avatar_url) payload.avatar_url = editForm.avatar_url;
    if (editForm.cover_url) payload.cover_url = editForm.cover_url;
    const r = await fetch('https://kemetc1-production.up.railway.app/api/users/profile', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
    const data = await r.json();
    if (data.ok) { const updatedUser = {...user, ...payload}; onUpdateUser && onUpdateUser(updatedUser); }
    setEditMode(false);
    onToast && onToast(t('تم تحديث البروفايل','Profile updated',lang));
  };
  const [tab, setTab] = useState('posts');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const loadFriends = async () => {
    if (friends.length > 0) return;
    setLoadingFriends(true);
    const token = storage.getToken();
    const r = await fetch('https://kemetc1-production.up.railway.app/api/users/following', { headers:{'Authorization':'Bearer '+token} });
    const d = await r.json();
    if (d.ok) setFriends(d.data||[]);
    setLoadingFriends(false);
  };

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
                <label style={{cursor:'pointer',display:'inline-block',background:'rgba(201,168,76,.1)',border:'1px solid var(--gd)',borderRadius:8,padding:'8px 16px',color:'var(--g)',fontSize:13,marginTop:8}}>
                  {uploading ? '⏳' : t('رفع صورة البنر','Upload Cover',lang)}
                  <input type='file' accept='image/*' onChange={uploadCover} style={{display:'none'}} />
                </label>
                {editForm.cover_url && <img src={editForm.cover_url} style={{width:'100%',height:60,objectFit:'cover',borderRadius:8,marginTop:8}} />}
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
      <div className='pcover' style={{ marginBottom:0, position:'relative' }}>
        {user?.cover_url ? <img src={user.cover_url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',position:'absolute',top:0,left:0}} /> : <div className='hiero'>𓂀 𓁿 𓆏 𓂋 𓆼 𓅓 𓂀 𓁿 𓆏 𓂋</div>}
      </div>
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderTop:'none', borderRadius:'0 0 12px 12px', padding:'0 16px 16px', marginBottom:14 }}>
        <div style={{ marginTop:10 }}>
          <div style={{ marginBottom:10 }}>
            <Avatar emoji={user?.avatar_emoji||'👑'} size={72} url={user?.avatar_url} />
            <button className='btn btn-o' style={{ fontSize:12, marginTop:8, display:'block' }} onClick={()=>setEditMode(true)}>✏️ {t('تعديل البروفايل','Edit Profile',lang)}</button>
          </div>
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
        {[['posts',t('المنشورات','Posts',lang)],['friends',t('الأصدقاء','Friends',lang)],['inbox',t('صندوق الوارد','Inbox',lang)]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>{ setTab(k); if(k==="friends") loadFriends(); }}>{l}</button>
        ))}
      </div>
      {tab==='posts' && (myPosts.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>📝</div>
          <div>{t('لا توجد منشورات بعد. ابدأ بنشر أول تغريدة!','No posts yet. Start with your first tweet!',lang)}</div>
        </div>
      ) : myPosts.map(p=><PostCard key={p.id} post={p} lang={lang} onLike={()=>{}} user={user} onToast={onToast} currentUserId={user?.id} />))}
      {tab==='friends' && (
        <div>
          {loadingFriends && <div style={{textAlign:'center',padding:20,color:'var(--tm)'}}>⏳</div>}
          {friends.length===0 && !loadingFriends && <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>👥 {t('لا يوجد أصدقاء','No friends yet',lang)}</div>}
          {friends.map(f=>(<div key={f.id} className='post-card' style={{display:'flex',gap:10,alignItems:'center',cursor:'pointer'}} onClick={()=>onStartChat&&onStartChat(f)}>
            <Avatar emoji={f.avatar_emoji||'👑'} size={44} url={f.avatar_url} />
            <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--g)',fontSize:14}}>{f.nickname}</div><div style={{fontSize:12,color:'var(--tm)'}}>{f.name}</div></div>
            <span style={{color:'var(--gd)',fontSize:20}}>›</span>
          </div>))}
        </div>
      )}
      {tab==='inbox' && (
        <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>
          <div style={{fontSize:48,marginBottom:10}}>💬</div>
          <div>{t('اضغط على صديق للمراسلة','Tap a friend to message',lang)}</div>
          <button className='btn btn-g' style={{marginTop:14}} onClick={()=>onSetPage&&onSetPage('messages')}>{t('فتح الرسائل','Open Messages',lang)}</button>
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ lang, user, onToast, notifsList, onGoToPost }) {
  const [notifs, setNotifs] = useState([]);
  const icons = { like:'❤️', comment:'💬', follow:'👥', booking:'🏛️', system:'🔺' };
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>🔔 {t('الإشعارات','Notifications',lang)}</div>
      {(notifsList||notifs).length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🔔</div>
          <div>{t('لا توجد إشعارات بعد','No notifications yet',lang)}</div>
        </div>
      ) : (notifsList||notifs).map(n=>(
        <div key={n.id} className='post-card' style={{ display:'flex', gap:12, alignItems:'center', cursor:n.post_id?'pointer':'default' }} onClick={()=>n.post_id&&onGoToPost&&onGoToPost(n.post_id)}>
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
      

// ── JITSI VIDEO CALL ──────────────────────────────────────
function VideoCall({ channelName, onEnd, lang }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.onload = () => {
      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: "kemet-" + channelName.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30),
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          enableNoisyMicDetection: false,
          p2p: { enabled: true },
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: ["microphone","camera","hangup","chat","tileview","fullscreen"],
        },
        userInfo: { displayName: "Kemet User" }
      });
      api.addEventListener("readyToClose", onEnd);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [channelName]);

  return (
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:2000,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:"rgba(0,0,0,.9)",borderBottom:"1px solid var(--gd)"}}>
        <span style={{color:"var(--g)",fontWeight:700,fontSize:15}}>📹 {lang==="ar"?"مكالمة فيديو":"Video Call"}</span>
        <button onClick={onEnd} style={{background:"var(--red)",border:"none",color:"#fff",padding:"8px 18px",borderRadius:20,cursor:"pointer",fontWeight:700,fontSize:13}}>
          📵 {lang==="ar"?"إنهاء":"End Call"}
        </button>
      </div>
      <div ref={containerRef} style={{flex:1,width:"100%"}} />
    </div>
  );
}
function MessagesPage({ lang, user, initialChat, onChatOpened }) {
  const [inbox, setInbox] = useState([]);
  const [active, setActive] = useState(null);
  const [conv, setConv] = useState([]);
  const [msg, setMsg] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callChannel, setCallChannel] = useState('');
  const startCall = (type) => {
    const ch = "kemet_" + [user?.id, active?.other_id].sort().join("_");
    setCallChannel(ch);
    setInCall(true);
    messagesAPI.sendMessage(active.other_id, type==='video' ? '📹 مكالمة فيديو جارية' : '📞 مكالمة صوتية جارية');
  };  const emojis = ['😊','❤️','🔺','🏛️','✈️','🌍','👑','⭐','🎉','🌅','🏖️','🐪','🦅','🌺','💎','⚔️','🌙','☀️','🎭','🏆','🤩','😂','🥰','😎','🙏'];
  const msgRef = null;
  const uploadImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    if (url) { const r = await messagesAPI.sendMessage(active.other_id, url); setConv(c=>[...c, { id:r.data?.message_id||Date.now(), sender_id:user?.id, content:url, created_at:new Date().toISOString() }]); }
  };
  useEffect(()=>{ if(initialChat){ openChat({other_id:initialChat.id, other_name:initialChat.nickname, avatar_emoji:initialChat.avatar_emoji||'👑'}); onChatOpened&&onChatOpened(); } },[initialChat]);

 useEffect(()=>{
    messagesAPI.getInbox().then(r=>{ if(r.ok) setInbox(r.data||[]); });
  },[]);

  const openChat = async (item) => {
    setActive(item);
    const r = await messagesAPI.getConversation(item.other_id);
    if (r.ok) setConv((r.data||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)));
    else setConv([
      { id:'m1', sender_id:item.other_id, sender_name:item.other_name, content:item.last_message, created_at:new Date(Date.now()-3600000).toISOString() }
    ]);
  };
  useEffect(()=>{ if(!active) return; const interval=setInterval(async()=>{ const r=await messagesAPI.getConversation(active.other_id); if(r.ok) setConv((r.data||[]).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))); },5000); return ()=>clearInterval(interval); },[active]);

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
          {inCall && <VideoCall channelName={callChannel} lang={lang} onEnd={()=>setInCall(false)} />}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 0', borderBottom:'1px solid var(--bb)' }}>
            <button className="btn btn-gh" onClick={()=>setActive(null)}>← {t('رجوع','Back',lang)}</button>
            <Avatar emoji={active.avatar_emoji} size={36} />
            <span style={{ fontWeight:700, color:'var(--g)' }}>{active.other_name}</span>
            <button className="btn btn-gh" style={{fontSize:20,padding:'4px 10px',marginRight:'auto'}} onClick={()=>startCall('audio')}>📞</button>
            <button className="btn btn-gh" style={{fontSize:20,padding:'4px 10px'}} onClick={()=>startCall('video')}>📹</button>
          </div>
          <div style={{ height:360, overflowY:'auto', marginBottom:12, display:'flex', flexDirection:'column' }}>
            {conv.map(m=>(
              <div key={m.id} className={`msg-bubble ${m.sender_id===user?.id?"msg-me":"msg-other"}`}>
                {m.content?.startsWith('http') && (m.content?.includes('cloudinary') || m.content?.includes('.jpg') || m.content?.includes('.png') || m.content?.includes('.webp')) ?
                  <img src={m.content} style={{ maxWidth:200, borderRadius:8, display:'block' }} /> :
                  m.content}
              </div>
            ))}
          </div>
          {showEmoji && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:10, background:'var(--bc)', border:'1px solid var(--bb)', borderRadius:10, marginBottom:8 }}>
              {emojis.map(e=>(<span key={e} style={{ fontSize:22, cursor:'pointer' }} onClick={()=>{ setMsg(m=>m+e); setShowEmoji(false); }}>{e}</span>))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className='btn btn-gh' style={{ fontSize:18, padding:'8px 10px' }} onClick={()=>setShowEmoji(v=>!v)}>😊</button>
            <label className='btn btn-gh' style={{ fontSize:18, padding:'8px 10px', cursor:'pointer' }}>
              {uploading ? '⏳' : '📎'}
              <input type='file' accept='image/*' onChange={uploadImage} style={{ display:'none' }} />
            </label>
            <input className='inp' placeholder={t('اكتب رسالة...','Type a message...',lang)} value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} style={{ flex:1 }} />
            <button className='btn btn-g' onClick={send} style={{ padding:'10px 16px' }}>{t('إرسال','Send',lang)}</button>
          </div>



        </div>
      )}
    </div>
  );
}

function SearchPage({ lang, onViewProfile, onStartChat }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const token = localStorage.getItem('kemet_token');
    const r = await fetch('https://kemetc1-production.up.railway.app/api/users/search?q='+encodeURIComponent(q), {headers:{'Authorization':'Bearer '+token}});
    const d = await r.json();
    if (d.ok) setResults(d.data||[]);
    setLoading(false);
  };
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>🔍 {t('البحث','Search',lang)}</div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <input className='inp' placeholder={t('ابحث بالاسم أو النيكنيم...','Search by name or nickname...',lang)} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} style={{flex:1}} />
        <button className='btn btn-g' onClick={search}>{loading?'⏳':'🔍'}</button>
      </div>
      {results.length>0 && results.map(u=>(
        <div key={u.id} className='post-card' style={{display:'flex',gap:12,alignItems:'center',cursor:'pointer'}} onClick={()=>onViewProfile&&onViewProfile(u.id)}>
          <Avatar emoji={u.avatar_emoji||'👑'} size={44} url={u.avatar_url} />
          <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--g)'}}>{u.nickname}</div><div style={{fontSize:12,color:'var(--tm)'}}>{u.name}</div></div>
          <span style={{color:'var(--gd)',fontSize:18}}>›</span>
        </div>
      ))}
    </div>
  );
}
function SettingsPage({ lang, setLang, onLogout }) {
  const items = [
    { icon:'🌐', ar:'اللغة', en:'Language', val:lang==='ar'?'العربية':'English', action:()=>setLang(l=>l==='ar'?'en':'ar') },
    { icon:'🔔', ar:'الإشعارات', en:'Notifications', val:t('مفعّلة','Enabled',lang), action:null },
    { icon:'🔒', ar:'الخصوصية', en:'Privacy', val:t('عام','Public',lang), action:null },
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
function StoreManagerPage({ lang, user, onBack, onToast }) {
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title_ar:'', title_en:'', description_ar:'', description_en:'', price:0, duration_days:1, image_emoji:'🏛', image_url:'', badge_ar:'', badge_en:'', category_id:'cat_tours', includes_ar:'', includes_en:'', itinerary_ar:'', itinerary_en:'', is_featured:0 });
  const token = storage.getToken();
  const [uploading, setUploading] = useState(false);
  const API = 'https://kemetc1-production.up.railway.app/api';
  useEffect(()=>{ loadTours(); },[]);
  const loadTours = () => { storeAPI.getTours().then(r=>{ if(r.ok) setTours(r.data||[]); }); };
  const uploadImg = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setForm(f=>({...f, image_url:url}));
    setUploading(false);
    onToast && onToast(t('تم رفع الصورة','Image uploaded',lang));
  };
  const saveTour = async () => {
    const body = {...form, price:Number(form.price), duration_days:Number(form.duration_days),
      includes_ar: JSON.stringify(form.includes_ar.split(',').map(s=>s.trim()).filter(Boolean)),
      includes_en: JSON.stringify(form.includes_en.split(',').map(s=>s.trim()).filter(Boolean)),
      itinerary_ar: JSON.stringify((form.itinerary_ar||'').split('\n').map(s=>s.trim()).filter(Boolean)),
      itinerary_en: JSON.stringify((form.itinerary_en||'').split('\n').map(s=>s.trim()).filter(Boolean))
    };
    if(editing) {
      await fetch(API+'/store/tours/'+editing.id, {method:'PUT', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}, body:JSON.stringify(body)});
      onToast && onToast(t('تم التحديث','Updated',lang));
    } else {
      await fetch(API+'/store/tours', {method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}, body:JSON.stringify(body)});
      onToast && onToast(t('تمت الاضافة','Added',lang));
    }
    setEditing(null); setAdding(false); loadTours();
  };
  const deleteTour = async (id) => {
    await fetch(API+'/store/tours/'+id, {method:'DELETE', headers:{'Authorization':'Bearer '+token}});
    onToast && onToast(t('تم الحذف','Deleted',lang));
    loadTours();
  };
  const startEdit = (tour) => {
    setForm({ title_ar:tour.title_ar||'', title_en:tour.title_en||'', description_ar:tour.description_ar||'', description_en:tour.description_en||'', price:tour.price||0, duration_days:tour.duration_days||1, image_emoji:tour.image_emoji||'🏛', image_url:tour.image_url||'', badge_ar:tour.badge_ar||'', badge_en:tour.badge_en||'', category_id:tour.category_id||'cat_tours', includes_ar:(tour.includes_ar?JSON.parse(tour.includes_ar):[]).join(','), includes_en:(tour.includes_en?JSON.parse(tour.includes_en):[]).join(','), itinerary_ar:(tour.itinerary_ar?JSON.parse(tour.itinerary_ar):[]).join('\n'), itinerary_en:(tour.itinerary_en?JSON.parse(tour.itinerary_en):[]).join('\n'), is_featured:tour.is_featured||0 });
    setEditing(tour); setAdding(true);
  };
  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:14}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button className='btn btn-gh' onClick={onBack}>← {t('رجوع','Back',lang)}</button>
        <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>🏛 {t('ادارة المتجر','Store Manager',lang)}</div>
        <button className='btn btn-g' style={{marginRight:'auto'}} onClick={()=>{setEditing(null);setForm({title_ar:'',title_en:'',description_ar:'',description_en:'',price:0,duration_days:1,image_emoji:'🏛',image_url:'',badge_ar:'',badge_en:'',category_id:'cat_tours',includes_ar:'',includes_en:'',is_featured:0});setAdding(true);}}>+ {t('اضافة رحلة','Add Tour',lang)}</button>
      </div>
      {adding && (
        <div className='card' style={{padding:20,marginBottom:20}}>
          <div style={{fontWeight:700,color:'var(--g)',marginBottom:14}}>{editing?t('تعديل رحلة','Edit Tour',lang):t('رحلة جديدة','New Tour',lang)}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <input className='inp' placeholder='العنوان بالعربي' value={form.title_ar} onChange={e=>setForm(f=>({...f,title_ar:e.target.value}))} />
            <input className='inp' placeholder='Title EN' value={form.title_en} onChange={e=>setForm(f=>({...f,title_en:e.target.value}))} />
            <textarea className='inp' placeholder='الوصف بالعربي' value={form.description_ar} onChange={e=>setForm(f=>({...f,description_ar:e.target.value}))} rows={3} />
            <textarea className='inp' placeholder='Description EN' value={form.description_en} onChange={e=>setForm(f=>({...f,description_en:e.target.value}))} rows={3} />
            <input className='inp' placeholder='السعر بالدولار $' type='number' value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
            <input className='inp' placeholder='عدد الايام' type='number' value={form.duration_days} onChange={e=>setForm(f=>({...f,duration_days:e.target.value}))} />
            <input className='inp' placeholder='الشارة عربي' value={form.badge_ar} onChange={e=>setForm(f=>({...f,badge_ar:e.target.value}))} />
            <input className='inp' placeholder='Badge EN' value={form.badge_en} onChange={e=>setForm(f=>({...f,badge_en:e.target.value}))} />
            <input className='inp' placeholder='يشمل عربي (مفصول بفواصل)' value={form.includes_ar} onChange={e=>setForm(f=>({...f,includes_ar:e.target.value}))} />
            <input className='inp' placeholder='Includes EN (comma separated)' value={form.includes_en} onChange={e=>setForm(f=>({...f,includes_en:e.target.value}))} />
            <select className='inp' value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}>
              <option value='cat_tours'>رحلات</option>
              <option value='cat_nile'>كروز</option>
              <option value='cat_consult'>استشارات</option>
              <option value='cat_medical'>علاجية</option>
            </select>
            <input className='inp' placeholder='Emoji' value={form.image_emoji} onChange={e=>setForm(f=>({...f,image_emoji:e.target.value}))} />
          </div>
            <textarea className='inp' placeholder='البرنامج اليومي بالعربي (كل يوم في سطر)&#10;اليوم 1: ...&#10;اليوم 2: ...' value={form.itinerary_ar||''} onChange={e=>setForm(f=>({...f,itinerary_ar:e.target.value}))} rows={4} />
            <textarea className='inp' placeholder='Daily Itinerary EN (one day per line)&#10;Day 1: ...&#10;Day 2: ...' value={form.itinerary_en||''} onChange={e=>setForm(f=>({...f,itinerary_en:e.target.value}))} rows={4} />
          <div style={{marginTop:10,display:'flex',gap:10,alignItems:'center'}}>
            <label className='btn btn-gh' style={{cursor:'pointer',border:'1px solid var(--gd)'}}>
              {uploading?'...':t('رفع صورة','Upload Image',lang)}
              <input type='file' accept='image/*' onChange={uploadImg} style={{display:'none'}} />
            </label>
            {form.image_url && <img src={form.image_url} style={{height:50,borderRadius:8}} />}
            <label style={{display:'flex',alignItems:'center',gap:6,color:'var(--tm)',fontSize:13}}>
              <input type='checkbox' checked={form.is_featured===1} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked?1:0}))} />
              {t('مميز','Featured',lang)}
            </label>
          </div>
          <div style={{display:'flex',gap:10,marginTop:14}}>
            <button className='btn btn-o' onClick={()=>{setAdding(false);setEditing(null);}} style={{flex:1}}>{t('الغاء','Cancel',lang)}</button>
            <button className='btn btn-g' onClick={saveTour} style={{flex:1}}>🔺 {t('حفظ','Save',lang)}</button>
          </div>
        </div>
      )}
      <div>
        {tours.map(tour=>(
          <div key={tour.id} className='card' style={{padding:14,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{fontSize:36}}>{tour.image_emoji||'🏛'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'var(--g)'}}>{t(tour.title_ar,tour.title_en,lang)}</div>
              <div style={{fontSize:12,color:'var(--tm)'}}>{tour.price} dollar - {tour.duration_days} {t('ايام','days',lang)}</div>
            </div>
            <button className='btn btn-gh' style={{fontSize:12}} onClick={()=>startEdit(tour)}>✏️ {t('تعديل','Edit',lang)}</button>
            <button className='btn btn-o' style={{fontSize:12,borderColor:'var(--red)',color:'var(--red)'}} onClick={()=>deleteTour(tour.id)}>🗑 {t('حذف','Delete',lang)}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminDashboard({ lang, user, onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('stats');
  const token = localStorage.getItem('kemet_token');
  const API = 'https://kemetc1-production.up.railway.app/api';

  useEffect(()=>{
    fetch(`${API}/admin/stats`, {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{ if(d.ok) setStats(d.data); });
    fetch(`${API}/admin/users`, {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{ if(d.ok) setUsers(d.data); });
  },[]);

  const toggleUser = async (uid) => {
    await fetch(`${API}/admin/users/${uid}/toggle`, {method:'POST', headers:{'Authorization':'Bearer '+token}});
    setUsers(u=>u.map(x=>x.id===uid?{...x,is_active:x.is_active?0:1}:x));
  };
  const setRole = async (uid, role) => {
    await fetch(API+'/admin/users/'+uid+'/role', {method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}, body:JSON.stringify({role})});
    setUsers(u=>u.map(x=>x.id===uid?{...x,role}:x));
  };
  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:14,direction:'rtl'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button className="btn btn-gh" onClick={onBack}>← رجوع</button>
        <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>🏛️ لوحة الإدارة</div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[['stats','📊 إحصائيات'],['users','👥 المستخدمين']].map(([k,l])=>(
          <button key={k} className={`btn ${tab===k?'btn-g':'btn-gh'}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==='stats' && stats && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {[['👥','المستخدمين',stats.users],['📝','البوستات',stats.posts],['❤️','الإعجابات',stats.likes],['👥','المتابعات',stats.follows],['🔑','الجلسات',stats.sessions]].map(([ic,l,n])=>(
            <div key={l} className="card" style={{padding:16,textAlign:'center'}}>
              <div style={{fontSize:32}}>{ic}</div>
              <div style={{fontSize:28,fontWeight:800,color:'var(--g)'}}>{n}</div>
              <div style={{fontSize:12,color:'var(--tm)'}}>{l}</div>
            </div>
          ))}
        </div>
      )}
      {tab==='users' && (
        <div>
          {users.map(u=>(
            <div key={u.id} className="card" style={{padding:12,marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'var(--g)'}}>{u.nickname}</div>
                <div style={{fontSize:11,color:'var(--tm)'}}>{u.email}</div>
                <div style={{fontSize:11,color:'var(--tm)'}}>{u.membership}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button className='btn btn-gh' style={{fontSize:10,padding:'4px 8px',border:'1px solid var(--gd)',color:'var(--g)'}} onClick={()=>setRole(u.id, u.role==='store_manager'?'user':'store_manager')}>
                  {u.role==='store_manager'?'❌ مدير متجر':'🏛️ مدير متجر'}
                </button>
                <button className={`btn ${u.is_active?'btn-o':'btn-g'}`} style={{fontSize:11}} onClick={()=>toggleUser(u.id)}>
                  {u.is_active?'تعطيل':'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// -- AI ASSISTANT --
function AIAssistant({ lang, user, onClose }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: lang === 'ar' ? 'مرحباً! أنا رمسيس، مساعدك الذكي في كيمت. كيف يمكنني مساعدتك؟ 🔺' : 'Welcome! I am Ramesses, your AI guide at Kemet. Ask me about Egypt, tourism, or the 2027 Eclipse! 🔺' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: 'You are Ramesses, an AI assistant for Kemet Social - Egyptian tourism and culture platform. Help users with Egyptian tourism, pharaonic civilization, 2027 Solar Eclipse in Luxor, travel tips, medical tourism, and Nile cruises. Be helpful and enthusiastic about Egyptian heritage. Respond in the same language as the user. IMPORTANT ECLIPSE 2027 ADVICE: Luxor and Aswan hotels are fully booked for the August 2, 2027 eclipse. Always recommend the ALTERNATIVE SOLUTION: Stay in Hurghada (hotels available) and take an air-conditioned bus to Luxor on eclipse morning (3-4 hours journey), watch the eclipse, then return to Hurghada in the evening. This is the BEST and most practical solution. Hurghada has many available hotels at reasonable prices, beautiful beaches to enjoy before and after eclipse day, and easy transportation to Luxor. Always mention this Hurghada alternative when users ask about eclipse accommodation or travel plans.', messages: messages.concat({ role: 'user', content: userMsg }).map(m => ({ role: m.role, content: m.content })) })
      });
      const d = await r.json();
      setMessages(m => [...m, { role: 'assistant', content: d.content?.[0]?.text || 'عذراً، حدث خطأ.' }]);
    } catch(e) { setMessages(m => [...m, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال.' }]); }
    setLoading(false);
  };
  return (
    <div style={{position:'fixed',bottom:130,right:16,width:320,height:460,background:'var(--bc)',border:'1px solid var(--gd)',borderRadius:16,display:'flex',flexDirection:'column',zIndex:1500,boxShadow:'0 8px 40px rgba(201,168,76,0.2)',overflow:'hidden'}}>
      <div style={{padding:'12px 16px',background:'linear-gradient(135deg,var(--gd),var(--g))',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>👑</span>
          <div><div style={{fontFamily:'Cinzel,serif',fontSize:13,fontWeight:700,color:'#000'}}>RAMESSES AI</div><div style={{fontSize:10,color:'rgba(0,0,0,0.6)'}}>مساعدك الذكي</div></div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#000',fontSize:20,cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
        {messages.map((m,i) => (<div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}><div style={{maxWidth:'85%',padding:'8px 12px',borderRadius:m.role==='user'?'12px 12px 0 12px':'12px 12px 12px 0',background:m.role==='user'?'linear-gradient(135deg,var(--gd),var(--g))':'var(--bb)',color:m.role==='user'?'#000':'var(--gl)',fontSize:13,lineHeight:1.6}}>{m.content}</div></div>))}
        {loading && <div style={{display:'flex',gap:4,padding:8}}><span style={{color:'var(--gd)'}}>⏳</span></div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:10,borderTop:'1px solid var(--bb)',display:'flex',gap:8}}>
        <input className="inp" placeholder={lang==='ar'?'اسألني عن مصر...':'Ask about Egypt...'} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} style={{flex:1,padding:'8px 12px',fontSize:13}} />
        <button className="btn btn-g" onClick={send} disabled={loading} style={{padding:'8px 14px'}}>➤</button>
      </div>
    </div>
  );
}
// -- MAIN APP --
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [page, setPage] = useState('feed');
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [user, setUser] = useState(()=>storage.getUser());
  const [viewUserId, setViewUserId] = useState(null);
  const [lang, setLang] = useState('en');
  const [modal, setModal] = useState(null);
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [notifsList, setNotifsList] = useState([]);
  useEffect(()=>{
    window.handleGoogleLogin = async (response) => {
      const r = await fetch('https://kemetc1-production.up.railway.app/api/auth/google', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:response.credential})});
      const d = await r.json();
      if(d.ok){ storage.setToken(d.data.token); storage.setUser(d.data.user); setUser(d.data.user); setModal(null); setScreen('app'); }
    };
  },[]);
  const [toast, setToast] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [theme, setTheme] = useState(()=>localStorage.getItem('kemet_theme')||'dark');
  useEffect(()=>{
    localStorage.setItem('kemet_theme',theme);
    const root = document.documentElement;
    if(theme==='light'){
      root.style.setProperty('--b','#F5F0E8');
      root.style.setProperty('--bc','#FFFFFF');
      root.style.setProperty('--bb','#E8DCC8');
      root.style.setProperty('--bi','#FFF8EE');
      root.style.setProperty('--g','#8B6914');
      root.style.setProperty('--gl','#5A3D00');
      root.style.setProperty('--gd','#C9A84C');
      root.style.setProperty('--tm','#888');
      root.style.setProperty('--td','#AAA');
    } else if(theme==='gold'){
      root.style.setProperty('--b','#FDF5DC');
      root.style.setProperty('--bc','#FFF8E7');
      root.style.setProperty('--bb','#F0DFA0');
      root.style.setProperty('--bi','#FFFBF0');
      root.style.setProperty('--g','#5A3D00');
      root.style.setProperty('--gl','#3D2800');
      root.style.setProperty('--gd','#8B6914');
      root.style.setProperty('--tm','#8B6914');
      root.style.setProperty('--td','#C9A84C');
    } else {
      root.style.setProperty('--b','#000');
      root.style.setProperty('--bc','#0A0A0A');
      root.style.setProperty('--bb','#1A1A1A');
      root.style.setProperty('--bi','#0D0D0D');
      root.style.setProperty('--g','#C9A84C');
      root.style.setProperty('--gl','#F0D080');
      root.style.setProperty('--gd','#8B6914');
      root.style.setProperty('--tm','#666');
      root.style.setProperty('--td','#444');
    }
  },[theme]);

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
      const token = localStorage.getItem('kemet_token');
      if(token) fetch('https://kemetc1-production.up.railway.app/api/notifications',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).then(d=>{ if(d.ok) setNotifsList(d.data||[]); });
    }
  },[screen]);
  const showToast = (msg) => { setToast(msg); };
  const loadNotifs = () => { const token = localStorage.getItem('kemet_token'); if(token) fetch('https://kemetc1-production.up.railway.app/api/notifications',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).then(d=>{ if(d.ok) setNotifsList(d.data||[]); }); };
  useEffect(()=>{ if(screen==='app'){ loadNotifs(); const interval = setInterval(loadNotifs, 30000); return ()=>clearInterval(interval); } },[screen]);
 const handleReg = (u) => { 
  setUser(u); 
  setModal(null); 
  setScreen('app'); 
  showToast(t('ahlan ' + u.nickname, 'Welcome ' + u.nickname, lang));
  const token = localStorage.getItem('kemet_token');
  if (token) {
    fetch('https://kemetc1-production.up.railway.app/api/notifications', {
      headers:{'Authorization': 'Bearer ' + token}
    }).then(r=>r.json()).then(d=>{
      if(d.ok) { 
        console.log('Setting notifs:', d.data?.length, d.data?.[0]?.actor_name); 
        setNotifsList(d.data || []); 
      }
    });
  }
};
      
  const handleLogout = async () => { await authAPI.logout(); setUser(null); setScreen('landing'); setPage('feed'); showToast(t('تم تسجيل الخروج','Logged out',lang)); };
  const handleLogin = (u) => { setUser(u); setModal(null); setScreen('app'); showToast(t('ahlan ' + u.nickname, 'Welcome back ' + u.nickname, lang)); const token = localStorage.getItem('kemet_token'); if(token){ fetch('https://kemetc1-production.up.railway.app/api/notifications',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).then(d=>{ if(d.ok) setNotifsList(d.data||[]); }); } };

  const navIcons = [['feed','🏠'],['store','🏛️'],['notifications','🔔'],['messages','💬']];

  if (screen==='landing') return (
    <>
      <style>{CSS}</style>
      <Landing onLogin={()=>setModal('login')} onRegister={()=>setModal('register')} lang={lang} setLang={setLang} />
      {modal==='login'    && <LoginModal    lang={lang} onClose={()=>setModal(null)} onSuccess={handleLogin} />}
      {modal==='register' && <RegisterModal lang={lang} onClose={()=>setModal(null)} onSuccess={handleReg} />}
      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
      {showAI && <AIAssistant lang={lang} user={user} onClose={()=>setShowAI(false)} />}
      <button onClick={()=>setShowAI(v=>!v)} style={{position:'fixed',bottom:70,right:16,width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--gd),var(--g))',border:'none',fontSize:22,cursor:'pointer',zIndex:1400,boxShadow:'0 4px 20px rgba(201,168,76,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>👑</button>


    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Top Nav */}
      <div className="nav">
        <div className="logo" style={{ fontSize:18 }}>KEMET</div>
        <button className="btn btn-gh" style={{fontSize:12,padding:"5px 12px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:20,color:"var(--g)",display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,0.06)",fontWeight:700,letterSpacing:1}} onClick={()=>setPage("eclipse")}>🌑 Eclipse 2027</button>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <div className='hide-mobile' style={{display:'flex',gap:6}}>
            {navIcons.map(([k,ic])=>(<button key={k} className='btn btn-gh' style={{ color:page===k?'var(--g)':'var(--tm)', fontSize:18, padding:'4px 10px' }} onClick={()=>setPage(k)}>{ic}</button>))}
          </div>
         <Avatar emoji={user?.avatar_emoji||'👑'} size={34} url={user?.avatar_url} onClick={()=>setPage('profile')} />
         <button className="lang" onClick={()=>setLang(l=>l==='ar'?'en':'ar')} style={{fontSize:12,padding:'3px 10px'}}>{lang==='ar'?'EN':'عربي'}</button>
         <button className="lang" onClick={()=>setTheme(t=>t==='dark'?'light':t==='light'?'gold':'dark')} style={{fontSize:14,padding:'3px 8px'}}>{theme==='dark'?'☀️':theme==='light'?'🌙':'✨'}</button>
         <button className="btn btn-gh" onClick={handleLogout} style={{fontSize:12,color:'var(--red)',padding:'4px 8px'}}>خروج</button>
        </div>
      </div>

      {/* Layout */}
      <div className="app-layout" style={{ direction:lang==='ar'?'rtl':'ltr', overflowX:'hidden', maxWidth:'100vw' }}>
        <div className="ls" style={{ borderLeft:lang==='ar'?'1px solid var(--bb)':'none', borderRight:lang==='ar'?'none':'1px solid var(--bb)' }}>
          <LeftSidebar user={user} page={page} setPage={setPage} lang={lang} onLogout={handleLogout} />
        </div>

        <div style={{ minHeight:'calc(100vh - 52px)', borderLeft:'1px solid var(--bb)', borderRight:'1px solid var(--bb)', overflowX:'hidden', minWidth:0 }}>
          {page==='feed' && <FeedPage user={user} lang={lang} posts={posts} setPosts={setPosts} onToast={showToast} onViewProfile={(uid)=>{ setViewUserId(uid); setPage('view_profile'); }} />}
          {page==='profile'        && <ProfilePage        user={user} lang={lang} posts={posts} onToast={showToast} onUpdateUser={(u)=>{setUser(u); storage.setUser(u);}} onSetPage={setPage} onStartChat={(friend)=>{ setActiveChatUser(friend); setPage('messages'); }} />}
          {page==='view_profile' && viewUserId && <ViewProfilePage userId={viewUserId} lang={lang} user={user} onBack={()=>setPage('feed')} onStartChat={(friend)=>{ setActiveChatUser(friend); setPage('messages'); }} />}
          {page==='store'         && <StorePage         lang={lang} user={user} onToast={showToast} />}
          {page==='admin' && user?.email==='mido704@gmail.com' && <AdminDashboard lang={lang} user={user} onBack={()=>setPage('feed')} />}
          {page==='store_manager' && <StoreManagerPage lang={lang} user={user} onBack={()=>setPage('feed')} onToast={showToast} />}
          {page==='notifications' && <NotificationsPage lang={lang} user={user} onToast={showToast} notifsList={notifsList} onGoToPost={(postId)=>{ setPage('feed'); setTimeout(()=>{ const el=document.getElementById('post-'+postId); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); },500); }} />}
          {page==='messages'      && <MessagesPage      lang={lang} user={user} initialChat={activeChatUser} onChatOpened={()=>setActiveChatUser(null)} />}
          {page==='search' && <SearchPage lang={lang} onViewProfile={(uid)=>{ setViewUserId(uid); setPage('view_profile'); }} onStartChat={(u)=>{ setActiveChatUser(u); setPage('messages'); }} />}
          {page==='settings'      && <SettingsPage      lang={lang} setLang={setLang} onLogout={handleLogout} />}
          {page==='eclipse' && <EclipsePage lang={lang} user={user} onToast={showToast} onBook={()=>setPage('store')} />}
        </div>

        <RightSidebar lang={lang} />
      </div>

      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
      {showAI && <AIAssistant lang={lang} user={user} onClose={()=>setShowAI(false)} />}
      <button onClick={()=>setShowAI(v=>!v)} style={{position:'fixed',bottom:70,right:16,width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--gd),var(--g))',border:'none',fontSize:22,cursor:'pointer',zIndex:1400,boxShadow:'0 4px 20px rgba(201,168,76,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>👑</button>


      <div className='bottom-nav'>
        {[['feed','🏠','الرئيسية','Home'],['store','🏛️','المتجر','Store'],['notifications','🔔','إشعارات','Notifs'],['messages','💬','رسائل','Messages'],['profile','👤','بروفايل','Profile'],['search','🔍','بحث','Search']].map(([k,ic,ar,en])=>(
          <button key={k} className={`bottom-nav-btn ${page===k?'on':''}`} onClick={()=>{ setPage(k); }}>
            <span style={{fontSize:22}}>{ic}</span>
            <span>{lang==='ar'?ar:en}</span>
          </button>
        ))}
      </div>
    </>
  );
}
