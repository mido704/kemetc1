/**
 * KEMET SOCIAL - Main React App
 * Full social media + tourism store
 */
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { authAPI, postsAPI, storeAPI, bookingsAPI, messagesAPI, notificationsAPI, usersAPI, storage } from "./utils/api.js";
import EclipsePage from "./EclipsePage.jsx";

// â”€â”€ App Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PHARAOH_NICKNAMES = [
  { id:1,  name_ar:"ط±ظ…ط³ظٹط³ ط§ظ„ط¹ط¸ظٹظ…",  name_en:"Ramesses the Great", emoji:"ًں‘‘" },
  { id:2,  name_ar:"طھظˆطھ ط¹ظ†ط® ط¢ظ…ظˆظ†", name_en:"Tutankhamun",         emoji:"âڑ±ï¸ڈ" },
  { id:3,  name_ar:"ط­طھط´ط¨ط³ظˆطھ",      name_en:"Hatshepsut",           emoji:"ًںŒ؛" },
  { id:4,  name_ar:"ط£ط®ظ†ط§طھظˆظ†",      name_en:"Akhenaten",            emoji:"âک€ï¸ڈ" },
  { id:5,  name_ar:"ظ†ظپط±طھظٹطھظٹ",      name_en:"Nefertiti",            emoji:"ًں’ژ" },
  { id:6,  name_ar:"طھط­طھظ…ط³ ط§ظ„ط«ط§ظ„ط«", name_en:"Thutmose III",         emoji:"âڑ”ï¸ڈ" },
  { id:7,  name_ar:"ط³ظ†ظپط±ظˆ",        name_en:"Sneferu",              emoji:"ًں”؛" },
  { id:8,  name_ar:"ط®ظˆظپظˆ",         name_en:"Khufu",                emoji:"ًںڈ›ï¸ڈ" },
  { id:9,  name_ar:"ظ†ظپط±طھط§ط±ظٹ",      name_en:"Nefertari",            emoji:"ًںŒ™" },
  { id:10, name_ar:"ظƒظ„ظٹظˆط¨ط§طھط±ط§",    name_en:"Cleopatra",            emoji:"ًںگچ" },
  { id:11, name_ar:"ط³ظٹطھظٹ ط§ظ„ط£ظˆظ„",   name_en:"Seti I",               emoji:"ًں¦…" },
  { id:12, name_ar:"ظ…ط±ظ†ط¨طھط§ط­",      name_en:"Merneptah",            emoji:"ًںŒٹ" },
];

const DEMO_POSTS = [
  { id:"p1", user_id:"u1", nickname:"ط±ظ…ط³ظٹط³ ط§ظ„ط¹ط¸ظٹظ…", avatar_emoji:"ًں‘‘", is_verified:1, membership:"gold",
    content:"ط²ظٹط§ط±ط© ظ…ط¹ط¨ط¯ ط§ظ„ظƒط±ظ†ظƒ ظƒط§ظ†طھ طھط¬ط±ط¨ط© ط±ظˆط­ط§ظ†ظٹط© ظ„ط§ طھظڈظˆطµظپ ًںڈ›ï¸ڈ ط§ظ„ط­ط¬ط§ط±ط© طھط­ظƒظٹ ظ‚طµطµ ط¢ظ„ط§ظپ ط§ظ„ط³ظ†ظٹظ†! ظ…ظ† ط²ط§ط± ط§ظ„ط£ظ‚طµط± ظ‡ط°ط§ ط§ظ„ط´ظ‡ط±طں",
    content_en:"Visiting Karnak Temple was an indescribable spiritual experience ًںڈ›ï¸ڈ",
    image_emoji:"ًںڈ›ï¸ڈ", hashtags:'["#ط§ظ„ط£ظ‚طµط±","#ظ…ط¹ط¨ط¯_ط§ظ„ظƒط±ظ†ظƒ","#ظ…طµط±"]',
    likes_count:342, comments_count:28, shares_count:15, liked:false,
    created_at:"2025-01-13T10:00:00" },
  { id:"p2", user_id:"u2", nickname:"ظ†ظپط±طھظٹطھظٹ", avatar_emoji:"ًں’ژ", is_verified:1, membership:"platinum",
    content:"ط§ظ„ط؛ط±ظˆط¨ ط¹ظ„ظ‰ ط§ظ„ظ†ظٹظ„ ظپظٹ ط£ط³ظˆط§ظ† ط´ظٹط، ظٹط³ط±ظ‚ ط§ظ„ظ‚ظ„ط¨ â‌¤ï¸ڈ ظ…طµط± ط¨ظ„ط¯ ط§ظ„ط³ط­ط± ظˆط§ظ„ط¬ظ…ط§ظ„ ط§ظ„ط­ظ‚ظٹظ‚ظٹ ًںŒٹ",
    content_en:"Sunset on the Nile in Aswan is something that steals your heart â‌¤ï¸ڈ",
    image_emoji:"ًںŒ…", hashtags:'["#ط£ط³ظˆط§ظ†","#ط§ظ„ظ†ظٹظ„","#Egypt"]',
    likes_count:891, comments_count:65, shares_count:43, liked:false,
    created_at:"2025-01-13T08:00:00" },
  { id:"p3", user_id:"u3", nickname:"طھط­طھظ…ط³ ط§ظ„ط«ط§ظ„ط«", avatar_emoji:"âڑ”ï¸ڈ", is_verified:0, membership:"classic",
    content:"ط§ظ†طھظ‡ظٹطھ ظ…ظ† ط±ط­ظ„ط© ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ ظ…ط¹ ظپط±ظٹظ‚ ظƒظٹظ…طھ ظƒظˆظ†ط³ظٹط±ط¬ ًں”؛ ط§ظ„ط®ط¯ظ…ط© ظƒط§ظ†طھ 10/10 ظˆط§ظ„ظ…ط±ط´ط¯ ظ…ظˆط³ظˆط¹ط© ط­ظٹط©. ط£ظ†طµط­ ط§ظ„ط¬ظ…ظٹط¹!",
    content_en:"Finished the Pyramids trip with Kemet Concierge ًں”؛ Service was 10/10!",
    image_emoji:"ًں”؛", hashtags:'["#ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ","#ظƒظٹظ…طھ","#ط±ط­ظ„ط§طھ"]',
    likes_count:224, comments_count:18, shares_count:9, liked:false,
    created_at:"2025-01-12T20:00:00" },
];

const DEMO_TOURS = [
  { id:'tour_luxor', category_id:'cat_tours', title_ar:'ط±ط­ظ„ط© ط§ظ„ط£ظ‚طµط± ظˆط§ظ„ط£ط³ظˆط§ظ† ط§ظ„ظ…ظ„ظƒظٹط©', title_en:'Royal Luxor & Aswan Tour', price:1200, duration_days:7, image_emoji:'ًںڈ›ï¸ڈ', image_url:'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800', gallery:['https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600','https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600','https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600'], badge_ar:'ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ط§ظ‹', badge_en:'Best Seller', rating:4.9, reviews_count:128, is_featured:1, includes_ar:'["ظپظ†ط¯ظ‚ 5 ظ†ط¬ظˆظ…","ط¬ظˆظ„ط§طھ ظ…ط¹ ظ…ط±ط´ط¯","ظˆط¬ط¨ط§طھ","ظ†ظ‚ظ„"]', includes_en:'["5-Star Hotel","Guided Tours","Meals","Transport"]', description_ar:'ط§ظƒطھط´ظپ ط±ظˆط¹ط© ط§ظ„ظ…ط¹ط§ط¨ط¯ ظˆط§ظ„ظ…ظ‚ط§ط¨ط± ط§ظ„ظ…ظ„ظƒظٹط© ط¹ظ„ظ‰ ط¶ظپط§ظپ ط§ظ„ظ†ظٹظ„ ظپظٹ ط±ط­ظ„ط© ظ„ط§ طھظڈظ†ط³ظ‰ طھط¬ظ…ط¹ ط¨ظٹظ† ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظپط®ط§ظ…ط©', description_en:'Discover the grandeur of temples and royal tombs along the Nile in an unforgettable journey combining history and luxury', itinerary_en:['Day 1: Arrive Luxor, Check-in 5-Star Hotel','Day 2: Karnak & Luxor Temples','Day 3: Valley of the Kings & Queens','Day 4: Edfu & Kom Ombo Temples','Day 5: Aswan High Dam & Philae Temple','Day 6: Abu Simbel Day Trip','Day 7: Departure'], itinerary_ar:['ط§ظ„ظٹظˆظ… 1: ط§ظ„ظˆطµظˆظ„ ظ„ظ„ط£ظ‚طµط± ظˆط§ظ„ط¥ظ‚ط§ظ…ط©','ط§ظ„ظٹظˆظ… 2: ظ…ط¹ط§ط¨ط¯ ط§ظ„ظƒط±ظ†ظƒ ظˆط§ظ„ط£ظ‚طµط±','ط§ظ„ظٹظˆظ… 3: ظˆط§ط¯ظٹ ط§ظ„ظ…ظ„ظˆظƒ ظˆط§ظ„ظ…ظ„ظƒط§طھ','ط§ظ„ظٹظˆظ… 4: ظ…ط¹ط¨ط¯ط§ ط¥ط¯ظپظˆ ظˆظƒظˆظ… ط£ظ…ط¨ظˆ','ط§ظ„ظٹظˆظ… 5: ط§ظ„ط³ط¯ ط§ظ„ط¹ط§ظ„ظٹ ظˆظ…ط¹ط¨ط¯ ظپظٹظ„ط©','ط§ظ„ظٹظˆظ… 6: ط±ط­ظ„ط© ط£ط¨ظˆ ط³ظ…ط¨ظ„','ط§ظ„ظٹظˆظ… 7: ط§ظ„ظ…ط؛ط§ط¯ط±ط©'] },
  { id:"tour_pyramids",category_id:"cat_tours",   title_ar:"ط¨ط§ظ‚ط© ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ ظˆط§ظ„ظ‚ط§ظ‡ط±ط© ط§ظ„ط®ط¯ظٹظˆظٹط©", title_en:"Pyramids & Khedival Cairo Package",    price:850,  duration_days:5,  image_emoji:"ًں”؛", badge_ar:"ط¹ط±ط¶ ظ…ط­ط¯ظˆط¯",    badge_en:"Limited Offer", rating:4.8, reviews_count:95,  is_featured:1, includes_ar:'["ظپظ†ط¯ظ‚ 5 ظ†ط¬ظˆظ…","ط§ظ„ظ…طھط­ظپ ط§ظ„ظ…طµط±ظٹ","ط£ط¨ظˆ ط§ظ„ظ‡ظˆظ„","ط¬ظٹط²ط©"]',        includes_en:'["5-Star Hotel","Egyptian Museum","Sphinx","Giza"]',               description_ar:"ط±ط­ظ„ط© ط´ط§ظ…ظ„ط© ظ„ط£ط¹ط¬ظˆط¨ط© ط§ظ„ط¹ط§ظ„ظ… ط§ظ„ظ‚ط¯ظٹظ…ط© ظˆط¹ط§طµظ…ط© ط§ظ„ط£ظ„ظپ ظ…ط¦ط°ظ†ط©",     description_en:"A comprehensive trip to the wonder of the ancient world" },
  { id:"tour_nile",    category_id:"cat_nile",    title_ar:"ط¬ظˆظ„ط© ط§ظ„ظ†ظٹظ„ ط§ظ„ظپط§ط®ط±ط© ط¹ظ„ظ‰ ظƒط±ظˆط²",       title_en:"Luxury Nile Cruise Tour",             price:1800, duration_days:10, image_emoji:"ًں›³ï¸ڈ", badge_ar:"ظپط§ط®ط±",         badge_en:"Luxury",        rating:5.0, reviews_count:64,  is_featured:1, includes_ar:'["ظƒط±ظˆط² 5 ظ†ط¬ظˆظ…","ط¬ظ…ظٹط¹ ط§ظ„ظˆط¬ط¨ط§طھ","ظ…ط±ط´ط¯ ط®ط§طµ","ظ†ظ‚ظ„ VIP"]',       includes_en:'["5-Star Cruise","All Meals","Private Guide","VIP Transfers"]',    description_ar:"ط±ط­ظ„ط© ط¨ط­ط±ظٹط© ظپط§ط®ط±ط© ط¹ظ„ظ‰ ط§ظ„ظ†ظٹظ„ ظ…ظ† ط§ظ„ط£ظ‚طµط± ط­طھظ‰ ط£ط³ظˆط§ظ†",          description_en:"A luxurious Nile cruise from Luxor to Aswan" },
  { id:"tour_consult", category_id:"cat_consult", title_ar:"ط§ط³طھط´ط§ط±ط© ط³ظٹط§ط­ظٹط© ط´ط®طµظٹط©",             title_en:"Personal Tourism Consultation",        price:150,  duration_days:null,image_emoji:"ًں’¬", badge_ar:"ط®ط¯ظ…ط©",         badge_en:"Service",       rating:4.9, reviews_count:210, is_featured:0, includes_ar:'["ط¬ظ„ط³ط© ط³ط§ط¹طھظٹظ†","ط®ط·ط© ظ…ط®طµطµط©","ط¯ط¹ظ… ظˆط§طھط³ط§ط¨","طھظˆطµظٹط§طھ"]',         includes_en:'["2-Hour Session","Custom Plan","WhatsApp Support","Recommendations"]', description_ar:"ط§ط³طھط´ط§ط±ط© ط³ظٹط§ط­ظٹط© ظ…ط®طµطµط© ظ…ظ† ط®ط¨ط±ط§ط، ظ…طµط±ظٹظٹظ† ظ…ط¹طھظ…ط¯ظٹظ†",           description_en:"Personalized consultation from certified Egyptian experts" },
  { id:"tour_dental",  category_id:"cat_medical", title_ar:"ط¨ط§ظ‚ط© ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط© - ط§ظ„ط£ط³ظ†ط§ظ†",      title_en:"Medical Tourism - Dental Package",     price:600,  duration_days:5,  image_emoji:"ًں¦·", badge_ar:"ط·ط¨ظٹ",          badge_en:"Medical",       rating:4.7, reviews_count:88,  is_featured:0, includes_ar:'["ظپط­طµ ط´ط§ظ…ظ„","ط¹ظ„ط§ط¬ ظ…طھظƒط§ظ…ظ„","ط¥ظ‚ط§ظ…ط©","ظ†ظ‚ظ„ ط·ط¨ظٹ"]',             includes_en:'["Full Checkup","Complete Treatment","Accommodation","Medical Transport"]', description_ar:"ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط© ظ…طھظƒط§ظ…ظ„ط© ط¨ط£ط³ط¹ط§ط± ظ…ظ†ط§ظپط³ط©",                       description_en:"Comprehensive medical tourism at competitive prices" },
  { id:"tour_desert",  category_id:"cat_desert",  title_ar:"طھط¬ط±ط¨ط© ط§ظ„ظˆط§ط­ط§طھ ظˆط§ظ„طµط­ط±ط§ط، ط§ظ„ط؛ط±ط¨ظٹط©",   title_en:"Oasis & Western Desert Experience",   price:950,  duration_days:6,  image_emoji:"ًںŒ…", badge_ar:"ظ…ط؛ط§ظ…ط±ط©",       badge_en:"Adventure",     rating:4.8, reviews_count:52,  is_featured:0, includes_ar:'["ط®ظٹط§ظ… ظپط§ط®ط±ط©","ط¬ظٹط¨ط§طھ طµط­ط±ط§ظˆظٹط©","ط±طµط¯ ط§ظ„ظ†ط¬ظˆظ…","ط·ط¹ط§ظ… ط¨ط¯ظˆظٹ"]', includes_en:'["Luxury Camping","Desert Jeeps","Stargazing","Bedouin Food"]',     description_ar:"ظ…ط؛ط§ظ…ط±ط© ظ„ط§ طھظڈظ†ط³ظ‰ ظپظٹ ط£ط¹ظ…ط§ظ‚ ط§ظ„طµط­ط±ط§ط، ط§ظ„ط؛ط±ط¨ظٹط©",               description_en:"An unforgettable adventure in the Western Desert" },
];

