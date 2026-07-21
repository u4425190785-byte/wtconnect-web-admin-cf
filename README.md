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
- Appels **uniquement** vers l’API (`NEXT_PUBLIC_API_URL`) routes `/admin/*` (à venir)
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

Dossier prêt à être extrait / poussé vers un dépôt dédié (ex. `wtconnect-admin`), miroir Byte puis Glitch selon la règle Git WTConnect.

## Contrat API

Voir [docs/API-CONTRACT.md](./docs/API-CONTRACT.md).
