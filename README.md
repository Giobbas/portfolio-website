# Portfolio — Giovanna Basilico

Sito personale single-page: HTML, CSS e JavaScript senza framework né build.
Senior Digital Project Manager | Product Owner.

## Struttura

```
portfolio-website/
├── index.html                  tutta la pagina (contenuti + layout)
├── css/style.css               reset, custom properties, stati hover, media query
├── js/main.js                  menu, voce attiva, animazioni allo scroll
├── assets/
│   ├── Giovanna_Basilico_CV_2026.pdf   CV scaricabile
│   ├── favicon-petrol.png
│   └── images/
│       ├── giovanna-basilico.jpg       foto hero (640px, JPEG)
│       ├── jb-logo-petrol.png          logo header
│       ├── jb-logo.png                 logo footer (invertito via CSS)
│       ├── betty-boys-logo.png         logo associazione
│       └── clients/                    loghi dei progetti selezionati
├── robots.txt
└── sitemap.xml
```

## Avviare in locale

Basta aprire `index.html` nel browser. Per avere i percorsi assoluti corretti:

```bash
python -m http.server 8000
# poi apri http://localhost:8000
```

## Dove modificare i contenuti

Tutto il testo è in `index.html`, in ordine di lettura della pagina. Ogni sezione
ha un id che corrisponde alle voci di menu:

| Sezione | id | Cosa contiene |
|---|---|---|
| Hero | (prima `section`) | nome, posizionamento, foto, citazione |
| Numeri chiave | `aria-label="Numeri chiave"` | 10+, 30+, 8–12 |
| Cosa faccio | `#cosa-faccio` | quattro aree di lavoro |
| Progetti | `#progetti` | cinque case study |
| Clienti & settori | `#clienti` | clienti raggruppati per settore |
| Esperienza | `#esperienza` | timeline con barra di avanzamento |
| Competenze | `#competenze` | aree di competenza e strumenti |
| SEO/GEO | `#seo-geo` | practice, roadmap in 4 tappe, retroscena |
| Formazione | `#formazione` | studi e lingue |
| Oltre il lavoro | `#oltre` | interessi e associazione Betty Boys |
| Contatti | `#contatti` | email, CV, LinkedIn |

### Sostituire il CV

Sovrascrivi `assets/Giovanna_Basilico_CV_2026.pdf` mantenendo lo stesso nome:
i tre link di download (header, menu mobile, contatti) puntano già lì. Se cambi
nome file, aggiorna gli attributi `href` e `download` nei tre punti.

### Aggiungere un progetto

Duplica un blocco `<article>` dentro `#progetti` e sostituisci: nome cliente
(`h3`), attività, azienda e periodo, i tag `<li>`, Challenge, Il mio ruolo e i
punti di "Su cosa ho lavorato". Aggiorna `data-delay` (+60ms per card) per
mantenere la comparsa a cascata.

### Aggiungere formazione, corsi o certificazioni

Dentro `#formazione`, duplica un `<li data-reveal="1" ...>` della lista studi:
data, titolo, ente. La struttura regge senza modifiche anche corsi,
certificazioni e workshop; per un gruppo separato, duplica il blocco `<div>`
di "Lingue" e cambia titolo e contenuto.

### Aggiungere un cliente

Dentro `#clienti`, aggiungi il nome nel box del settore giusto (separatore ` · `)
oppure duplica un box per un nuovo settore: la griglia si adatta da sola.

## Note tecniche

- Nessuna dipendenza da installare. Da CDN: Google Fonts (Instrument Sans,
  Instrument Serif, Source Serif 4), Font Awesome 6 e una icona Material Symbols.
- Gli stili sono inline nel markup per tenere ogni blocco modificabile dove si
  legge; `css/style.css` contiene reset, custom properties, stati `:hover`,
  pseudo-elementi e media query.
- Tutte le animazioni sono disattivate con `prefers-reduced-motion: reduce`.
- I valori dei contatori sono già scritti nell'HTML: se JavaScript non parte, i
  numeri restano corretti.
- SEO: title, meta description, Open Graph, canonical, favicon, dati strutturati
  Schema.org `Person`, `robots.txt` e `sitemap.xml`.

## Deploy

Sito statico: qualsiasi hosting va bene.

**GitHub Pages** — push su `main`, poi Settings → Pages → Source: `main`, cartella
`/root` (o `/docs` se sposti i file). Con dominio personalizzato aggiungi un file
`CNAME` con `giovannabasilico.com`.

**Netlify / Vercel** — collega il repository, nessun comando di build, publish
directory: la cartella del sito.

**Hosting tradizionale (FTP)** — carica il contenuto della cartella nella root
del dominio.

Dopo il primo deploy verifica che `https://giovannabasilico.com/sitemap.xml` e
`/robots.txt` rispondano, e aggiorna `lastmod` nella sitemap a ogni modifica
sostanziale.
