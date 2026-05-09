"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGES = [
  { key: "cover", title: "Εξωφυλλο" },
  { key: "first_moments", title: "Οι πρωτες σου στιγμες" },
  { key: "your_world", title: "Ο κοσμος σου" },
  { key: "first_achievements", title: "Οι πρωτες σου καταχτησεις" },
  { key: "first_steps", title: "Τα πρωτα σου βηματα" },
  { key: "moments", title: "Στιγμες που με εκανες να νιωθω τα παντα" },
  { key: "hard_days", title: "Οι μερες που δεν ηταν ευκολες" },
  { key: "personality", title: "Η προσωπικοτητα σου" },
  { key: "birthdays", title: "Τα γενεθλια σου" },
  { key: "school", title: "Η πρωτη σου μερα στο σχολειο" },
  { key: "when_you_grow", title: "Για σενα οταν μεγαλωσεις" },
  { key: "letter", title: "Ενα γραμμα για σενα" },
];

export default function MemoryBookPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [flipping, setFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: boxData } = await supabase
      .from("memory_box_data")
      .select("*")
      .eq("memory_box_id", params.id);

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
  };

  const saveField = async (pageKey: string, fieldKey: string, value: string) => {
    const newData = { ...data };
    if (!newData[pageKey]) newData[pageKey] = {};
    newData[pageKey][fieldKey] = value;
    setData(newData);

    await supabase.from("memory_box_data").upsert({
      memory_box_id: params.id,
      page_key: pageKey,
      field_key: fieldKey,
      field_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "memory_box_id,page_key,field_key" });
  };

  const uploadPhoto = async (pageKey: string, photoKey: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `${user.id}/${params.id}/${pageKey}/${photoKey}_${Date.now()}`;
    const { data: uploadData, error } = await supabase.storage
      .from("memory-box-photos")
      .upload(fileName, file, { upsert: true });

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

      const newPhotos = { ...photos };
      if (!newPhotos[pageKey]) newPhotos[pageKey] = {};
      newPhotos[pageKey][photoKey] = photoUrl;
      setPhotos(newPhotos);
    }
  };

  const goToPage = (direction: "prev" | "next") => {
    if (flipping) return;
    if (direction === "next" && currentPage < PAGES.length - 1) {
      setFlipDirection("right");
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipping(false);
      }, 400);
    } else if (direction === "prev" && currentPage > 0) {
      setFlipDirection("left");
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
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadPhoto(pageKey, photoKey, file);
          }}
        />
        {photoUrl ? (
          <img src={photoUrl} alt="Memory" className="w-full h-40 object-cover rounded-xl border-4 border-white shadow-md" />
        ) : (
          <div className="w-full h-40 bg-[#F2E8DE] rounded-xl border-4 border-dashed border-[#C4A882] flex flex-col items-center justify-center hover:bg-[#EDE0D4] transition-all">
            <span className="text-3xl mb-2">📸</span>
            <span className="text-xs text-[#B09880] font-light">Πατηστε για φωτογραφια</span>
          </div>
        )}
      </label>
    );
  };

  const TextField = ({ pageKey, fieldKey, placeholder, multiline = false }: {
    pageKey: string;
    fieldKey: string;
    placeholder: string;
    multiline?: boolean;
  }) => {
    const [localValue, setLocalValue] = useState(data[pageKey]?.[fieldKey] || "");

    useEffect(() => {
      setLocalValue(data[pageKey]?.[fieldKey] || "");
    }, [pageKey, fieldKey, data]);

    const handleChange = (value: string) => {
      setLocalValue(value);
      clearTimeout((window as any)[`timer_${pageKey}_${fieldKey}`]);
      (window as any)[`timer_${pageKey}_${fieldKey}`] = setTimeout(() => {
        saveField(pageKey, fieldKey, value);
      }, 800);
    };

    const baseClass = "w-full bg-transparent border-b-2 border-dotted border-[#C4A882] text-[#5C3820] font-light text-sm focus:outline-none focus:border-[#8B5E3C] placeholder-[#C4A882] py-1 resize-none";

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
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={baseClass}
      />
    );
  };

  const renderPage = () => {
    const page = PAGES[currentPage];

    switch (page.key) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-8 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-6 leading-relaxed">
              Τα πρωτα χρονια ζωης σου
            </h1>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">✦</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs">
              <p className="text-xs tracking-widest uppercase text-[#B09880] mb-2">Ονομα</p>
              <TextField pageKey="cover" fieldKey="child_name" placeholder="Το ονομα του παιδιου σου..." />
            </div>
          </div>
        );

      case "first_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρωτες σου στιγμες</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <PhotoPlaceholder pageKey="first_moments" photoKey="photo1" />
              <PhotoPlaceholder pageKey="first_moments" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που σε κρατησα:</p>
                <TextField pageKey="first_moments" fieldKey="first_hold" placeholder="..." multiline />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Ζυγιζες:</p>
                  <TextField pageKey="first_moments" fieldKey="weight" placeholder="π.χ. 3.2 κιλα" />
                </div>
                <div>
                  <p className="text-xs text-[#8B5E3C] mb-1">Υψος:</p>
                  <TextField pageKey="first_moments" fieldKey="height" placeholder="π.χ. 50 εκ" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που χαμογελασες:</p>
                <TextField pageKey="first_moments" fieldKey="first_smile" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Οι πρωτες στιγμες στο σπιτι μας:</p>
                <TextField pageKey="first_moments" fieldKey="first_home" placeholder="..." multiline />
              </div>
            </div>
          </div>
        );

      case "your_world":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ο κοσμος σου</h2>
            <div className="space-y-4">
              {[
                { key: "parents", label: "Οι γονεις σου" },
                { key: "siblings", label: "Τα αδερφια σου" },
                { key: "uncles", label: "Οι θειοι σου" },
                { key: "grandparents", label: "Γιαγιαδες & Παππουδες" },
                { key: "godparents", label: "Νονος/α" },
                { key: "friends_family", label: "Φιλοι που εγιναν οικογενεια" },
                { key: "values", label: "Τι αξιες θελουμε να σου δωσουμε" },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="your_world" fieldKey={item.key} placeholder="..." multiline />
                  <PhotoPlaceholder pageKey="your_world" photoKey={item.key + "_photo"} />
                </div>
              ))}
            </div>
          </div>
        );

      case "first_achievements":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι πρωτες σου καταχτησεις</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="first_achievements" photoKey="photo1" />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Το πρωτο σου δοντακι (και το πρωτο μου ξενυχτι 😅):</p>
                <TextField pageKey="first_achievements" fieldKey="first_tooth" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που μπουσουλησες:</p>
                <TextField pageKey="first_achievements" fieldKey="first_crawl" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που σηκωθηκες ορθιο:</p>
                <TextField pageKey="first_achievements" fieldKey="first_stand" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που ετρεξες προς το μερος μου (εκει... ελιωσα ❤️):</p>
                <TextField pageKey="first_achievements" fieldKey="first_run" placeholder="..." multiline />
              </div>
              <PhotoPlaceholder pageKey="first_achievements" photoKey="photo2" />
            </div>
          </div>
        );

      case "first_steps":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα πρωτα σου βηματα προς τον κοσμο</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη φορα που επαιξες με αλλα παιδακια:</p>
                <TextField pageKey="first_steps" fieldKey="first_play" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η πρωτη σου φιλια (οπως την ειδα εγω):</p>
                <TextField pageKey="first_steps" fieldKey="first_friend" placeholder="..." multiline />
              </div>
              <PhotoPlaceholder pageKey="first_steps" photoKey="photo1" />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κατι που σε ενθουσιασε πολυ:</p>
                <TextField pageKey="first_steps" fieldKey="excited" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κατι που σε φοβισε:</p>
                <TextField pageKey="first_steps" fieldKey="scared" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμη που καταλαβα οτι μεγαλωνεις:</p>
                <TextField pageKey="first_steps" fieldKey="growing_up" placeholder="..." multiline />
              </div>
            </div>
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμες που με εκανες να νιωθω τα παντα</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="moments" photoKey="photo1" />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμη που ενιωσα περηφανη για σενα:</p>
                <TextField pageKey="moments" fieldKey="proud" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κατι μικρο που για μενα ηταν τεραστιο:</p>
                <TextField pageKey="moments" fieldKey="small_big" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια αγκαλια που δεν ηθελα να τελειωσει:</p>
                <TextField pageKey="moments" fieldKey="hug" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Η στιγμη που σκεφτηκα αυτο ειναι η ευτυχια:</p>
                <TextField pageKey="moments" fieldKey="happiness" placeholder="..." multiline />
              </div>
              <PhotoPlaceholder pageKey="moments" photoKey="photo2" />
            </div>
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι μερες που δεν ηταν ευκολες αλλα ηταν δικες μας</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια μερα που ενιωσα οτι δεν τα καταφερνα:</p>
                <TextField pageKey="hard_days" fieldKey="hard_day" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Μια στιγμη που λυγισα (αλλα δεν το εδειξα):</p>
                <TextField pageKey="hard_days" fieldKey="broke_down" placeholder="..." multiline />
              </div>
              <PhotoPlaceholder pageKey="hard_days" photoKey="photo1" />
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Κατι που με δυσκολεψε περισσοτερο απ οσο περιμενα:</p>
                <TextField pageKey="hard_days" fieldKey="difficult" placeholder="..." multiline />
              </div>
              <div>
                <p className="text-xs text-[#8B5E3C] mb-1">Και παρ ολα αυτα... συνεχισα γιατι:</p>
                <TextField pageKey="hard_days" fieldKey="continued" placeholder="..." multiline />
              </div>
            </div>
          </div>
        );

      case "personality":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η προσωπικοτητα σου απο τα ματια της μαμας</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="personality" photoKey="photo1" />
              {[
                { key: "laugh", label: "Αυτο που σε κανει να γελας" },
                { key: "angry", label: "Αυτο που σε θυμωνει" },
                { key: "calm", label: "Αυτο που σε ηρεμει" },
                { key: "best_trait", label: "Το πιο ομορφο κομματι του χαρακτηρα σου" },
                { key: "unique", label: "Κατι που σε κανει μοναδικο πλασμα" },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="personality" fieldKey={item.key} placeholder="..." multiline />
                </div>
              ))}
            </div>
          </div>
        );

      case "birthdays":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα γενεθλια σου 🎉</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="birthdays" photoKey="photo1" />
              {[1, 2, 3, 4, 5].map((year) => (
                <div key={year} className="bg-[#F9F2EC] rounded-2xl p-3">
                  <p className="text-sm font-serif text-[#8B5E3C] mb-2">{year} ετων 🎂</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[#8B5E3C] mb-1">Εσβησες την τουρτα με:</p>
                      <TextField pageKey="birthdays" fieldKey={`year${year}_with`} placeholder="..." />
                    </div>
                    <div>
                      <p className="text-xs text-[#8B5E3C] mb-1">Η ευχη μου για σενα:</p>
                      <TextField pageKey="birthdays" fieldKey={`year${year}_wish`} placeholder="..." multiline />
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
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρωτη σου μερα στο σχολειο</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="school" photoKey="photo1" />
              {[
                { key: "i_felt", label: "Και εγω ενιωσα" },
                { key: "you_looked", label: "Εσυ εδειχνες" },
                { key: "left_you", label: "Η στιγμη που σε αφησα" },
                { key: "thought", label: "Η σκεψη που δεν εφυγε απο το μυαλο μου" },
                { key: "saw_again", label: "Οταν σε ξαναειδα" },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="school" fieldKey={item.key} placeholder="..." multiline />
                </div>
              ))}
              <PhotoPlaceholder pageKey="school" photoKey="photo2" />
            </div>
          </div>
        );

      case "when_you_grow":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Για σενα οταν μεγαλωσεις...</h2>
            <div className="space-y-4">
              <PhotoPlaceholder pageKey="when_you_grow" photoKey="photo1" />
              {[
                { key: "life", label: "Αν μπορουσα να σου πω κατι για τη ζωη..." },
                { key: "protect", label: "Αν μπορουσα να σε προστατεψω απο κατι..." },
                { key: "thought", label: "Αν μπορουσα να σου αφησω μονο μια σκεψη..." },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}</p>
                  <TextField pageKey="when_you_grow" fieldKey={item.key} placeholder="..." multiline />
                </div>
              ))}
            </div>
          </div>
        );

      case "letter":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Ενα γραμμα για σενα...</h2>
            <PhotoPlaceholder pageKey="letter" photoKey="photo1" />
            <div className="mt-4">
              <TextField pageKey="letter" fieldKey="letter" placeholder="Αγαπητε/η..." multiline />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#8B5E3C] flex flex-col items-center justify-center p-4">
      <div
        className={`relative bg-[#F9F2EC] rounded-lg shadow-2xl w-full max-w-md transition-all duration-400 ${
          flipping ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        style={{
          minHeight: "600px",
          boxShadow: "8px 8px 30px rgba(0,0,0,0.4), inset -3px 0 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="sticky top-0 z-10 bg-[#F9F2EC] pt-4 pb-2 flex justify-center border-b border-[rgba(196,168,130,0.2)]">
          <button onClick={() => setCurrentPage(0)}>
            <img src="/logo.png" alt="Logo" className="w-16 h-auto hover:opacity-80 transition-opacity" />
          </button>
        </div>

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
        ← Επιστροφη στο Dashboard
      </Link>
    </div>
  );
}
