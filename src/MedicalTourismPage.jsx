import { useState, useRef } from "react";

export default function MedicalTourismPage() {
  const [disease, setDisease] = useState("");
  const [medFile, setMedFile] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [payMethod, setPayMethod] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const hotels = [
    { name: "شقة فندقية نيل تاور", type: "شقة", price: 2500, area: "وسط القاهرة", rooms: "٢ غرفة", video: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "شقة فاخرة مطلة على النيل، مجهزة بالكامل، قريبة من أكبر المستشفيات التخصصية في القاهرة." },
    { name: "فندق القاهرة الكبير", type: "فندق", price: 3500, area: "المهندسين", rooms: "غرفة فاخرة", video: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "فندق خمس نجوم بخدمات متكاملة، على بُعد دقائق من المستشفى التخصصي للجراحة." },
    { name: "شقة مصر الجديدة", type: "شقة", price: 1800, area: "مصر الجديدة", rooms: "٣ غرف", video: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "شقة هادئة في حي راقٍ، مناسبة للعائلات، بالقرب من مستشفى الشيخ زايد." },
  ];

  const cars = [
    { name: "تويوتا كامري", type: "سيدان فاخرة", price: 800, seats: "٥ مقاعد", ac: "تكييف مزدوج", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500", desc: "سيارة مريحة وموثوقة، مثالية للتنقل اليومي بين الإقامة والمستشفى." },
    { name: "هيونداي H1", type: "ميني فان عائلية", price: 1200, seats: "٨ مقاعد", ac: "تكييف قوي", img: "https://images.unsplash.com/photo-1609520778520-b39f89a634a7?w=500", desc: "مثالية للعائلات الكبيرة، مساحة واسعة للأمتعة والمرضى." },
    { name: "مرسيدس E-Class", type: "VIP فاخرة", price: 2000, seats: "٤ مقاعد", ac: "تكييف + واي فاي", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500", desc: "أرقى وسائل النقل لمن يستحق الفخامة أثناء رحلة علاجه." },
  ];

  const totalPrice = selectedHotel !== null && selectedCar !== null
    ? Math.round((hotels[selectedHotel].price + cars[selectedCar].price) * 0.1)
    : selectedHotel !== null
    ? Math.round(hotels[selectedHotel].price * 0.1)
    : selectedCar !== null
    ? Math.round(cars[selectedCar].price * 0.1)
    : 0;

  const c = {
    page: { minHeight:"100vh", background:"linear-gradient(180deg,#E8F5F0 0%,#F0F8FF 50%,#EBF5FB 100%)", direction:"rtl", fontFamily:"'Cairo','Tajawal',Arial,sans-serif", color:"#1A3A4A" },
    header: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", padding:"40px 20px", textAlign:"center" },
    h1: { color:"#fff", fontSize:26, fontWeight:800, margin:"10px 0 6px" },
    sub: { color:"rgba(255,255,255,0.9)", fontSize:14, margin:0 },
    wrap: { maxWidth:640, margin:"0 auto", padding:"24px 16px" },
    section: { background:"#fff", borderRadius:20, padding:24, marginBottom:20, boxShadow:"0 4px 20px rgba(26,127,168,0.1)", border:"1px solid #C8E8F4" },
    secTitle: { fontSize:18, fontWeight:800, color:"#1A7FA8", marginBottom:8, display:"flex", alignItems:"center", gap:8 },
    secDesc: { fontSize:13, color:"#5A8A9A", marginBottom:14 },
    textarea: { width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #B8E0F0", fontSize:14, color:"#1A3A4A", background:"#F0FBFF", outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" },
    uploadBox: { border:"2px dashed #2EAE8A", borderRadius:16, padding:28, textAlign:"center", cursor:"pointer", background:"#F0FBF7", marginBottom:8 },
    hotelCard: (sel) => ({ border:`2px solid ${sel?"#1A7FA8":"#C8E8F4"}`, borderRadius:16, overflow:"hidden", marginBottom:14, background:sel?"#EBF6FF":"#fff", transition:"all 0.2s", cursor:"pointer", boxShadow: sel?"0 4px 16px rgba(26,127,168,0.2)":"none" }),
    carCard: (sel) => ({ border:`2px solid ${sel?"#2EAE8A":"#C8E8F4"}`, borderRadius:16, overflow:"hidden", marginBottom:14, background:sel?"#F0FBF7":"#fff", transition:"all 0.2s", cursor:"pointer", boxShadow: sel?"0 4px 16px rgba(46,174,138,0.2)":"none" }),
    badge: (color) => ({ background:`${color}20`, color:color, borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:700, display:"inline-block", marginBottom:6 }),
    price: (color) => ({ color:color, fontWeight:800, fontSize:16 }),
    payCard: (sel) => ({ display:"flex", alignItems:"center", gap:14, padding:16, borderRadius:14, border:`2px solid ${sel?"#1A7FA8":"#C8E8F4"}`, cursor:"pointer", background:sel?"#EBF6FF":"#fff", marginBottom:10, transition:"all 0.2s" }),
    btn: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", color:"#fff", border:"none", borderRadius:14, padding:"14px 28px", fontSize:16, fontWeight:800, cursor:"pointer", width:"100%", marginTop:8, letterSpacing:0.5 },
    totalBox: { background:"linear-gradient(135deg,#1A7FA8,#2EAE8A)", borderRadius:16, padding:20, textAlign:"center", marginBottom:20 },
  };

  return (
    <div style={c.page}>
      <div style={c.header}>
        <div style={{fontSize:56}}>🏥</div>
        <h1 style={c.h1}>مركز استشارات السياحة العلاجية في مصر</h1>
        <p style={c.sub}>نرحب بكم ونسعى لتقديم أفضل رعاية طبية متكاملة لشفائكم التام</p>
      </div>

      <div style={c.wrap}>

        {/* 1. Disease */}
        <div style={c.section}>
          <div style={c.secTitle}>📋 اكتب لنا عن حالتك الصحية</div>
          <div style={c.secDesc}>صف المرض أو الحالة التي تحتاج إلى علاج أو استشارة طبية بأكبر قدر من التفصيل</div>
          <textarea style={c.textarea} rows={5} value={disease} onChange={e=>setDisease(e.target.value)} placeholder="مثال: أعاني من ألم مزمن في الركبة اليسرى منذ ٦ أشهر، وقد أجريت أشعة سينية تظهر تآكلاً في الغضروف..." />
        </div>

        {/* 2. Upload */}
        <div style={c.section}>
          <div style={c.secTitle}>📄 ارفع ملفاتك الطبية</div>
          <div style={c.secDesc}>ارفع ملف PDF يحتوي على التقارير الطبية والأشعة والتحاليل كاملة لمساعدة الطبيب في تقييم حالتك بدقة</div>
          <label style={c.uploadBox}>
            <div style={{fontSize:48, marginBottom:8}}>{medFile ? "✅" : "📂"}</div>
            <div style={{color:"#1A7FA8", fontWeight:700, fontSize:15}}>{medFile ? medFile.name : "اضغط هنا لرفع الملف الطبي"}</div>
            <div style={{color:"#5A8A9A", fontSize:12, marginTop:6}}>يقبل ملفات PDF فقط • الحد الأقصى 10MB</div>
            <input type="file" accept=".pdf" style={{display:"none"}} onChange={e=>setMedFile(e.target.files[0])} />
          </label>
          {medFile && <div style={{color:"#2EAE8A", fontSize:13, textAlign:"center"}}>✓ تم رفع الملف بنجاح</div>}
        </div>

        {/* 3. Hotels */}
        <div style={c.section}>
          <div style={c.secTitle}>🏨 أماكن الإقامة خلال رحلة العلاج</div>
          <div style={c.secDesc}>اختر المكان المناسب لك ولعائلتك أثناء فترة العلاج • السعر بالجنيه المصري للليلة</div>
          {hotels.map((h,i) => (
            <div key={i} style={c.hotelCard(selectedHotel===i)} onClick={()=>setSelectedHotel(i)}>
              <video src={h.video} style={{width:"100%", height:180, objectFit:"cover", display:"block"}} controls poster="" />
              <div style={{padding:16}}>
                <span style={c.badge("#1A7FA8")}>{h.type} • {h.area}</span>
                <div style={{color:"#1A3A4A", fontWeight:800, fontSize:16, marginBottom:4}}>{h.name}</div>
                <div style={{color:"#5A8A9A", fontSize:13, marginBottom:10, lineHeight:1.6}}>{h.desc}</div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div style={{color:"#5A8A9A", fontSize:13}}>🛏️ {h.rooms}</div>
                  <div style={c.price("#1A7FA8")}>{h.price.toLocaleString()} جنيه/ليلة</div>
                </div>
                {selectedHotel===i && <div style={{color:"#2EAE8A", fontWeight:700, marginTop:8, textAlign:"center"}}>✓ تم الاختيار</div>}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Cars */}
        <div style={c.section}>
          <div style={c.secTitle}>🚗 اختر وسيلة النقل المناسبة</div>
          <div style={c.secDesc}>نوفر لك أفضل السيارات للتنقل بين مكان إقامتك والمستشفى بكل راحة وأمان</div>
          {cars.map((car,i) => (
            <div key={i} style={c.carCard(selectedCar===i)} onClick={()=>setSelectedCar(i)}>
              <img src={car.img} alt={car.name} style={{width:"100%", height:180, objectFit:"cover", display:"block"}} onError={e=>e.target.style.display='none'} />
              <div style={{padding:16}}>
                <span style={c.badge("#2EAE8A")}>{car.type}</span>
                <div style={{color:"#1A3A4A", fontWeight:800, fontSize:16, marginBottom:4}}>{car.name}</div>
                <div style={{color:"#5A8A9A", fontSize:13, marginBottom:10, lineHeight:1.6}}>{car.desc}</div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div style={{color:"#5A8A9A", fontSize:13}}>👥 {car.seats} • {car.ac}</div>
                  <div style={c.price("#2EAE8A")}>{car.price.toLocaleString()} جنيه/يوم</div>
                </div>
                {selectedCar===i && <div style={{color:"#1A7FA8", fontWeight:700, marginTop:8, textAlign:"center"}}>✓ تم الاختيار</div>}
              </div>
            </div>
          ))}
        </div>

        {/* 5. Payment */}
        <div style={c.section}>
          <div style={c.secTitle}>💳 دفع مقدم الحجز (١٠٪)</div>
          <div style={c.secDesc}>يُدفع مقدم بنسبة ١٠٪ من إجمالي تكلفة الإقامة ووسيلة النقل المختارة لتأكيد الحجز</div>

          {totalPrice > 0 && (
            <div style={c.totalBox}>
              <div style={{color:"rgba(255,255,255,0.8)", fontSize:13}}>إجمالي المقدم المطلوب (١٠٪)</div>
              <div style={{color:"#fff", fontSize:32, fontWeight:800, margin:"6px 0"}}>{totalPrice.toLocaleString()} جنيه</div>
              <div style={{color:"rgba(255,255,255,0.8)", fontSize:12}}>
                {selectedHotel!==null && `إقامة: ${hotels[selectedHotel].price.toLocaleString()} جنيه/ليلة`}
                {selectedHotel!==null && selectedCar!==null && " • "}
                {selectedCar!==null && `نقل: ${cars[selectedCar].price.toLocaleString()} جنيه/يوم`}
              </div>
            </div>
          )}

          {[
            {id:"paypal", icon:"🅿️", name:"PayPal", desc:"الدفع الدولي الآمن"},
            {id:"vodafone", icon:"📱", name:"Vodafone Cash", desc:"فودافون كاش"},
            {id:"instapay", icon:"⚡", name:"InstaPay", desc:"إنستا باي - الدفع الفوري"},
          ].map(m => (
            <div key={m.id} style={c.payCard(payMethod===m.id)} onClick={()=>setPayMethod(m.id)}>
              <span style={{fontSize:32}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:"#1A3A4A", fontWeight:700}}>{m.name}</div>
                <div style={{color:"#5A8A9A", fontSize:12}}>{m.desc}</div>
              </div>
              {payMethod===m.id && <span style={{color:"#2EAE8A", fontSize:22}}>✓</span>}
            </div>
          ))}

          {!submitted ? (
            <button style={c.btn} onClick={()=>{ if(disease.trim() && payMethod) setSubmitted(true); }}>
              🏥 تأكيد الحجز وإرسال الطلب
            </button>
          ) : (
            <div style={{background:"linear-gradient(135deg,#2EAE8A20,#1A7FA820)", border:"2px solid #2EAE8A", borderRadius:20, padding:30, textAlign:"center", marginTop:8}}>
              <div style={{fontSize:56}}>🎉</div>
              <div style={{color:"#2EAE8A", fontWeight:800, fontSize:22, marginTop:10}}>تم إرسال طلبك بنجاح!</div>
              <div style={{color:"#1A3A4A", fontSize:14, marginTop:10, lineHeight:1.8}}>
                سيتواصل معك فريقنا الطبي المتخصص خلال <strong>٢٤ ساعة</strong><br/>
                لتأكيد الحجز وترتيب كافة التفاصيل
              </div>
              <div style={{marginTop:16, color:"#1A7FA8", fontWeight:700, fontSize:15}}>📞 01000000000</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}