// Bouwt de Paisan-site: src/pages/*.html + layout -> dist/
// Gebruik: node build.js
const fs = require("fs");
const path = require("path");

const SITE = "https://www.paisanhilversum.nl";
const RESERVE_BAR = "mailto:info@paisanhilversum.nl?subject=Reservering%20Balagan%20Bar"; // tijdelijk, tot de Zenchef-code van de bar er is
const RESERVE = "https://bookings.zenchef.com/results?rid=380945&pid=1001";
// Beeld staat voorlopig nog op de Framer-CDN; vóór livegang naar /assets/img verplaatsen.
const IMG = (id, w = 1600) => `https://framerusercontent.com/images/${id}?scale-down-to=${w}`;

const pages = [
  { file: "index", out: "", nav: "",
    title: "Paisan Hilversum | Mediterrane bar, restaurant en stadstuin",
    desc: "Mediterrane mezzes om te delen, een grote zonnige stadstuin met jeu de boules en een bar in hartje Hilversum. Elke dag open vanaf 10:00." },
  { file: "balagan-bar", out: "balagan-bar", nav: "balagan-bar",
    title: "De Balagan Bar | DJ, Balagan en groepen in Hilversum",
    desc: "De Balagan Bar van Paisan aan de Groest 16: het Balagan-menu om te delen, DJ op zaterdag, Boozy Sunday Brunch en een semi-privé plek voor groepen tot 22 personen." },
  { file: "menu", motif: "bestek-licht", out: "menu", nav: "menu",
    title: "Menukaart | Paisan Hilversum",
    desc: "Bekijk de dagkaart en avondkaart van Paisan: mediterrane mezzes om te delen, met invloeden uit het Midden-Oosten." },
  { file: "groepen", motif: "wijnglas-licht", out: "groepen", nav: "groepen",
    title: "Groepen en besloten feesten | Paisan Hilversum",
    desc: "Dineren, borrelen of feesten met 20 tot 200 gasten in onze bar, het restaurant of de stadstuin. Mezze- en Balagan-arrangementen vanaf €35 p.p." },
  { file: "evenementen", motif: "cocktail-licht", out: "evenementen", nav: "evenementen",
    title: "Evenementen | Paisan Hilversum",
    desc: "Brunch met DJ, Dinner Party's met mezzes en meer: dit is er binnenkort te doen bij Paisan in Hilversum." },
  { file: "jeu-de-boules", motif: "boom-licht", out: "jeu-de-boules", nav: "jeu-de-boules",
    title: "Jeu de boules in de stadstuin | Paisan Hilversum",
    desc: "Reserveer een jeu de boules-baan in onze stadstuin in hartje Hilversum, voor €25 per uur, met een drankje van de buitenbar." },
  { file: "over-ons", motif: "wijnvrouw-licht", out: "over-ons", nav: "over-ons",
    title: "Over ons | Paisan Hilversum",
    desc: "Paisan is van Koen en David: een bar, restaurant en stadstuin aan de Naarderstraat waar je binnenkomt als gast en vertrekt als vriend." },
  { file: "contact", motif: "krans-licht", out: "contact", nav: "contact",
    title: "Contact en route | Paisan Hilversum",
    desc: "Paisan, Naarderstraat 7, 1211 AH Hilversum. Bel 035 544 70 75 of mail info@paisanhilversum.nl. Elke dag open vanaf 10:00." },
  { file: "werkenbij", motif: "bestek-licht", out: "werkenbij", nav: "werkenbij",
    title: "Werken bij Paisan | Vacatures in Hilversum",
    desc: "Werken in de keuken of bediening van Paisan? We staan altijd open voor ervaren, gemotiveerde mensen, zeker richting het zomerseizoen." },
  { file: "bedankt", motif: "krans-licht", out: "groepen/bedankt", nav: "groepen", noindex: true,
    title: "Bedankt voor je aanvraag | Paisan Hilversum",
    desc: "We hebben je groepsaanvraag ontvangen." },
];

const navItems = [
  ["menu", "Menu"], ["balagan-bar", "Balagan Bar"], ["groepen", "Groepen"], ["evenementen", "Evenementen"],
  ["jeu-de-boules", "Jeu de boules"], ["over-ons", "Over ons"], ["contact", "Contact"],
];

const jsonLd = {
  "@context": "https://schema.org", "@type": "Restaurant",
  name: "Paisan Hilversum", url: SITE + "/",
  image: SITE + "/assets/img/mezze-tafel.jpg",
  telephone: "+31355447075", email: "info@paisanhilversum.nl",
  servesCuisine: ["Mediterraans", "Midden-Oosters"], priceRange: "€€",
  acceptsReservations: "True", menu: SITE + "/menu",
  address: { "@type": "PostalAddress", streetAddress: "Naarderstraat 7", postalCode: "1211 AH", addressLocality: "Hilversum", addressCountry: "NL" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "10:00" }],
  sameAs: ["https://www.instagram.com/paisan_hilversum/", "https://www.facebook.com/paisanhilversum", "https://www.tiktok.com/@paisan_hilversum", "https://www.linkedin.com/company/restaurant-paisan/"],
};

