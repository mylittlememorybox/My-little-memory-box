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
  { key: "how_we_met", title: "Πώς ξεκίνησε όλο αυτό" },
  { key: "him", title: "Αυτός" },
  { key: "her", title: "Αυτή" },
  { key: "our_moments", title: "Οι στιγμές μας" },
  { key: "our_trips", title: "Τα ταξίδια μας" },
  { key: "hard_days", title: "Οι δύσκολες μέρες" },
  { key: "what_i_love", title: "Αυτό που αγαπώ σε σένα" },
  { key: "our_dreams", title: "Τα όνειρά μας" },
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
}

export default function MemoryBookCouplePage({ params }: { params: { id: string } }) {
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
          <img src={photoUrl} alt="Memory" className="w-full h-40 object-cover rounded-xl border-4 border-white shadow-md" />
        ) : (
          <div className="w-full h-40 bg-[#F2E8DE] rounded-xl border-4 border-dashed border-[#C4A882] flex flex-col items-center justify-center hover:bg-[#EDE0D4] transition-all">
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
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-6">Εγώ & Εσύ</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💑</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <F pk="cover" fk="his_name" ph="Όνομα του..." />
              <F pk="cover" fk="her_name" ph="Όνομα της..." />
              <F pk="cover" fk="start_date" ph="Η ιστορία μας ξεκίνησε..." />
            </div>
            <PhotoPlaceholder pageKey="cover" photoKey="cover_photo" />
          </div>
        );

      case "how_we_met":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Πώς ξεκίνησε όλο αυτό</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="how_we_met" photoKey="photo1" />
              <PhotoPlaceholder pageKey="how_we_met" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "how_met", label: "Πώς γνωριστήκαμε", ml: true },
                { key: "first_impression", label: "Η πρώτη μου εντύπωση για σένα", ml: true },
                { key: "first_date", label: "Η πρώτη μας συνάντηση ήταν", ml: true },
                { key: "realized", label: "Η στιγμή που κατάλαβα ότι ήσουν ο/η κατάλληλος/η", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="how_we_met" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "him":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτός 💙</h2>
            <PhotoPlaceholder pageKey="him" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "name", label: "Το όνομά του", ml: false },
                { key: "crazy_about", label: "Αυτό που με τρέλανε σε αυτόν", ml: true },
                { key: "makes_laugh", label: "Αυτό που με κάνει να γελάω μαζί του", ml: true },
                { key: "funny_trait", label: "Το πιο αστείο χαρακτηριστικό του", ml: false },
                { key: "talent", label: "Το ταλέντο του που με εκπλήσσει", ml: false },
                { key: "love_most", label: "Αυτό που αγαπώ περισσότερο σε αυτόν", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="him" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "her":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτή 🌸</h2>
            <PhotoPlaceholder pageKey="her" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "name", label: "Το όνομά της", ml: false },
                { key: "crazy_about", label: "Αυτό που με τρέλανε σε αυτήν", ml: true },
                { key: "makes_laugh", label: "Αυτό που με κάνει να γελάω μαζί της", ml: true },
                { key: "funny_trait", label: "Το πιο αστείο χαρακτηριστικό της", ml: false },
                { key: "talent", label: "Το ταλέντο της που με εκπλήσσει", ml: false },
                { key: "love_most", label: "Αυτό που αγαπώ περισσότερο σε αυτήν", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="her" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι στιγμές μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="our_moments" photoKey="photo1" />
              <PhotoPlaceholder pageKey="our_moments" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "favorite_moment", label: "Η αγαπημένη μας στιγμή μαζί", ml: true },
                { key: "unforgettable", label: "Μια στιγμή που δεν θα ξεχάσω ποτέ", ml: true },
                { key: "small_big", label: "Κάτι μικρό που για μένα ήταν τεράστιο", ml: true },
                { key: "this_is_love", label: "Η στιγμή που σκέφτηκα αυτό είναι αγάπη", ml: true },
                { key: "hug", label: "Μια αγκαλιά που δεν ήθελα να τελειώσει", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="our_moments" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
              <div className="bg-[#F2E8DE] rounded-2xl p-4 mt-2">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το αγαπημένο μας τραγούδι</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Τίτλος τραγουδιού:</p>
                    <F pk="our_moments" fk="song_title" ph="π.χ. Perfect - Ed Sheeran" />
                  </div>
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Γιατί είναι το τραγούδι μας:</p>
                    <F pk="our_moments" fk="song_reason" ph="..." ml />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "our_trips":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα ταξίδια μας ✈️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="our_trips" photoKey="photo1" />
              <PhotoPlaceholder pageKey="our_trips" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "first_trip", label: "Το πρώτο μας ταξίδι μαζί", ml: true },
                { key: "favorite_place", label: "Το αγαπημένο μας μέρος", ml: false },
                { key: "funny_moment", label: "Μια αστεία στιγμή σε ταξίδι", ml: true },
                { key: "dream_trip", label: "Το ταξίδι που θέλουμε να κάνουμε", ml: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="our_trips" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι δύσκολες μέρες που μας έκαναν πιο δυνατούς</h2>
            <PhotoPlaceholder pageKey="hard_days" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "hard_moment", label: "Μια δύσκολη στιγμή που περάσαμε μαζί", ml: true },
                { key: "stronger", label: "Αυτό που μας έκανε πιο δυνατούς", ml: true },
                { key: "trust", label: "Η στιγμή που κατάλαβα ότι μπορώ να βασιστώ σε σένα", ml: true },
                { key: "continued", label: "Και παρ' όλα αυτά... συνεχίσαμε γιατί", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="hard_days" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "what_i_love":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτό που αγαπώ σε σένα ❤️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="what_i_love" photoKey="photo1" />
              <PhotoPlaceholder pageKey="what_i_love" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "three_things", label: "Τρία πράγματα που αγαπώ σε σένα", ml: true },
                { key: "how_you_make_feel", label: "Αυτό που με κάνεις να νιώθω", ml: true },
                { key: "learned", label: "Κάτι που έμαθα από σένα", ml: true },
                { key: "choose_you", label: "Αυτό που με κάνει να σε επιλέγω κάθε μέρα", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="what_i_love" fk={item.key} ph="..." ml={item.ml} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_dreams":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα όνειρά μας 🌟</h2>
            <PhotoPlaceholder pageKey="our_dreams" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "dream", label: "Ένα όνειρο που έχουμε μαζί", ml: true },
                { key: "bucket_list", label: "Κάτι που θέλουμε να κάνουμε μαζί", ml: true },
                { key: "future", label: "Πού βλέπουμε τον εαυτό μας σε 10 χρόνια", ml: true },
                { key: "promise", label: "Η υπόσχεση που δίνουμε ο ένας στον άλλον", ml: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <F pk="our_dreams" fk={item.key} ph="..." ml={item.ml} />
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
    <div className="min-h-screen bg-[#C4A882] flex flex-col items-center justify-center p-4">
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
