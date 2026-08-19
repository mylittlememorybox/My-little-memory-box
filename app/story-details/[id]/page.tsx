"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StoryDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUserEmail(user.email || "");

    const { data: box } = await supabase
      .from("memory_boxes")
      .select("*")
      .eq("id", params.id)
      .single();

    if (box) setTemplateId(box.template_id);

    const { data: storyData } = await supabase
      .from("memory_box_data")
      .select("*")
      .eq("memory_box_id", params.id)
      .eq("page_key", "story_details");

    if (storyData) {
      const organized: Record<string, string> = {};
      storyData.forEach((item: any) => {
        organized[item.field_key] = item.field_value;
      });
      setFormData(organized);
    }

    setLoading(false);
  };

  const saveField = async (fieldKey: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));

    await supabase.from("memory_box_data").upsert({
      memory_box_id: params.id,
      page_key: "story_details",
      field_key: fieldKey,
      field_value: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: "memory_box_id,page_key,field_key" });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/send-story-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          templateId,
          formData,
          memoryBoxId: params.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSaveError("Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error:", error);
      setSaveError("Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, fieldKey, multiline = false, dropdown = false, options = [] }: {
    label: string;
    fieldKey: string;
    multiline?: boolean;
    dropdown?: boolean;
    options?: string[];
  }) => {
    const [localValue, setLocalValue] = useState(formData[fieldKey] || "");
    const baseClass = "w-full px-4 py-3 rounded-2xl border border-[#C4A882] text-[#7A6055] font-light text-sm focus:outline-none focus:border-[#8B5E3C] bg-[#F9F2EC]";

    if (dropdown) {
      return (
        <div className="mb-4">
          <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
          <select
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              saveField(fieldKey, e.target.value);
            }}
            className={baseClass}
          >
            <option value="">Επιλεξτε...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (multiline) {
      return (
        <div className="mb-4">
          <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => saveField(fieldKey, localValue)}
            rows={3}
            className={baseClass + " resize-none"}
            placeholder="Γραψτε εδω..."
          />
        </div>
      );
    }

    return (
      <div className="mb-4">
        <p className="text-xs text-[#8B5E3C] font-light mb-1">{label}</p>
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => saveField(fieldKey, localValue)}
          className={baseClass}
          placeholder="Γραψτε εδω..."
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
        <p className="text-[#B09880] font-light">Φορτωση...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-16 h-auto object-contain" />
          </Link>
          <Link href="/dashboard" className="text-xs font-light tracking-widest uppercase text-[#8B5E3C] hover:text-[#5C3820]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="pt-8 pb-20 px-6 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#8B5E3C] mb-3">
            Στοιχεια Παραμυθιου
          </h1>
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
            <span className="text-[#C4A882] text-xs">✦</span>
            <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          </div>
          <p className="text-sm text-[#B09880] font-light">
            Συμπληρωστε τα στοιχεια και θα δημιουργησουμε το παραμυθι σας
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {templateId === "first-years" ? (
            <>
              <Field label="Ονομα παιδιου" fieldKey="child_name" />
              <Field label="Φυλο" fieldKey="gender" dropdown options={["Κοριτσακι", "Αγορακι"]} />
              <Field label="Ηλικια" fieldKey="age" />
              <Field label="Χρωμα μαλλιων" fieldKey="hair_color" dropdown options={["Καστανο", "Ξανθο", "Χαλκινο", "Μαυρο"]} />
              <Field label="Χρωμα ματιων" fieldKey="eye_color" dropdown options={["Μαυρα", "Καφε", "Γκρι", "Πρασινα", "Γαλαζια"]} />
              <Field label="Αγαπημενο χρωμα" fieldKey="favorite_color" />
              <Field label="Αγαπημενα πραγματα" fieldKey="favorite_things" multiline />
              <Field label="Αγαπημενο ζωακι" fieldKey="favorite_animal" />
              <Field label="Ενα ομορφο μηνυμα μαμας" fieldKey="mom_message" multiline />
            </>
          ) : (
            <>
              <Field label="Ονομα του" fieldKey="his_name" />
              <Field label="Ονομα της" fieldKey="her_name" />
              <Field label="Πως γνωριστηκατε" fieldKey="how_met" multiline />
              <Field label="Αστειο χαρακτηριστικο του" fieldKey="his_funny" />
              <Field label="Αστειο χαρακτηριστικο της" fieldKey="her_funny" />
              <Field label="Εκεινος εχει ταλεντο στο" fieldKey="his_talent" />
              <Field label="Εκεινη εχει ταλεντο στο" fieldKey="her_talent" />
              <Field label="Αγαπημενη στιγμη μαζι" fieldKey="favorite_moment" multiline />
              <Field label="Μηνυμα αγαπης" fieldKey="love_message" multiline />
            </>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-green-600 text-sm font-light text-center">
                Αποθηκευτηκε και στειλαμε τα στοιχεια! ✓
              </p>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <p className="text-red-600 text-sm font-light text-center">
                {saveError}
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all disabled:opacity-50 mb-4"
          >
            {saving ? "Αποστολη..." : "Αποθηκευση και Αποστολη Στοιχειων"}
          </button>

          <Link
            href={`/my-story/${params.id}`}
            className="block w-full py-4 bg-[#F2E8DE] text-[#8B5E3C] rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all text-center"
          >
            📚 Δες το Παραμυθι σου
          </Link>
        </div>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Ολα τα δικαιωματα διατηρουνται
        </p>
      </footer>
    </div>
  );
}
