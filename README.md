# Wtconnectwebadmin

Console **Super Admin** WTConnect — front **séparé** du portail utilisateur (`wtconnect-web` / `portail.wintruckconnect.net`).

> Spec : [`docs/ADR-SUPER-ADMIN.md`](../docs/ADR-SUPER-ADMIN.md)  
> Cloudflare : [`docs/CLOUDFLARE-PAGES.md`](./docs/CLOUDFLARE-PAGES.md)

## Objectif

| Action | Description |
|--------|-------------|
| Créer un compte Auth | E-mail + mot de passe |
| Révoquer un compte | Ban / disable |
| Impersonation | Voir le portail « en tant que » un user |
| Lister les users | Recherche / memberships |

## Stack

- Next.js → Cloudflare Pages (`npm run pages:build`)
- API : `NEXT_PUBLIC_API_URL` → routes `/admin/*` (`wtconnect-api`)
- Inactif côté API tant que `SUPER_ADMIN_EMAILS` est vide (503)
- **Jamais** de `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur

## Local

```bash
cd Wtconnectwebadmin
cp .env.example .env.local
npm install
npm run dev
```

→ http://localhost:3001

## Repo GitHub

**Glitch (primaire pour ce projet) :** https://github.com/cfonte732-glitch/Wtconnectwebadmin  

Cloudflare Pages : [docs/CLOUDFLARE-PAGES.md](./docs/CLOUDFLARE-PAGES.md) — brancher ce repo.

## Contrat API

[docs/API-CONTRACT.md](./docs/API-CONTRACT.md)
