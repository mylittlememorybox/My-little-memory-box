'use client'

import { useSearchParams } from ‘next/navigation’
import Link from ‘next/link’

const templates: Record<string, any> = {
‘first-years’: {
emoji: ‘🍼’,
name: ‘Τα Πρώτα Χρόνια’,
priceId: ‘price_1TTP6PI6cMM6olNfgyRPXeoy’,
basePrice: ‘29.99’,
features: [
‘Ψηφιακό λεύκωμα με όλες τις σημαντικές στιγμές από τα πρώτα χρόνια του μωρού σας’,
‘Προσωποποιημένο ebook παραμύθι με ήρωα το παιδί σας’,
‘Πρόσβαση χωρίς περιορισμό χρόνου για συμπλήρωση’,
‘Πρόσβαση 30 ημέρες για download αφού ολοκληρώσετε’,
],
stripColor: ‘from-[#C49090] to-[#D4ACAC]’,
},
‘me-and-you’: {
emoji: ‘💑’,
name: ‘Εγώ & Εσύ’,
priceId: ‘price_1TUvjoI6cMM6olNfqYPKW6f5’,
basePrice: ‘24.99’,
features: [
‘Η ιστορία της σχέσης μας μέσα σε ένα Memory Box γεμάτο αναμνήσεις και φωτογραφίες’,
‘Για να μείνει το συναίσθημα μας ζωντανό μέσα στο χρόνο’,
‘Ένα ebook με ήρωες εσάς και το άλλο σας μισό’,
‘Πρόσβαση χωρίς περιορισμό χρόνου για συμπλήρωση’,
‘Πρόσβαση 30 ημέρες για download αφού ολοκληρώσετε’,
],
stripColor: ‘from-[#C4A882] to-[#D4BC98]’,
},
‘our-wedding’: {
emoji: ‘💍’,
name: ‘Ο Γάμος Μας’,
priceId: ‘price_1TUvpKI6cMM6olNfvpuY7qxq’,
basePrice: ‘19.99’,
features: [
‘Ένα Memory Box γεμάτο με όλες τις στιγμές και τα συναισθήματα της πιο σημαντικής μέρας της ζωής σας’,
‘Που δεν θέλετε να χαθούν μέσα στο χρόνο’,
‘Γεγονότα και συναισθήματα που μόνο οι φωτογραφίες δεν μπορούν κρατήσουν ζωντανά’,
‘Πρόσβαση χωρίς περιορισμό χρόνου για συμπλήρωση’,
‘Πρόσβαση 30 ημέρες για download αφού ολοκληρώσετε’,
],
stripColor: ‘from-[#D4B8A8] to-[#E8CCC0]’,
},
}

export default function CheckoutPage() {
const searchParams = useSearchParams()
const templateId = searchParams.get(‘template’) || ‘first-years’
const isGift = searchParams.get(‘gift’) === ‘true’
const template = templates[templateId]

if (!template) {
return (
<div className="min-h-screen bg-[#F9F2EC] flex items-center justify-center">
<div className="text-center">
<h1 className="text-2xl text-[#8B5E3C] mb-4 font-serif">Memory Box not found</h1>
<Link href="/" className="text-[#C49090] font-light">← Επιστροφή στην αρχική</Link>
</div>
</div>
)
}

const handlePayment = async () => {
try {
const response = await fetch(’/api/checkout’, {
method: ‘POST’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({
priceId: template.priceId,
isGift,
}),
})
const { url } = await response.json()
if (url) window.location.href = url
} catch (error) {
console.error(‘Payment error:’, error)
alert(‘Σφάλμα κατά την επεξεργασία της πληρωμής’)
}
}

return (
<div className="min-h-screen bg-[#F9F2EC]">
{/* HEADER */}
<header className="bg-white shadow-sm sticky top-0 z-50">
<div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
<Link
href="/"
className="w-16 h-16 flex items-center justify-center hover:opacity-80 transition-opacity"
>
<img
src=”/logo.png”
alt=“My Little Memory Box”
className=“w-full h-full object-contain”
onError={(e) => {
e.currentTarget.src = ‘data:image/svg+xml,%3Csvg xmlns=“http://www.w3.org/2000/svg” width=“64” height=“64”%3E%3Crect fill=”%23F5EDE0” width=“64” height=“64”/%3E%3Ctext x=“50%” y=“50%” text-anchor=“middle” dy=”.3em” font-size=“32” fill=”%23C49090”%3E🎀%3C/text%3E%3C/svg%3E’
}}
/>
</Link>
<Link
href="/"
className="text-xs font-light tracking-widest uppercase text-[#8B5E3C] hover:text-[#5C3820]"
>
← Αρχική
</Link>
</div>
</header>

```
  {/* CONTENT */}
  <div className="pt-12 pb-20 px-6 max-w-2xl mx-auto">
    {/* Gift Badge */}
    {isGift && (
      <div className="bg-[#F2E8DE] rounded-full py-2 px-6 mb-8 text-center text-sm text-[#C4A882] font-light tracking-widest uppercase">
        🎁 Κάντο Δώρο
      </div>
    )}

    {/* Header */}
    <div className="text-center mb-12">
      <div className="text-5xl mb-4">{template.emoji}</div>
      <h1 className="text-4xl md:text-5xl font-serif font-normal text-[#8B5E3C] mb-4">
        {template.name}
      </h1>
    </div>

    {/* Main Card */}
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-8">
      {/* Top Strip */}
      <div className={`h-2 bg-gradient-to-r ${template.stripColor}`} />

      {/* Content */}
      <div className="p-8">
        {/* Features */}
        <div className="mb-8">
          <h3 className="font-serif text-lg text-[#8B5E3C] mb-5">Τι περιλαμβάνει:</h3>
          <ul className="space-y-3">
            {template.features.map((feature: string, idx: number) => (
              <li key={idx} className="flex gap-3 text-sm font-light text-[#7A6055] leading-relaxed">
                <span className="text-[#C4A882] flex-shrink-0 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <hr className="h-px bg-[#C4A882] opacity-15 my-8" />

        {/* Price */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest uppercase text-[#B09880] mb-2">Τιμή</p>
          <div className="text-5xl font-serif font-normal text-[#5C3820]">
            {template.basePrice}€
          </div>
          <p className="text-xs text-[#B09880] mt-2">+ ΦΠΑ</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full py-4 bg-[#C49090] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            💳 {template.basePrice}€ + ΦΠΑ - Προχωρήστε στην πληρωμή
          </button>

          {/* Gift Button */}
          <button
            onClick={handlePayment}
            className="w-full py-4 bg-[#C47878] text-white rounded-full font-light uppercase tracking-wider text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            🎁 Κάντο Δώρο
          </button>
        </div>
      </div>
    </div>

    {/* Info Box */}
    <div className="bg-[#F2E8DE] rounded-3xl p-8">
      <h3 className="font-serif text-lg text-[#8B5E3C] mb-5">Πώς λειτουργεί:</h3>
      <div className="space-y-4 text-sm font-light text-[#7A6055]">
        <div className="flex gap-3">
          <span className="text-[#C4A882] flex-shrink-0">01</span>
          <div>
            <p className="font-normal text-[#8B5E3C] mb-1">Ολοκλήρωση Πληρωμής</p>
            <p className="text-[#B09880]">Δημιουργία λογαριασμού και πρόσβαση σε editor</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-[#C4A882] flex-shrink-0">02</span>
          <div>
            <p className="font-normal text-[#8B5E3C] mb-1">Συμπλήρωση Memory Box</p>
            <p className="text-[#B09880]">Πρόσθεσε φωτογραφίες και συμπλήρωσε τις ενότητες</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-[#C4A882] flex-shrink-0">03</span>
          <div>
            <p className="font-normal text-[#8B5E3C] mb-1">Λήψη Δώρου σου</p>
            <p className="text-[#B09880]">Κατέβασε το PDF και το ebook παραμύθι σου</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* FOOTER */}
  <footer className="bg-[#F2E8DE] py-8 px-6 text-center border-t border-[rgba(196,168,130,0.2)] mt-12">
    <p className="text-xs font-light text-[#B09880]">
      © 2025 My Little Memory Box · Όλα τα δικαιώματα διατηρούνται
    </p>
  </footer>
</div>
```

)
}
