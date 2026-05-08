<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Little Memory Box</title>
<link href="https://fonts.googleapis.com/css2?family=GFS+Didot&family=Dancing+Script:wght@600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #F9F2EC;
  --bg2:         #F2E8DE;
  --text-h:      #8B5E3C;
  --text-body:   #7A6055;
  --text-light:  #B09880;
  --taupe:       #C4A882;
  --btn-create:  #C49090;
  --btn-gift:    #C47878;
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text-body);
  font-family: 'Jost', sans-serif;
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
}

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 18px 32px;
  display: flex; justify-content: center; gap: 40px;
  transition: background 0.4s, box-shadow 0.4s;
}
nav.scrolled {
  background: rgba(249,242,236,0.96);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 20px rgba(139,94,60,0.08);
}
.nav-links a {
  font-size: 0.75rem; font-weight: 400;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-h); text-decoration: none;
  transition: color 0.2s;
}
.nav-links a:hover { color: #5C3820; }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  background: var(--bg);
  display: flex; flex-direction: column;
  align-items: center;
  padding: 100px 28px 80px;
  position: relative; overflow: hidden;
}
.hero-glow {
  position: absolute; top: -80px; left: 50%;
  transform: translateX(-50%);
  width: 700px; height: 500px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(196,144,144,0.10) 0%, transparent 65%);
  pointer-events: none;
}

.logo-area {
  animation: fadeUp 0.8s ease 0.05s both;
  margin-bottom: 32px; margin-top: 16px;
}
.logo-area img {
  width: 210px;
  filter: drop-shadow(0 6px 20px rgba(139,94,60,0.12));
}
/* logo placeholder */
.logo-placeholder {
  width: 210px; height: 190px;
  background: rgba(196,144,144,0.07);
  border-radius: 20px;
  border: 1.5px dashed rgba(196,144,144,0.3);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px;
}
.logo-placeholder span:first-child { font-size: 2.2rem; }
.logo-placeholder span:last-child {
  font-size: 0.58rem; letter-spacing: 0.1em;
  color: #C49090; text-transform: uppercase;
}

.hero-h1 {
  font-family: 'GFS Didot', serif;
  font-size: clamp(2.6rem, 8vw, 4.8rem);
  font-weight: 400; color: var(--text-h);
  text-align: center; line-height: 1.18;
  max-width: 640px;
  animation: fadeUp 0.85s ease 0.2s both;
}

.divider {
  display: flex; align-items: center; gap: 14px;
  margin: 28px 0 24px;
  animation: fadeUp 0.85s ease 0.32s both;
}
.divider-line { width: 56px; height: 1px; background: var(--taupe); opacity: 0.5; }
.divider-icon { color: var(--taupe); font-size: 0.75rem; }

.hero-sub {
  font-size: 1rem; font-weight: 300;
  color: var(--text-light); text-align: center;
  max-width: 380px; line-height: 1.85;
  animation: fadeUp 0.85s ease 0.42s both;
}

/* single hero CTA */
.hero-cta {
  margin-top: 36px;
  animation: fadeUp 0.85s ease 0.52s both;
}
.btn-how {
  display: inline-block; text-align: center; text-decoration: none;
  font-family: 'Jost', sans-serif; font-size: 0.72rem;
  font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 15px 40px; border-radius: 50px;
  background: transparent;
  border: 1.5px solid var(--btn-create);
  color: var(--text-h);
  transition: all 0.25s;
}
.btn-how:hover { background: rgba(196,144,144,0.08); transform: translateY(-2px); }

/* scroll arrow */
.scroll-hint {
  margin-top: 52px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  animation: fadeUp 1s ease 0.9s both;
}
.scroll-hint p {
  font-size: 0.6rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--text-light);
}
.scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--taupe), transparent);
  animation: scrollAnim 2s ease-in-out infinite;
}
@keyframes scrollAnim {
  0%, 100% { opacity: 0.4; transform: scaleY(1); }
  50%       { opacity: 0.9; transform: scaleY(1.2); }
}

/* ── MEMORY BOXES SECTION ── */
.boxes-section {
  padding: 80px 24px 96px;
  background: var(--bg2);
}

