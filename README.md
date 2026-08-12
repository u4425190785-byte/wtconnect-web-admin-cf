# wtconnect-web-admin-cf

Console **Super Admin** WTConnect — dépôt **Byte** (`u4425190785-byte`), Cloudflare Pages (`edge`).

Base de code alignée sur Glitch [`Wtconnectwebadmin`](https://github.com/cfonte732-glitch/Wtconnectwebadmin), pour l’écosystème Byte (API **`.123`**).

| | Ce repo | Portail user Byte |
|--|---------|-------------------|
| Repo | `wtconnect-web-admin-cf` | `wt-connect-web-cf` |
| Hébergeur | Cloudflare Pages | Cloudflare Pages |
| API | `api.185-124-202-123.sslip.io` | idem |

> Guide Pages : [`docs/CLOUDFLARE-PAGES.md`](./docs/CLOUDFLARE-PAGES.md)  
> Contrat API : [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md)

## Objectif

| Action | Description |
|--------|-------------|
| Créer un compte Auth | E-mail + mot de passe |
| Révoquer un compte | Ban / disable |
| Impersonation | Voir le portail « en tant que » un user |
| Lister les users | Recherche / memberships |

## Stack

- Next.js → Cloudflare Pages (`npm run pages:build`)
- API : `NEXT_PUBLIC_API_URL` → routes `/admin/*`
- Inactif côté API tant que `SUPER_ADMIN_EMAILS` est vide (503)
- **Jamais** de `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

→ http://localhost:3001
