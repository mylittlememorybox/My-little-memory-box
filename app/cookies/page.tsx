import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Logo" className="w-16 h-auto" />
          </Link>
          <Link href="/" className="text-xs text-[#8B5E3C] uppercase tracking-widest">
            ← αρχική
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-serif text-[#8B5E3C] mb-2">πολιτική cookies</h1>
        <div className="flex items-center gap-2 my-4">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>
        <p className="text-xs text-[#B09880] mb-12">τελευταία ενημέρωση: ιανουάριος 2025</p>

        <div className="space-y-10 text-[#7A6055] font-light leading-relaxed">

          <section>
            <h2 className="font-serif text-lg text-[#8B5E3C] mb-3">τι είναι τα cookies</h2>
            <p className="text-sm">
              τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας όταν επισκέπτεστε έναν ιστότοπο.
              χρησιμοποιούνται ευρέως για να κάνουν τους ιστότοπους να λειτουργούν αποτελεσματικά και να παρέχουν πληροφορίες στους ιδιοκτήτες τους.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#8B5E3C] mb-3">ποια cookies χρησιμοποιούμε</h2>
            <p className="text-sm mb-4">
              χρησιμοποιούμε <strong className="font-normal text-[#8B5E3C]">μόνο απαραίτητα cookies</strong> για τη λειτουργία του ιστότοπου.
              δεν χρησιμοποιούμε cookies marketing, analytics ή τρίτων.
            </p>

            <div className="bg-white rounded-2xl overflow-hidden border border-[rgba(196,168,130,0.2)]">
              <div className="grid grid-cols-3 bg-[#F2E8DE] px-4 py-3">
                <p className="text-xs text-[#8B5E3C] uppercase tracking-wider">cookie</p>
                <p className="text-xs text-[#8B5E3C] uppercase tracking-wider">σκοπός</p>
                <p className="text-xs text-[#8B5E3C] uppercase tracking-wider">διάρκεια</p>
              </div>
              {[
                { name: "supabase-auth-token", purpose: "διαχείριση σύνδεσης χρήστη", duration: "7 ημέρες" },
                { name: "cookies_accepted", purpose: "αποθήκευση επιλογής cookies", duration: "1 χρόνος" },
              ].map((cookie, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 border-t border-[rgba(196,168,130,0.1)]">
                  <p className="text-xs text-[#5C3820] font-mono">{cookie.name}</p>
                  <p className="text-xs text-[#7A6055]">{cookie.purpose}</p>
                  <p className="text-xs text-[#7A6055]">{cookie.duration}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#8B5E3C] mb-3">γιατί τα χρησιμοποιούμε</h2>
            <p className="text-sm">
              τα cookies αυτά είναι απαραίτητα για:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "να παραμένετε συνδεδεμένοι στον λογαριασμό σας",
                "να αποθηκεύεται η επιλογή σας για τα cookies",
                "την ασφαλή πρόσβαση στο memory box σας",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#C4A882] flex-shrink-0">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#8B5E3C] mb-3">πώς να διαχειριστείτε τα cookies</h2>
            <p className="text-sm">
              μπορείτε να διαγράψετε ή να απενεργοποιήσετε τα cookies μέσα από τις ρυθμίσεις του browser σας.
              σημειώστε ότι η απενεργοποίηση των απαραίτητων cookies ενδέχεται να επηρεάσει τη λειτουργικότητα του ιστότοπου
              και να μην μπορείτε να συνδεθείτε στον λογαριασμό σας.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#8B5E3C] mb-3">επικοινωνία</h2>
            <p className="text-sm">
              για οποιαδήποτε ερώτηση σχετικά με την πολιτική cookies μας, επικοινωνήστε μαζί μας:
            </p>
            <a
              href="mailto:info@mylittlememorybox.gr"
              className="inline-block mt-3 text-sm text-[#C49090] hover:text-[#8B5E3C] transition-colors"
            >
              info@mylittlememorybox.gr
            </a>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(196,168,130,0.2)] flex gap-4 text-xs text-[#B09880]">
          <Link href="/privacy" className="hover:text-[#8B5E3C] transition-colors">πολιτική απορρήτου</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-[#8B5E3C] transition-colors">όροι χρήσης</Link>
        </div>
      </div>
    </div>
  );
}
