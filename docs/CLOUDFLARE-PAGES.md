# Cloudflare Pages — wtconnect-web-admin-cf (Byte)

Console Super Admin Byte → API **`.123`**.  
≠ portail user (`wt-connect-web-cf`) ≠ front Render (`wtconnect-web`).

## 1. Repo GitHub

https://github.com/u4425190785-byte/wtconnect-web-admin-cf (`main`)

Source métier : miroir de `cfonte732-glitch/Wtconnectwebadmin`.

## 2. Nouveau projet Cloudflare Pages

Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

| Champ | Valeur |
|--------|--------|
| Repository | `u4425190785-byte/wtconnect-web-admin-cf` |
| Project name | `wtconnect-web-admin-cf` (minuscules) |
| Production branch | `main` |
| Framework preset | **None** |
| **Build command** | `npm run pages:build` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | *(vide)* |
| **Deploy command** | *(vide)* |

Ne **pas** publier le dossier `.next`.

## 3. Variables d’environnement

Production (et Preview si besoin) :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.185-124-202-123.sslip.io` |
| `NEXT_PUBLIC_PORTAL_URL` | `https://wt-connect-web-cf.pages.dev` |

Sans `/` final. Après toute modif `NEXT_PUBLIC_*` → **Redeploy**.

## 4. Domaine

URL typique : `https://wtconnect-web-admin-cf.pages.dev`  
Custom domain optionnel (CNAME vers `*.pages.dev`).

## 5. API (VPS `.123`)

Dans `~/wtconnect/deploy/.env.api` :

```env
CORS_ORIGINS=...,https://wtconnect-web-admin-cf.pages.dev,http://localhost:3001
SUPER_ADMIN_EMAILS=c.fontaine@2sn.fr
PORTAL_PUBLIC_URL=https://wt-connect-web-cf.pages.dev
```

Puis :

```bash
cd ~/wtconnect/deploy
docker compose -f docker-compose.api.yml --env-file .env.api up -d api
```

Smoke :

```bash
curl -fsS https://api.185-124-202-123.sslip.io/health
curl -fsS https://api.185-124-202-123.sslip.io/admin/health
```

## 6. Première connexion

1. Ouvrir `https://wtconnect-web-admin-cf.pages.dev/login`
2. Compte dont l’e-mail est dans `SUPER_ADMIN_EMAILS`
3. Écrans `/users` : créer / révoquer / impersonation
