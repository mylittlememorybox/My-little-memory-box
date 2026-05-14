"use client";


import { useState, useEffect, useRef, useCallback } from “react”;
import Link from “next/link”;
import { createClient } from “@supabase/supabase-js”;

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGES = [
{ key: “cover”, title: “Εξώφυλλο” },
{ key: “first_moments”, title: “Οι πρώτες σου στιγμές” },
{ key: “your_world”, title: “Ο κόσμος σου” },
{ key: “first_achievements”, title: “Οι πρώτες σου κατακτήσεις” },
{ key: “first_steps”, title: “Τα πρώτα σου βήματα” },
{ key: “moments”, title: “Στιγμές που με έκανες να νιώθω τα πάντα” },
{ key: “hard_days”, title: “Οι μέρες που δεν ήταν εύκολες” },
{ key: “personality”, title: “Η προσωπικότητά σου” },
{ key: “birthdays”, title: “Τα γενέθλιά σου” },
{ key: “school”, title: “Η πρώτη σου μέρα στο σχολείο” },
{ key: “when_you_grow”, title: “Για σένα όταν μεγαλώσεις” },
{ key: “letter”, title: “Ένα γράμμα για σένα” },
];

interface TextFieldProps {
pageKey: string;
fieldKey: string;
placeholder: string;
multiline?: boolean;
value: string;
onChange: (pageKey: string, fieldKey: string, value: string) => void;
}

