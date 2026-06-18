import { useState, useEffect } from "react";

const DEFAULT_EPISODES = [];

export default function EclipsePage({ lang, user, onToast, onBook }) {
  const [episodes, setEpisodes] = useState(() => {
    try { const s = localStorage.getItem('eclipse_episodes'); return s ? JSON.parse(s) : DEFAULT_EPISODES; } catch { return DEFAULT_EPISODES; }
  });
  const [adminMode, setAdminMode] = useState(false);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({title:'', presenter:'', institution:'', date:''});
  const [countdown, setCountdown] = useState({d:'000',h:'00',m:'00',s:'00'});
  const isAdmin = user?.email === 'mido704@gmail.com';

  useEffect(() => {
    localStorage.setItem('eclipse_episodes', JSON.stringify(episodes));
  }, [episodes]);

  useEffect(() => {
    const tick = () => {
      const diff = new Date('2027-08-02T10:08:00+02:00') - new Date();
      if (diff <= 0) return;
      setCountdown({
        d: String(Math.floor(diff/86400000)).padStart(3,'0'),
        h: String(Math.floor((diff%86400000)/3600000)).padStart(2,'0'),
        m: String(Math.floor((diff%3600000)/60000)).padStart(2,'0'),
        s: String(Math.floor((diff%60000)/1000)).padStart(2,'0'),
      });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const openModal = (id) => {
    setEditingId(id||null);
    if (id) { const ep = episodes.find(e=>e.id===id); setForm({title:ep.title,presenter:ep.presenter,institution:ep.institution,date:ep.date}); }
    else setForm({title:'',presenter:'',institution:'',date:''});
    setModal(true);
  };

  const saveEpisode = () => {
    if (!form.title||!form.presenter) { onToast && onToast('Please fill title and presenter'); return; }
    if (editingId) setEpisodes(eps => eps.map(e => e.id===editingId ? {...e,...form} : e));
    else setEpisodes(eps => [...eps, {id: Math.max(0,...eps.map(e=>e.id))+1, ...form}]);
    setModal(false);
    onToast && onToast(editingId ? 'Episode updated!' : 'Episode added!');
  };

  const deleteEp = (id) => {
    if (!confirm('Delete this episode?')) return;
    setEpisodes(eps => eps.filter(e=>e.id!==id));
    onToast && onToast('Episode deleted.');
  };

  const css = `
    .ecl{background:#000;color:#C9A84C;font-family:'Cairo',sans-serif;min-height:100vh;padding-bottom:40px}
    .ecl-topbar{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(201,168,76,0.15)}
    .ecl-logo{font-family:'Cinzel',serif;font-size:15px;color:#F0D080;letter-spacing:3px}
    .ecl-admin-btn{background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);color:#C9A84C;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;font-family:'Cairo',sans-serif}
    .ecl-hero{text-align:center;padding:36px 16px 24px;background:radial-gradient(ellipse at 50% 0%,#1A0A00,#000 65%)}
    .ecl-title{font-family:'Cinzel',serif;font-size:clamp(24px,5vw,48px);font-weight:900;background:linear-gradient(135deg,#8B6914,#C9A84C,#F0D080,#C9A84C,#8B6914);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:3px;margin-bottom:6px}
    .ecl-sub{font-size:12px;color:#F0D080;letter-spacing:2px;margin-bottom:24px}
    .ecl-vis{position:relative;width:160px;height:160px;margin:0 auto 24px}
    .ecl-sun{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,#FFF 0%,#FFD700 15%,#FF8C00 35%,#FF4500 55%,transparent 72%);animation:eclPulse 4s ease-in-out infinite;opacity:0.85}
    .ecl-moon{position:absolute;inset:14px;border-radius:50%;background:radial-gradient(circle at 42% 42%,#111,#000);box-shadow:0 0 40px rgba(201,168,76,0.7),0 0 80px rgba(201,168,76,0.3)}
    .ecl-cr1{position:absolute;inset:-14px;border-radius:50%;border:1px solid rgba(201,168,76,0.2);animation:eclExp 4s ease-in-out infinite}
    .ecl-cr2{position:absolute;inset:-28px;border-radius:50%;border:1px solid rgba(201,168,76,0.1);animation:eclExp 4s ease-in-out infinite 0.6s}
    @keyframes eclPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes eclExp{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.1);opacity:0.15}}
    .ecl-cd{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:420px;margin:0 auto 20px;padding:0 16px}
    .ecl-cb{background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:10px;padding:12px 4px;text-align:center}
    .ecl-cn{font-family:'Cinzel',serif;font-size:26px;font-weight:900;color:#F0D080;line-height:1}
    .ecl-cl{font-size:9px;color:#555;margin-top:4px;letter-spacing:2px}
    .ecl-stats{display:grid;grid-template-columns:repeat(3,1fr);background:rgba(201,168,76,0.06);border-top:1px solid rgba(201,168,76,0.1);border-bottom:1px solid rgba(201,168,76,0.1);margin-bottom:24px}
    .ecl-stat{padding:14px 8px;text-align:center}
    .ecl-sn{font-family:'Cinzel',serif;font-size:18px;color:#F0D080;font-weight:700}
    .ecl-sl{font-size:9px;color:#555;margin-top:3px}
    .ecl-sec{padding:0 16px 24px;max-width:660px;margin:0 auto}
    .ecl-stitle{font-family:'Cinzel',serif;font-size:13px;color:#C9A84C;text-align:center;letter-spacing:3px;margin-bottom:16px;text-transform:uppercase}
    .ecl-list{border:1px solid rgba(201,168,76,0.15);border-radius:14px;overflow:hidden}
    .ecl-row{display:flex;gap:10px;padding:12px 14px;align-items:center;border-bottom:1px solid rgba(201,168,76,0.08)}
    .ecl-row:last-child{border-bottom:none}
    .ecl-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#5A3D00,#C9A84C);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000;flex-shrink:0}
    .ecl-txt{flex:1;min-width:0}
    .ecl-txt h4{font-size:12px;color:#C9A84C;margin-bottom:2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ecl-txt p{font-size:10px;color:#444;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ecl-dt{font-size:10px;color:#553300;white-space:nowrap;margin-left:8px}
    .ecl-acts{display:flex;gap:6px;flex-shrink:0}
    .ecl-edit{background:rgba(201,168,76,0.12);color:#C9A84C;border:1px solid rgba(201,168,76,0.2);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer}
    .ecl-del{background:rgba(231,76,60,0.1);color:#E74C3C;border:1px solid rgba(231,76,60,0.2);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer}
    .ecl-add{width:100%;margin-top:10px;padding:11px;background:transparent;border:1px dashed rgba(201,168,76,0.3);border-radius:10px;color:#C9A84C;font-size:12px;cursor:pointer;font-family:'Cairo',sans-serif;letter-spacing:1px}
    .ecl-banner{margin:0 16px;padding:16px 14px;background:linear-gradient(135deg,rgba(139,105,20,0.15),rgba(201,168,76,0.07));border:1px solid rgba(201,168,76,0.3);border-radius:16px;text-align:center}
    .ecl-banner h3{font-family:'Cinzel',serif;font-size:16px;color:#F0D080;margin-bottom:6px}
    .ecl-banner p{font-size:12px;color:#555;margin-bottom:14px;line-height:1.6}
    .ecl-book{padding:11px 32px;background:linear-gradient(135deg,#8B6914,#C9A84C,#F0D080);border:none;border-radius:10px;color:#000;font-weight:700;font-size:13px;cursor:pointer;font-family:'Cairo',sans-serif}
    .ecl-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
    .ecl-modal{background:#0D0800;border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:24px;width:100%;max-width:440px}
    .ecl-modal h3{font-family:'Cinzel',serif;color:#F0D080;font-size:15px;margin-bottom:18px}
    .ecl-field{margin-bottom:12px}
    .ecl-field label{display:block;font-size:11px;color:#666;margin-bottom:5px;letter-spacing:1px}
    .ecl-field input{width:100%;background:#050200;border:1px solid rgba(201,168,76,0.2);color:#F0D080;padding:9px 12px;border-radius:8px;font-family:'Cairo',sans-serif;font-size:13px;outline:none}
    .ecl-modal-btns{display:flex;gap:10px;margin-top:18px}
    .ecl-save{flex:1;padding:10px;background:linear-gradient(135deg,#8B6914,#C9A84C);border:none;border-radius:8px;color:#000;font-weight:700;font-size:13px;cursor:pointer}
    .ecl-cancel{flex:1;padding:10px;background:transparent;border:1px solid rgba(201,168,76,0.2);border-radius:8px;color:#888;font-size:13px;cursor:pointer}
  `;

  return (
    <div className="ecl">
      <style>{css}</style>

      <div className="ecl-topbar">
        <div className="ecl-logo">KEMET · ECLIPSE 2027</div>
        {isAdmin && <button className="ecl-admin-btn" onClick={()=>setAdminMode(a=>!a)}>{adminMode ? '✓ Admin ON' : '⚙ Admin Mode'}</button>}
      </div>

      <div className="ecl-hero">
        <div style={{fontSize:10,letterSpacing:3,color:'#555',marginBottom:10}}>RARE CELESTIAL EVENT · LUXOR, EGYPT</div>
        <div className="ecl-title">Total Solar Eclipse</div>
        <div className="ecl-sub">August 2, 2027 · Luxor, Upper Egypt</div>
        <div className="ecl-vis">
          <div className="ecl-cr2"/><div className="ecl-cr1"/>
          <div className="ecl-sun"/><div className="ecl-moon"/>
        </div>
        <div className="ecl-cd">
          {[['d','Days'],['h','Hours'],['m','Min'],['s','Sec']].map(([k,l])=>(
            <div key={k} className="ecl-cb"><div className="ecl-cn">{countdown[k]}</div><div className="ecl-cl">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="ecl-stats">
        <div className="ecl-stat"><div className="ecl-sn">6:22</div><div className="ecl-sl">Minutes of Totality</div></div>
        <div className="ecl-stat"><div className="ecl-sn">10:08 AM</div><div className="ecl-sl">Local Eclipse Time</div></div>
        <div className="ecl-stat"><div className="ecl-sn">100%</div><div className="ecl-sl">Sun Coverage</div></div>
      </div>
      <div className="ecl-sec">
        <div className="ecl-stitle">✦ Weekly Podcast Schedule ✦</div>
        {episodes.length===0 && !adminMode && (
          <div style={{textAlign:'center',padding:'30px 20px',color:'#9a8158',fontSize:14,lineHeight:1.8}}>
            🎙️ Podcast episodes covering eclipse science, ancient Egyptian astronomy, and travel tips will be announced soon — featuring leading experts in their fields.
          </div>
        )}
        {(episodes.length>0 || adminMode) && (
        <div className="ecl-list">
          {episodes.map((ep,i)=>(
            <div key={ep.id} className="ecl-row">
              <div className="ecl-num">{String(i+1).padStart(2,'0')}</div>
              <div className="ecl-txt"><h4>{ep.title}</h4><p>{ep.presenter} · {ep.institution}</p></div>
              <div className="ecl-dt">{ep.date}</div>
              {adminMode && <div className="ecl-acts">
                <button className="ecl-edit" onClick={()=>openModal(ep.id)}>Edit</button>
                <button className="ecl-del" onClick={()=>deleteEp(ep.id)}>Del</button>
              </div>}
            </div>
          ))}
        </div>
        )}
        {adminMode && <button className="ecl-add" onClick={()=>openModal()}>+ Add New Episode</button>}
      </div>

      <div className="ecl-banner">
        <h3>🔺 Reserve Your Eclipse Experience</h3>
        <p>Exclusive luxury packages to witness the 2027 Total Solar Eclipse<br/>from the temples of Luxor — with Kemet Concierge</p>
        <button className="ecl-book" onClick={()=>onBook&&onBook()}>BOOK YOUR SPOT NOW</button>
      </div>

      {modal && (
        <div className="ecl-modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="ecl-modal">
            <h3>{editingId ? 'Edit Episode' : 'Add Episode'}</h3>
            <div className="ecl-field"><label>EPISODE TITLE</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Why Luxor Is the Best Eclipse Spot" /></div>
            <div className="ecl-field"><label>PRESENTER NAME</label><input value={form.presenter} onChange={e=>setForm(f=>({...f,presenter:e.target.value}))} placeholder="e.g. Dr. James Walker" /></div>
            <div className="ecl-field"><label>INSTITUTION</label><input value={form.institution} onChange={e=>setForm(f=>({...f,institution:e.target.value}))} placeholder="e.g. NASA · Astrophysics" /></div>
            <div className="ecl-field"><label>SCHEDULED DATE</label><input value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} placeholder="e.g. Jul 2026" /></div>
            <div className="ecl-modal-btns">
              <button className="ecl-cancel" onClick={()=>setModal(false)}>Cancel</button>
              <button className="ecl-save" onClick={saveEpisode}>Save Episode</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
