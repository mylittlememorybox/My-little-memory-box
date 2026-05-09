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
          Οροι και Προϋποθεσεις
        </h1>
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
          <span className="text-[#C4A882] text-xs">✦</span>
          <div className="w-12 h-px bg-[#C4A882] opacity-40" />
        </div>

        <div className="space-y-8 text-[#7A6055] font-light leading-relaxed">

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">1. Στοιχεια Παροχου</h2>
            <p>Η ιστοσελιδα mylittlememorybox.gr ανηκει και διαχειριζεται απο:</p>
            <ul className="mt-3 space-y-1 pl-4">
              <li><strong>Επωνυμια:</strong> My Little Memory Box</li>
              <li><strong>Διευθυνση:</strong> Αλοννησου 7, Βολος 38221</li>
              <li><strong>ΑΦΜ:</strong> 157374699</li>
              <li><strong>Email:</strong> info@mylittlememorybox.gr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">2. Αντικειμενο Υπηρεσιων</h2>
            <p>Το My Little Memory Box παρεχει ψηφιακα λευκωματα αναμνησεων (Memory Boxes) και προσωποποιημενα ebook παραμυθια. Προκειται για αμιγως ψηφιακα προϊοντα που παρεχονται μεσω διαδικτυου.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">3. Διαδικασια Αγορας</h2>
            <p>Η αγορα πραγματοποιειται ηλεκτρονικα μεσω της πλατφορμας Stripe. Με την ολοκληρωση της πληρωμης, ο χρηστης αποκτα προσβαση στην υπηρεσια. Η συμβαση θεωρειται συναφθεισα κατα την επιβεβαιωση της πληρωμης.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">4. Τιμες και Πληρωμη</h2>
            <p>Ολες οι τιμες αναγραφονται σε ευρω (€) και προσαυξανονται με τον αντιστοιχο ΦΠΑ. Η πληρωμη πραγματοποιειται μεσω ασφαλους συνδεσης SSL μεσω της πλατφορμας Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">5. Προσβαση και Διαρκεια</h2>
            <p>Μετα την αγορα, ο χρηστης εχει:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Απεριοριστη προσβαση για τη συμπληρωση του Memory Box</li>
              <li>Προσβαση 30 ημερων για download/export μετα την ολοκληρωση</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">6. Δικαιωμα Υπαναχωρησης</h2>
            <p>Συμφωνα με τον Ν. 2251/1994 και την Οδηγια 2011/83/ΕΕ, για ψηφιακο περιεχομενο που παρεχεται online, το δικαιωμα υπαναχωρησης παυει να ισχυει μολις ο χρηστης αρχισει να χρησιμοποιει την υπηρεσια, εφοσον εχει δωσει τη ρητη συγκαταθεση του.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">7. Πνευματικη Ιδιοκτησια</h2>
            <p>Ολο το περιεχομενο της ιστοσελιδας (σχεδια, κειμενα, εικονες, λογοτυπο) αποτελει πνευματικη ιδιοκτησια του My Little Memory Box και προστατευεται απο την ισχυουσα νομοθεσια. Απαγορευεται η αναπαραγωγη χωρις γραπτη αδεια.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">8. Περιορισμος Ευθυνης</h2>
            <p>Το My Little Memory Box δεν φερει ευθυνη για τεχνικα προβληματα που οφειλονται σε τριτους παροχους (Stripe, Vercel, Zoho). Καταβαλλεται καθε δυνατη προσπαθεια για αδιαλειπτη λειτουργια της υπηρεσιας.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">9. Εφαρμοστεο Δικαιο</h2>
            <p>Οι παροντες οροι διεπονται απο το Ελληνικο Δικαιο. Για οποιαδηποτε διαφορα αρμοδια ειναι τα Δικαστηρια του Βολου.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#8B5E3C] mb-3">10. Επικοινωνια</h2>
            <p>Για οποιαδηποτε απορια επικοινωνηστε: <a href="mailto:info@mylittlememorybox.gr" className="text-[#C4A882] hover:text-[#8B5E3C]">info@mylittlememorybox.gr</a></p>
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