.sec-header { text-align: center; margin-bottom: 60px; }
.sec-eyebrow {
  font-size: 0.65rem; letter-spacing: 0.32em;
  text-transform: uppercase; color: var(--taupe); margin-bottom: 12px;
}
.sec-title {
  font-family: 'GFS Didot', serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400; color: var(--text-h);
}
.sec-div {
  width: 80px; margin: 20px auto 0;
  display: flex; align-items: center; gap: 10px;
}
.sec-div::before, .sec-div::after {
  content: ''; flex: 1; height: 1px;
  background: var(--taupe); opacity: 0.4;
}
.sec-div span { color: var(--taupe); font-size: 0.7rem; }

/* ── BOX CARDS ── */
.boxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 28px; max-width: 1040px; margin: 0 auto;
}

.box-card {
  background: #fff; border-radius: 28px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(92,56,32,0.08);
  transition: transform 0.4s, box-shadow 0.4s;
  display: flex; flex-direction: column;
}
.box-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 52px rgba(92,56,32,0.14);
}

/* top accent strip */
.box-strip { height: 5px; }

.box-body { padding: 32px 28px 0; text-align: center; flex: 1; }
.box-emoji { font-size: 2.8rem; }
.box-name {
  font-family: 'GFS Didot', serif;
  font-size: 1.7rem; font-weight: 400;
  color: #5C3820; margin-top: 12px;
}
.box-tagline {
  font-size: 0.67rem; letter-spacing: 0.13em;
  text-transform: uppercase; color: var(--text-light); margin-top: 5px;
}
.box-desc {
  font-size: 0.82rem; font-weight: 300;
  color: var(--text-body); margin-top: 14px;
  line-height: 1.75; text-align: left;
}

.box-hr { height: 1px; margin: 20px 28px; opacity: 0.15; background: var(--taupe); border: none; }

.box-features { padding: 0 28px; list-style: none; }
.box-features li {
  font-size: 0.79rem; font-weight: 300; color: var(--text-body);
  padding: 6px 0; display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(196,168,130,0.12);
}
.box-features li:last-child { border-bottom: none; }
.feat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

/* ── CARD BOTTOM ── */
.box-bottom { padding: 22px 28px 28px; }

.box-price {
  font-family: 'GFS Didot', serif;
  font-size: 2.8rem; font-weight: 400;
  color: #5C3820; text-align: center;
  line-height: 1; margin-bottom: 18px;
}
.box-price sup { font-size: 1.1rem; vertical-align: super; }

/* TWO BUTTONS per card */
.box-btns { display: flex; flex-direction: column; gap: 9px; }

.box-btn {
  display: block; width: 100%;
  padding: 14px; border-radius: 50px;
  font-family: 'Jost', sans-serif; font-size: 0.7rem;
  font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase;
  text-decoration: none; text-align: center;
  border: none; cursor: pointer;
  transition: all 0.25s;
}
.box-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
.box-btn:active { transform: scale(0.97); }

.box-btn-create {
  background: var(--btn-create); color: #fff;
  box-shadow: 0 4px 16px rgba(196,144,144,0.3);
}
.box-btn-gift {
  background: var(--btn-gift); color: #fff;
  box-shadow: 0 4px 16px rgba(196,120,120,0.28);
}

/* ── HOW IT WORKS ── */
.how { padding: 88px 24px; background: var(--bg); text-align: center; }
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 40px; max-width: 800px; margin: 52px auto 52px;
}
.step-num {
  font-family: 'GFS Didot', serif; font-size: 3.6rem;
  font-weight: 400; color: rgba(196,168,130,0.32); line-height: 1;
}
.step-title {
  font-family: 'GFS Didot', serif; font-size: 1.3rem;
  color: var(--text-h); margin-top: 8px;
}
.step-desc {
  font-size: 0.8rem; font-weight: 300; color: var(--text-light);
  margin-top: 8px; line-height: 1.7; max-width: 190px; margin-inline: auto;
}

/* ── FOOTER ── */
footer {
  background: var(--bg2); padding: 52px 24px; text-align: center;
  border-top: 1px solid rgba(196,168,130,0.2);
}
.foot-name { font-family: 'Dancing Script', cursive; font-size: 1.7rem; color: var(--text-h); }
.foot-url { font-size: 0.65rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--taupe); margin-top: 4px; }
footer hr { width: 60px; border: none; border-top: 1px solid rgba(196,168,130,0.3); margin: 18px auto; }
.foot-copy { font-size: 0.7rem; font-weight: 300; color: var(--text-light); }
.foot-email { display: block; font-size: 0.72rem; color: var(--taupe); text-decoration: none; margin-top: 6px; transition: color 0.2s; }
.foot-email:hover { color: var(--text-h); }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.d1 { transition-delay: 0.08s; } .d2 { transition-delay: 0.18s; } .d3 { transition-delay: 0.28s; }
</style>
</head>
<body>

