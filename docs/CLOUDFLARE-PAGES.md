# Cloudflare Pages — Wtconnectwebadmin

Guide pour brancher **cette** interface Super Admin sur un **nouveau** projet Cloudflare Pages.  
≠ `wtconnect-web` / `portail.wintruckconnect.net`.

## 1. Repo GitHub (Glitch d’abord pour ce projet)

Nom du dépôt : **`Wtconnectwebadmin`**

**Déjà créé :** https://github.com/cfonte732-glitch/Wtconnectwebadmin (`origin` / `main`)

Pour ce repo, l’ordre est **Glitch → Byte** (décision projet). Miroir byte optionnel plus tard :

```powershell
# Après création du dépôt vide côté u4425190785-byte :
git push byte main
```

Cloudflare Pages : connecter **`cfonte732-glitch/Wtconnectwebadmin`**.

## 2. Nouveau projet Cloudflare Pages

Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

| Champ | Valeur |
|--------|--------|
| Repository | `u4425190785-byte/Wtconnectwebadmin` (ou le miroir une fois promu) |
| Project name | `Wtconnectwebadmin` |
| Production branch | `main` |
| Framework preset | Next.js (ou None) |
| **Build command** | `npm run pages:build` |
| **Build output directory** | *(vide si `wrangler.toml` détecté)* — sinon `.vercel/output/static` |
| **Root directory** | `/` (racine du repo) |
| **Deploy command** | *(vide)* |

Ne **pas** publier le dossier `.next`.

## 3. Variables d’environnement (Pages → Settings → Environment variables)

Production (et Preview si besoin) :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.185-124-202-100.sslip.io` (sans `/` final) |
| `NEXT_PUBLIC_PORTAL_URL` | `https://portail.wintruckconnect.net` |

Après toute modif `NEXT_PUBLIC_*` → **Redeploy**.

## 4. Domaine custom (optionnel)

Pages → **Custom domains** → ex. `admin.wintruckconnect.net`  
DNS chez le registrar / Cloudflare : CNAME vers `Wtconnectwebadmin.pages.dev`.

URL de secours Cloudflare : `https://Wtconnectwebadmin.pages.dev`

## 5. API (serveur) — sans casser le portail

Dans `~/wtconnect/deploy/.env.api` :

```env
# AJOUTER l’origine admin (ne pas retirer portail / pages.dev)
CORS_ORIGINS=https://wtconnect-web.pages.dev,https://portail.wintruckconnect.net,https://Wtconnectwebadmin.pages.dev,https://admin.wintruckconnect.net,http://localhost:3001

# Activer Super Admin (allowlist)
SUPER_ADMIN_EMAILS=c.fontaine@2sn.fr
PORTAL_PUBLIC_URL=https://portail.wintruckconnect.net
```

Redémarrer l’API **après** avoir déployé l’image qui contient les routes `/admin/*` :

```bash
cd ~/wtconnect/deploy
docker compose -f docker-compose.api.yml --env-file .env.api up -d --build api
```

Smoke (ne doit pas casser l’existant) :

```bash
curl -fsS https://api.185-124-202-100.sslip.io/health
curl -fsS https://api.185-124-202-100.sslip.io/connect/einvoicing/health
curl -fsS https://api.185-124-202-100.sslip.io/admin/health
# → {"ok":true,"module":"super-admin","configured":true|false}
```

## 6. Première connexion

1. Ouvrir `https://Wtconnectwebadmin.pages.dev/login` (ou ton custom domain)
2. Compte Auth dont l’e-mail est dans `SUPER_ADMIN_EMAILS`
3. Écrans `/users` : créer / révoquer / impersonation

Ce login **n’est pas** celui du portail user (même cookies API possibles, mais allowlist admin obligatoire).
