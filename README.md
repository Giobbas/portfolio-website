# portfolio-website

Sito portfolio personale di Giovanna Basilico — pagina statica in HTML/CSS/JS, senza framework né build step.

## Struttura

- `index.html` — pagina unica con sezione Hero, "Chi sono" ed "Esperienza"
- `style.css` — stili
- `script.js` — piccolo script (anno corrente nel footer)
- `assets/` — immagini

## Deploy su Cloudflare Pages

1. Push del repository su GitHub.
2. Su Cloudflare Pages, crea un nuovo progetto collegato al repository.
3. Build command: (nessuno)
4. Build output directory: `/`

Ogni push su `main` aggiorna automaticamente il sito.