<!-- NAV -->
<nav id="nav">
  <div class="nav-links">
    <a href="#">Αρχική</a>
    <a href="#">Λογαριασμός μου</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>

  <div class="logo-area">
    <div class="logo-placeholder">
      <span>🎀</span>
      <span>logo.png</span>
    </div>
  </div>

  <h1 class="hero-h1">
    Ένα μέρος για να κρατήσεις
    όλες τις στιγμές που δεν
    θέλεις να ξεχαστούν ποτέ.
  </h1>

  <div class="divider">
    <div class="divider-line"></div>
    <span class="divider-icon">✦</span>
    <div class="divider-line"></div>
  </div>

  <p class="hero-sub">
    Δημιούργησε το δικό σου Memory Box γεμάτο
    φωτογραφίες και λόγια αγάπης και χάρισε στο
    παιδί σου ένα προσωποποιημένο ebook παραμύθι.
  </p>

  <div class="hero-cta">
    <a href="#boxes" class="btn-how">Δες τα Memory Boxes ↓</a>
  </div>

  <div class="scroll-hint">
    <p>Scroll</p>
    <div class="scroll-line"></div>
  </div>
</section>

<!-- MEMORY BOXES -->
<section class="boxes-section" id="boxes">
  <div class="sec-header">
    <p class="sec-eyebrow reveal">Τα λευκώματά μας</p>
    <h2 class="sec-title reveal d1">Επίλεξε το Memory Box σου</h2>
    <div class="sec-div reveal d2"><span>✦</span></div>
  </div>

  <div class="boxes-grid">

    <!-- BOX 1: Τα Πρώτα Χρόνια -->
    <div class="box-card reveal d1">
      <div class="box-strip" style="background: linear-gradient(90deg,#C49090,#D4ACAC);"></div>
      <div class="box-body">
        <div class="box-emoji">🍼</div>
        <div class="box-name">Τα Πρώτα Χρόνια</div>
        <div class="box-tagline">Για τα πρώτα χρόνια ζωής του μωρού</div>
        <p class="box-desc">
          Κράτησε κάθε «πρώτη φορά» — το πρώτο χαμόγελο,
          τα πρώτα βήματα, τις πρώτες λέξεις. Ένα λεύκωμα
          που θα αγαπήσει να ανακαλύπτει όταν μεγαλώσει.
        </p>
      </div>
      <hr class="box-hr">
      <ul class="box-features">
        <li><div class="feat-dot" style="background:#C49090;"></div>Φωτογραφίες & αναμνήσεις ανά ενότητα</li>
        <li><div class="feat-dot" style="background:#C49090;"></div>Μήνυμα αγάπης από γονείς</li>
        <li><div class="feat-dot" style="background:#C49090;"></div>Timeline πρώτων στιγμών</li>
        <li><div class="feat-dot" style="background:#C49090;"></div>Προσωποποιημένο ebook παραμύθι</li>
        <li><div class="feat-dot" style="background:#C49090;"></div>Εκτυπώσιμο PDF</li>
      </ul>
      <div class="box-bottom">
        <div class="box-price"><sup>€</sup>19</div>
        <div class="box-btns">
          <a href="checkout.html?template=baby-first-years" class="box-btn box-btn-create">✨ Δημιούργησε το δικό σου Memory Box</a>
          <a href="checkout.html?template=baby-first-years&gift=true" class="box-btn box-btn-gift">🎁 Κάντο Δώρο</a>
        </div>
      </div>
    </div>

    <!-- BOX 2: Γάμος -->
    <div class="box-card reveal d2">
      <div class="box-strip" style="background: linear-gradient(90deg,#C4A882,#D4BC98);"></div>
      <div class="box-body">
        <div class="box-emoji">💍</div>
        <div class="box-name">Γάμος & Αρραβώνας</div>
        <div class="box-tagline">Η μέρα που άλλαξε τα πάντα</div>
        <p class="box-desc">
          Αθάνατες αναμνήσεις από την πιο σημαντική μέρα.
          Φωτογραφίες, η ιστορία σας, ευχές από
          αγαπημένα πρόσωπα.
        </p>
      </div>
      <hr class="box-hr">
      <ul class="box-features">
        <li><div class="feat-dot" style="background:#C4A882;"></div>Φωτογραφίες της μέρας</li>
        <li><div class="feat-dot" style="background:#C4A882;"></div>Η ιστορία σας</li>
        <li><div class="feat-dot" style="background:#C4A882;"></div>Ευχές αγαπημένων</li>
        <li><div class="feat-dot" style="background:#C4A882;"></div>Προσωποποιημένο ebook παραμύθι</li>
        <li><div class="feat-dot" style="background:#C4A882;"></div>Εκτυπώσιμο PDF</li>
      </ul>
      <div class="box-bottom">
        <div class="box-price"><sup>€</sup>24</div>
        <div class="box-btns">
          <a href="checkout.html?template=wedding" class="box-btn box-btn-create">✨ Δημιούργησε το δικό σου Memory Box</a>
          <a href="checkout.html?template=wedding&gift=true" class="box-btn box-btn-gift">🎁 Κάντο Δώρο</a>
        </div>
      </div>
    </div>

    <!-- BOX 3: Βάπτιση -->
    <div class="box-card reveal d3">
      <div class="box-strip" style="background: linear-gradient(90deg,#A8B89A,#C0CCAC);"></div>
      <div class="box-body">
        <div class="box-emoji">🕊️</div>
        <div class="box-name">Βάπτιση</div>
        <div class="box-tagline">Μια μέρα ευλογίας & αγάπης</div>
        <p class="box-desc">
          Μια ξεχωριστή μέρα που αξίζει να μείνει για πάντα.
          Φωτογραφίες, ευχές νονών και αγαπημένων,
          μήνυμα γονέων.
        </p>
      </div>
      <hr class="box-hr">
      <ul class="box-features">
        <li><div class="feat-dot" style="background:#A8B89A;"></div>Φωτογραφίες βάπτισης</li>
        <li><div class="feat-dot" style="background:#A8B89A;"></div>Ευχές νονών & οικογένειας</li>
        <li><div class="feat-dot" style="background:#A8B89A;"></div>Μήνυμα γονέων</li>
        <li><div class="feat-dot" style="background:#A8B89A;"></div>Προσωποποιημένο ebook παραμύθι</li>
        <li><div class="feat-dot" style="background:#A8B89A;"></div>Εκτυπώσιμο PDF</li>
      </ul>
      <div class="box-bottom">
        <div class="box-price"><sup>€</sup>19</div>
        <div class="box-btns">
          <a href="checkout.html?template=baptism" class="box-btn box-btn-create">✨ Δημιούργησε το δικό σου Memory Box</a>
          <a href="checkout.html?template=baptism&gift=true" class="box-btn box-btn-gift">🎁 Κάντο Δώρο</a>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how" id="how">
  <p class="sec-eyebrow reveal">Απλά & γρήγορα</p>
  <h2 class="sec-title reveal d1">Πώς λειτουργεί</h2>
  <div class="sec-div reveal d2"><span>✦</span></div>
  <div class="steps">
    <div class="reveal d1">
      <div class="step-num">01</div>
      <div class="step-title">Επίλεξε Memory Box</div>
      <p class="step-desc">Διάλεξε αυτό που ταιριάζει στην περίσταση</p>
    </div>
    <div class="reveal d2">
      <div class="step-num">02</div>
      <div class="step-title">Συμπλήρωσε το</div>
      <p class="step-desc">Πρόσθεσε φωτογραφίες και λόγια αγάπης</p>
    </div>
    <div class="reveal d3">
      <div class="step-num">03</div>
      <div class="step-title">Μοιράσου το</div>
      <p class="step-desc">Λήψη PDF ή αποστολή ως ψηφιακό δώρο με QR code</p>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="foot-name">My Little Memory Box</div>
  <div class="foot-url">mylittlememorybox.gr</div>
  <hr>
  <p class="foot-copy">© 2025 My Little Memory Box · Όλα τα δικαιώματα διατηρούνται</p>
  <a href="mailto:info@mylittlememorybox.gr" class="foot-email">info@mylittlememorybox.gr</a>
</footer>

<script>
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30))
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
}, { threshold: 0.1 })
document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
</script>
</body>
</html>