const HASHTAGS_AR = [
  { tag:'#ظ…طµط±_ط§ظ„ظپط±ط§ط¹ظ†ط©', count:'12.4K' }, { tag:'#ط§ظ„ط£ظ‚طµط±_ظˆط§ظ„ط£ط³ظˆط§ظ†', count:'8.1K' },
  { tag:'#ط±ط­ظ„ط§طھ_ظ…طµط±', count:'6.7K' }, { tag:'#ط­ط¶ط§ط±ط©_ظƒظٹظ…طھ', count:'5.2K' },
  { tag:'#ط§ظ„ط£ظ‡ط±ط§ظ…ط§طھ', count:'4.9K' }, { tag:'#ط£ط¨ظˆ_ط³ظ…ط¨ظ„', count:'3.8K' },
  { tag:'#ط§ظ„ظ†ظٹظ„', count:'3.2K' }, { tag:'#ظپط±ط§ط¹ظ†ط©_ظ…طµط±', count:'2.9K' },
];
const HASHTAGS_EN = [
  { tag:'#Egypt_Tourism', count:'12.4K' }, { tag:'#Luxor_Aswan', count:'8.1K' },
  { tag:'#Egypt_Travel', count:'6.7K' }, { tag:'#Kemet_Culture', count:'5.2K' },
  { tag:'#Pyramids', count:'4.9K' }, { tag:'#AbuSimbel', count:'3.8K' },
  { tag:'#NileCruise', count:'3.2K' }, { tag:'#AncientEgypt', count:'2.9K' },
];
const HASHTAGS = HASHTAGS_AR;

// â”€â”€ CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cairo:wght@300;400;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden;width:100%;max-width:100vw}
:root{--g:#C9A84C;--gl:#F0D080;--gd:#8B6914;--gg:rgba(201,168,76,.25);
  --b:#000;--bc:#0A0A0A;--bh:#111;--bb:#1A1A1A;--bi:#0D0D0D;
  --tm:#666;--td:#444;--red:#E74C3C;--grn:#27AE60}
body{background:var(--b);color:var(--g);font-family:'Cairo',sans-serif;direction:rtl;overflow-x:hidden;max-width:100vw}
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

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function t(ar, en, lang) { return lang === 'ar' ? ar : en; }
function ts(arr, lang) {
  try { const p = JSON.parse(arr); return Array.isArray(p) ? p : []; } catch { return []; }
}
function timeAgo(dt, lang) {
  const d = new Date(dt), n = new Date();
  const m = Math.floor((n - d) / 60000);
  if (m < 1) return t('ط§ظ„ط¢ظ†', 'now', lang);
  if (m < 60) return `${t('ظ…ظ†ط°', '', lang)} ${m} ${t('ط¯ظ‚ظٹظ‚ط©', 'min ago', lang)}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${t('ظ…ظ†ط°', '', lang)} ${h} ${t('ط³ط§ط¹ط©', 'h ago', lang)}`;
  return `${t('ظ…ظ†ط°', '', lang)} ${Math.floor(h/24)} ${t('ظٹظˆظ…', 'd ago', lang)}`;
}

// â”€â”€ Small components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Toast({ msg, onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 2600); return () => clearTimeout(id); }, []);
  return <div className="toast">{msg}</div>;
}

function Avatar({ emoji = 'ًں‘‘', size = 44, onClick, url }) {
  return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.45, overflow:'hidden', padding: url ? 0 : undefined }} onClick={onClick}>
      {url ? <img src={url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',borderRadius:'50%'}} /> : emoji}
    </div>
  );
}

function GoldDivider() { return <div className="gdiv" />; }

// â”€â”€ LANDING PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          {lang==='ar'?'ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ظپظٹ ط£ط±ط¶ ط§ظ„ط­ط¶ط§ط±ط©':'Welcome to the Land of Civilization'}<br/>
          <span style={{fontSize:phase===2?16:0,color:'var(--tm)',fontWeight:400,transition:'font-size 1s 0.5s'}}>{lang==='ar'?'ط§ط¯ط®ظ„ ظ„طھظƒطھط´ظپ ط§ظ„طھط§ط±ظٹط® ط¨ظ†ظپط³ظƒ':'Enter to discover history yourself'}</span>
        </div>
      </div>)}
      <div style={{ position:'absolute', fontSize:420, opacity:.015, bottom:-80, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', lineHeight:1 }}>ًں”؛</div>

      {/* Lang toggle */}
      <div style={{ position:'absolute', top:20, right:20, zIndex:20 }}>
        <button className="lang" onClick={()=>setLang(l=>l==='ar'?'en':'ar')}>{lang==='ar'?'EN':'ط¹ط±ط¨ظٹ'}</button>
      </div>

      {/* Main content */}
      <div style={{ textAlign:'center', padding:'40px 24px', maxWidth:540, zIndex:1 }}>
        
        {/* Logo */}
        <div style={{ fontSize:72, lineHeight:1, marginBottom:16, animation:'float 5s ease-in-out infinite', filter:'drop-shadow(0 0 30px rgba(201,168,76,.6))' }}>ًں”؛</div>
        
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:6 }}>
          <span style={{ color:'var(--gd)', fontSize:18 }}>ً“‚€</span>
          <div className="logo" style={{ fontSize:44, letterSpacing:5 }}>KEMET</div>
          <span style={{ color:'var(--gd)', fontSize:18 }}>ً“‚€</span>
        </div>
        
        <div style={{ fontSize:12, color:'var(--gd)', letterSpacing:4, marginBottom:32, textTransform:'uppercase' }}>
          {lang==='ar' ? 'ظƒظٹظ…طھ ظ„ظٹط¬ط§ط³ظٹ' : 'Legacy'}
        </div>

        {/* Tagline */}
        <h1 style={{ fontSize:24, fontWeight:800, color:'var(--gl)', lineHeight:1.5, marginBottom:12 }}>
          {lang==='ar' 
            ? 'ط§ظƒطھط´ظپ ط£ط³ط±ط§ط± ط§ظ„ط­ط¶ط§ط±ط© ط§ظ„ظ…طµط±ظٹط© ظ…ظ† ط®ظ„ط§ظ„ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ ط£ط¨ظ†ط§ط¦ظ‡ط§'
            : 'Discover the Secrets of Egyptian Civilization Through Its People'}
        </h1>
        
        <p style={{ fontSize:14, color:'var(--tm)', lineHeight:1.9, marginBottom:36 }}>
          {lang==='ar'
            ? 'ط§ظ†ط¶ظ… ط¥ظ„ظ‰ ظ…ط¬طھظ…ط¹ ط­ظٹ ظ…ظ† ط¹ط´ط§ظ‚ ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ط«ظ‚ط§ظپط© ط§ظ„ظ…طµط±ظٹط© ط­ظˆظ„ ط§ظ„ط¹ط§ظ„ظ…'
            : 'Join a living community of history lovers and Egyptian culture enthusiasts worldwide'}
        </p>

        {/* CTA Buttons */}
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-g" style={{ minWidth:180, fontSize:16, padding:'14px 32px', borderRadius:12, boxShadow:'0 4px 28px rgba(201,168,76,.4)', letterSpacing:1 }} onClick={onRegister}>
            {lang==='ar' ? 'ط§ط¨ط¯ط£ ط±ط­ظ„طھظƒ' : 'Join Now'}
          </button>
          <button className="btn btn-o" style={{ minWidth:150, fontSize:15, padding:'14px 24px', borderRadius:12 }} onClick={onLogin}>
            {lang==='ar' ? 'طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„' : 'Sign In'}
          </button>
        </div>

        {/* Subtle tagline */}
        <div style={{ marginTop:40, color:'var(--td)', fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>
          {lang==='ar' ? 'ً“‚€ ط­ط¶ط§ط±ط© ظ„ط§ طھظ…ظˆطھ ً“‚€' : 'ً“‚€ A Civilization That Never Dies ً“‚€'}
        </div>

      </div>

      {/* Bottom line */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,var(--g),transparent)' }} />
    </div>
  );
}

