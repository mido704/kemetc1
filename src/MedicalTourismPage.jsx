import { useState } from "react";

export default function MedicalTourismPage({ lang, onBack }) {
  const [step, setStep] = useState(1);
  const [disease, setDisease] = useState("");
  const [file, setFile] = useState(null);
  const [payMethod, setPayMethod] = useState("");

  const hotels = [
    { name: "شقة فندقية نيل تاور", type: "شقة", price: "٢٥٠٠ جنيه/ليلة", img: "🏢", rooms: "٢ غرفة", area: "وسط القاهرة" },
    { name: "فندق القاهرة الكبير", type: "فندق", price: "٣٥٠٠ جنيه/ليلة", img: "🏨", rooms: "غرفة فاخرة", area: "المهندسين" },
    { name: "شقة مصر الجديدة", type: "شقة", price: "١٨٠٠ جنيه/ليلة", img: "🏠", rooms: "٣ غرف", area: "مصر الجديدة" },
  ];

  const cars = [
    { name: "تويوتا كامري", type: "سيدان فاخرة", price: "٨٠٠ جنيه/يوم", img: "🚗", seats: "٥ مقاعد", ac: "تكييف" },
    { name: "هيونداي H1", type: "ميني فان", price: "١٢٠٠ جنيه/يوم", img: "🚐", seats: "٨ مقاعد", ac: "تكييف" },
    { name: "مرسيدس E-Class", type: "فاخرة VIP", price: "٢٠٠٠ جنيه/يوم", img: "🚙", seats: "٤ مقاعد", ac: "تكييف + واي فاي" },
  ];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px", direction: "rtl", fontFamily: "inherit" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--gd)", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← رجوع</button>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40 }}>🏥</div>
        <h1 style={{ color: "var(--g)", fontSize: 22, fontWeight: 800, margin: "8px 0 4px" }}>مركز استشارات السياحة العلاجية في مصر</h1>
        <p style={{ color: "var(--gl)", fontSize: 14 }}>نرحب بكم ونسعى لتقديم أفضل رعاية طبية</p>
        <div className="gdiv" style={{ margin: "16px auto", maxWidth: 200 }} />
      </div>

      {/* Steps indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {[1,2,3,4,5].map(s => (
          <div key={s} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: step >= s ? "var(--gd)" : "var(--bb)", color: step >= s ? "#000" : "var(--tm)", transition: "all 0.3s" }}>{s}</div>
        ))}
      </div>

      {/* Step 1: Disease */}
      {step === 1 && (
        <div style={{ background: "var(--bc)", border: "1px solid var(--bb)", borderRadius: 16, padding: 20 }}>
          <h2 style={{ color: "var(--g)", fontSize: 18, marginBottom: 8 }}>📋 اكتب لنا عن حالتك</h2>
          <p style={{ color: "var(--gl)", fontSize: 13, marginBottom: 16 }}>يرجى وصف المرض أو الحالة الصحية التي تحتاج إلى علاج</p>
          <textarea
            className="inp"
            rows={5}
            placeholder="مثال: أعاني من ألم في الركبة وأحتاج إلى استشارة طبية متخصصة..."
            value={disease}
            onChange={e => setDisease(e.target.value)}
            style={{ width: "100%", marginBottom: 16, resize: "vertical" }}
          />
          <button className="btn btn-g" style={{ width: "100%" }} onClick={() => disease.trim() && setStep(2)}>
            التالي ←
          </button>
        </div>
      )}

      {/* Step 2: Upload files */}
      {step === 2 && (
        <div style={{ background: "var(--bc)", border: "1px solid var(--bb)", borderRadius: 16, padding: 20 }}>
          <h2 style={{ color: "var(--g)", fontSize: 18, marginBottom: 8 }}>📄 ارفع ملفاتك الطبية</h2>
          <p style={{ color: "var(--gl)", fontSize: 13, marginBottom: 16 }}>ارفع ملف PDF يحتوي على التقارير الطبية والأشعات والتحاليل</p>
          <label style={{ display: "block", border: "2px dashed var(--gd)", borderRadius: 12, padding: 30, textAlign: "center", cursor: "pointer", marginBottom: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
            <div style={{ color: "var(--g)", fontWeight: 700 }}>{file ? file.name : "اضغط لرفع الملف"}</div>
            <div style={{ color: "var(--tm)", fontSize: 12, marginTop: 4 }}>PDF - حد أقصى 10MB</div>
            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-gh" style={{ flex: 1 }} onClick={() => setStep(1)}>← السابق</button>
            <button className="btn btn-g" style={{ flex: 2 }} onClick={() => setStep(3)}>
              {file ? "التالي ←" : "تخطي →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div style={{ background: "var(--bc)", border: "1px solid var(--bb)", borderRadius: 16, padding: 20 }}>
          <h2 style={{ color: "var(--g)", fontSize: 18, marginBottom: 8 }}>💳 دفع مقدم الاستشارة</h2>
          <p style={{ color: "var(--gl)", fontSize: 13, marginBottom: 16 }}>اختر طريقة الدفع المناسبة لك</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { id: "paypal", icon: "🅿️", name: "PayPal", desc: "الدفع الدولي" },
              { id: "vodafone", icon: "📱", name: "Vodafone Cash", desc: "01XXXXXXXXX" },
              { id: "instapay", icon: "⚡", name: "InstaPay", desc: "الدفع الفوري" },
            ].map(m => (
              <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: `2px solid ${payMethod === m.id ? "var(--gd)" : "var(--bb)"}`, cursor: "pointer", background: payMethod === m.id ? "rgba(201,168,76,0.1)" : "transparent" }}>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <div>
                  <div style={{ color: "var(--g)", fontWeight: 700 }}>{m.name}</div>
                  <div style={{ color: "var(--tm)", fontSize: 12 }}>{m.desc}</div>
                </div>
                {payMethod === m.id && <span style={{ marginRight: "auto", color: "var(--gd)" }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-gh" style={{ flex: 1 }} onClick={() => setStep(2)}>← السابق</button>
            <button className="btn btn-g" style={{ flex: 2 }} onClick={() => payMethod && setStep(4)}>تأكيد الدفع ←</button>
          </div>
        </div>
      )}

      {/* Step 4: Accommodation */}
      {step === 4 && (
        <div style={{ background: "var(--bc)", border: "1px solid var(--bb)", borderRadius: 16, padding: 20 }}>
          <h2 style={{ color: "var(--g)", fontSize: 18, marginBottom: 16 }}>🏨 احجز مكان الإقامة</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {hotels.map((h, i) => (
              <div key={i} style={{ border: "1px solid var(--bb)", borderRadius: 12, padding: 14, cursor: "pointer" }} onClick={() => setStep(5)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{h.img}</span>
                  <div>
                    <div style={{ color: "var(--g)", fontWeight: 700 }}>{h.name}</div>
                    <div style={{ color: "var(--gd)", fontSize: 12 }}>{h.type} - {h.area}</div>
                  </div>
                  <div style={{ marginRight: "auto", textAlign: "left" }}>
                    <div style={{ color: "var(--gd)", fontWeight: 700, fontSize: 13 }}>{h.price}</div>
                    <div style={{ color: "var(--tm)", fontSize: 11 }}>{h.rooms}</div>
                  </div>
                </div>
                <button className="btn btn-g" style={{ width: "100%", fontSize: 13 }}>احجز الآن</button>
              </div>
            ))}
          </div>
          <button className="btn btn-gh" style={{ width: "100%" }} onClick={() => setStep(3)}>← السابق</button>
        </div>
      )}

      {/* Step 5: Car */}
      {step === 5 && (
        <div style={{ background: "var(--bc)", border: "1px solid var(--bb)", borderRadius: 16, padding: 20 }}>
          <h2 style={{ color: "var(--g)", fontSize: 18, marginBottom: 16 }}>🚗 احجز سيارة خاصة</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {cars.map((c, i) => (
              <div key={i} style={{ border: "1px solid var(--bb)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{c.img}</span>
                  <div>
                    <div style={{ color: "var(--g)", fontWeight: 700 }}>{c.name}</div>
                    <div style={{ color: "var(--gd)", fontSize: 12 }}>{c.type}</div>
                  </div>
                  <div style={{ marginRight: "auto", textAlign: "left" }}>
                    <div style={{ color: "var(--gd)", fontWeight: 700, fontSize: 13 }}>{c.price}</div>
                    <div style={{ color: "var(--tm)", fontSize: 11 }}>{c.seats} | {c.ac}</div>
                  </div>
                </div>
                <button className="btn btn-g" style={{ width: "100%", fontSize: 13 }}>احجز السيارة</button>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid var(--gd)", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 30 }}>✅</div>
            <div style={{ color: "var(--g)", fontWeight: 700, marginTop: 8 }}>شكراً لك!</div>
            <div style={{ color: "var(--gl)", fontSize: 13, marginTop: 4 }}>سيتواصل معك فريقنا خلال ٢٤ ساعة</div>
          </div>
          <button className="btn btn-gh" style={{ width: "100%" }} onClick={() => setStep(4)}>← السابق</button>
        </div>
      )}
    </div>
  );
}