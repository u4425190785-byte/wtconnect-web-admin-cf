# Créer le dépôt GitHub `Wtconnectwebadmin` (byte d’abord)

`gh` sur beaucoup de postes est encore connecté en **cfonte732-glitch**.  
Le dépôt doit être créé **d’abord** sur **u4425190785-byte**.

## Création + push

```powershell
cd Wtconnectwebadmin
gh auth login   # compte u4425190785-byte

gh repo create u4425190785-byte/Wtconnectwebadmin --private `
  --source=. --remote=byte --push `
  --description "Console Super Admin WTConnect (Pages dédiées)"
```

## Dépôt déjà créé (vide) sur byte

```powershell
git remote add byte https://github.com/u4425190785-byte/Wtconnectwebadmin.git
git push -u byte main
```

## Miroir glitch (après validation utilisateur)

```powershell
gh auth login   # cfonte732-glitch si besoin
gh repo create cfonte732-glitch/Wtconnectwebadmin --private
git remote add origin https://github.com/cfonte732-glitch/Wtconnectwebadmin.git
git push origin main
```
