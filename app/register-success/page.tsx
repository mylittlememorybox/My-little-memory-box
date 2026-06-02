import Link from "next/link";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F9F2EC] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-3xl font-serif text-[#8B5E3C] mb-4">
          Ο λογαριασμός σας δημιουργήθηκε!
        </h1>
        <div className="flex items-center justify-center gap-2 my-6">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <p className="text-[#7A6055] font-light leading-relaxed mb-6">
            Σας έχουμε στείλει email επιβεβαίωσης. Παρακαλώ ελέγξτε τα εισερχόμενά σας και τον φάκελο <strong className="text-[#8B5E3C]">spam/ανεπιθύμητα</strong> για να βρείτε το email μας!
          </p>
          <div className="bg-[#F2E8DE] rounded-2xl p-4 mb-6">
            <p className="text-sm text-[#8B5E3C] font-light">
              📌 Μόλις επιβεβαιώσετε το email σας, επιστρέψτε εδώ και συνδεθείτε με τους κωδικούς σας!
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 transition-all text-center"
          >
            Σύνδεση →
          </Link>
        </div>
        <p className="text-xs text-[#B09880] font-light">
          Δεν λάβατε email; Ελέγξτε τα spam ή επικοινωνήστε μαζί μας στο{" "}
          <a href="mailto:info@mylittlememorybox.gr" className="text-[#C4A882] hover:text-[#8B5E3C]">
            info@mylittlememorybox.gr
          </a>
        </p>
      </div>
    </div>
  );
}