// â”€â”€ LOGIN MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    if (!email || !pass) { setError(t('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ','Please fill all fields',lang)); return; }
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
          <div style={{ fontSize:38 }}>ً“‚€</div>
          <div className="logo" style={{ fontSize:22 }}>{t('طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„','Login',lang)}</div>
        </div>
        <GoldDivider />
        {error && <div style={{ color:'var(--red)', fontSize:12, textAlign:'center', padding:'8px 0' }}>{error}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:11, marginTop:14 }}>
          <input className="inp" placeholder={t('ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ','Email',lang)} value={email} onChange={e=>setEmail(e.target.value)} type="email" onKeyDown={e=>e.key==='Enter'&&handle()} />
          <input className="inp" placeholder={t('ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±','Password',lang)} value={pass} onChange={e=>setPass(e.target.value)} type="password" onKeyDown={e=>e.key==='Enter'&&handle()} />
          <div style={{ fontSize:11, color:'var(--tm)', textAlign:'center' }}>
            {t('طھط¬ط±ظٹط¨ظٹ: ramesses@kemet.com / Demo1234!','Demo: ramesses@kemet.com / Demo1234!',lang)}
          </div>
          <button className="btn btn-g" onClick={handle} disabled={loading}>{loading ? 'âڈ³' : t('ط¯ط®ظˆظ„','Login',lang)}</button>
          <div id='g_id_onload' data-client_id='289013959333-tql6lc08dvtn5cc9mvmpb7af3vvp8unl.apps.googleusercontent.com' data-callback='handleGoogleLogin' data-auto_prompt='false'></div>
          <button className='btn' style={{width:'100%',background:'white',color:'#333',border:'1px solid #ddd',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontSize:14,fontWeight:600,borderRadius:8,marginBottom:8}} onClick={()=>window.google?.accounts.id.prompt()}>ًں”´ Sign in with Google</button>
          <div style={{textAlign:'center',fontSize:12,color:'var(--tm)',margin:'4px 0'}}>â”€â”€ {t('ط£ظˆ','or',lang)} â”€â”€</div>
          <button className="btn btn-gh" onClick={onClose} style={{ textAlign:'center' }}>{t('ط¥ظ„ط؛ط§ط،','Cancel',lang)}</button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ REGISTER MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RegisterModal({ onClose, onSuccess, lang }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', country:'', phone:'', selectedPharaoh:null, customNick:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const nickname  = form.selectedPharaoh ? t(form.selectedPharaoh.name_ar,form.selectedPharaoh.name_en,lang) : (form.customNick||form.name);
  const avatarEmoji = form.selectedPharaoh?.emoji || 'ًں‘‘';

  const finish = async () => {
    setLoading(true); setError('');
    const nick = form.selectedPharaoh ? form.selectedPharaoh.name_ar : (form.customNick||form.name);
    const r = await authAPI.register({ name:form.name, email:form.email, password:form.password, nickname:nick, avatar_emoji:avatarEmoji, country:form.country, phone:form.phone });
    setLoading(false);
    if (r.ok) onSuccess(r.data.user);
    else setError(r.error);
  };

  const COUNTRIES = [['EG','ظ…طµط±','Egypt'],['SA','ط§ظ„ط³ط¹ظˆط¯ظٹط©','Saudi Arabia'],['AE','ط§ظ„ط¥ظ…ط§ط±ط§طھ','UAE'],['KW','ط§ظ„ظƒظˆظٹطھ','Kuwait'],['QA','ظ‚ط·ط±','Qatar'],['BH','ط§ظ„ط¨ط­ط±ظٹظ†','Bahrain'],['OM','ط¹ظڈظ…ط§ظ†','Oman'],['JO','ط§ظ„ط£ط±ط¯ظ†','Jordan'],['LB','ظ„ط¨ظ†ط§ظ†','Lebanon'],['SY','ط³ظˆط±ظٹط§','Syria'],['IQ','ط§ظ„ط¹ط±ط§ظ‚','Iraq'],['YE','ط§ظ„ظٹظ…ظ†','Yemen'],['LY','ظ„ظٹط¨ظٹط§','Libya'],['TN','طھظˆظ†ط³','Tunisia'],['DZ','ط§ظ„ط¬ط²ط§ط¦ط±','Algeria'],['MA','ط§ظ„ظ…ط؛ط±ط¨','Morocco'],['SD','ط§ظ„ط³ظˆط¯ط§ظ†','Sudan'],['SO','ط§ظ„طµظˆظ…ط§ظ„','Somalia'],['MR','ظ…ظˆط±ظٹطھط§ظ†ظٹط§','Mauritania'],['US','ط£ظ…ط±ظٹظƒط§','USA'],['GB','ط¨ط±ظٹط·ط§ظ†ظٹط§','UK'],['DE','ط£ظ„ظ…ط§ظ†ظٹط§','Germany'],['FR','ظپط±ظ†ط³ط§','France'],['IT','ط¥ظٹط·ط§ظ„ظٹط§','Italy'],['ES','ط¥ط³ط¨ط§ظ†ظٹط§','Spain'],['NL','ظ‡ظˆظ„ظ†ط¯ط§','Netherlands'],['BE','ط¨ظ„ط¬ظٹظƒط§','Belgium'],['SE','ط§ظ„ط³ظˆظٹط¯','Sweden'],['NO','ط§ظ„ظ†ط±ظˆظٹط¬','Norway'],['DK','ط§ظ„ط¯ظ†ظ…ط§ط±ظƒ','Denmark'],['CH','ط³ظˆظٹط³ط±ط§','Switzerland'],['AT','ط§ظ„ظ†ظ…ط³ط§','Austria'],['PL','ط¨ظˆظ„ظ†ط¯ط§','Poland'],['PT','ط§ظ„ط¨ط±طھط؛ط§ظ„','Portugal'],['GR','ط§ظ„ظٹظˆظ†ط§ظ†','Greece'],['TR','طھط±ظƒظٹط§','Turkey'],['RU','ط±ظˆط³ظٹط§','Russia'],['CA','ظƒظ†ط¯ط§','Canada'],['AU','ط£ط³طھط±ط§ظ„ظٹط§','Australia'],['NZ','ظ†ظٹظˆط²ظٹظ„ظ†ط¯ط§','New Zealand'],['JP','ط§ظ„ظٹط§ط¨ط§ظ†','Japan'],['CN','ط§ظ„طµظٹظ†','China'],['IN','ط§ظ„ظ‡ظ†ط¯','India'],['PK','ط¨ط§ظƒط³طھط§ظ†','Pakistan'],['BD','ط¨ظ†ط؛ظ„ط§ط¯ظٹط´','Bangladesh'],['ID','ط¥ظ†ط¯ظˆظ†ظٹط³ظٹط§','Indonesia'],['MY','ظ…ط§ظ„ظٹط²ظٹط§','Malaysia'],['SG','ط³ظ†ط؛ط§ظپظˆط±ط©','Singapore'],['ZA','ط¬ظ†ظˆط¨ ط£ظپط±ظٹظ‚ظٹط§','South Africa'],['NG','ظ†ظٹط¬ظٹط±ظٹط§','Nigeria'],['KE','ظƒظٹظ†ظٹط§','Kenya'],['OTHER','ط£ط®ط±ظ‰','Other']];
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
              <div style={{ fontSize:32 }}>ًں”؛</div>
              <div className="logo" style={{ fontSize:20 }}>{t('ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨','Create Account',lang)}</div>
            </div>
            <GoldDivider />
            {error && <div style={{ color:'var(--red)', fontSize:12, padding:'6px 0', textAlign:'center' }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:14 }}>
              <input className="inp" placeholder={t('ط§ظ„ط§ط³ظ… ط§ظ„ظƒط§ظ…ظ„ *','Full Name *',lang)} value={form.name} onChange={e=>set('name',e.target.value)} />
              <input className="inp" placeholder={t('ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ *','Email *',lang)} value={form.email} onChange={e=>set('email',e.target.value)} type="email" />
              <input className="inp" placeholder={t('ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± * (6 ط£ط­ط±ظپ+)','Password * (6+ chars)',lang)} value={form.password} onChange={e=>set('password',e.target.value)} type="password" />
              <input className="inp" placeholder={t('ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ','Phone',lang)} value={form.phone} onChange={e=>set('phone',e.target.value)} />
              <select className="inp" value={form.country} onChange={e=>set('country',e.target.value)}>
                <option value="">{t('ط§ظ„ط¯ظˆظ„ط©','Country',lang)}</option>
                {COUNTRIES.map(([k,ar,en])=><option key={k} value={k}>{en}</option>)}
              </select>
              <button className="btn btn-g" onClick={()=>{
                if(!form.name||!form.email||!form.password){setError(t('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط·ظ„ظˆط¨ط©','Please fill required fields',lang));return;}
                if(form.password.length<6){setError(t('ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ‚طµظٹط±ط©','Password too short',lang));return;}
                setError(''); setStep(2);
              }}>{t('ط§ظ„طھط§ظ„ظٹ â†گ','Next â†’',lang)}</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="fi">
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:28 }}>ًں‘‘</div>
              <div style={{ color:'var(--g)', fontWeight:700, fontSize:15 }}>{t('ط§ط®طھط± ط§ط³ظ…ظƒ ط§ظ„ظپط±ط¹ظˆظ†ظٹ','Choose Your Pharaonic Name',lang)}</div>
              <div style={{ color:'var(--tm)', fontSize:12, marginTop:3 }}>{t('ط§ط®طھط± ظ…ظ† ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظ„ظˆظƒ ظˆط§ظ„ظ…ظ„ظƒط§طھ','Choose from Kings & Queens of Egypt',lang)}</div>
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
            <div style={{ marginTop:10, color:'var(--tm)', fontSize:12, textAlign:'center' }}>{t('ط£ظˆ ط§ظƒطھط¨ ظ†ظٹظƒظ†ظٹظ… ظ…ط®طµطµ','Or type your own nickname',lang)}</div>
            <input className="inp" style={{ marginTop:8 }} placeholder={t('ظ†ظٹظƒظ†ظٹظ… ظ…ط®طµطµ (ط§ط®طھظٹط§ط±ظٹ)','Custom nickname (optional)',lang)}
              value={form.customNick} onChange={e=>{set('customNick',e.target.value);set('selectedPharaoh',null)}} />
            <div style={{ display:'flex', gap:10, marginTop:13 }}>
              <button className="btn btn-o" onClick={()=>setStep(1)} style={{ flex:1 }}>{t('â†گ ط±ط¬ظˆط¹','â†گ Back',lang)}</button>
              <button className="btn btn-g" onClick={()=>setStep(3)} style={{ flex:1 }}>{t('ط§ظ„طھط§ظ„ظٹ â†گ','Next â†’',lang)}</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div className="fi" style={{ textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:8, animation:'float 3s ease-in-out infinite' }}>{avatarEmoji}</div>
            <div style={{ color:'var(--g)', fontWeight:700, fontSize:18 }}>{nickname}</div>
            <div style={{ color:'var(--tm)', fontSize:13, marginTop:3 }}>{form.name} آ· {form.email}</div>
            {error && <div style={{ color:'var(--red)', fontSize:12, marginTop:8 }}>{error}</div>}
            <GoldDivider />
            <div style={{ color:'var(--tm)', fontSize:13, lineHeight:2, padding:'8px 0' }}>
              âœ¦ {t('ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ظپظٹ ظ…ظ…ظ„ظƒط© ظƒظٹظ…طھ','Welcome to the Kingdom of Kemet',lang)}<br/>
              âœ¦ {t('ط­ط³ط§ط¨ظƒ ط¹ظ„ظ‰ ظˆط´ظƒ ط§ظ„ط¥ظ†ط´ط§ط،','Your account is ready to be created',lang)}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button className="btn btn-o" onClick={()=>setStep(2)} style={{ flex:1 }}>{t('â†گ ط±ط¬ظˆط¹','â†گ Back',lang)}</button>
              <button className="btn btn-g" onClick={finish} disabled={loading} style={{ flex:1 }}>
                {loading?'âڈ³':t('ط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨ ًں”؛','Create Account ًں”؛',lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ POST CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    if (r.ok) { setComments(c=>[...c, {id:r.data.comment_id,content:replyText,image_url:imgUrl,nickname:user?.nickname||t('ط£ظ†طھ','You',lang),avatar_emoji:user?.avatar_emoji||'ًں‘‘',avatar_url:user?.avatar_url,created_at:new Date().toISOString(),parent_id:replyTo?.id}]); setReplyText(''); setReplyImage(''); setReplyTo(null); }
  };
  const uploadReplyImg = async (e) => { const file=e.target.files[0]; if(!file) return; setReplyUploading(true); const url=await uploadToCloudinary(file); setReplyImage(url); setReplyUploading(false); };
  const [likeAnim, setLikeAnim] = useState(false);
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
      setComments(c=>[...c, { id:r.data.comment_id, content:newComment, image_url:imgUrl, nickname:user?.nickname||t('ط£ظ†طھ','You',lang), avatar_emoji:user?.avatar_emoji||'ًں‘‘', avatar_url:user?.avatar_url, created_at:new Date().toISOString() }]);
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
            {post.is_verified===1 && <span style={{ fontSize:13 }}>âœ“</span>}
            {post.membership==='gold' && <span className="badge" style={{ fontSize:10 }}>Gold</span>}
            {post.membership==='platinum' && <span className="badge" style={{ fontSize:10, background:'linear-gradient(135deg,#6B5B95,#9B8EC4)' }}>Platinum</span>}
          </div>
          <div style={{ fontSize:11, color:'var(--tm)', marginTop:1 }}>{timeAgo(post.created_at, lang)}</div>
               {post.user_id !== currentUserId && (
  <button className="btn btn-gh" style={{fontSize:11,padding:'2px 8px',color:'var(--gd)',border:'1px solid var(--gd)',borderRadius:20,marginTop:2}}
    onClick={async(e)=>{
      e.stopPropagation();
      const r = await usersAPI.follow(post.user_id);
      onToast && onToast(t('طھظ…طھ ط§ظ„ظ…طھط§ط¨ط¹ط©','Followed',lang));
    }}>
    + {t('ظ…طھط§ط¨ط¹ط©','Follow',lang)}
  </button>
)}
        </div>
      </div>

      <div style={{ fontSize:14, lineHeight:1.85, color:'#D4B660', marginBottom:10 }}>
        {lang==='ar' ? post.content : (post.content_en||post.content)}
      </div>

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
          {liked ? '❤' : '♡'} {t('Like','Like',lang)} {likesCount>0&&<span style={{fontSize:11,opacity:.7}}>({likesCount})</span>}
        </button>
        <button className='btn btn-gh' onClick={loadComments} style={{ flex:1, fontSize:13 }}>
               {"✦ "} {t('Comment','Comment',lang)} {post.comments_count>0&&<span style={{fontSize:11,opacity:.7}}>({post.comments_count})</span>}
        </button>
      <button className="btn btn-gh" style={{ flex:1, fontSize:13 }} onClick={async()=>{
        const r = await postsAPI.createPost({
         content: `ًں”پ ${post.nickname}: ${post.content}`,
          language: post.language || 'ar'
       });
        if (r.ok) onToast && onToast(t('طھظ…طھ ط§ظ„ظ…ط´ط§ط±ظƒط©','Shared',lang));
      }}>
             {"↗ "} {t('Share','Share',lang)}
    </button>

      </div>
      {showComments && (
        <div className='fi' style={{marginTop:11,borderTop:'1px solid var(--bb)',paddingTop:11}}>
          {replyTo && (<div style={{background:"var(--bi)",border:"1px solid var(--gd)",borderRadius:12,padding:12,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--gd)"}}>â†© Reply to <b>{replyTo.nickname}</b></span><button onClick={()=>{setReplyTo(null);setReplyText("");}} style={{background:"none",border:"none",color:"var(--tm)",cursor:"pointer",fontSize:14}}>âœ•</button></div><div style={{fontSize:12,color:"var(--tm)",padding:"4px 8px",background:"var(--bb)",borderRadius:6,marginBottom:8}}>{replyTo.content}</div>{showReplyEmoji&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{["ًںکٹ","â‌¤ï¸ڈ","ًںک‚","ًں‘چ","ًں”¥","ًںکچ","ًں™ڈ","ًں’ژ","ًں‘‘","ًںڈ›ï¸ڈ"].map(e=>(<button key={e} onClick={()=>{setReplyText(t=>t+e);setShowReplyEmoji(false);}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer"}}>{e}</button>))}</div>}{replyImage&&<img src={replyImage} style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:8,marginBottom:8}} />}<textarea className="inp" placeholder="Write reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} rows={2} style={{marginBottom:8}} /><div style={{display:"flex",gap:8,alignItems:"center"}}><button className="btn btn-gh" onClick={()=>setShowReplyEmoji(v=>!v)} style={{fontSize:18,padding:"4px 8px"}}>ًںکٹ</button><label className="btn btn-gh" style={{cursor:"pointer",fontSize:13,padding:"4px 8px"}}>{replyUploading?"...":"ًں–¼ï¸ڈ"}<input type="file" accept="image/*,video/*" onChange={uploadReplyImg} style={{display:"none"}} /></label><button className="btn btn-g" onClick={submitReply} style={{marginRight:"auto",padding:"8px 16px"}}>ط¥ط±ط³ط§ظ„</button></div></div>)}
          {comments.filter(c=>!c.parent_id).map(c=>(<div key={c.id} style={{marginBottom:8,padding:'6px 0',borderBottom:'1px solid var(--bb)'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:6}}>
              <Avatar emoji={c.avatar_emoji||'ًں‘‘'} size={26} url={c.avatar_url} />
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
            {showCommentEmoji && <div style={{display:'flex',flexWrap:'wrap',gap:4,background:'var(--bi)',borderRadius:8,padding:6}}>{['ًںکٹ','â‌¤ï¸ڈ','ًںک‚','ًں‘چ','ًں”¥','ًںکچ','ًں™ڈ','ًں’ژ','ًں‘‘'].map(e=>(<button key={e} onClick={()=>{setNewComment(c=>c+e);setShowCommentEmoji(false);}} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>{e}</button>))}</div>}
            {commentImage && <img src={commentImage} style={{width:'100%',maxHeight:200,objectFit:'cover',borderRadius:8}} />}
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className='btn btn-gh' onClick={()=>setShowCommentEmoji(v=>!v)} style={{padding:'6px 10px',fontSize:16}}>ًںکٹ</button>
              <label className='btn btn-gh' style={{cursor:'pointer',fontSize:13,padding:'6px 8px'}}>{commentUploading?'...':'ًں–¼ï¸ڈ'}<input type='file' accept='image/*,video/*' onChange={uploadCommentImg} style={{display:'none'}} /></label>
              <input className='inp' placeholder='ط§ظƒطھط¨ طھط¹ظ„ظٹظ‚ط§ظ‹...' value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitComment()} style={{flex:1,padding:'8px 12px',fontSize:13}} />
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
  const emojis = ['ًںکٹ','â‌¤ï¸ڈ','ًں”؛','ًںڈ›ï¸ڈ','âœˆï¸ڈ','ًںŒچ','ًں‘‘','â­گ','ًںژ‰','ًںŒ…','ًںڈ–ï¸ڈ','ًںگھ','ًں¦…','ًںŒ؛','ًں’ژ','âڑ”ï¸ڈ','ًںŒ™','âک€ï¸ڈ','ًںژ­','ًںڈ†'];
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
    const content = text.trim() || (isVideo ? 'ًںژ¥' : 'ًں“·');
    const hashtags = JSON.stringify((content.match(/#[\w\u0600-\u06FF]+/g)||[]));
    const r = await postsAPI.createPost({ content, language:'ar', image_url: isVideo?'':imageUrl, video_url: isVideo?imageUrl:'', hashtags });
  };

  return (
    <div className="card" style={{ padding:14, marginBottom:14 }}>
      <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
        <Avatar emoji={user?.avatar_emoji||'ًں‘‘'} size={42} url={user?.avatar_url} />
        <div style={{ flex:1 }}>
          <textarea className="inp" placeholder={t('ظ…ط§ ط§ظ„ط°ظٹ طھظپظƒط± ظپظٹظ‡ طں ًں”؛','What are you thinking? ًں”؛',lang)}
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
              <label style={{cursor:'pointer',padding:'3px 8px',fontSize:16,color:'var(--tm)',title:'طµظˆط±ط©'}}>
                {uploading ? 'âڈ³' : 'ًں–¼ï¸ڈ'}
                <input type='file' accept='image/*' onChange={uploadImage} style={{display:'none'}} />
              </label>
              <label style={{cursor:'pointer',padding:'3px 8px',fontSize:16,color:'var(--tm)'}}>
                ًںژ¥
                <input type='file' accept='video/*' onChange={uploadImage} style={{display:'none'}} />
              </label>
            </div>
            <button className='btn btn-g' onClick={submit} disabled={posting||(!text.trim()&&!imageUrl)} style={{ padding:'8px 20px' }}>
              {posting?'âڈ³':t('ظ†ط´ط±','Post',lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// â”€â”€ TOUR CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TourCard({ tour, lang, onBuy }) {
  const incl = ts(lang==='ar'?tour.includes_ar:tour.includes_en);
  return (
    <div className='tour-card' onClick={()=>onBuy(tour)} style={{cursor:'pointer'}}>
      <div style={{ background:'linear-gradient(135deg,#0D0A02,#1A1200)', padding:'22px 16px', textAlign:'center', position:'relative', minHeight:160, overflow:'hidden' }}>
        {tour.image_url && <img src={tour.image_url} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.4}} />}
        {(tour.badge_ar||tour.badge_en) && <span className='badge' style={{position:'absolute',top:10,right:10,fontSize:10,zIndex:2}}>{t(tour.badge_ar,tour.badge_en,lang)}</span>}
        <div style={{fontSize:58,marginBottom:6,position:'relative',zIndex:1}}>{tour.image_emoji||'ًںڈ›ï¸ڈ'}</div>
        <div style={{color:'var(--g)',fontSize:12,position:'relative',zIndex:1}}>{'â­گ'.repeat(Math.floor(tour.rating||0))} {tour.rating||0} ({tour.reviews_count||0})</div>
      </div>
      <div style={{ padding:14 }}>
        <h3 style={{ color:'var(--g)', fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:4 }}>{t(tour.title_ar,tour.title_en,lang)}</h3>
        {tour.duration_days && <div style={{ fontSize:12, color:'var(--tm)', marginBottom:8 }}>ًں“… {tour.duration_days} {t('ط£ظٹط§ظ…','days',lang)}</div>}
        <GoldDivider />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <span style={{ fontSize:20, fontWeight:800, color:'var(--g)' }}>{tour.price||0}</span>
            <span style={{ fontSize:11, color:'var(--tm)' }}> $ / person</span>
          </div>
          <button className='btn btn-g' style={{ padding:'8px 14px', fontSize:13 }} onClick={e=>{e.stopPropagation();onBuy(tour);}}>
            {t('ط§ط­ط¬ط² ط§ظ„ط¢ظ†','Book Now',lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
// â”€â”€ PAYMENT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PaymentModal({ tour, lang, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('');
  const [card, setCard] = useState({ num:'', exp:'', cvv:'', name:'' });
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = [
    { id:'card',     label:t('ط¨ط·ط§ظ‚ط© ط§ط¦طھظ…ط§ظ† / ط®طµظ…','Credit / Debit Card',lang), icon:'ًں’³' },
    { id:'paypal',   label:'PayPal',                                             icon:'ًں…؟ï¸ڈ' },
    { id:'vodafone', label:t('ظپظˆط¯ط§ظپظˆظ† ظƒط§ط´','Vodafone Cash',lang),               icon:'ًں“±' },
    { id:'instapay', label:'InstaPay',                                           icon:'âڑ،' },
    { id:'whatsapp', label:t('ط¯ظپط¹ ط¹ط¨ط± ظˆط§طھط³ط§ط¨','Pay via WhatsApp',lang),         icon:'ًں’¬' },
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
    else setError(pRes.error||t('ط®ط·ط£ ظپظٹ ط§ظ„ط¯ظپط¹','Payment error',lang));
  };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontWeight:700, color:'var(--g)', fontSize:15 }}>ًں”؛ {t('ط¥طھظ…ط§ظ… ط§ظ„ط­ط¬ط²','Complete Booking',lang)}</div>
          <button className="btn btn-gh" onClick={onClose} style={{ fontSize:18, padding:'2px 8px' }}>أ—</button>
        </div>

        <div style={{ background:'rgba(201,168,76,.04)', border:'1px solid var(--bb)', borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:36, textAlign:'center', marginBottom:6 }}>{tour.image_emoji}</div>
          <div style={{ fontWeight:700, color:'var(--g)', fontSize:14, textAlign:'center' }}>{t(tour.title_ar,tour.title_en,lang)}</div>
          <GoldDivider />
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'var(--tm)' }}>{t('ط¹ط¯ط¯ ط§ظ„ط£ط´ط®ط§طµ','Guests',lang)}</label>
              <select className="inp" style={{ marginTop:4, padding:'7px 10px' }} value={guests} onChange={e=>setGuests(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'var(--tm)' }}>{t('طھط§ط±ظٹط® ط§ظ„ط³ظپط±','Travel Date',lang)}</label>
              <input className="inp" type="date" style={{ marginTop:4, padding:'7px 10px' }} value={date} onChange={e=>setDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontSize:13 }}>
            <span style={{ color:'var(--tm)' }}>{t('ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ','Total',lang)}</span>
            <span style={{ color:'var(--g)', fontWeight:800, fontFamily:'Cinzel,serif' }}>${total}</span>
          </div>
        </div>

        {error && <div style={{ color:'var(--red)', fontSize:12, textAlign:'center', marginBottom:8 }}>{error}</div>}

        {step===1 && (
          <div className="fi">
            <div style={{ fontSize:13, color:'var(--gl)', marginBottom:10, fontWeight:600 }}>{t('ط§ط®طھط± ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹:','Choose payment method:',lang)}</div>
            {methods.map(m=>(
              <div key={m.id} className={`pay-opt ${method===m.id?'sel':''}`} onClick={()=>setMethod(m.id)}>
                <span style={{ fontSize:20 }}>{m.icon}</span>
                <span style={{ fontSize:13, color:'var(--gl)' }}>{m.label}</span>
                {method===m.id && <span style={{ marginRight:'auto', color:'var(--g)' }}>âœ“</span>}
              </div>
            ))}
            <button className="btn btn-g" style={{ width:'100%', marginTop:6 }} onClick={()=>method&&setStep(2)}>
              {t('ط§ظ„طھط§ظ„ظٹ â†گ','Next â†’',lang)}
            </button>
          </div>
        )}

        {step===2 && (
          <div className="fi">
            {method==='card' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input className="inp" placeholder={t('ط§ط³ظ… ط­ط§ظ…ظ„ ط§ظ„ط¨ط·ط§ظ‚ط©','Cardholder Name',lang)} value={card.name} onChange={e=>setCard(c=>({...c,name:e.target.value}))} />
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
                    ? t('ط³ظٹطھظ… طھط­ظˆظٹظ„ظƒ ط¥ظ„ظ‰ ظˆط§طھط³ط§ط¨ ظ„ط¥طھظ…ط§ظ… ط§ظ„ط­ط¬ط² ظ…ط¹ ظپط±ظٹظ‚ ظƒظٹظ…طھ ظƒظˆظ†ط³ظٹط±ط¬','You will be redirected to WhatsApp to complete booking with Kemet Concierge',lang)
                    : t('ط³طھطھظ„ظ‚ظ‰ طھط¹ظ„ظٹظ…ط§طھ ط§ظ„ط¯ظپط¹ ط¹ط¨ط± ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ','You will receive payment instructions via email',lang)}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button className="btn btn-o" onClick={()=>setStep(1)} style={{ flex:1 }}>{t('ط±ط¬ظˆط¹','Back',lang)}</button>
              <button className="btn btn-g" onClick={handlePay} disabled={loading} style={{ flex:1 }}>
                {loading?'âڈ³':t('طھط£ظƒظٹط¯ ط§ظ„ط­ط¬ط² ًں”؛','Confirm ًں”؛',lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ LEFT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LeftSidebar({ user, page, setPage, lang, onLogout }) {
  const navItems = [
    { icon:'ًںڈ ', ar:'ط§ظ„ط±ط¦ظٹط³ظٹط©',   en:'Home',          key:'feed' },
    { icon:'ًں‘¤', ar:'ط§ظ„ط¨ط±ظˆظپط§ظٹظ„',  en:'Profile',       key:'profile' },
    { icon:'ًںڈ›ï¸ڈ', ar:'ط§ظ„ط§ط³طھظˆط±',   en:'Store',         key:'store' },
    { icon:'ًں””', ar:'ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ', en:'Notifications', key:'notifications', dot:true },
    { icon:'ًں’¬', ar:'ط§ظ„ط±ط³ط§ط¦ظ„',   en:'Messages',      key:'messages' },
    { icon:'ًں”چ', ar:'ط§ظ„ط¨ط­ط«',      en:'Search',        key:'search' },
    { icon:'âڑ™ï¸ڈ', ar:'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ', en:'Settings', key:'settings' },
    { icon:'ًںŒ‘', ar:'ظƒط³ظˆظپ 2027', en:'Eclipse 2027', key:'eclipse' },
  ];
  const isAdmin = user?.email === 'mido704@gmail.com';
  const isStoreManager = user?.role === 'store_manager' || isAdmin;
       
  return (
    <div style={{ borderLeft:'1px solid var(--bb)', padding:'18px 10px', position:'sticky', top:52, height:'calc(100vh - 52px)', overflowY:'auto', background:'var(--b)', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 8px', marginBottom:22 }}>
        <div className="logo" style={{ fontSize:18 }}>KEMET</div>
        <button className="btn btn-gh" style={{fontSize:12,padding:"5px 12px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:20,color:"var(--g)",display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,0.06)",fontWeight:700,letterSpacing:1}} onClick={()=>setPage("eclipse")}>ًںŒ‘ Eclipse 2027</button>
        <div style={{ fontSize:10, color:'var(--tm)', marginTop:1 }}>ط³ظˆط´ظٹط§ظ„</div>
      </div>
      {isAdmin && (
        <div className={`si ${page==='admin'?'on':''}`} onClick={()=>setPage('admin')}>
          <span style={{ fontSize:17, width:22, textAlign:'center' }}>ًں›،ï¸ڈ</span>
          <span>{t('ط§ظ„ط¥ط¯ط§ط±ط©','Admin',lang)}</span>
        </div>
      )}
      {isStoreManager && (
        <div className={`si ${page===('store_manager')?'on':''}`} onClick={()=>setPage('store_manager')}>
          <span style={{ fontSize:17, width:22, textAlign:'center' }}>ًںڈ›ï¸ڈ</span>
          <span>{t('ط¥ط¯ط§ط±ط© ط§ظ„ظ…طھط¬ط±','Store Mgr',lang)}</span>
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
            <Avatar emoji={user.avatar_emoji||'ًں‘‘'} url={user?.avatar_url} size={34} />
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:12, color:'var(--g)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.nickname}</div>
              <div style={{ fontSize:10, color:'var(--tm)' }}>{user.email}</div>
            </div>
          </div>
        )}
        <button className="btn btn-gh" onClick={onLogout} style={{ width:'100%', marginTop:6, fontSize:12, color:'#E74C3C' }}>
          {t('طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬','Logout',lang)}
        </button>
      </div>
    </div>
  );
}

// â”€â”€ RIGHT SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RightSidebar({ lang }) {
  return (
    <div className="rs" style={{ borderRight:'1px solid var(--bb)', padding:'18px 12px', position:'sticky', top:52, height:'calc(100vh - 52px)', overflowY:'auto', background:'var(--b)' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:13, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
        ًں”¥ {t('ط§ظ„ط£ظƒط«ط± طھط¯ط§ظˆظ„ط§ظ‹','Trending',lang)}
      </div>
      {(lang==='ar'?HASHTAGS_AR:HASHTAGS_EN).map(h=>(
        <div key={h.tag} style={{ padding:'7px 0', borderBottom:'1px solid var(--bb)', cursor:'pointer' }} onClick={()=>{ if(window.setHashtagFilter) window.setHashtagFilter(h.tag); }}>
          <div style={{ color:'var(--g)', fontWeight:600, fontSize:13 }}>{h.tag}</div>
          <div style={{ color:'var(--tm)', fontSize:11 }}>{h.count} {t('ظ…ظ†ط´ظˆط±','posts',lang)}</div>
        </div>
      ))}
      <div className="card" style={{ padding:13, textAlign:'center', marginTop:16 }}>
        <div style={{ fontSize:28, marginBottom:5 }}>ًںڈ›ï¸ڈ</div>
        <div style={{ color:'var(--g)', fontWeight:700, fontSize:12 }}>{t('ظƒظٹظ…طھ ظƒظˆظ†ط³ظٹط±ط¬','Kemet Concierge',lang)}</div>
        <div style={{ fontSize:11, color:'var(--tm)', marginTop:4, lineHeight:1.6 }}>{t('طھط±ط®ظٹطµ ط³ظٹط§ط­ظٹ ط·ط¨ظٹ ط±ط³ظ…ظٹ','Official Medical Tourism License',lang)}</div>
        <div style={{ marginTop:8 }}><span className="badge" style={{ fontSize:10 }}>âœ“ {t('ظ…ط¹طھظ…ط¯','Certified',lang)}</span></div>
      </div>
    </div>
  );
}

// â”€â”€ PAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    onToast(t('طھظ… ظ†ط´ط± ط§ظ„ظ…ظ†ط´ظˆط±! ًں”؛','Post published! ًں”؛',lang));
  };

  const handleLike = async (postId) => {
    await postsAPI.likePost(postId);
  };

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:14 }}>
        <button className="tab on">{t('ظ„ظƒ','For You',lang)}</button>
        <button className="tab">{t('ط§ظ„ط£طµط¯ظ‚ط§ط،','Following',lang)}</button>
        <button className="tab">{t('ظ…طµط±','Egypt',lang)}</button>
      </div>
      {hashFilter && <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,padding:'6px 12px',background:'rgba(201,168,76,.1)',borderRadius:20}}><span style={{color:'var(--gd)',fontSize:13}}>{hashFilter}</span><button onClick={()=>setHashFilter('')} style={{background:'none',border:'none',color:'var(--tm)',cursor:'pointer',fontSize:14}}>âœ•</button></div>}
      <CreatePost user={user} lang={lang} onPosted={handlePosted} />
      {(hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).slice(0,visibleCount).map(p=><PostCard key={p.id} post={p} lang={lang} onLike={handleLike} currentUserId={user?.id} user={user} onToast={onToast} onViewProfile={onViewProfile} />)}
      {loadingMore && <div style={{textAlign:'center',padding:'20px 0',color:'var(--gd)',fontSize:22}}>âڈ³</div>}
      {!loadingMore && visibleCount < (hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).length && (
        <div onClick={()=>{setLoadingMore(true);setTimeout(()=>{setVisibleCount(c=>c+10);setLoadingMore(false);},600);}} style={{textAlign:'center',padding:'16px 0',color:'var(--gd)',fontSize:14,cursor:'pointer',border:'1px solid var(--gd)',borderRadius:20,margin:'10px 0',fontWeight:700}}>
          â†“ {lang==='ar'?'طھط­ظ…ظٹظ„ ط§ظ„ظ…ط²ظٹط¯':'Load More'}
        </div>
      )}
      {!loadingMore && visibleCount < (hashFilter ? posts.filter(p=>p.hashtags&&p.hashtags.includes(hashFilter)) : posts).length && <div style={{textAlign:'center',padding:'16px 0',color:'var(--tm)',fontSize:13}}>â†“ {lang==='ar'?'ط§ط³ط­ط¨ ظ„ظ„ظ…ط²ظٹط¯':'Scroll for more'}</div>}
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
      <button className="btn btn-gh" onClick={onBack} style={{ marginBottom:14 }}>â†گ {t('ط±ط¬ظˆط¹','Back',lang)}</button>
      <div style={{ background:'linear-gradient(135deg,#0D0A02,#1A1200)', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
        {tour.image_url ? (
          <img src={tour.image_url} style={{ width:'100%', maxHeight:280, objectFit:'cover' }} />
        ) : (
          <div style={{ textAlign:'center', padding:'40px 0', fontSize:80 }}>{tour.image_emoji||'ًںڈ›ï¸ڈ'}</div>
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
            <div style={{ color:'var(--g)', fontSize:13 }}>{'â­گ'.repeat(Math.floor(tour.rating))} {tour.rating} ({tour.reviews_count} {t('طھظ‚ظٹظٹظ…','reviews',lang)})</div>
          </div>
          <span className="badge" style={{ fontSize:11 }}>{t(tour.badge_ar,tour.badge_en,lang)}</span>
        </div>
        <GoldDivider />
        {tour.duration_days && <div style={{ fontSize:13, color:'var(--tm)', marginBottom:10 }}>ًں“… {tour.duration_days} {t('ط£ظٹط§ظ…','days',lang)}</div>}
        <p style={{ fontSize:14, color:'#aaa', lineHeight:1.8, marginBottom:14 }}>{t(tour.description_ar,tour.description_en,lang)}</p>
        {incl.length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--gd)', fontWeight:700, marginBottom:8 }}>âœ¦ {t('ظٹط´ظ…ظ„ ط§ظ„ط¨ط±ظ†ط§ظ…ط¬:','Program Includes:',lang)}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {incl.map(i=><span key={i} style={{ fontSize:12, background:'rgba(201,168,76,.08)', border:'1px solid var(--bb)', padding:'4px 12px', borderRadius:20, color:'var(--gl)' }}>âœ“ {i}</span>)}
            </div>
          </div>
        )}
      </div>
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderRadius:14, padding:20 }}>
        <div style={{ fontWeight:700, color:'var(--g)', fontSize:16, marginBottom:14 }}>ًںژ« {t('طھظپط§طµظٹظ„ ط§ظ„ط­ط¬ط²','Booking Details',lang)}</div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ color:'var(--tm)', fontSize:13 }}>{t('ط¹ط¯ط¯ ط§ظ„ط£ظپط±ط§ط¯:','Number of guests:',lang)}</div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className='btn btn-gh' style={{ width:34, height:34, fontSize:18, padding:0 }} onClick={()=>setGuests(g=>Math.max(1,g-1))}>âˆ’</button>
            <span style={{ fontWeight:800, fontSize:20, color:'var(--g)', minWidth:30, textAlign:'center' }}>{guests}</span>
            <button className='btn btn-gh' style={{ width:34, height:34, fontSize:18, padding:0 }} onClick={()=>setGuests(g=>Math.min(9,g+1))}>+</button>
          </div>
          <div style={{ fontSize:12, color:'var(--tm)' }}>{t('(ط­ط¯ ط£ظ‚طµظ‰ 9)','(max 9)',lang)}</div>
        </div>
        {(lang==='ar'?tour.itinerary_ar:tour.itinerary_en) && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--gd)', fontWeight:700, marginBottom:10 }}>ًں—“ï¸ڈ {t('ط§ظ„ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظٹظˆظ…ظٹ:','Daily Itinerary:',lang)}</div>
            {(lang==='ar'?tour.itinerary_ar:tour.itinerary_en).map((day,i)=>(<div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}><span style={{ background:'var(--gd)', color:'#000', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span><span style={{ fontSize:13, color:'var(--gl)', lineHeight:1.6 }}>{day}</span></div>))}
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
          <div>
            <div style={{ fontSize:13, color:'var(--tm)' }}>{guests} أ— ${tour.price}</div>
            <div style={{ fontSize:26, fontWeight:800, color:'var(--g)', fontFamily:'Cinzel,serif' }}>${total}</div>
          </div>
          <button className="btn btn-g" style={{ padding:'12px 28px', fontSize:15 }} onClick={()=>setBuyTour({...tour, guests_count:guests, total_price:total})}>
            ًں”؛ {t('ط§ط­ط¬ط² ط§ظ„ط¢ظ†','Book Now',lang)}
          </button>
        </div>
      </div>
      {buyTour && <PaymentModal tour={buyTour} lang={lang} user={user} onClose={()=>setBuyTour(null)} onSuccess={()=>{ setBuyTour(null); onToast(t('طھظ… طھط£ظƒظٹط¯ ط­ط¬ط²ظƒ! ًں”؛','Booking confirmed! ًں”؛',lang)); onBack(); }} />}
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
      <div style={{fontSize:48,marginBottom:10}}>âœˆï¸ڈ</div>
      <div style={{fontWeight:800,fontSize:20,color:'var(--g)',marginBottom:6}}>{lang==='ar'?'ط§ط¨ط­ط« ط¹ظ† ط±ط­ظ„ط§طھ ط§ظ„ط·ظٹط±ط§ظ†':'Search Flights'}</div>
      <div style={{fontSize:12,color:'var(--tm)',marginBottom:20}}>{lang==='ar'?'ط¨ط§ظ„طھط¹ط§ظˆظ† ظ…ط¹ Skyscanner':'Powered by Skyscanner'}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        <input className='inp' placeholder={lang==='ar'?'ظ…ظ† (ظ…ط«ط§ظ„: CAI)':'From (e.g. CAI)'} value={from} onChange={e=>setFrom(e.target.value)} />
        <input className='inp' placeholder={lang==='ar'?'ط¥ظ„ظ‰ (ظ…ط«ط§ظ„: DXB)':'To (e.g. DXB)'} value={to} onChange={e=>setTo(e.target.value)} />
        <input className='inp' type='date' value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <button className='btn btn-g' style={{width:'100%',padding:'12px 0',fontSize:15}} onClick={search}>ًں”چ {lang==='ar'?'ط§ط¨ط­ط« ط§ظ„ط¢ظ†':'Search Now'}</button>
      <div style={{marginTop:12,fontSize:11,color:'var(--tm)'}}>{lang==='ar'?'ط³طھظ†طھظ‚ظ„ ظ„ظ…ظˆظ‚ط¹ Skyscanner ظ„ظ„ط­ط¬ط²':'You will be redirected to Skyscanner to book'}</div>
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
      <div style={{fontSize:48,marginBottom:10}}>ًںڈ¨</div>
      <div style={{fontWeight:800,fontSize:20,color:'var(--g)',marginBottom:6}}>{lang==='ar'?'ط§ط¨ط­ط« ط¹ظ† ظپظ†ط§ط¯ظ‚':'Search Hotels'}</div>
      <div style={{fontSize:12,color:'var(--tm)',marginBottom:20}}>{lang==='ar'?'ط¨ط§ظ„طھط¹ط§ظˆظ† ظ…ط¹ Booking.com':'Powered by Booking.com'}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        <input className='inp' placeholder={lang==='ar'?'ط§ظ„ظ…ط¯ظٹظ†ط© (ظ…ط«ط§ظ„: ط§ظ„ظ‚ط§ظ‡ط±ط©)':'City (e.g. Cairo)'} value={city} onChange={e=>setCity(e.target.value)} />
        <input className='inp' type='date' placeholder={lang==='ar'?'طھط§ط±ظٹط® ط§ظ„ظˆطµظˆظ„':'Check-in'} value={checkin} onChange={e=>setCheckin(e.target.value)} />
        <input className='inp' type='date' placeholder={lang==='ar'?'طھط§ط±ظٹط® ط§ظ„ظ…ط؛ط§ط¯ط±ط©':'Check-out'} value={checkout} onChange={e=>setCheckout(e.target.value)} />
      </div>
      <button className='btn btn-g' style={{width:'100%',padding:'12px 0',fontSize:15}} onClick={search}>ًں”چ {lang==='ar'?'ط§ط¨ط­ط« ط§ظ„ط¢ظ†':'Search Now'}</button>
      <div style={{marginTop:12,fontSize:11,color:'var(--tm)'}}>{lang==='ar'?'ط³طھظ†طھظ‚ظ„ ظ„ظ…ظˆظ‚ط¹ Booking.com ظ„ظ„ط­ط¬ط²':'You will be redirected to Booking.com to book'}</div>
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
        <div style={{ fontSize:48, marginBottom:7 }}>ًںڈ›ï¸ڈ</div>
        <div className="logo" style={{ fontSize:24, display:'block', marginBottom:5 }}>{t('ظ…طھط¬ط± ظƒظٹظ…طھ ط§ظ„ط³ظٹط§ط­ظٹ','Kemet Tourism Store',lang)}</div>
        <p style={{ color:'var(--tm)', fontSize:12, padding:'0 8px', wordBreak:'break-word' }}>{t('ط±ط­ظ„ط§طھ ظپط§ط®ط±ط© â€¢ ط§ط³طھط´ط§ط±ط§طھ â€¢ ط³ظٹط§ط­ط© ط¹ظ„ط§ط¬ظٹط© â€¢ طھط±ط®ظٹطµ ط±ط³ظ…ظٹ','Luxury Tours â€¢ Consulting â€¢ Medical Tourism â€¢ Official License',lang)}</p>
        <div style={{ marginTop:10, display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
          {['âœ“ طھط±ط®ظٹطµ ط±ط³ظ…ظٹ','âœ“ ط¯ظپط¹ ط¢ظ…ظ†','âœ“ ط¯ط¹ظ… 24/7'].map(b=><span key={b} className="badge" style={{ fontSize:11 }}>{b}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:18, gap:0, overflowX:'auto', WebkitOverflowScrolling:'touch', msOverflowStyle:'none', scrollbarWidth:'none' }}>
        {[['all',t('ط§ظ„ظƒظ„','All',lang)],['tours',t('ط±ط­ظ„ط§طھ','Tours',lang)],['consult',t('ط§ط³طھط´ط§ط±ط§طھ','Consult',lang)],['medical',t('ط¹ظ„ط§ط¬ظٹط©','Medical',lang)],['flights',t('ط·ظٹط±ط§ظ†','Flights',lang)],['hotels',t('ظپظ†ط§ط¯ظ‚','Hotels',lang)]].map(([k,l])=>(<button key={k} className={'tab '+(tab===k?'on':'')} onClick={()=>setTab(k)}>{l}</button>))}

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
  if(loading) return <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>âڈ³</div>;
  if(!profile) return <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>ظ…ط´ ظ…ظˆط¬ظˆط¯</div>;
  return (
    <div style={{maxWidth:600,margin:'0 auto',padding:'0 14px 14px'}}>
      <button className='btn btn-gh' onClick={onBack} style={{marginBottom:14}}>â†گ {t('ط±ط¬ظˆط¹','Back',lang)}</button>
      <div className='pcover' style={{marginBottom:0,position:'relative'}}>
        {profile.cover_url ? <img src={profile.cover_url} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',top:0,left:0}} /> : <div className='hiero'>ً“‚€ ً“پ؟ ً“†ڈ ً“‚‹ ً“†¼ ً“…“ ً“‚€ ً“پ؟ ً“†ڈ ً“‚‹</div>}
      </div>
      <div style={{background:'var(--bc)',border:'1px solid var(--bb)',borderTop:'none',borderRadius:'0 0 12px 12px',padding:'0 16px 16px',marginBottom:14}}>
        <div style={{marginTop:10}}>
          <Avatar emoji={profile.avatar_emoji||'ًں‘‘'} size={72} url={profile.avatar_url} />
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>{profile.nickname}</div>
          <div style={{fontSize:13,color:'var(--tm)',marginTop:2}}>{profile.name}</div>
          {profile.bio && <div style={{fontSize:13,color:'var(--gl)',marginTop:6,lineHeight:1.6}}>{profile.bio}</div>}
          <div style={{display:'flex',gap:24,marginTop:14}}>
            <div><div style={{fontWeight:800,fontSize:18,color:'var(--g)'}}>{profile.followers_count||0}</div><div style={{fontSize:11,color:'var(--tm)'}}>{t('ظ…طھط§ط¨ط¹ظˆظ†','Followers',lang)}</div></div>
            <div><div style={{fontWeight:800,fontSize:18,color:'var(--g)'}}>{profile.following_count||0}</div><div style={{fontSize:11,color:'var(--tm)'}}>{t('ظ…طھط§ط¨ظژط¹ظˆظ†','Following',lang)}</div></div>
          </div>
          {userId !== user?.id && <button className={following?'btn btn-gh':'btn btn-g'} onClick={toggleFollow} style={{marginTop:12,padding:'8px 24px'}}>{following?t('ط¥ظ„ط؛ط§ط، ط§ظ„ظ…طھط§ط¨ط¹ط©','Unfollow',lang):t('+ ظ…طھط§ط¨ط¹ط©','+ Follow',lang)}</button>}
        </div>
      </div>
      {userId !== user?.id && (
        <div style={{background:'var(--bc)',border:'1px solid var(--bb)',borderRadius:12,padding:20,textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:8}}>ًں’¬</div>
          <div style={{color:'var(--tm)',fontSize:13,marginBottom:14}}>{t('ط§ط¨ط¹طھ ط±ط³ط§ظ„ط© ط®ط§طµط©','Send a private message',lang)}</div>
          <button className='btn btn-g' style={{padding:'10px 28px'}} onClick={()=>onStartChat&&onStartChat({id:profile.id,nickname:profile.nickname,avatar_emoji:profile.avatar_emoji,avatar_url:profile.avatar_url})}>
            ًں’¬ {t('ط§ط±ط³ظ„ ط±ط³ط§ظ„ط©','Send Message',lang)}
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
    onToast && onToast(t('طھظ… ط±ظپط¹ ط§ظ„طµظˆط±ط©','Image uploaded',lang));
  };
  const uploadCover = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setEditForm(f=>({...f, cover_url:url}));
    setUploading(false);
    onToast && onToast(t('طھظ… ط±ظپط¹ ط§ظ„ط¨ظ†ط±','Cover uploaded',lang));
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
    onToast && onToast(t('طھظ… طھط­ط¯ظٹط« ط§ظ„ط¨ط±ظˆظپط§ظٹظ„','Profile updated',lang));
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
            <div style={{fontWeight:700,color:'var(--g)',fontSize:16,marginBottom:16}}>{t('طھط¹ط¯ظٹظ„ ط§ظ„ط¨ط±ظˆظپط§ظٹظ„','Edit Profile',lang)}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{textAlign:'center',marginBottom:8}}>
                <label style={{cursor:'pointer',display:'inline-block',background:'rgba(201,168,76,.1)',border:'1px solid var(--gd)',borderRadius:8,padding:'8px 16px',color:'var(--g)',fontSize:13}}>
                  {uploading ? 'âڈ³' : t('ط±ظپط¹ طµظˆط±ط© ط§ظ„ط£ظپط§طھط§ط±','Upload Avatar',lang)}
                  <input type='file' accept='image/*' onChange={uploadAvatar} style={{display:'none'}} />
                </label>
                {editForm.avatar_url && <img src={editForm.avatar_url} style={{width:60,height:60,borderRadius:'50%',marginTop:8,display:'block',margin:'8px auto 0'}} />}
                <label style={{cursor:'pointer',display:'inline-block',background:'rgba(201,168,76,.1)',border:'1px solid var(--gd)',borderRadius:8,padding:'8px 16px',color:'var(--g)',fontSize:13,marginTop:8}}>
                  {uploading ? 'âڈ³' : t('ط±ظپط¹ طµظˆط±ط© ط§ظ„ط¨ظ†ط±','Upload Cover',lang)}
                  <input type='file' accept='image/*' onChange={uploadCover} style={{display:'none'}} />
                </label>
                {editForm.cover_url && <img src={editForm.cover_url} style={{width:'100%',height:60,objectFit:'cover',borderRadius:8,marginTop:8}} />}
              </div>
              <input className='inp' placeholder={t('ط§ظ„ط§ط³ظ…','Name',lang)} value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
              <input className='inp' placeholder={t('ط§ظ„ظ†ظٹظƒظ†ظٹظ…','Nickname',lang)} value={editForm.nickname} onChange={e=>setEditForm(f=>({...f,nickname:e.target.value}))} />
              <textarea className='inp' placeholder={t('ظ†ط¨ط°ط© ط¹ظ†ظƒ','Bio',lang)} value={editForm.bio} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))} rows={3} />
              <div style={{display:'flex',gap:10,marginTop:6}}>
                <button className='btn btn-o' onClick={()=>setEditMode(false)} style={{flex:1}}>{t('ط¥ظ„ط؛ط§ط،','Cancel',lang)}</button>
                <button className='btn btn-g' onClick={saveProfile} style={{flex:1}}>{t('ط­ظپط¸','Save',lang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='pcover' style={{ marginBottom:0, position:'relative' }}>
        {user?.cover_url ? <img src={user.cover_url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',position:'absolute',top:0,left:0}} /> : <div className='hiero'>ً“‚€ ً“پ؟ ً“†ڈ ً“‚‹ ً“†¼ ً“…“ ً“‚€ ً“پ؟ ً“†ڈ ً“‚‹</div>}
      </div>
      <div style={{ background:'var(--bc)', border:'1px solid var(--bb)', borderTop:'none', borderRadius:'0 0 12px 12px', padding:'0 16px 16px', marginBottom:14 }}>
        <div style={{ marginTop:10 }}>
          <div style={{ marginBottom:10 }}>
            <Avatar emoji={user?.avatar_emoji||'ًں‘‘'} size={72} url={user?.avatar_url} />
            <button className='btn btn-o' style={{ fontSize:12, marginTop:8, display:'block' }} onClick={()=>setEditMode(true)}>âœڈï¸ڈ {t('طھط¹ط¯ظٹظ„ ط§ظ„ط¨ط±ظˆظپط§ظٹظ„','Edit Profile',lang)}</button>
          </div>
          <div style={{ fontWeight:800, fontSize:20, color:'var(--g)' }}>{user?.nickname}</div>
          <div style={{ fontSize:13, color:'var(--tm)', marginTop:2 }}>{user?.name} آ· {user?.email}</div>
          <div style={{ marginTop:7 }}>
            <span className="badge">ًں‘‘ {t('ط¹ط¶ظˆ ظ…ظ…ظٹط²','Premium Member',lang)}</span>
            {user?.country && <span style={{ fontSize:12, color:'var(--tm)', marginRight:10 }}>ًںŒچ {user.country}</span>}
          </div>
          <div style={{ display:'flex', gap:24, marginTop:14 }}>
            {[[myPosts.length, t('ظ…ظ†ط´ظˆط±ط§طھ','Posts',lang)],[user?.followers_count||248,t('ظ…طھط§ط¨ط¹ظˆظ†','Followers',lang)],[user?.following_count||89,t('ظ…طھط§ط¨ظژط¹ظˆظ†','Following',lang)]].map(([n,l])=>(
              <div key={l}><div style={{ fontWeight:800, fontSize:18, color:'var(--g)' }}>{n}</div><div style={{ fontSize:11, color:'var(--tm)' }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid var(--bb)', marginBottom:14 }}>
        {[['posts',t('ط§ظ„ظ…ظ†ط´ظˆط±ط§طھ','Posts',lang)],['friends',t('ط§ظ„ط£طµط¯ظ‚ط§ط،','Friends',lang)],['inbox',t('طµظ†ط¯ظˆظ‚ ط§ظ„ظˆط§ط±ط¯','Inbox',lang)]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>{ setTab(k); if(k==="friends") loadFriends(); }}>{l}</button>
        ))}
      </div>
      {tab==='posts' && (myPosts.length===0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>ًں“‌</div>
          <div>{t('ظ„ط§ طھظˆط¬ط¯ ظ…ظ†ط´ظˆط±ط§طھ ط¨ط¹ط¯. ط§ط¨ط¯ط£ ط¨ظ†ط´ط± ط£ظˆظ„ طھط؛ط±ظٹط¯ط©!','No posts yet. Start with your first tweet!',lang)}</div>
        </div>
      ) : myPosts.map(p=><PostCard key={p.id} post={p} lang={lang} onLike={()=>{}} user={user} onToast={onToast} currentUserId={user?.id} />))}
      {tab==='friends' && (
        <div>
          {loadingFriends && <div style={{textAlign:'center',padding:20,color:'var(--tm)'}}>âڈ³</div>}
          {friends.length===0 && !loadingFriends && <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>ًں‘¥ {t('ظ„ط§ ظٹظˆط¬ط¯ ط£طµط¯ظ‚ط§ط،','No friends yet',lang)}</div>}
          {friends.map(f=>(<div key={f.id} className='post-card' style={{display:'flex',gap:10,alignItems:'center',cursor:'pointer'}} onClick={()=>onStartChat&&onStartChat(f)}>
            <Avatar emoji={f.avatar_emoji||'ًں‘‘'} size={44} url={f.avatar_url} />
            <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--g)',fontSize:14}}>{f.nickname}</div><div style={{fontSize:12,color:'var(--tm)'}}>{f.name}</div></div>
            <span style={{color:'var(--gd)',fontSize:20}}>â€؛</span>
          </div>))}
        </div>
      )}
      {tab==='inbox' && (
        <div style={{textAlign:'center',padding:40,color:'var(--tm)'}}>
          <div style={{fontSize:48,marginBottom:10}}>ًں’¬</div>
          <div>{t('ط§ط¶ط؛ط· ط¹ظ„ظ‰ طµط¯ظٹظ‚ ظ„ظ„ظ…ط±ط§ط³ظ„ط©','Tap a friend to message',lang)}</div>
          <button className='btn btn-g' style={{marginTop:14}} onClick={()=>onSetPage&&onSetPage('messages')}>{t('ظپطھط­ ط§ظ„ط±ط³ط§ط¦ظ„','Open Messages',lang)}</button>
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ lang, user, onToast, notifsList, onGoToPost }) {
  const [notifs, setNotifs] = useState([]);
  const icons = { like:'â‌¤ï¸ڈ', comment:'ًں’¬', follow:'ًں‘¥', booking:'ًںڈ›ï¸ڈ', system:'ًں”؛' };
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>ًں”” {t('ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ','Notifications',lang)}</div>
      {(notifsList||notifs).length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--tm)' }}>
          <div style={{ fontSize:48, marginBottom:10 }}>ًں””</div>
          <div>{t('ظ„ط§ طھظˆط¬ط¯ ط¥ط´ط¹ط§ط±ط§طھ ط¨ط¹ط¯','No notifications yet',lang)}</div>
        </div>
      ) : (notifsList||notifs).map(n=>(
        <div key={n.id} className='post-card' style={{ display:'flex', gap:12, alignItems:'center', cursor:n.post_id?'pointer':'default' }} onClick={()=>n.post_id&&onGoToPost&&onGoToPost(n.post_id)}>
          <Avatar emoji={n.actor_avatar||icons[n.type]||'ًں””'} size={40} url={n.actor_url||null} />
          <div style={{ flex:1, textAlign:'right' }}>
            <div style={{ fontSize:13, color:'var(--g)', fontWeight:700 }}>{n.actor_name} {icons[n.type]||'ًں””'}</div>
            <div style={{ fontSize:13, color:'var(--gl)', marginTop:2 }}>{n.content}</div>
            <div style={{ fontSize:11, color:'var(--tm)', marginTop:2 }}>{timeAgo(n.created_at, lang)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
      

// â”€â”€ JITSI VIDEO CALL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <span style={{color:"var(--g)",fontWeight:700,fontSize:15}}>ًں“¹ {lang==="ar"?"ظ…ظƒط§ظ„ظ…ط© ظپظٹط¯ظٹظˆ":"Video Call"}</span>
        <button onClick={onEnd} style={{background:"var(--red)",border:"none",color:"#fff",padding:"8px 18px",borderRadius:20,cursor:"pointer",fontWeight:700,fontSize:13}}>
          ًں“µ {lang==="ar"?"ط¥ظ†ظ‡ط§ط،":"End Call"}
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
    messagesAPI.sendMessage(active.other_id, type==='video' ? 'ًں“¹ ظ…ظƒط§ظ„ظ…ط© ظپظٹط¯ظٹظˆ ط¬ط§ط±ظٹط©' : 'ًں“‍ ظ…ظƒط§ظ„ظ…ط© طµظˆطھظٹط© ط¬ط§ط±ظٹط©');
  };  const emojis = ['ًںکٹ','â‌¤ï¸ڈ','ًں”؛','ًںڈ›ï¸ڈ','âœˆï¸ڈ','ًںŒچ','ًں‘‘','â­گ','ًںژ‰','ًںŒ…','ًںڈ–ï¸ڈ','ًںگھ','ًں¦…','ًںŒ؛','ًں’ژ','âڑ”ï¸ڈ','ًںŒ™','âک€ï¸ڈ','ًںژ­','ًںڈ†','ًں¤©','ًںک‚','ًں¥°','ًںکژ','ًں™ڈ'];
  const msgRef = null;
  const uploadImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    setUploading(false);
    if (url) { const r = await messagesAPI.sendMessage(active.other_id, url); setConv(c=>[...c, { id:r.data?.message_id||Date.now(), sender_id:user?.id, content:url, created_at:new Date().toISOString() }]); }
  };
  useEffect(()=>{ if(initialChat){ openChat({other_id:initialChat.id, other_name:initialChat.nickname, avatar_emoji:initialChat.avatar_emoji||'ًں‘‘'}); onChatOpened&&onChatOpened(); } },[initialChat]);

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
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>ًں’¬ {t('ط§ظ„ط±ط³ط§ط¦ظ„','Messages',lang)}</div>
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
            <button className="btn btn-gh" onClick={()=>setActive(null)}>â†گ {t('ط±ط¬ظˆط¹','Back',lang)}</button>
            <Avatar emoji={active.avatar_emoji} size={36} />
            <span style={{ fontWeight:700, color:'var(--g)' }}>{active.other_name}</span>
            <button className="btn btn-gh" style={{fontSize:20,padding:'4px 10px',marginRight:'auto'}} onClick={()=>startCall('audio')}>ًں“‍</button>
            <button className="btn btn-gh" style={{fontSize:20,padding:'4px 10px'}} onClick={()=>startCall('video')}>ًں“¹</button>
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
            <button className='btn btn-gh' style={{ fontSize:18, padding:'8px 10px' }} onClick={()=>setShowEmoji(v=>!v)}>ًںکٹ</button>
            <label className='btn btn-gh' style={{ fontSize:18, padding:'8px 10px', cursor:'pointer' }}>
              {uploading ? 'âڈ³' : 'ًں“ژ'}
              <input type='file' accept='image/*' onChange={uploadImage} style={{ display:'none' }} />
            </label>
            <input className='inp' placeholder={t('ط§ظƒطھط¨ ط±ط³ط§ظ„ط©...','Type a message...',lang)} value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} style={{ flex:1 }} />
            <button className='btn btn-g' onClick={send} style={{ padding:'10px 16px' }}>{t('ط¥ط±ط³ط§ظ„','Send',lang)}</button>
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
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:14 }}>ًں”چ {t('ط§ظ„ط¨ط­ط«','Search',lang)}</div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <input className='inp' placeholder={t('ط§ط¨ط­ط« ط¨ط§ظ„ط§ط³ظ… ط£ظˆ ط§ظ„ظ†ظٹظƒظ†ظٹظ…...','Search by name or nickname...',lang)} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} style={{flex:1}} />
        <button className='btn btn-g' onClick={search}>{loading?'âڈ³':'ًں”چ'}</button>
      </div>
      {results.length>0 && results.map(u=>(
        <div key={u.id} className='post-card' style={{display:'flex',gap:12,alignItems:'center',cursor:'pointer'}} onClick={()=>onViewProfile&&onViewProfile(u.id)}>
          <Avatar emoji={u.avatar_emoji||'ًں‘‘'} size={44} url={u.avatar_url} />
          <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--g)'}}>{u.nickname}</div><div style={{fontSize:12,color:'var(--tm)'}}>{u.name}</div></div>
          <span style={{color:'var(--gd)',fontSize:18}}>â€؛</span>
        </div>
      ))}
    </div>
  );
}
function SettingsPage({ lang, setLang, onLogout }) {
  const items = [
    { icon:'ًںŒگ', ar:'ط§ظ„ظ„ط؛ط©', en:'Language', val:lang==='ar'?'ط§ظ„ط¹ط±ط¨ظٹط©':'English', action:()=>setLang(l=>l==='ar'?'en':'ar') },
    { icon:'ًں””', ar:'ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ', en:'Notifications', val:t('ظ…ظپط¹ظ‘ظ„ط©','Enabled',lang), action:null },
    { icon:'ًں”’', ar:'ط§ظ„ط®طµظˆطµظٹط©', en:'Privacy', val:t('ط¹ط§ظ…','Public',lang), action:null },
  ];
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'14px 14px' }}>
      <div style={{ fontWeight:700, color:'var(--g)', fontSize:18, marginBottom:18 }}>âڑ™ï¸ڈ {t('ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ','Settings',lang)}</div>
      {items.map(s=>(
        <div key={s.ar} className="post-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:s.action?'pointer':'default' }} onClick={s.action||undefined}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontSize:20 }}>{s.icon}</span>
            <span style={{ fontSize:14, color:'var(--gl)' }}>{t(s.ar,s.en,lang)}</span>
          </div>
          <span style={{ fontSize:12, color:'var(--tm)' }}>{s.val} â€؛</span>
        </div>
      ))}
      <div style={{ marginTop:20 }}>
        <button className="btn btn-o" style={{ width:'100%', borderColor:'var(--red)', color:'var(--red)' }} onClick={onLogout}>
          {t('طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬','Logout',lang)}
        </button>
      </div>
    </div>
  );
}
function StoreManagerPage({ lang, user, onBack, onToast }) {
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title_ar:'', title_en:'', description_ar:'', description_en:'', price:0, duration_days:1, image_emoji:'ًںڈ›', image_url:'', badge_ar:'', badge_en:'', category_id:'cat_tours', includes_ar:'', includes_en:'', itinerary_ar:'', itinerary_en:'', is_featured:0 });
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
    onToast && onToast(t('طھظ… ط±ظپط¹ ط§ظ„طµظˆط±ط©','Image uploaded',lang));
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
      onToast && onToast(t('طھظ… ط§ظ„طھط­ط¯ظٹط«','Updated',lang));
    } else {
      await fetch(API+'/store/tours', {method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}, body:JSON.stringify(body)});
      onToast && onToast(t('طھظ…طھ ط§ظ„ط§ط¶ط§ظپط©','Added',lang));
    }
    setEditing(null); setAdding(false); loadTours();
  };
  const deleteTour = async (id) => {
    await fetch(API+'/store/tours/'+id, {method:'DELETE', headers:{'Authorization':'Bearer '+token}});
    onToast && onToast(t('طھظ… ط§ظ„ط­ط°ظپ','Deleted',lang));
    loadTours();
  };
  const startEdit = (tour) => {
    setForm({ title_ar:tour.title_ar||'', title_en:tour.title_en||'', description_ar:tour.description_ar||'', description_en:tour.description_en||'', price:tour.price||0, duration_days:tour.duration_days||1, image_emoji:tour.image_emoji||'ًںڈ›', image_url:tour.image_url||'', badge_ar:tour.badge_ar||'', badge_en:tour.badge_en||'', category_id:tour.category_id||'cat_tours', includes_ar:(tour.includes_ar?JSON.parse(tour.includes_ar):[]).join(','), includes_en:(tour.includes_en?JSON.parse(tour.includes_en):[]).join(','), itinerary_ar:(tour.itinerary_ar?JSON.parse(tour.itinerary_ar):[]).join('\n'), itinerary_en:(tour.itinerary_en?JSON.parse(tour.itinerary_en):[]).join('\n'), is_featured:tour.is_featured||0 });
    setEditing(tour); setAdding(true);
  };
  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:14}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button className='btn btn-gh' onClick={onBack}>â†گ {t('ط±ط¬ظˆط¹','Back',lang)}</button>
        <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>ًںڈ› {t('ط§ط¯ط§ط±ط© ط§ظ„ظ…طھط¬ط±','Store Manager',lang)}</div>
        <button className='btn btn-g' style={{marginRight:'auto'}} onClick={()=>{setEditing(null);setForm({title_ar:'',title_en:'',description_ar:'',description_en:'',price:0,duration_days:1,image_emoji:'ًںڈ›',image_url:'',badge_ar:'',badge_en:'',category_id:'cat_tours',includes_ar:'',includes_en:'',is_featured:0});setAdding(true);}}>+ {t('ط§ط¶ط§ظپط© ط±ط­ظ„ط©','Add Tour',lang)}</button>
      </div>
      {adding && (
        <div className='card' style={{padding:20,marginBottom:20}}>
          <div style={{fontWeight:700,color:'var(--g)',marginBottom:14}}>{editing?t('طھط¹ط¯ظٹظ„ ط±ط­ظ„ط©','Edit Tour',lang):t('ط±ط­ظ„ط© ط¬ط¯ظٹط¯ط©','New Tour',lang)}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <input className='inp' placeholder='ط§ظ„ط¹ظ†ظˆط§ظ† ط¨ط§ظ„ط¹ط±ط¨ظٹ' value={form.title_ar} onChange={e=>setForm(f=>({...f,title_ar:e.target.value}))} />
            <input className='inp' placeholder='Title EN' value={form.title_en} onChange={e=>setForm(f=>({...f,title_en:e.target.value}))} />
            <textarea className='inp' placeholder='ط§ظ„ظˆطµظپ ط¨ط§ظ„ط¹ط±ط¨ظٹ' value={form.description_ar} onChange={e=>setForm(f=>({...f,description_ar:e.target.value}))} rows={3} />
            <textarea className='inp' placeholder='Description EN' value={form.description_en} onChange={e=>setForm(f=>({...f,description_en:e.target.value}))} rows={3} />
            <input className='inp' placeholder='ط§ظ„ط³ط¹ط± ط¨ط§ظ„ط¯ظˆظ„ط§ط± $' type='number' value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
            <input className='inp' placeholder='ط¹ط¯ط¯ ط§ظ„ط§ظٹط§ظ…' type='number' value={form.duration_days} onChange={e=>setForm(f=>({...f,duration_days:e.target.value}))} />
            <input className='inp' placeholder='ط§ظ„ط´ط§ط±ط© ط¹ط±ط¨ظٹ' value={form.badge_ar} onChange={e=>setForm(f=>({...f,badge_ar:e.target.value}))} />
            <input className='inp' placeholder='Badge EN' value={form.badge_en} onChange={e=>setForm(f=>({...f,badge_en:e.target.value}))} />
            <input className='inp' placeholder='ظٹط´ظ…ظ„ ط¹ط±ط¨ظٹ (ظ…ظپطµظˆظ„ ط¨ظپظˆط§طµظ„)' value={form.includes_ar} onChange={e=>setForm(f=>({...f,includes_ar:e.target.value}))} />
            <input className='inp' placeholder='Includes EN (comma separated)' value={form.includes_en} onChange={e=>setForm(f=>({...f,includes_en:e.target.value}))} />
            <select className='inp' value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}>
              <option value='cat_tours'>ط±ط­ظ„ط§طھ</option>
              <option value='cat_nile'>ظƒط±ظˆط²</option>
              <option value='cat_consult'>ط§ط³طھط´ط§ط±ط§طھ</option>
              <option value='cat_medical'>ط¹ظ„ط§ط¬ظٹط©</option>
            </select>
            <input className='inp' placeholder='Emoji' value={form.image_emoji} onChange={e=>setForm(f=>({...f,image_emoji:e.target.value}))} />
          </div>
            <textarea className='inp' placeholder='ط§ظ„ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ظٹظˆظ…ظٹ ط¨ط§ظ„ط¹ط±ط¨ظٹ (ظƒظ„ ظٹظˆظ… ظپظٹ ط³ط·ط±)&#10;ط§ظ„ظٹظˆظ… 1: ...&#10;ط§ظ„ظٹظˆظ… 2: ...' value={form.itinerary_ar||''} onChange={e=>setForm(f=>({...f,itinerary_ar:e.target.value}))} rows={4} />
            <textarea className='inp' placeholder='Daily Itinerary EN (one day per line)&#10;Day 1: ...&#10;Day 2: ...' value={form.itinerary_en||''} onChange={e=>setForm(f=>({...f,itinerary_en:e.target.value}))} rows={4} />
          <div style={{marginTop:10,display:'flex',gap:10,alignItems:'center'}}>
            <label className='btn btn-gh' style={{cursor:'pointer',border:'1px solid var(--gd)'}}>
              {uploading?'...':t('ط±ظپط¹ طµظˆط±ط©','Upload Image',lang)}
              <input type='file' accept='image/*' onChange={uploadImg} style={{display:'none'}} />
            </label>
            {form.image_url && <img src={form.image_url} style={{height:50,borderRadius:8}} />}
            <label style={{display:'flex',alignItems:'center',gap:6,color:'var(--tm)',fontSize:13}}>
              <input type='checkbox' checked={form.is_featured===1} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked?1:0}))} />
              {t('ظ…ظ…ظٹط²','Featured',lang)}
            </label>
          </div>
          <div style={{display:'flex',gap:10,marginTop:14}}>
            <button className='btn btn-o' onClick={()=>{setAdding(false);setEditing(null);}} style={{flex:1}}>{t('ط§ظ„ط؛ط§ط،','Cancel',lang)}</button>
            <button className='btn btn-g' onClick={saveTour} style={{flex:1}}>ًں”؛ {t('ط­ظپط¸','Save',lang)}</button>
          </div>
        </div>
      )}
      <div>
        {tours.map(tour=>(
          <div key={tour.id} className='card' style={{padding:14,marginBottom:10,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{fontSize:36}}>{tour.image_emoji||'ًںڈ›'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'var(--g)'}}>{t(tour.title_ar,tour.title_en,lang)}</div>
              <div style={{fontSize:12,color:'var(--tm)'}}>{tour.price} dollar - {tour.duration_days} {t('ط§ظٹط§ظ…','days',lang)}</div>
            </div>
            <button className='btn btn-gh' style={{fontSize:12}} onClick={()=>startEdit(tour)}>âœڈï¸ڈ {t('طھط¹ط¯ظٹظ„','Edit',lang)}</button>
            <button className='btn btn-o' style={{fontSize:12,borderColor:'var(--red)',color:'var(--red)'}} onClick={()=>deleteTour(tour.id)}>ًں—‘ {t('ط­ط°ظپ','Delete',lang)}</button>
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
        <button className="btn btn-gh" onClick={onBack}>â†گ ط±ط¬ظˆط¹</button>
        <div style={{fontWeight:800,fontSize:20,color:'var(--g)'}}>ًںڈ›ï¸ڈ ظ„ظˆط­ط© ط§ظ„ط¥ط¯ط§ط±ط©</div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[['stats','ًں“ٹ ط¥ط­طµط§ط¦ظٹط§طھ'],['users','ًں‘¥ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†']].map(([k,l])=>(
          <button key={k} className={`btn ${tab===k?'btn-g':'btn-gh'}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==='stats' && stats && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {[['ًں‘¥','ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†',stats.users],['ًں“‌','ط§ظ„ط¨ظˆط³طھط§طھ',stats.posts],['â‌¤ï¸ڈ','ط§ظ„ط¥ط¹ط¬ط§ط¨ط§طھ',stats.likes],['ًں‘¥','ط§ظ„ظ…طھط§ط¨ط¹ط§طھ',stats.follows],['ًں”‘','ط§ظ„ط¬ظ„ط³ط§طھ',stats.sessions]].map(([ic,l,n])=>(
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
                  {u.role==='store_manager'?'â‌Œ ظ…ط¯ظٹط± ظ…طھط¬ط±':'ًںڈ›ï¸ڈ ظ…ط¯ظٹط± ظ…طھط¬ط±'}
                </button>
                <button className={`btn ${u.is_active?'btn-o':'btn-g'}`} style={{fontSize:11}} onClick={()=>toggleUser(u.id)}>
                  {u.is_active?'طھط¹ط·ظٹظ„':'طھظپط¹ظٹظ„'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [posts, setPosts] = useState([]);
  const [notifsList, setNotifsList] = useState([]);
  useEffect(()=>{
    window.handleGoogleLogin = async (response) => {
      const r = await fetch('https://kemetc1-production.up.railway.app/api/auth/google', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:response.credential})});
      const d = await r.json();
      if(d.ok){ storage.setToken(d.data.token); storage.setUser(d.data.user); setUser(d.data.user); setModal(null); setScreen('app'); }
    };
  },[]);
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
      
  const handleLogout = async () => { await authAPI.logout(); setUser(null); setScreen('landing'); setPage('feed'); showToast(t('طھظ… طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬','Logged out',lang)); };
  const handleLogin = (u) => { setUser(u); setModal(null); setScreen('app'); showToast(t('ahlan ' + u.nickname, 'Welcome back ' + u.nickname, lang)); const token = localStorage.getItem('kemet_token'); if(token){ fetch('https://kemetc1-production.up.railway.app/api/notifications',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).then(d=>{ if(d.ok) setNotifsList(d.data||[]); }); } };

  const navIcons = [['feed','ًںڈ '],['store','ًںڈ›ï¸ڈ'],['notifications','ًں””'],['messages','ًں’¬']];

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
        <button className="btn btn-gh" style={{fontSize:12,padding:"5px 12px",border:"1px solid rgba(201,168,76,0.4)",borderRadius:20,color:"var(--g)",display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,0.06)",fontWeight:700,letterSpacing:1}} onClick={()=>setPage("eclipse")}>ًںŒ‘ Eclipse 2027</button>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <div className='hide-mobile' style={{display:'flex',gap:6}}>
            {navIcons.map(([k,ic])=>(<button key={k} className='btn btn-gh' style={{ color:page===k?'var(--g)':'var(--tm)', fontSize:18, padding:'4px 10px' }} onClick={()=>setPage(k)}>{ic}</button>))}
          </div>
         <Avatar emoji={user?.avatar_emoji||'ًں‘‘'} size={34} url={user?.avatar_url} onClick={()=>setPage('profile')} />
         <button className="btn btn-gh" onClick={handleLogout} style={{fontSize:12,color:'var(--red)',padding:'4px 8px'}}>ط®ط±ظˆط¬</button>
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

      <div className='bottom-nav'>
        {[['feed','ًںڈ ','ط§ظ„ط±ط¦ظٹط³ظٹط©','Home'],['store','ًںڈ›ï¸ڈ','ط§ظ„ظ…طھط¬ط±','Store'],['notifications','ًں””','ط¥ط´ط¹ط§ط±ط§طھ','Notifs'],['messages','ًں’¬','ط±ط³ط§ط¦ظ„','Messages'],['profile','ًں‘¤','ط¨ط±ظˆظپط§ظٹظ„','Profile'],['search','ًں”چ','ط¨ط­ط«','Search']].map(([k,ic,ar,en])=>(
          <button key={k} className={`bottom-nav-btn ${page===k?'on':''}`} onClick={()=>setPage(k)}>
            <span style={{fontSize:22}}>{ic}</span>
            <span>{lang==='ar'?ar:en}</span>
          </button>
        ))}
      </div>
    </>
  );
}
