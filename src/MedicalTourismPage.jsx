import { useState } from "react";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dnrfsmtbi/auto/upload";
const CLOUDINARY_PRESET = "kemet_upload";

async function uploadToCloudinary(fileObj) {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append("file", fileObj);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_URL, true);
    xhr.onload = () => { try { const d = JSON.parse(xhr.responseText); resolve(d.secure_url||""); } catch { resolve(""); } };
    xhr.onerror = () => resolve("");
    xhr.send(fd);
  });
}

export default function MedicalTourismPage({ user, onBack }) {
  const isAdmin = user?.email === "mido704@gmail.com";
  const [adminMode, setAdminMode] = useState(false);
  const [disease, setDisease] = useState("");
  const [medFile, setMedFile] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [payMethod, setPayMethod] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [hotels, setHotels] = useState([
    { name:"شقة فندقية نيل تاور", type:"شقة", price:2500, area:"وسط القاهرة", rooms:"٢ غرفة", videoUrl:"", desc:"شقة فاخرة مطلة على النيل، مجهزة بالكامل، قريبة من أكبر المستشفيات." },
    { name:"فندق القاهرة الكبير", type:"فندق", price:3500, area:"المهندسين", rooms:"غرفة فاخرة", videoUrl:"", desc:"فندق خمس نجوم بخدمات متكاملة، على بُعد دقائق من المستشفى." },
    { name:"شقة مصر الجديدة", type:"شقة", price:1800, area:"مصر الجديدة", rooms:"٣ غرف", videoUrl:"", desc:"شقة هادئة في حي راقٍ، مناسبة للعائلات." },
  ]);

  const [cars, setCars] = useState([
    { name:"تويوتا كامري", type:"سيدان فاخرة", price:800, seats:"٥ مقاعد", ac:"تكييف مزدوج", imgUrl:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500", desc:"سيارة مريحة وموثوقة للتنقل اليومي." },
    { name:"هيونداي H1", type:"ميني فان", price:1200, seats:"٨ مقاعد", ac:"تكييف قوي", imgUrl:"https://images.unsplash.com/photo-1609520778520-b39f89a634a7?w=500", desc:"مثالية للعائلات الكبيرة." },
    { name:"مرسيدس E-Class", type:"VIP فاخرة", price:2000, seats:"٤ مقاعد", ac:"تكييف + واي فاي", imgUrl:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500", desc:"أرقى وسائل النقل." },
  ]);

  const [newHotel, setNewHotel] = useState({ name:"", type:"شقة", price:0, area:"", rooms:"", videoUrl:"", desc:"" });
  const [newCar, setNewCar] = useState({ name:"", type:"سيدان", price:0, seats:"", ac:"", imgUrl:"", desc:"" });

  const totalPrice = selectedHotel !== null && selectedCar !== null
    ? Math.round((hotels[selectedHotel].price + cars[selectedCar].price) * 0.1)
    : selectedHotel !== null ? Math.round(hotels[selectedHotel].price * 0.1)
    : selectedCar !== null ? Math.round(cars[selectedCar].price * 0.1) : 0;

  const updateHotel = (i,f,v) => { const h=[...hotels]; h[i]={...h[i],[f]:f==="price"?Number(v):v}; setHotels(h); };
  const updateCar = (i,f,v) => { const cs=[...cars]; cs[i]={...cs[i],[f]:f==="price"?Number(v):v}; setCars(cs); };
  const deleteHotel = (i) => { const h=[...hotels]; h.splice(i,1); setHotels(h); setSelectedHotel(null); };
  const deleteCar = (i) => { const cs=[...cars]; cs.splice(i,1); setCars(cs); setSelectedCar(null); };

  const addHotel = () => {
    if(newHotel.name){ setHotels([...hotels,newHotel]); setNewHotel({name:"",type:"شقة",price:0,area:"",rooms:"",videoUrl:"",desc:""}); showSaved("تم إضافة مكان الإقامة"); }
  };
  const addCar = () => {
    if(newCar.name){ setCars([...cars,newCar]); setNewCar({name:"",type:"سيدان",price:0,seats:"",ac:"",imgUrl:"",desc:""}); showSaved("تم إضافة السيارة"); }
  };
  const showSaved = (msg) => { setSavedMsg(msg); setTimeout(()=>setSavedMsg(""),3000); };

  const uploadHotelVideo = async (i, file) => {
    setUploading(`hotel-${i}`);
    const url = await uploadToCloudinary(file);
    if(url) updateHotel(i,"videoUrl",url);
    setUploading("");
    showSaved("تم رفع الفيديو");
  };

  const uploadCarImg = async (i, file) => {
    setUploading(`car-${i}`);
    const url = await uploadToCloudinary(file);
    if(url) updateCar(i,"imgUrl",url);
    setUploading("");
    showSaved("تم رفع الصورة");
  };

  const uploadNewHotelVideo = async (file) => {
    setUploading("new-hotel");
    const url = await uploadToCloudinary(file);
    if(url) setNewHotel(h=>({...h,videoUrl:url}));
    setUploading("");
  };

  const uploadNewCarImg = async (file) => {
    setUploading("new-car");
    const url = await uploadToCloudinary(file);
    if(url) setNewCar(c=>({...c,imgUrl:url}));
    setUploading("");
  };

  const S = {
    page: { minHeight:"100vh", background:"linear-gradient(180deg,#E8F5F0,#F0F8FF,#EBF5FB)", direction:"rtl", fontFamily:"Cairo,Tajawal,Arial,sans-serif", color:"#1A3A4A" },
    adminBar: { background:"#1A3A4A", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    header: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", padding:"40px 20px", textAlign:"center" },
    wrap: { maxWidth:640, margin:"0 auto", padding:"24px 16px" },
    section: { background:"#fff", borderRadius:20, padding:24, marginBottom:20, boxShadow:"0 4px 20px rgba(26,127,168,0.1)", border:"1px solid #C8E8F4" },
    secTitle: { fontSize:18, fontWeight:800, color:"#1A7FA8", marginBottom:8, display:"flex", alignItems:"center", gap:8 },
    secDesc: { fontSize:13, color:"#5A8A9A", marginBottom:14 },
    inp: { width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #B8E0F0", fontSize:13, color:"#1A3A4A", background:"#F0FBFF", outline:"none", fontFamily:"inherit", boxSizing:"border-box", marginBottom:8 },
    ta: { width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #B8E0F0", fontSize:14, color:"#1A3A4A", background:"#F0FBFF", outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" },
    uploadBox: { border:"2px dashed #2EAE8A", borderRadius:16, padding:28, textAlign:"center", cursor:"pointer", background:"#F0FBF7", marginBottom:8 },
    uploadBtn: { border:"2px dashed #1A7FA8", borderRadius:10, padding:"10px 16px", textAlign:"center", cursor:"pointer", background:"#EBF6FF", marginBottom:8, fontSize:13, color:"#1A7FA8", fontWeight:700 },
    card: (sel,color) => ({ border:`2px solid ${sel?color:"#C8E8F4"}`, borderRadius:16, overflow:"hidden", marginBottom:14, background:sel?`${color}10`:"#fff", cursor:"pointer", boxShadow:sel?`0 4px 16px ${color}30`:"none" }),
    badge: (color) => ({ background:`${color}20`, color, borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:700, display:"inline-block", marginBottom:6 }),
    payCard: (sel) => ({ display:"flex", alignItems:"center", gap:14, padding:16, borderRadius:14, border:`2px solid ${sel?"#1A7FA8":"#C8E8F4"}`, cursor:"pointer", background:sel?"#EBF6FF":"#fff", marginBottom:10 }),
    btn: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", color:"#fff", border:"none", borderRadius:14, padding:"14px 28px", fontSize:16, fontWeight:800, cursor:"pointer", width:"100%", marginTop:8 },
    btnSm: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" },
    btnDel: { background:"#FF4444", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" },
    btnSave: { background:"#2EAE8A", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" },
    adminSection: { background:"#F8FFFE", border:"2px dashed #2EAE8A", borderRadius:16, padding:16, marginBottom:12 },
    totalBox: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", borderRadius:16, padding:20, textAlign:"center", marginBottom:16 },
    paymentCard: { background:"#fff", borderRadius:16, padding:20, border:"2px solid #C8E8F4", marginBottom:12 },
  };

  return (
    <div style={S.page}>

      {isAdmin && (
        <div style={S.adminBar}>
          <span style={{color:"#2EAE8A",fontWeight:700,fontSize:14}}>👑 لوحة الإدارة</span>
          <button style={S.btnSm} onClick={()=>setAdminMode(v=>!v)}>
            {adminMode?"🔒 إغلاق التحرير":"✏️ تحرير المحتوى"}
          </button>
        </div>
      )}

      {savedMsg && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:"#2EAE8A",color:"#fff",padding:"12px 24px",borderRadius:12,zIndex:9999,fontWeight:700,fontSize:14,boxShadow:"0 4px 20px rgba(46,174,138,0.4)"}}>
          ✓ {savedMsg}
        </div>
      )}

      <div style={S.header}>
        <div style={{fontSize:56}}>🏥</div>
        <h1 style={{color:"#fff",fontSize:26,fontWeight:800,margin:"10px 0 6px"}}>مركز استشارات السياحة العلاجية في مصر</h1>
        <p style={{color:"rgba(255,255,255,0.9)",fontSize:14,margin:0}}>نرحب بكم ونسعى لتقديم أفضل رعاية طبية متكاملة</p>
      </div>

      <div style={S.wrap}>

        {/* 1. Disease */}
        <div style={S.section}>
          <div style={S.secTitle}>📋 اكتب لنا عن حالتك الصحية</div>
          <div style={S.secDesc}>صف المرض أو الحالة بأكبر قدر من التفصيل</div>
          <textarea style={S.ta} rows={5} value={disease} onChange={e=>setDisease(e.target.value)} placeholder="مثال: أعاني من ألم مزمن في الركبة اليسرى منذ ٦ أشهر..." />
        </div>

        {/* 2. Upload */}
        <div style={S.section}>
          <div style={S.secTitle}>📄 ارفع ملفاتك الطبية</div>
          <div style={S.secDesc}>ارفع ملف PDF يحتوي على التقارير والأشعة والتحاليل كاملة</div>
          <label style={S.uploadBox}>
            <div style={{fontSize:48,marginBottom:8}}>{medFile?"✅":"📂"}</div>
            <div style={{color:"#1A7FA8",fontWeight:700}}>{medFile?medFile.name:"اضغط لرفع الملف الطبي"}</div>
            <div style={{color:"#5A8A9A",fontSize:12,marginTop:6}}>PDF فقط • الحد الأقصى 10MB</div>
            <input type="file" accept=".pdf" style={{display:"none"}} onChange={e=>setMedFile(e.target.files[0])} />
          </label>
          {medFile && <div style={{color:"#2EAE8A",fontSize:13,textAlign:"center"}}>✓ تم رفع الملف</div>}
        </div>

        {/* 3. Hotels */}
        <div style={S.section}>
          <div style={S.secTitle}>🏨 أماكن الإقامة خلال رحلة العلاج</div>
          <div style={S.secDesc}>اختر المكان المناسب • السعر بالجنيه للليلة</div>
          {hotels.map((h,i) => (
            <div key={i}>
              <div style={S.card(selectedHotel===i,"#1A7FA8")} onClick={()=>!adminMode&&setSelectedHotel(selectedHotel===i?null:i)}>
                {h.videoUrl
                  ? <video src={h.videoUrl} style={{width:"100%",height:180,objectFit:"cover",display:"block"}} controls onClick={e=>e.stopPropagation()} />
                  : <div style={{width:"100%",height:120,background:"linear-gradient(135deg,#C8E8F4,#E8F5F0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🏨</div>
                }
                <div style={{padding:16}}>
                  <span style={S.badge("#1A7FA8")}>{h.type} • {h.area}</span>
                  <div style={{color:"#1A3A4A",fontWeight:800,fontSize:16,marginBottom:4}}>{h.name}</div>
                  <div style={{color:"#5A8A9A",fontSize:13,marginBottom:10,lineHeight:1.6}}>{h.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{color:"#5A8A9A",fontSize:13}}>🛏️ {h.rooms}</div>
                    <div style={{color:"#1A7FA8",fontWeight:800,fontSize:16}}>{h.price.toLocaleString()} جنيه/ليلة</div>
                  </div>
                  {selectedHotel===i && <div style={{color:"#2EAE8A",fontWeight:700,marginTop:8,textAlign:"center"}}>✓ تم الاختيار</div>}
                </div>
              </div>
              {adminMode && (
                <div style={S.adminSection}>
                  <div style={{fontWeight:700,color:"#1A7FA8",marginBottom:10}}>✏️ تعديل: {h.name}</div>
                  <input style={S.inp} placeholder="اسم المكان" value={h.name} onChange={e=>updateHotel(i,"name",e.target.value)} />
                  <input style={S.inp} placeholder="رابط الفيديو (اختياري)" value={h.videoUrl} onChange={e=>updateHotel(i,"videoUrl",e.target.value)} />
                  <label style={S.uploadBtn}>
                    {uploading===`hotel-${i}` ? "⏳ جاري الرفع..." : "📹 أو ارفع فيديو من جهازك"}
                    <input type="file" accept="video/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadHotelVideo(i,e.target.files[0])} />
                  </label>
                  <input style={S.inp} placeholder="المنطقة" value={h.area} onChange={e=>updateHotel(i,"area",e.target.value)} />
                  <input style={S.inp} placeholder="عدد الغرف" value={h.rooms} onChange={e=>updateHotel(i,"rooms",e.target.value)} />
                  <input style={S.inp} type="number" placeholder="السعر/ليلة" value={h.price} onChange={e=>updateHotel(i,"price",e.target.value)} />
                  <textarea style={{...S.ta,marginBottom:8}} rows={2} placeholder="الوصف" value={h.desc} onChange={e=>updateHotel(i,"desc",e.target.value)} />
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <button style={S.btnSave} onClick={()=>showSaved("تم حفظ التعديلات")}>💾 حفظ</button>
                    <button style={S.btnDel} onClick={()=>deleteHotel(i)}>🗑️ حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {adminMode && (
            <div style={{...S.adminSection,border:"2px dashed #1A7FA8"}}>
              <div style={{fontWeight:700,color:"#1A7FA8",marginBottom:10}}>➕ إضافة مكان إقامة جديد</div>
              <input style={S.inp} placeholder="اسم المكان" value={newHotel.name} onChange={e=>setNewHotel({...newHotel,name:e.target.value})} />
              <input style={S.inp} placeholder="رابط الفيديو (اختياري)" value={newHotel.videoUrl} onChange={e=>setNewHotel({...newHotel,videoUrl:e.target.value})} />
              <label style={S.uploadBtn}>
                {uploading==="new-hotel" ? "⏳ جاري الرفع..." : "📹 أو ارفع فيديو من جهازك"}
                <input type="file" accept="video/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadNewHotelVideo(e.target.files[0])} />
              </label>
              {newHotel.videoUrl && <div style={{color:"#2EAE8A",fontSize:12,marginBottom:8}}>✓ تم رفع الفيديو</div>}
              <input style={S.inp} placeholder="المنطقة" value={newHotel.area} onChange={e=>setNewHotel({...newHotel,area:e.target.value})} />
              <input style={S.inp} placeholder="عدد الغرف" value={newHotel.rooms} onChange={e=>setNewHotel({...newHotel,rooms:e.target.value})} />
              <input style={S.inp} type="number" placeholder="السعر/ليلة" value={newHotel.price} onChange={e=>setNewHotel({...newHotel,price:Number(e.target.value)})} />
              <textarea style={{...S.ta,marginBottom:8}} rows={2} placeholder="الوصف" value={newHotel.desc} onChange={e=>setNewHotel({...newHotel,desc:e.target.value})} />
              <button style={S.btnSm} onClick={addHotel}>➕ إضافة وحفظ</button>
            </div>
          )}
        </div>

        {/* 4. Cars */}
        <div style={S.section}>
          <div style={S.secTitle}>🚗 اختر وسيلة النقل</div>
          <div style={S.secDesc}>نوفر لك أفضل السيارات للتنقل بكل راحة وأمان</div>
          {cars.map((car,i) => (
            <div key={i}>
              <div style={S.card(selectedCar===i,"#2EAE8A")} onClick={()=>!adminMode&&setSelectedCar(selectedCar===i?null:i)}>
                {car.imgUrl
                  ? <img src={car.imgUrl} alt={car.name} style={{width:"100%",height:180,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"} />
                  : <div style={{width:"100%",height:120,background:"linear-gradient(135deg,#E8F5F0,#C8E8F4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🚗</div>
                }
                <div style={{padding:16}}>
                  <span style={S.badge("#2EAE8A")}>{car.type}</span>
                  <div style={{color:"#1A3A4A",fontWeight:800,fontSize:16,marginBottom:4}}>{car.name}</div>
                  <div style={{color:"#5A8A9A",fontSize:13,marginBottom:10,lineHeight:1.6}}>{car.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{color:"#5A8A9A",fontSize:13}}>👥 {car.seats} • {car.ac}</div>
                    <div style={{color:"#2EAE8A",fontWeight:800,fontSize:16}}>{car.price.toLocaleString()} جنيه/يوم</div>
                  </div>
                  {selectedCar===i && <div style={{color:"#1A7FA8",fontWeight:700,marginTop:8,textAlign:"center"}}>✓ تم الاختيار</div>}
                </div>
              </div>
              {adminMode && (
                <div style={S.adminSection}>
                  <div style={{fontWeight:700,color:"#2EAE8A",marginBottom:10}}>✏️ تعديل: {car.name}</div>
                  <input style={S.inp} placeholder="اسم السيارة" value={car.name} onChange={e=>updateCar(i,"name",e.target.value)} />
                  <input style={S.inp} placeholder="رابط الصورة (اختياري)" value={car.imgUrl} onChange={e=>updateCar(i,"imgUrl",e.target.value)} />
                  <label style={S.uploadBtn}>
                    {uploading===`car-${i}` ? "⏳ جاري الرفع..." : "🖼️ أو ارفع صورة من جهازك"}
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadCarImg(i,e.target.files[0])} />
                  </label>
                  <input style={S.inp} placeholder="النوع" value={car.type} onChange={e=>updateCar(i,"type",e.target.value)} />
                  <input style={S.inp} placeholder="عدد المقاعد" value={car.seats} onChange={e=>updateCar(i,"seats",e.target.value)} />
                  <input style={S.inp} placeholder="المميزات" value={car.ac} onChange={e=>updateCar(i,"ac",e.target.value)} />
                  <input style={S.inp} type="number" placeholder="السعر/يوم" value={car.price} onChange={e=>updateCar(i,"price",e.target.value)} />
                  <textarea style={{...S.ta,marginBottom:8}} rows={2} placeholder="الوصف" value={car.desc} onChange={e=>updateCar(i,"desc",e.target.value)} />
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <button style={S.btnSave} onClick={()=>showSaved("تم حفظ التعديلات")}>💾 حفظ</button>
                    <button style={S.btnDel} onClick={()=>deleteCar(i)}>🗑️ حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {adminMode && (
            <div style={{...S.adminSection,border:"2px dashed #2EAE8A"}}>
              <div style={{fontWeight:700,color:"#2EAE8A",marginBottom:10}}>➕ إضافة سيارة جديدة</div>
              <input style={S.inp} placeholder="اسم السيارة" value={newCar.name} onChange={e=>setNewCar({...newCar,name:e.target.value})} />
              <input style={S.inp} placeholder="رابط الصورة (اختياري)" value={newCar.imgUrl} onChange={e=>setNewCar({...newCar,imgUrl:e.target.value})} />
              <label style={S.uploadBtn}>
                {uploading==="new-car" ? "⏳ جاري الرفع..." : "🖼️ أو ارفع صورة من جهازك"}
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadNewCarImg(e.target.files[0])} />
              </label>
              {newCar.imgUrl && <div style={{color:"#2EAE8A",fontSize:12,marginBottom:8}}>✓ تم رفع الصورة</div>}
              <input style={S.inp} placeholder="النوع" value={newCar.type} onChange={e=>setNewCar({...newCar,type:e.target.value})} />
              <input style={S.inp} placeholder="عدد المقاعد" value={newCar.seats} onChange={e=>setNewCar({...newCar,seats:e.target.value})} />
              <input style={S.inp} placeholder="المميزات" value={newCar.ac} onChange={e=>setNewCar({...newCar,ac:e.target.value})} />
              <input style={S.inp} type="number" placeholder="السعر/يوم" value={newCar.price} onChange={e=>setNewCar({...newCar,price:Number(e.target.value)})} />
              <textarea style={{...S.ta,marginBottom:8}} rows={2} placeholder="الوصف" value={newCar.desc} onChange={e=>setNewCar({...newCar,desc:e.target.value})} />
              <button style={S.btnSm} onClick={addCar}>➕ إضافة وحفظ</button>
            </div>
          )}
        </div>

        {/* 5. Payment */}
        <div style={S.section}>
          <div style={S.secTitle}>💳 دفع مقدم الحجز (١٠٪)</div>
          <div style={S.secDesc}>يُدفع مقدم ١٠٪ من إجمالي تكلفة الإقامة والنقل لتأكيد الحجز</div>

          {totalPrice > 0 && (
            <div style={S.totalBox}>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>إجمالي المقدم المطلوب (١٠٪)</div>
              <div style={{color:"#fff",fontSize:36,fontWeight:800,margin:"6px 0"}}>{totalPrice.toLocaleString()} جنيه</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:12}}>
                {selectedHotel!==null && `إقامة: ${hotels[selectedHotel].price.toLocaleString()} ج/ليلة`}
                {selectedHotel!==null && selectedCar!==null && " • "}
                {selectedCar!==null && `نقل: ${cars[selectedCar].price.toLocaleString()} ج/يوم`}
              </div>
            </div>
          )}

          {[
            {id:"paypal", icon:"🅿️", name:"PayPal", desc:"الدفع الدولي الآمن", detail:"PayPal.me/KemetMedical"},
            {id:"vodafone", icon:"📱", name:"Vodafone Cash", desc:"فودافون كاش", detail:"01XXXXXXXXX"},
            {id:"instapay", icon:"⚡", name:"InstaPay", desc:"إنستا باي - الدفع الفوري", detail:"@KemetMedical"},
          ].map(m=>(
            <div key={m.id}>
              <div style={S.payCard(payMethod===m.id)} onClick={()=>setPayMethod(payMethod===m.id?"":m.id)}>
                <span style={{fontSize:32}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:"#1A3A4A",fontWeight:700}}>{m.name}</div>
                  <div style={{color:"#5A8A9A",fontSize:12}}>{m.desc}</div>
                </div>
                {payMethod===m.id && <span style={{color:"#2EAE8A",fontSize:22}}>✓</span>}
              </div>
              {payMethod===m.id && (
                <div style={{background:"#EBF6FF",border:"1px solid #1A7FA8",borderRadius:12,padding:16,marginBottom:12,textAlign:"center"}}>
                  <div style={{color:"#1A7FA8",fontWeight:800,fontSize:15,marginBottom:6}}>{m.name}</div>
                  <div style={{color:"#1A3A4A",fontWeight:700,fontSize:18,marginBottom:8}}>{m.detail}</div>
                  {totalPrice > 0 && <div style={{color:"#2EAE8A",fontWeight:800,fontSize:16}}>المبلغ: {totalPrice.toLocaleString()} جنيه</div>}
                  <div style={{color:"#5A8A9A",fontSize:12,marginTop:8}}>بعد الدفع اضغط على زر التأكيد أدناه</div>
                </div>
              )}
            </div>
          ))}

          {!submitted
            ? <button style={S.btn} onClick={()=>{ if(disease.trim()&&payMethod) setSubmitted(true); }}>
                🏥 تأكيد الحجز وإرسال الطلب
              </button>
            : <div style={{background:"#F0FBF7",border:"2px solid #2EAE8A",borderRadius:20,padding:30,textAlign:"center",marginTop:8}}>
                <div style={{fontSize:56}}>🎉</div>
                <div style={{color:"#2EAE8A",fontWeight:800,fontSize:22,marginTop:10}}>تم إرسال طلبك بنجاح!</div>
                <div style={{color:"#1A3A4A",fontSize:14,marginTop:10,lineHeight:1.8}}>
                  سيتواصل معك فريقنا الطبي المتخصص خلال <strong>٢٤ ساعة</strong><br/>لتأكيد الحجز وترتيب كافة التفاصيل
                </div>
                <div style={{marginTop:16,color:"#1A7FA8",fontWeight:700,fontSize:16}}>📞 01000000000</div>
              </div>
          }
        </div>

      </div>
    </div>
  );
}