const header = (cur) => `
<a class="skip" href="#main">Naar de inhoud</a>
<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="/"><img src="/assets/img/logo-sand.png" alt="Paisan, bar, restaurant, stadstuin" width="640" height="287"></a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Hoofdmenu">
      ${navItems.map(([k, l]) => `<a href="/${k}"${k === cur ? ' aria-current="page"' : ""}>${l}</a>`).join("\n      ")}
      <a class="btn btn-sand" href="${RESERVE}">Reserveren</a>
    </nav>
  </div>
</header>`;

const footer = `
<footer class="site-footer has-motif">
  <img class="motif m-foot" src="/assets/motif/krans-licht.png" alt="" aria-hidden="true" loading="lazy">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="wordmark" href="/"><img src="/assets/img/logo-sand.png" alt="Paisan" width="640" height="287"></a>
        <p>Bar, restaurant en stadstuin in hartje Hilversum.</p>
      </div>
      <div>
        <h2>Bezoek ons</h2>
        <ul>
          <li>Naarderstraat 7<br>1211 AH Hilversum</li>
          <li>Balagan Bar: Groest 16</li>
          <li><a href="tel:+31355447075">035 544 70 75</a></li>
          <li><a href="mailto:info@paisanhilversum.nl">info@paisanhilversum.nl</a></li>
        </ul>
      </div>
      <div>
        <h2>Openingstijden</h2>
        <ul><li>Elke dag vanaf 10:00 tot laat</li><li>Keuken: ma–vr tot 21:00, za en zo tot 22:00</li><li>Balagan Bar: elke avond vanaf 17:00</li></ul>
        <h2 style="margin-top:1em">Direct naar</h2>
        <ul>
          <li><a href="${RESERVE}">Reserveren</a></li>
          <li><a href="/groepen#aanvraag">Groepsaanvraag</a></li>
          <li><a href="/werkenbij">Werken bij</a></li>
        </ul>
      </div>
      <div>
        <h2>Volg ons</h2>
        <ul>
          <li><a href="https://www.instagram.com/paisan_hilversum/">Instagram</a></li>
          <li><a href="https://www.facebook.com/paisanhilversum">Facebook</a></li>
          <li><a href="https://www.tiktok.com/@paisan_hilversum">TikTok</a></li>
          <li><a href="https://www.linkedin.com/company/restaurant-paisan/">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <p class="legal">© ${new Date().getFullYear()} Paisan B.V. · Naarderstraat 7, Hilversum</p>
  </div>
</footer>
<!-- Zenchef Widget SDK: knoppen met data-zc-action="open" openen het reserveervenster; zonder SDK werkt de gewone link -->
<script>;(function (d, s, id) {const el = d.getElementsByTagName(s)[0]; if (d.getElementById(id) || el.parentNode == null) {return;} var js = d.createElement(s);  js.id = id; js.async = true; js.src = 'https://sdk.zenchef.com/v1/sdk.min.js'; js.onload = function(){ window.__zcReady = true; }; el.parentNode.insertBefore(js, el); })(document, 'script', 'zenchef-sdk')</script>
<div class="zc-widget-config" data-restaurant="380945"></div>
<script>
  document.addEventListener('click',function(e){var a=e.target.closest('a[data-zc-action="open"]');if(a&&window.__zcReady){e.preventDefault();}});
  const t=document.querySelector('.menu-toggle'),n=document.getElementById('nav');
  t&&t.addEventListener('click',()=>{const o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);t.textContent=o?'Sluiten':'Menu';});
</script>`;

const layout = (p, body) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${SITE}/${p.out}">
<meta property="og:type" content="website">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${SITE}/${p.out}">
<meta property="og:image" content="${SITE}/assets/img/mezze-tafel.jpg">
<meta property="og:locale" content="nl_NL">
<meta name="twitter:card" content="summary_large_image">
<meta name="google-site-verification" content="IzBnSYQndCLuVm6DvSpl85SfTpxATmgmo4MJ9K1mHrU">
<meta name="theme-color" content="#992F2F">${p.noindex ? '\n<meta name="robots" content="noindex">' : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Blinker:wght@400;600;700&family=Yellowtail&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${p.file === "index" ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body>
${header(p.nav)}
<main id="main">
${body}
</main>
${footer}
</body>
</html>
`;

const dist = path.join(__dirname, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, "static"), dist, { recursive: true });

for (const p of pages) {
  let body = fs.readFileSync(path.join(__dirname, "src/pages", p.file + ".html"), "utf8");
  if (p.motif) body = body.replace('<div class="page-hero">', `<div class="page-hero has-motif"><img class="motif m-page" src="/assets/motif/${p.motif}.png" alt="" aria-hidden="true">`);
  body = body.replaceAll("{{RESERVE_BAR}}", RESERVE_BAR).replaceAll("{{RESERVE}}", RESERVE).replace(/\{\{IMG:([^}|]+)(?:\|(\d+))?\}\}/g, (_, id, w) => IMG(id, w ? +w : 1600));
  const outDir = path.join(dist, p.out);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), layout(p, body).replaceAll(`href="${RESERVE}"`, `href="${RESERVE}" data-zc-action="open"`));
}

fs.writeFileSync(path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE}/${p.out}</loc></url>`).join("\n") + `\n</urlset>\n`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("Gebouwd:", pages.length, "pagina's in dist/");
