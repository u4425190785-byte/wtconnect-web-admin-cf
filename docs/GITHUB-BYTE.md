# Créer le dépôt GitHub sous u4425190785-byte

`gh` sur cette machine est connecté en **cfonte732-glitch** uniquement.
Le dépôt Super Admin doit être créé **d’abord** sur le profil **byte** (règle Byte avant Glitch).

## Une fois authentifié en byte

```powershell
cd wtconnect-admin
gh auth login   # compte u4425190785-byte

gh repo create u4425190785-byte/wtconnect-admin --private `
  --source=. --remote=byte --push `
  --description "Console Super Admin WTConnect (Pages dédiées)"
```

Puis, après validation, miroir glitch :

```powershell
gh repo create cfonte732-glitch/wtconnect-admin --private
git remote add origin https://github.com/cfonte732-glitch/wtconnect-admin.git
git push origin main
```

## En attendant

Le code local `wtconnect-admin/` est prêt (squelette + client API).
L’API `/admin/*` est dans `wtconnect-api` (additive, inactive sans `SUPER_ADMIN_EMAILS`).
