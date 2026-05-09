export default function PrivacyPage() {
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
          Πολιτικη Απορρητου και Προστασια Δεδομενων
        </h1>
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>

        <div className="space-y-8 text-[#7A6055] font-light leading-relaxed">

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">1. Υπευθυνος Επεξεργασιας</h2>
            <p>Υπευθυνος επεξεργασιας των προσωπικων σας δεδομενων ειναι:</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong>Επωνυμια:</strong> My Little Memory Box</li>
              <li><strong>Διευθυνση:</strong> Αλοννησου 7, Βολος 38221</li>
              <li><strong>ΑΦΜ:</strong> 157374699</li>
              <li><strong>Email:</strong> info@mylittlememorybox.gr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">2. Ποια Δεδομενα Συλλεγουμε</h2>
            <p>Συλλεγουμε τα ακολουθα προσωπικα δεδομενα:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Ονομα και email κατα την εγγραφη</li>
              <li>Email κατα την αγορα η αποστολη δωρου</li>
              <li>Φωτογραφιες και κειμενα που εισαγετε στο Memory Box σας</li>
              <li>Στοιχεια πληρωμης (διαχειριζεται αποκλειστικα η Stripe)</li>
              <li>Τεχνικα δεδομενα (IP, browser, cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">3. Σκοπος Επεξεργασιας</h2>
            <p>Τα δεδομενα σας χρησιμοποιουνται αποκλειστικα για:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Παροχη της υπηρεσιας Memory Box</li>
              <li>Αποστολη του QR code δωρου στο email σας</li>
              <li>Επικοινωνια σχετικα με την παραγγελια σας</li>
              <li>Αποστολη ενημερωτικου newsletter (μονο με συγκαταθεση)</li>
              <li>Βελτιωση της υπηρεσιας μας</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">4. Νομικη Βαση Επεξεργασιας</h2>
            <p>Η επεξεργασια των δεδομενων σας βασιζεται στις εξης νομικες βασεις (αρθρο 6 GDPR):</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li><strong>Εκτελεση συμβασης:</strong> για την παροχη της υπηρεσιας</li>
              <li><strong>Συγκαταθεση:</strong> για newsletter και marketing</li>
              <li><strong>Εννομο συμφερον:</strong> για βελτιωση της υπηρεσιας</li>
              <li><strong>Νομικη υποχρεωση:</strong> για φορολογικους σκοπους</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">5. Διαβιβαση σε Τριτους</h2>
            <p>Τα δεδομενα σας δεν πωλουνται σε τριτους. Διαβιβαζονται μονο στους παρακατω παροχους υπηρεσιων:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li><strong>Stripe:</strong> επεξεργασια πληρωμων</li>
              <li><strong>Zoho:</strong> αποστολη email</li>
              <li><strong>Vercel:</strong> φιλοξενια ιστοσελιδας</li>
            </ul>
            <p className="mt-3">Ολοι οι παροχοι συμμορφωνονται με τον GDPR.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">6. Χρονος Διατηρησης</h2>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Στοιχεια λογαριασμου: εως τη διαγραφη του λογαριασμου</li>
              <li>Περιεχομενο Memory Box: 30 ημερες μετα την ολοκληρωση</li>
              <li>Δεδομενα πληρωμων: 5 χρονια (φορολογικη υποχρεωση)</li>
              <li>Cookies: εως 12 μηνες</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">7. Τα Δικαιωματα σας</h2>
            <p>Βασει του GDPR εχετε τα εξης δικαιωματα:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li><strong>Προσβαση:</strong> να γνωριζετε ποια δεδομενα τηρουμε</li>
              <li><strong>Διορθωση:</strong> να διορθωσετε ανακριβη δεδομενα</li>
              <li><strong>Διαγραφη:</strong> να ζητησετε τη διαγραφη των δεδομενων σας</li>
              <li><strong>Φορητοτητα:</strong> να λαβετε τα δεδομενα σας σε αναγνωσιμη μορφη</li>
              <li><strong>Εναντιωση:</strong> να αντιταχθειτε στην επεξεργασια</li>
              <li><strong>Ανακληση συγκαταθεσης:</strong> ανα πασα στιγμη</li>
            </ul>
            <p className="mt-3">Για ασκηση δικαιωματων επικοινωνηστε: <a href="mailto:info@mylittlememorybox.gr" className="text-[#C4A882] hover:text-[#8B5E3C]">info@mylittlememorybox.gr</a></p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">8. Cookies</h2>
            <p>Χρησιμοποιουμε cookies για την ευρυθμη λειτουργια της ιστοσελιδας. Μπορειτε να απενεργοποιησετε τα cookies απο τις ρυθμισεις του browser σας.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">9. Ασφαλεια Δεδομενων</h2>
            <p>Εφαρμοζουμε καταλληλα τεχνικα και οργανωτικα μετρα για την προστασια των δεδομενων σας, συμπεριλαμβανομενης της κρυπτογραφησης SSL και της ασφαλους αποθηκευσης.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">10. Καταγγελια</h2>
            <p>Εχετε δικαιωμα καταγγελιας στην Αρχη Προστασιας Δεδομενων Προσωπικου Χαρακτηρα (ΑΠΔΠΧ):</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li>Website: <a href="https://www.dpa.gr" className="text-[#C4A882]" target="_blank">www.dpa.gr</a></li>
              <li>Τηλεφωνο: 210 6475600</li>
              <li>Email: contact@dpa.gr</li>
            </ul>
          </section>

          <p className="text-xs text-[#B09880] pt-8 border-t border-[rgba(196,168,130,0.2)]">
            Τελευταια ενημερωση: Μαιος 2026
          </p>
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
