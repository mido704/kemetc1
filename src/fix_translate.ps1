$file = "C:\Users\Maryam\Documents\GitHub\kemetc1\src\App.jsx"
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)
$newLines = [System.Collections.Generic.List[string]]::new($lines)
$newLine = "  const translateNews = async (newsItem, targetLang) => { setShowLangMenu(null); setTranslatingId(newsItem.id); try { const token=localStorage.getItem('kemet_token'); const r=await fetch('https://kemetc1-production.up.railway.app/api/translate',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({text:(lang==='ar'?newsItem.title_ar:newsItem.title_en)+' '+(lang==='ar'?newsItem.summary_ar:newsItem.summary_en),lang:targetLang})}); const d=await r.json(); console.log('TR:', JSON.stringify(d)); if(d.ok) setTranslatedNews(prev=>({...prev,[newsItem.id]:d.data?.translated||''})); } catch(e){ console.error('TR ERR:', e); } setTranslatingId(null); };"
$newLines[904] = $newLine
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($file, $newLines.ToArray(), $utf8NoBom)
Write-Host "Done"