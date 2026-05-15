"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGES = [
  { key: "cover", title: "Εξώφυλλο" },
  { key: "proposal", title: "Η πρόταση γάμου" },
  { key: "day_before", title: "Η μέρα πριν" },
  { key: "saw_you", title: "Η στιγμή που σε είδα" },
  { key: "ceremony", title: "Η τελετή" },
  { key: "people", title: "Οι άνθρωποι της μέρας μας" },
  { key: "feelings", title: "Τα συναισθήματα της μέρας" },
  { key: "moments", title: "Στιγμές που δεν θέλουμε να ξεχάσουμε" },
  { key: "party", title: "Το γλέντι" },
  { key: "our_night", title: "Η νύχτα μας" },
  { key: "letter", title: "Ένα γράμμα για σένα" },
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
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(pageKey, fieldKey, newValue);
    }, 1500);
  };

  const baseClass = "w-full bg-transparent border-b-2 border-dotted border-[#C4A882] text-[#5C3820] font-light text-sm focus:outline-none focus:border-[#8B5E3C] placeholder-[#C4A882] py-1 resize-none";

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={baseClass}
        onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
      onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
    />
  );
}

export default function MemoryBookWeddingPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [photos, setPhotos] = useState<Record<string, Record<string, string>>>({});
  const [flipping, setFlipping] = useState(false);

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

  const saveField = useCallback(async (pageKey: string, fieldKey: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      if (!newData[pageKey]) newData[pageKey] = {};
      newData[pageKey][fieldKey] = value;
      return newData;
    });

    await supabase.from("memory_box_data").upsert({
      memory_box_id: params.id,
      page_key: pageKey,
      field_key: fieldKey,
      field_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "memory_box_id,page_key,field_key" });
  }, [params.id]);

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

      setPhotos(prev => {
        const newPhotos = { ...prev };
        if (!newPhotos[pageKey]) newPhotos[pageKey] = {};
        newPhotos[pageKey][photoKey] = photoUrl;
        return newPhotos;
      });
    }
  };

  const goToPage = (direction: "prev" | "next") => {
    if (flipping) return;
    if (direction === "next" && currentPage < PAGES.length - 1) {
      setFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipping(false);
      }, 400);
    } else if (direction === "prev" && currentPage > 0) {
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
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
              alert("Η φωτογραφία δεν πρέπει να ξεπερνά τα 5MB.");
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
      value={data[pk]?.[fk] || ""}
      onChange={saveField}
    />
  );

  const renderPage = () => {
    const page = PAGES[currentPage];

    switch (page.key) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Ο Γάμος Μας</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💍</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <F pk="cover" fk="groom_name" ph="Όνομα γαμπρού..." />
              <F pk="cover" fk="bride_name" ph="Όνομα νύφης..." />
              <F pk="cover" fk="wedding_date" ph="Ημερομηνία γάμου..." />
              <F pk="cover" fk="wedding_location" ph="Τοποθεσία γάμου..." />
            </div>
            <PhotoPlaceholder pageKey="cover" photoKey="cover_photo" />
          </div>
        );

      case "proposal":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η πρόταση γάμου 💍</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="proposal" photoKey="photo1" />
              <PhotoPlaceholder pageKey="proposal" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "where", label: "Πού έγινε η πρόταση", ml: false },
                { key: "planned", label: "Πώς το σχεδίασα/σχεδίασες", ml: true },
                { key: "wearing", label: "Τι φορούσαμε εκείνη τη στιγμή", ml: false },
                { key: "words", label: "Τα λόγια που είπα/είπες", ml: true },
                { key: "reaction", label: "Η πρώτη μου αντίδραση", ml: true },
                { key: "feeling", label: "Αυτό που ένιωσα εκείνη τη στιγμή", ml: true },
                { key: "first_told", label: "Ο πρώτος που το μοιραστήκαμε", ml: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="proposal" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "day_before":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η μέρα πριν</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="day_before" photoKey="photo1" />
              <PhotoPlaceholder pageKey="day_before" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "evening_feeling", label: "Τι ένιωθα το βράδυ πριν", ml: true },
                { key: "thoughts", label: "Τι σκεφτόμουν ξαπλωμένος/η", ml: true },
                { key: "last_message", label: "Το τελευταίο μήνυμα που έστειλα σε σένα", ml: true },
                { key: "sleep", label: "Πώς κοιμήθηκα (ή δεν κοιμήθηκα 😄)", ml: true },
                { key: "morning", label: "Το πρωινό της ημέρας του γάμου", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="day_before" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "saw_you":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η στιγμή που σε είδα</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="saw_you" photoKey="photo1" />
              <PhotoPlaceholder pageKey="saw_you" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "first_thought", label: "Η πρώτη μου σκέψη όταν σε είδα", ml: true },
                { key: "outfit", label: "Πώς ήσουν ντυμένος/η", ml: true },
                { key: "noticed_first", label: "Αυτό που παρατήρησα πρώτα", ml: false },
                { key: "feeling", label: "Τι ένιωσα εκείνη τη στιγμή", ml: true },
                { key: "freeze_time", label: "Αν μπορούσα να σταματήσω τον χρόνο εκείνη τη στιγμή", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="saw_you" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "ceremony":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η τελετή</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="ceremony" photoKey="photo1" />
              <PhotoPlaceholder pageKey="ceremony" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "hands", label: "Η στιγμή που έδωσα τα χέρια μου", ml: true },
                { key: "words", label: "Τα λόγια που είπαμε", ml: true },
                { key: "ring", label: "Η στιγμή που φόρεσα/φόρεσες το δαχτυλίδι", ml: true },
                { key: "said_yes", label: "Αυτό που σκέφτηκα όταν είπα ναι", ml: true },
                { key: "detail", label: "Μια λεπτομέρεια που θυμάμαι έντονα", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="ceremony" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "people":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι άνθρωποι της μέρας μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="people" photoKey="photo1" />
              <PhotoPlaceholder pageKey="people" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "were_there", label: "Αυτοί που ήταν εκεί για μας", ml: true },
                { key: "moved_me", label: "Κάποιος που με συγκίνησε", ml: true },
                { key: "smiled", label: "Ένα πρόσωπο που κοίταξα και χαμογέλασα", ml: false },
                { key: "missed", label: "Κάποιος που έλειψε αλλά ήταν στην καρδιά μας", ml: true },
                { key: "godparents", label: "Κουμπάρος/α", ml: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="people" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "feelings":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα συναισθήματα της μέρας</h2>
            <PhotoPlaceholder pageKey="feelings" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "main_feeling", label: "Η κυρίαρχη αίσθηση της ημέρας", ml: true },
                { key: "cried", label: "Η στιγμή που δάκρυσα", ml: true },
                { key: "laughed", label: "Η στιγμή που γέλασα", ml: true },
                { key: "unexpected", label: "Κάτι που δεν περίμενα να νιώσω", ml: true },
                { key: "keep_forever", label: "Αυτό που ήθελα να κρατήσω για πάντα", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="feelings" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμές που δεν θέλουμε να ξεχάσουμε</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="moments" photoKey="photo1" />
              <PhotoPlaceholder pageKey="moments" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "funny", label: "Η πιο αστεία στιγμή της ημέρας", ml: true },
                { key: "went_wrong", label: "Κάτι που πήγε στραβά αλλά έγινε ανάμνηση", ml: true },
                { key: "small_detail", label: "Μια μικρή λεπτομέρεια που με συγκίνησε", ml: true },
                { key: "remember", label: "Η στιγμή που σκέφτηκα αυτό θέλω να θυμάμαι", ml: true },
                { key: "surprise", label: "Μια έκπληξη της ημέρας", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="moments" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "party":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Το γλέντι 🎉</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="party" photoKey="photo1" />
              <PhotoPlaceholder pageKey="party" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              <div className="bg-[#F2E8DE] rounded-2xl p-4">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το τραγούδι του πρώτου μας χορού</p>
                <F pk="party" fk="first_dance_song" ph="Τίτλος - Καλλιτέχνης..." />
              </div>
              {[
                { key: "dance_floor", label: "Πώς ήταν η πίστα", ml: true },
                { key: "unexpected_dancer", label: "Κάποιος που χόρεψε και δεν το περιμέναμε 😄", ml: false },
                { key: "danced_together", label: "Η στιγμή που χορέψαμε μαζί", ml: true },
                { key: "favorite_moment", label: "Το αγαπημένο μου στιγμιότυπο από το γλέντι", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="party" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_night":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η νύχτα μας 🌙</h2>
            <PhotoPlaceholder pageKey="our_night" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "left_when", label: "Πότε φύγαμε", ml: false },
                { key: "alone", label: "Η πρώτη στιγμή που μείναμε μόνοι", ml: true },
                { key: "said", label: "Τι είπαμε ο ένας στον άλλον", ml: true },
                { key: "ended", label: "Πώς τελείωσε αυτή η μέρα", ml: true },
                { key: "dreamed", label: "Τι ονειρεύτηκα εκείνη τη νύχτα", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="our_night" fk={item.key} ph="..." ml={item.ml} />
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
  };

  return (
    <div className="min-h-screen bg-[#D4B8A8] flex flex-col items-center justify-center p-4">
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
        ← Επιστροφή στο Dashboard
      </Link>
    </div>
  );
}
