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
  { key: "how_we_met", title: "Πως ξεκινησε ολο αυτο" },
  { key: "him", title: "Αυτος" },
  { key: "her", title: "Αυτη" },
  { key: "our_moments", title: "Οι στιγμες μας" },
  { key: "our_trips", title: "Τα ταξιδια μας" },
  { key: "hard_days", title: "Οι δυσκολες μερες" },
  { key: "what_i_love", title: "Αυτο που αγαπω σε σενα" },
  { key: "our_dreams", title: "Τα ονειρα μας" },
  { key: "letter", title: "Ενα γραμμα για σενα" },
];

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
            <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-6 drop-shadow-lg" />
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-6">
              Εγω & Εσυ
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💑</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <TextField pageKey="cover" fieldKey="his_name" placeholder="Ονομα του..." />
              <TextField pageKey="cover" fieldKey="her_name" placeholder="Ονομα της..." />
              <TextField pageKey="cover" fieldKey="start_date" placeholder="Η ιστορια μας ξεκινησε..." />
            </div>
            <PhotoPlaceholder pageKey="cover" photoKey="cover_photo" />
          </div>
        );

      case "how_we_met":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Πως ξεκινησε ολο αυτο</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="how_we_met" photoKey="photo1" />
              <PhotoPlaceholder pageKey="how_we_met" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "how_met", label: "Πως γνωριστηκαμε", multi: true },
                { key: "first_impression", label: "Η πρωτη μου εντυπωση για σενα", multi: true },
                { key: "first_date", label: "Η πρωτη μας συναντηση ηταν", multi: true },
                { key: "realized", label: "Η στιγμη που καταλαβα οτι ησουν ο/η καταλληλος/η", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="how_we_met" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "him":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτος 💙</h2>
            <PhotoPlaceholder pageKey="him" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "name", label: "Το ονομα του", multi: false },
                { key: "crazy_about", label: "Αυτο που με τρελανε σε αυτον", multi: true },
                { key: "makes_laugh", label: "Αυτο που με κανει να γελαω μαζι του", multi: true },
                { key: "funny_trait", label: "Το πιο αστειο χαρακτηριστικο του", multi: false },
                { key: "talent", label: "Το ταλεντο του που με εκπλησσει", multi: false },
                { key: "love_most", label: "Αυτο που αγαπω περισσοτερο σε αυτον", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="him" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "her":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτη 🌸</h2>
            <PhotoPlaceholder pageKey="her" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "name", label: "Το ονομα της", multi: false },
                { key: "crazy_about", label: "Αυτο που με τρελανε σε αυτην", multi: true },
                { key: "makes_laugh", label: "Αυτο που με κανει να γελαω μαζι της", multi: true },
                { key: "funny_trait", label: "Το πιο αστειο χαρακτηριστικο της", multi: false },
                { key: "talent", label: "Το ταλεντο της που με εκπλησσει", multi: false },
                { key: "love_most", label: "Αυτο που αγαπω περισσοτερο σε αυτην", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="her" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι στιγμες μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="our_moments" photoKey="photo1" />
              <PhotoPlaceholder pageKey="our_moments" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "favorite_moment", label: "Η αγαπημενη μας στιγμη μαζι", multi: true },
                { key: "unforgettable", label: "Μια στιγμη που δεν θα ξεχασω ποτε", multi: true },
                { key: "small_big", label: "Κατι μικρο που για μενα ηταν τεραστιο", multi: true },
                { key: "this_is_love", label: "Η στιγμη που σκεφτηκα αυτο ειναι αγαπη", multi: true },
                { key: "hug", label: "Μια αγκαλια που δεν ηθελα να τελειωσει", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="our_moments" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}

              <div className="bg-[#F2E8DE] rounded-2xl p-4 mt-2">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το αγαπημενο μας τραγουδι</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Τιτλος τραγουδιου:</p>
                    <TextField pageKey="our_moments" fieldKey="song_title" placeholder="π.χ. Perfect - Ed Sheeran" />
                  </div>
                  <div>
                    <p className="text-xs text-[#B09880] mb-1">Γιατι ειναι το τραγουδι μας:</p>
                    <TextField pageKey="our_moments" fieldKey="song_reason" placeholder="..." multiline />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "our_trips":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα ταξιδια μας ✈️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="our_trips" photoKey="photo1" />
              <PhotoPlaceholder pageKey="our_trips" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "first_trip", label: "Το πρωτο μας ταξιδι μαζι", multi: true },
                { key: "favorite_place", label: "Το αγαπημενο μας μερος", multi: false },
                { key: "funny_moment", label: "Μια αστεια στιγμη σε ταξιδι", multi: true },
                { key: "dream_trip", label: "Το ταξιδι που θελουμε να κανουμε", multi: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="our_trips" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "hard_days":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι δυσκολες μερες που μας εκαναν πιο δυνατους</h2>
            <PhotoPlaceholder pageKey="hard_days" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "hard_moment", label: "Μια δυσκολη στιγμη που περασαμε μαζι", multi: true },
                { key: "stronger", label: "Αυτο που μας εκανε πιο δυνατους", multi: true },
                { key: "trust", label: "Η στιγμη που καταλαβα οτι μπορω να βασιστω σε σενα", multi: true },
                { key: "continued", label: "Και παρ ολα αυτα... συνεχισαμε γιατι", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="hard_days" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "what_i_love":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Αυτο που αγαπω σε σενα ❤️</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="what_i_love" photoKey="photo1" />
              <PhotoPlaceholder pageKey="what_i_love" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "three_things", label: "Τρια πραγματα που αγαπω σε σενα", multi: true },
                { key: "how_you_make_feel", label: "Αυτο που με κανεις να νιωθω", multi: true },
                { key: "learned", label: "Κατι που εμαθα απο σενα", multi: true },
                { key: "choose_you", label: "Αυτο που με κανει να σε επιλεγω καθε μερα", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="what_i_love" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_dreams":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα ονειρα μας 🌟</h2>
            <PhotoPlaceholder pageKey="our_dreams" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "dream", label: "Ενα ονειρο που εχουμε μαζι", multi: true },
                { key: "bucket_list", label: "Κατι που θελουμε να κανουμε μαζι", multi: true },
                { key: "future", label: "Που βλεπουμε τον εαυτο μας σε 10 χρονια", multi: true },
                { key: "promise", label: "Η υποσχεση που δινουμε ο ενας στον αλλον", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="our_dreams" fieldKey={item.key} placeholder="..." multiline={item.multi} />
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
              <TextField pageKey="letter" fieldKey="letter" placeholder="Αγαπητε/η μου..." multiline />
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
        ← Επιστροφη στο Dashboard
      </Link>
    </div>
  );
}