function TextField({ pageKey, fieldKey, placeholder, multiline = false, value, onChange }: TextFieldProps) {
const [localValue, setLocalValue] = useState(value);
const timerRef = useRef<any>(null);

useEffect(() => {
setLocalValue(value);
}, [value]);

const handleChange = (newValue: string) => {
setLocalValue(newValue);
if (timerRef.current) clearTimeout(timerRef.current);
timerRef.current = setTimeout(() => {
onChange(pageKey, fieldKey, newValue);
}, 1000);
};

const baseClass = “w-full bg-transparent border-b-2 border-dotted border-[#C4A882] text-[#5C3820] font-light text-sm focus:outline-none focus:border-[#8B5E3C] placeholder-[#C4A882] py-1 resize-none”;

if (multiline) {
return (
<textarea
value={localValue}
onChange={(e) => handleChange(e.target.value)}
placeholder={placeholder}
rows={3}
className={baseClass}
/>
);
}

return (
<input
type=“text”
value={localValue}
onChange={(e) => handleChange(e.target.value)}
placeholder={placeholder}
className={baseClass}
/>
);
}

export default function MemoryBookPage({ params }: { params: { id: string } }) {
const [currentPage, setCurrentPage] = useState(0);
const [data, setData] = useState<Record<string, Record<string, string>>>({});
const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
const [flipping, setFlipping] = useState(false);

useEffect(() => {
loadData();
}, []);

const loadData = async () => {
const { data: boxData } = await supabase
.from(“memory_box_data”)
.select(”*”)
.eq(“memory_box_id”, params.id);

```
if (boxData) {
  const organized: Record<string, Record<string, string>> = {};
  boxData.forEach((item: any) => {
    if (!organized[item.page_key]) organized[item.page_key] = {};
    organized[item.page_key][item.field_key] = item.field_value;
  });
  setData(organized);
}

const { data: photoData } = await supabase
  .from("memory_box_photos")
  .select("*")
  .eq("memory_box_id", params.id);

if (photoData) {
  const organizedPhotos: Record<string, Record<string, string>> = {};
  photoData.forEach((item: any) => {
    if (!organizedPhotos[item.page_key]) organizedPhotos[item.page_key] = {};
    organizedPhotos[item.page_key][item.photo_key] = item.photo_url;
  });
  setPhotos(organizedPhotos);
}
```

};

const saveField = useCallback(async (pageKey: string, fieldKey: string, value: string) => {
setData(prev => {
const newData = { …prev };
if (!newData[pageKey]) newData[pageKey] = {};
newData[pageKey][fieldKey] = value;
return newData;
});

```
await supabase.from("memory_box_data").upsert({
  memory_box_id: params.id,
  page_key: pageKey,
  field_key: fieldKey,
  field_value: value,
  updated_at: new Date().toISOString(),
}, { onConflict: "memory_box_id,page_key,field_key" });
```

}, [params.id]);

// ✅ ΔΙΟΡΘΩΣΗ: Αφαιρέθηκε ο έλεγχος user - επιτρέπει upload χωρίς login
const uploadPhoto = async (pageKey: string, photoKey: string, file: File) => {
const fileName = `${params.id}/${pageKey}/${photoKey}_${Date.now()}`;
const { data: uploadData, error } = await supabase.storage
.from(“memory-box-photos”)
.upload(fileName, file, { upsert: true });

```
if (!error && uploadData) {
  const { data: urlData } = supabase.storage
    .from("memory-box-photos")
    .getPublicUrl(fileName);

  const photoUrl = urlData.publicUrl;

  await supabase.from("memory_box_photos").upsert({
    memory_box_id: params.id,
    page_key: pageKey,
    photo_key: photoKey,
    photo_url: photoUrl,
  }, { onConflict: "memory_box_id,page_key,photo_key" });

  setPhotos(prev => {
    const newPhotos = { ...prev };
    if (!newPhotos[pageKey]) newPhotos[pageKey] = {};
    newPhotos[pageKey][photoKey] = photoUrl;
    return newPhotos;
  });
}
```

};

const goToPage = (direction: “prev” | “next”) => {
if (flipping) return;
if (direction === “next” && currentPage < PAGES.length - 1) {
setFlipping(true);
setTimeout(() => {
setCurrentPage(currentPage + 1);
setFlipping(false);
}, 400);
} else if (direction === “prev” && currentPage > 0) {
setFlipping(true);
setTimeout(() => {
setCurrentPage(currentPage - 1);
setFlipping(false);
}, 400);
}
};

const PhotoPlaceholder = ({ pageKey, photoKey }: { pageKey: string; photoKey: string }) => {
const photoUrl = photos[pageKey]?.[photoKey];
return (
<label className="block cursor-pointer">
<input
type=“file”
accept=“image/*”
className=“hidden”
onChange={(e) => {
const file = e.target.files?.[0];
if (!file) return;
if (file.size > 5 * 1024 * 1024) {
alert(“Η φωτογραφία δεν πρέπει να ξεπερνά τα 5MB.”);
return;
}
uploadPhoto(pageKey, photoKey, file);
}}
/>
{photoUrl ? (
<img src={photoUrl} alt="Memory" className="w-full h-48 object-contain bg-[#F2E8DE] rounded-xl border-4 border-white shadow-md" />
) : (
<div className="w-full h-48 bg-[#F2E8DE] rounded-xl border-4 border-dashed border-[#C4A882] flex flex-col items-center justify-center hover:bg-[#EDE0D4] transition-all">
<span className="text-3xl mb-2">📸</span>
<span className="text-xs text-[#B09880] font-light">Πατήστε για φωτογραφία</span>
<span className="text-xs text-[#C4A882] font-light mt-1">Max 5MB</span>
</div>
)}
</label>
);
};

const F = ({ pk, fk, ph, ml = false }: { pk: string; fk: string; ph: string; ml?: boolean }) => (
<TextField
pageKey={pk}
fieldKey={fk}
placeholder={ph}
multiline={ml}
value={data[pk]?.[fk] || “”}
onChange={saveField}
/>
);

const renderPage = () => {
const page = PAGES[currentPage];

```
switch (page.key) {
  case "cover":
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-8 drop-shadow-lg" />
        <h1 className="text-3xl font-script text-[#8B5E3C] mb-6 leading-relaxed">
          Τα πρώτα χρόνια ζωής σου
        </h1>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882]">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>
        <div className="w-full max-w-xs">
          <p className="text-xs tracking-widest uppercase text-[#B09880] mb-2">Όνομα</p>
          <F pk="cover" fk="child_name" ph="Το όνομα του παιδιού σου..." />
        </div>
      </div>
    );

  case "first_moments":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου στιγμές</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PhotoPlaceholder pageKey="first_moments" photoKey="photo1" />
          <PhotoPlaceholder pageKey="first_moments" photoKey="photo2" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που σε κράτησα:</p>
            <F pk="first_moments" fk="first_hold" ph="..." ml />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1">Ζύγιζες:</p>
              <F pk="first_moments" fk="weight" ph="π.χ. 3.2 κιλά" />
            </div>
            <div>
              <p className="text-xs text-[#8B5E3C] mb-1">Ύψος:</p>
              <F pk="first_moments" fk="height" ph="π.χ. 50 εκ" />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που χαμογέλασες:</p>
            <F pk="first_moments" fk="first_smile" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Οι πρώτες στιγμές στο σπίτι μας:</p>
            <F pk="first_moments" fk="first_home" ph="..." ml />
          </div>
        </div>
      </div>
    );

  case "your_world":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ο κόσμος σου</h2>
        <div className="space-y-4">
          {[
            { key: "parents", label: "Οι γονείς σου" },
            { key: "siblings", label: "Τα αδέρφια σου" },
            { key: "uncles", label: "Οι θείοι σου" },
            { key: "grandparents", label: "Γιαγιάδες & Παππούδες" },
            { key: "godparents", label: "Νονός/α" },
            { key: "friends_family", label: "Φίλοι που έγιναν οικογένεια" },
            { key: "values", label: "Τι αξίες θέλουμε να σου δώσουμε" },
          ].map((item) => (
            <div key={item.key}>
              <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
              <F pk="your_world" fk={item.key} ph="..." ml />
              <PhotoPlaceholder pageKey="your_world" photoKey={item.key + "_photo"} />
            </div>
          ))}
        </div>
      </div>
    );

  case "first_achievements":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρώτες σου κατακτήσεις</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="first_achievements" photoKey="photo1" />
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Το πρώτο σου δοντάκι (και το πρώτο μου ξενύχτι 😅):</p>
            <F pk="first_achievements" fk="first_tooth" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που μπουσούλησες:</p>
            <F pk="first_achievements" fk="first_crawl" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που σηκώθηκες όρθια:</p>
            <F pk="first_achievements" fk="first_stand" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που έτρεξες προς το μέρος μου (εκεί... έλιωσα ❤️):</p>
            <F pk="first_achievements" fk="first_run" ph="..." ml />
          </div>
          <PhotoPlaceholder pageKey="first_achievements" photoKey="photo2" />
        </div>
      </div>
    );

  case "first_steps":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα πρώτα σου βήματα προς τον κόσμο</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη φορά που έπαιξες με άλλα παιδάκια:</p>
            <F pk="first_steps" fk="first_play" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η πρώτη σου φιλία (όπως την είδα εγώ):</p>
            <F pk="first_steps" fk="first_friend" ph="..." ml />
          </div>
          <PhotoPlaceholder pageKey="first_steps" photoKey="photo1" />
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που σε ενθουσίασε πολύ:</p>
            <F pk="first_steps" fk="excited" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που σε φόβισε:</p>
            <F pk="first_steps" fk="scared" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που κατάλαβα ότι μεγαλώνεις:</p>
            <F pk="first_steps" fk="growing_up" ph="..." ml />
          </div>
        </div>
      </div>
    );

  case "moments":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμές που με έκανες να νιώθω τα πάντα</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="moments" photoKey="photo1" />
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που ένιωσα περήφανη για σένα:</p>
            <F pk="moments" fk="proud" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Κάτι μικρό που για μένα ήταν τεράστιο:</p>
            <F pk="moments" fk="small_big" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Μια αγκαλιά που δεν ήθελα να τελειώσει:</p>
            <F pk="moments" fk="hug" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμή που σκέφτηκα αυτό είναι η ευτυχία:</p>
            <F pk="moments" fk="happiness" ph="..." ml />
          </div>
          <PhotoPlaceholder pageKey="moments" photoKey="photo2" />
        </div>
      </div>
    );

  case "hard_days":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι μέρες που δεν ήταν εύκολες αλλά ήταν δικές μας</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Μια μέρα που ένιωσα ότι δεν τα κατάφερνα:</p>
            <F pk="hard_days" fk="hard_day" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Μια στιγμή που λύγισα (αλλά δεν το έδειξα):</p>
            <F pk="hard_days" fk="broke_down" ph="..." ml />
          </div>
          <PhotoPlaceholder pageKey="hard_days" photoKey="photo1" />
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Κάτι που με δυσκόλεψε περισσότερο απ' όσο περίμενα:</p>
            <F pk="hard_days" fk="difficult" ph="..." ml />
          </div>
          <div>
            <p className="text-xs text-[#8B5E3C] mb-1">Και παρ' όλα αυτά... συνέχισα γιατί:</p>
            <F pk="hard_days" fk="continued" ph="..." ml />
          </div>
        </div>
      </div>
    );

  case "personality":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η προσωπικότητά σου από τα μάτια της μαμάς</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="personality" photoKey="photo1" />
          {[
            { key: "laugh", label: "Αυτό που σε κάνει να γελάς" },
            { key: "angry", label: "Αυτό που σε θυμώνει" },
            { key: "calm", label: "Αυτό που σε ηρεμεί" },
            { key: "best_trait", label: "Το πιο όμορφο κομμάτι του χαρακτήρα σου" },
            { key: "unique", label: "Κάτι που σε κάνει μοναδικό πλάσμα" },
          ].map((item) => (
            <div key={item.key}>
              <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
              <F pk="personality" fk={item.key} ph="..." ml />
            </div>
          ))}
        </div>
      </div>
    );

  case "birthdays":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα γενέθλιά σου 🎉</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="birthdays" photoKey="photo1" />
          {[1, 2, 3].map((year) => (
            <div key={year} className="bg-[#F9F2EC] rounded-2xl p-3">
              <p className="text-sm font-serif text-[#8B5E3C] mb-2">{year} ετών 🎂</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Έσβησες την τούρτα με:</p>
                  <F pk="birthdays" fk={`year${year}_with`} ph="..." />
                </div>
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Η ευχή μου για σένα:</p>
                  <F pk="birthdays" fk={`year${year}_wish`} ph="..." ml />
                </div>
                <PhotoPlaceholder pageKey="birthdays" photoKey={`photo_year${year}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  case "school":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρώτη σου μέρα στο σχολείο</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="school" photoKey="photo1" />
          {[
            { key: "i_felt", label: "Και εγώ ένιωσα" },
            { key: "you_looked", label: "Εσύ έδειχνες" },
            { key: "left_you", label: "Η στιγμή που σε άφησα" },
            { key: "thought", label: "Η σκέψη που δεν έφυγε από το μυαλό μου" },
            { key: "saw_again", label: "Όταν σε ξαναείδα" },
          ].map((item) => (
            <div key={item.key}>
              <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
              <F pk="school" fk={item.key} ph="..." ml />
            </div>
          ))}
          <PhotoPlaceholder pageKey="school" photoKey="photo2" />
        </div>
      </div>
    );

  case "when_you_grow":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Για σένα όταν μεγαλώσεις...</h2>
        <div className="space-y-4">
          <PhotoPlaceholder pageKey="when_you_grow" photoKey="photo1" />
          {[
            { key: "life", label: "Αν μπορούσα να σου πω κάτι για τη ζωή..." },
            { key: "protect", label: "Αν μπορούσα να σε προστατέψω από κάτι..." },
            { key: "thought", label: "Αν μπορούσα να σου αφήσω μόνο μια σκέψη..." },
          ].map((item) => (
            <div key={item.key}>
              <p className="text-xs text-[#8B5E3C] mb-1">{item.label}</p>
              <F pk="when_you_grow" fk={item.key} ph="..." ml />
            </div>
          ))}
        </div>
      </div>
    );

  case "letter":
    return (
      <div className="h-full overflow-y-auto px-6 py-4">
        <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ένα γράμμα για σένα...</h2>
        <PhotoPlaceholder pageKey="letter" photoKey="photo1" />
        <div className="mt-4">
          <F pk="letter" fk="letter" ph="Αγάπη μου..." ml />
        </div>
      </div>
    );

  default:
    return null;
}
```

};

return (
<div className="min-h-screen bg-[#8B5E3C] flex flex-col items-center justify-center p-4">
<div
className={`relative bg-[#F9F2EC] rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${ flipping ? "opacity-0 scale-95" : "opacity-100 scale-100" }`}
style={{
minHeight: “600px”,
boxShadow: “8px 8px 30px rgba(0,0,0,0.4), inset -3px 0 6px rgba(0,0,0,0.1)”,
}}
>
<div className="sticky top-0 z-10 bg-[#F9F2EC] pt-4 pb-2 flex justify-center border-b border-[rgba(196,168,130,0.2)]">
<button onClick={() => setCurrentPage(0)}>
<img src="/logo.png" alt="Logo" className="w-16 h-auto hover:opacity-80 transition-opacity" />
</button>
</div>

```
    <div className="p-4" style={{ minHeight: "520px" }}>
      {renderPage()}
    </div>

    <div className="text-center py-2 text-xs text-[#B09880]">
      {currentPage + 1} / {PAGES.length}
    </div>
  </div>

  <div className="flex items-center gap-8 mt-6">
    <button
      onClick={() => goToPage("prev")}
      disabled={currentPage === 0 || flipping}
      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#F2E8DE] transition-all disabled:opacity-30 text-[#8B5E3C] text-xl"
    >
      ←
    </button>
    <span className="text-white text-sm font-light text-center max-w-xs">
      {PAGES[currentPage].title}
    </span>
    <button
      onClick={() => goToPage("next")}
      disabled={currentPage === PAGES.length - 1 || flipping}
      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#F2E8DE] transition-all disabled:opacity-30 text-[#8B5E3C] text-xl"
    >
      →
    </button>
  </div>

  <Link
    href="/dashboard"
    className="mt-6 text-white text-xs font-light hover:opacity-70 transition-opacity tracking-widest uppercase"
  >
    ← Επιστροφή στο Dashboard
  </Link>
</div>
```

);
}
