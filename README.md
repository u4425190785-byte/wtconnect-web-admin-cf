# wtconnect-admin

Console **Super Admin** WTConnect — front séparé du portail utilisateur.

> **Phase 0** : squelette local uniquement.  
> **Ne modifie pas** `wtconnect-web` / `wtconnect-api` / le portail en production.  
> Spec : [`docs/ADR-SUPER-ADMIN.md`](../docs/ADR-SUPER-ADMIN.md)

## Objectif

| Action | Description |
|--------|-------------|
| Créer un compte Auth | E-mail + mot de passe |
| Révoquer un compte | Ban / disable |
| Impersonation | Voir le portail « en tant que » un user |
| Lister les users | Recherche / memberships |

## Stack prévue

- Next.js (Pages Cloudflare) — même famille que `wtconnect-web`
- Appels **uniquement** vers l’API (`NEXT_PUBLIC_API_URL`) routes `/admin/*`
- Routes implémentées dans `wtconnect-api` (additives) — **503** tant que `SUPER_ADMIN_EMAILS` est vide
- **Jamais** de `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur

## URL cible

Exemple : `https://admin.wintruckconnect.net` (Cloudflare Pages + DNS dédié).  
CORS : ajouter cette origine à `CORS_ORIGINS` **seulement** au moment du déploiement admin (sans retirer `portail` / `pages.dev`).

## Démarrage local (quand les deps seront installées)

```bash
cd wtconnect-admin
cp .env.example .env.local
npm install
npm run dev
```

Les écrans actuels sont des **maquettes** (pas branchées à une API admin réelle).

## Repo GitHub

Voir [docs/GITHUB-BYTE.md](./docs/GITHUB-BYTE.md) — créer sous **u4425190785-byte** d’abord (`gh` doit être authentifié en byte).

Commit local initial prêt sur `main`. Remote à ajouter après création du dépôt :

```bash
git remote add byte https://github.com/u4425190785-byte/wtconnect-admin.git
git push -u byte main
```

## Contrat API

Voir [docs/API-CONTRACT.md](./docs/API-CONTRACT.md).
