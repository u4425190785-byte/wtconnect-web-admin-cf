# Contrat API Super Admin

> **Statut** : implémenté côté `wtconnect-api` (routes additives).  
> Inactif en prod tant que `SUPER_ADMIN_EMAILS` est vide (réponses **503**).  
> Le portail user (`/auth/login`, `/connect/*`) est **inchangé**.

Base URL : même host API que le portail (ex. `https://api.185-124-202-100.sslip.io`).  
Auth : session cookie super-admin (même mécanisme cookies que `/auth/*`, guard rôle différent).

## Auth super-admin

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `POST` | `/admin/auth/login` | Login allowlist / `app_metadata.role=super_admin` |
| `POST` | `/admin/auth/logout` | Logout |
| `GET` | `/admin/auth/session` | Session courante |

Réponses d’erreur : `401` si non authentifié, `403` si authentifié mais pas super-admin.

## Users

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `GET` | `/admin/users?page=&per_page=&q=` | Liste / recherche (proxy GoTrue Admin) |
| `POST` | `/admin/users` | Créer user `{ email, password?, email_confirm? }` |
| `POST` | `/admin/users/:id/reset-password` | `{ password }` |
| `POST` | `/admin/users/:id/revoke` | Ban / disable |
| `GET` | `/admin/users/:id/memberships` | Tenants via `connect_members` |

### `POST /admin/users` — corps

```json
{
  "email": "user@example.com",
  "password": "MotDePasseGenereOuSaisi!",
  "email_confirm": true
}
```

Si `password` omis : généré côté serveur, renvoyé **une seule fois** dans la réponse.

### `POST /admin/users/:id/revoke` — corps

```json
{
  "mode": "ban",
  "remove_memberships": false
}
```

`mode`: `ban` | `delete` (politique à figer avant implémentation).

## Impersonation

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `POST` | `/admin/impersonate` | `{ "user_id": "<uuid>" }` → jeton one-shot |
| `POST` | `/auth/impersonation/exchange` | (portail) échange jeton → session marquée |

Réponse impersonate (exemple) :

```json
{
  "exchange_url": "https://portail.wintruckconnect.net/impersonate?token=…",
  "expires_in": 900
}
```

Le portail n’affiche le bandeau que si la session contient le marqueur d’impersonation (zéro impact sinon).

## Audit

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `GET` | `/admin/audit?limit=` | Dernières actions (création, revoke, impersonate) |

Table proposée (migration **nouveau numéro libre** uniquement) : `connect_admin_audit`.

## Hors scope de ce contrat

- Routes `/connect/*`, `/auth/login` user, `/v1/*` : **inchangées**
- Clés API TMS `wtc_…` : hors super-admin (reste dans Société / api-keys du portail)
