$file = ".\app.py"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# 1) Fix PUT allowed list
$oldAllowed = "allowed = ['title_ar','title_en','description_ar','description_en','price','duration_days','image_emoji','image_url','badge_ar','badge_en','includes_ar','includes_en','itinerary_ar','itinerary_en','seo_keywords','is_featured','category_id']"
$newAllowed = "allowed = ['title_ar','title_en','description_ar','description_en','price','duration_days','image_emoji','image_url','badge_ar','badge_en','includes_ar','includes_en','itinerary_ar','itinerary_en','seo_keywords','is_featured','category_id','gallery']"
if ($content.IndexOf($oldAllowed) -eq -1) { Write-Host "STEP1 NOT FOUND - allowed list"; exit }
$content = $content.Replace($oldAllowed, $newAllowed)

# 2) Fix POST INSERT column list
$oldCols = "includes_ar,includes_en,itinerary_ar,itinerary_en,seo_keywords,is_featured,is_active) VALUES"
$newCols = "includes_ar,includes_en,itinerary_ar,itinerary_en,seo_keywords,is_featured,gallery,is_active) VALUES"
if ($content.IndexOf($oldCols) -eq -1) { Write-Host "STEP2 NOT FOUND - column list"; exit }
$content = $content.Replace($oldCols, $newCols)

# 3) Fix POST VALUES placeholders (add one more %s before literal 1)
$oldPlaceholders = "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)"
$newPlaceholders = "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,1)"
if ($content.IndexOf($oldPlaceholders) -eq -1) { Write-Host "STEP3 NOT FOUND - placeholders"; exit }
$content = $content.Replace($oldPlaceholders, $newPlaceholders)

# 4) Fix POST tuple values (add gallery value at the end)
$oldTuple = "b.get('seo_keywords',''), b.get('is_featured',0)))"
$newTuple = "b.get('seo_keywords',''), b.get('is_featured',0), b.get('gallery','[]')))"
if ($content.IndexOf($oldTuple) -eq -1) { Write-Host "STEP4 NOT FOUND - tuple values"; exit }
$content = $content.Replace($oldTuple, $newTuple)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
Write-Host "Done - gallery added to backend POST and PUT"