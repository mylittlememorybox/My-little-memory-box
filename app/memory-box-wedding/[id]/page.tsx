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
  { key: "proposal", title: "Η προταση γαμου" },
  { key: "day_before", title: "Η μερα πριν" },
  { key: "saw_you", title: "Η στιγμη που σε ειδα" },
  { key: "ceremony", title: "Η τελετη" },
  { key: "people", title: "Οι ανθρωποι της μερας μας" },
  { key: "feelings", title: "Τα συναισθηματα της μερας" },
  { key: "moments", title: "Στιγμες που δεν θελουμε να ξεχασουμε" },
  { key: "party", title: "Το γλεντι" },
  { key: "our_night", title: "Η νυχτα μας" },
  { key: "letter", title: "Ενα γραμμα για σενα" },
];

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
            <h1 className="text-3xl font-script text-[#8B5E3C] mb-4">Ο Γαμος Μας</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
              <span className="text-[#C4A882]">💍</span>
              <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            </div>
            <div className="w-full max-w-xs space-y-3 mb-6">
              <TextField pageKey="cover" fieldKey="groom_name" placeholder="Ονομα γαμπρου..." />
              <TextField pageKey="cover" fieldKey="bride_name" placeholder="Ονομα νυφης..." />
              <TextField pageKey="cover" fieldKey="wedding_date" placeholder="Ημερομηνια γαμου..." />
              <TextField pageKey="cover" fieldKey="wedding_location" placeholder="Τοποθεσια γαμου..." />
            </div>
            <PhotoPlaceholder pageKey="cover" photoKey="cover_photo" />
          </div>
        );

      case "proposal":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η προταση γαμου 💍</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="proposal" photoKey="photo1" />
              <PhotoPlaceholder pageKey="proposal" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "where", label: "Που εγινε η προταση", multi: false },
                { key: "planned", label: "Πως το σχεδιασα/σχεδιασες", multi: true },
                { key: "wearing", label: "Τι φορουσαμε εκεινη τη στιγμη", multi: false },
                { key: "words", label: "Τα λογια που ειπα/ειπες", multi: true },
                { key: "reaction", label: "Η πρωτη μου αντιδραση", multi: true },
                { key: "feeling", label: "Αυτο που ενιωσα εκεινη τη στιγμη", multi: true },
                { key: "first_told", label: "Ο πρωτος που το μοιραστηκαμε", multi: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="proposal" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "day_before":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η μερα πριν</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="day_before" photoKey="photo1" />
              <PhotoPlaceholder pageKey="day_before" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "evening_feeling", label: "Τι ενιωθα το βραδυ πριν", multi: true },
                { key: "thoughts", label: "Τι σκεφτομουν ξαπλωμενος/η", multi: true },
                { key: "last_message", label: "Το τελευταιο μηνυμα που εστειλα σε σενα", multi: true },
                { key: "sleep", label: "Πως κοιμηθηκα (η δεν κοιμηθηκα 😄)", multi: true },
                { key: "morning", label: "Το πρωινο της ημερας του γαμου", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="day_before" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "saw_you":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η στιγμη που σε ειδα</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="saw_you" photoKey="photo1" />
              <PhotoPlaceholder pageKey="saw_you" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "first_thought", label: "Η πρωτη μου σκεψη οταν σε ειδα", multi: true },
                { key: "outfit", label: "Πως ησουν ντυμενος/η", multi: true },
                { key: "noticed_first", label: "Αυτο που παρατηρησα πρωτα", multi: false },
                { key: "feeling", label: "Τι ενιωσα εκεινη τη στιγμη", multi: true },
                { key: "freeze_time", label: "Αν μπορουσα να σταματησω τον χρονο εκεινη τη στιγμη", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="saw_you" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "ceremony":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η τελετη</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="ceremony" photoKey="photo1" />
              <PhotoPlaceholder pageKey="ceremony" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "hands", label: "Η στιγμη που εδωσα τα χερια μου", multi: true },
                { key: "words", label: "Τα λογια που ειπαμε", multi: true },
                { key: "ring", label: "Η στιγμη που φορεσα/φορεσες το δαχτυλιδι", multi: true },
                { key: "said_yes", label: "Αυτο που σκεφτηκα οταν ειπα ναι", multi: true },
                { key: "detail", label: "Μια λεπτομερεια που θυμαμαι εντονα", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="ceremony" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "people":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Οι ανθρωποι της μερας μας</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="people" photoKey="photo1" />
              <PhotoPlaceholder pageKey="people" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "were_there", label: "Αυτοι που ηταν εκει για μας", multi: true },
                { key: "moved_me", label: "Καποιος που με συγκινησε", multi: true },
                { key: "smiled", label: "Ενα προσωπο που κοιταξα και χαμογελασα", multi: false },
                { key: "missed", label: "Καποιος που εκλειψε αλλα ηταν στην καρδια μας", multi: true },
                { key: "godparents", label: "Νονος/Νονα", multi: false },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="people" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "feelings":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Τα συναισθηματα της μερας</h2>
            <PhotoPlaceholder pageKey="feelings" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "main_feeling", label: "Η κυριαρχη συναισθηση της ημερας", multi: true },
                { key: "cried", label: "Η στιγμη που δακρυσα", multi: true },
                { key: "laughed", label: "Η στιγμη που γελασα", multi: true },
                { key: "unexpected", label: "Κατι που δεν περιμενα να νιωσω", multi: true },
                { key: "keep_forever", label: "Αυτο που ηθελα να κρατησω για παντα", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="feelings" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "moments":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Στιγμες που δεν θελουμε να ξεχασουμε</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="moments" photoKey="photo1" />
              <PhotoPlaceholder pageKey="moments" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              {[
                { key: "funny", label: "Η πιο αστεια στιγμη της ημερας", multi: true },
                { key: "went_wrong", label: "Κατι που πηγε στραβα αλλα εγινε αναμνηση", multi: true },
                { key: "small_detail", label: "Μια μικρη λεπτομερεια που με συγκινησε", multi: true },
                { key: "remember", label: "Η στιγμη που σκεφτηκα αυτο θελω να θυμαμαι", multi: true },
                { key: "surprise", label: "Μια εκπληξη της ημερας", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="moments" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "party":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Το γλεντι 🎉</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <PhotoPlaceholder pageKey="party" photoKey="photo1" />
              <PhotoPlaceholder pageKey="party" photoKey="photo2" />
            </div>
            <div className="space-y-4">
              <div className="bg-[#F2E8DE] rounded-2xl p-4">
                <p className="text-xs text-[#8B5E3C] mb-3 font-serif">🎵 Το τραγουδι του πρωτου μας χορου</p>
                <TextField pageKey="party" fieldKey="first_dance_song" placeholder="Τιτλος - Καλλιτεχνης..." />
              </div>
              {[
                { key: "dance_floor", label: "Πως ηταν η πιστα", multi: true },
                { key: "unexpected_dancer", label: "Καποιος που χορεψε και δεν το περιμεναμε 😄", multi: false },
                { key: "danced_together", label: "Η στιγμη που χορεψαμε μαζι", multi: true },
                { key: "favorite_moment", label: "Το αγαπημενο μου στιγμιοτυπο απο το γλεντι", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="party" fieldKey={item.key} placeholder="..." multiline={item.multi} />
                </div>
              ))}
            </div>
          </div>
        );

      case "our_night":
        return (
          <div className="h-full overflow-y-auto px-6 py-4">
            <h2 className="text-xl font-script text-[#8B5E3C] mb-4 text-center">Η νυχτα μας 🌙</h2>
            <PhotoPlaceholder pageKey="our_night" photoKey="photo1" />
            <div className="space-y-4 mt-4">
              {[
                { key: "left_when", label: "Ποτε φυγαμε", multi: false },
                { key: "alone", label: "Η πρωτη στιγμη που μειναμε μονοι", multi: true },
                { key: "said", label: "Τι ειπαμε ο ενας στον αλλον", multi: true },
                { key: "ended", label: "Πως τελειωσε αυτη η μερα", multi: true },
                { key: "dreamed", label: "Τι ονειρευτηκα εκεινη τη νυχτα", multi: true },
              ].map((item) => (
                <div key={item.key}>
                  <p className="text-xs text-[#8B5E3C] mb-1">{item.label}:</p>
                  <TextField pageKey="our_night" fieldKey={item.key} placeholder="..." multiline={item.multi} />
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
        ← Επιστροφη στο Dashboard
      </Link>
    </div>
  );
}
