export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9F2EC]">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-6 flex justify-center">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="My Little Memory Box" className="w-24 h-auto" />
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif text-[#8B5E3C] mb-4 text-center">
          Όροι & Προϋποθέσεις
        </h1>
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>

        <div className="space-y-8 text-[#7A6055] font-light leading-relaxed">

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">1. Στοιχεία Παρόχου</h2>
            <p>Η ιστοσελίδα mylittlememorybox.gr ανήκει και διαχειρίζεται από:</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong>Ονοματεπώνυμο:</strong> Λαμπρινού Χριστίνα</li>
              <li><strong>Διεύθυνση:</strong> Πλαταιών 19, Μαραθώνας 19007</li>
              <li><strong>ΑΦΜ:</strong> 157374699</li>
              <li><strong>Email:</strong> info@mylittlememorybox.gr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">2. Αντικείμενο Υπηρεσιών</h2>
            <p>Το My Little Memory Box παρέχει ψηφιακά λευκώματα αναμνήσεων (Memory Boxes) και προσωποποιημένα ebook παραμύθια. Πρόκειται για αμιγώς ψηφιακά προϊόντα που παρέχονται μέσω διαδικτύου.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">3. Διαδικασία Αγοράς</h2>
            <p>Η αγορά πραγματοποιείται ηλεκτρονικά μέσω της πλατφόρμας Stripe. Με την ολοκλήρωση της πληρωμής, ο χρήστης αποκτά πρόσβαση στην υπηρεσία. Η σύμβαση θεωρείται συναφθείσα κατά την επιβεβαίωση της πληρωμής.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">4. Τιμές & Πληρωμή</h2>
            <p>Όλες οι τιμές αναγράφονται σε ευρώ (€) και προσαυξάνονται με τον αντίστοιχο ΦΠΑ. Η πληρωμή πραγματοποιείται μέσω ασφαλούς σύνδεσης SSL μέσω της πλατφόρμας Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">5. Πρόσβαση & Διάρκεια</h2>
            <p>Μετά την αγορά, ο χρήστης έχει:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Απεριόριστη πρόσβαση για τη συμπλήρωση του Memory Box</li>
              <li>Πρόσβαση 30 ημερών για download/export μετά την ολοκλήρωση</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">6. Δικαίωμα Υπαναχώρησης</h2>
            <p>Σύμφωνα με τον Ν. 2251/1994 και την Οδηγία 2011/83/ΕΕ, για ψηφιακό περιεχόμενο που παρέχεται online, το δικαίωμα υπαναχώρησης παύει να ισχύει μόλις ο χρήστης αρχίσει να χρησιμοποιεί την υπηρεσία, εφόσον έχει δώσει τη ρητή συγκατάθεσή του.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">7. Πνευματική Ιδιοκτησία</h2>
            <p>Όλο το περιεχόμενο της ιστοσελίδας (σχέδια, κείμενα, εικόνες, λογότυπο) αποτελεί πνευματική ιδιοκτησία του My Little Memory Box και προστατεύεται από την ισχύουσα νομοθεσία. Απαγορεύεται η αναπαραγωγή χωρίς γραπτή άδεια.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">8. Περιορισμός Ευθύνης</h2>
            <p>Το My Little Memory Box δεν φέρει ευθύνη για τεχνικά προβλήματα που οφείλονται σε τρίτους παρόχους (Stripe, Vercel, Zoho). Καταβάλλεται κάθε δυνατή προσπάθεια για αδιάλειπτη λειτουργία της υπηρεσίας.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">9. Εφαρμοστέο Δίκαιο</h2>
            <p>Οι παρόντες όροι διέπονται από το Ελληνικό Δίκαιο. Για οποιαδήποτε διαφορά αρμόδια είναι τα Δικαστήρια της Αθήνας.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">10. Επικοινωνία</h2>
            <p>Για οποιαδήποτε απορία ή παράπονο επικοινωνήστε μαζί μας στο: <a href="mailto:info@mylittlememorybox.gr" className="text-[#C4A882] hover:text-[#8B5E3C]">info@mylittlememorybox.gr</a></p>
          </section>

          <p className="text-xs text-[#B09880] pt-8 border-t border-[rgba(196,168,130,0.2)]">
            Τελευταία ενημέρωση: Μάιος 2026
          </p>
        </div>
      </div>

      <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
        <p className="text-xs font-light text-[#B09880]">
          © 2025 My Little Memory Box - Όλα τα δικαιώματα διατηρούνται
        </p>
      </footer>
    </div>
  );
}
