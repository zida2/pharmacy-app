# ⚡ ACTION IMMÉDIATE - PharmaBF

## 🎯 CE QU'IL RESTE À FAIRE (5 minutes)

### ÉTAPE 1: IMPORTER LES PHARMACIES ✅ CRITIQUE

**L'application est prête SAUF les données !**

```bash
1. Ouvrir: http://localhost:3000/admin/import
2. Cliquer sur "Cliquez pour upload le JSON"
3. Sélectionner: scraper/pharmacies_for_webapp_import.json
4. Attendre 2-3 minutes
5. Vérifier message de succès : "297 pharmacies importées"
```

**Alternative si ça ne marche pas:**
- Allez sur Firebase Console → Firestore
- Importez manuellement le fichier JSON

---

### ÉTAPE 2: VÉRIFICATION RAPIDE

```bash
1. Ouvrir: http://localhost:3000
2. Rechercher une pharmacie (ex: "Marjean")
3. Vérifier qu'elle apparaît sur la carte
4. Cliquer sur "De Garde" → Vérifier qu'il y a des résultats
```

---

### ÉTAPE 3: DÉPLOIEMENT

**Si tout fonctionne en local:**

```bash
# Installer Vercel
npm install -g vercel

# Déployer
cd frontend
vercel --prod
```

Suivez les instructions, puis :
- Ajoutez les variables d'environnement sur Vercel dashboard
- Redéployez

**Votre app sera en ligne en 5-10 minutes !**

---

## 📁 FICHIERS IMPORTANTS

| Fichier | Utilité |
|---------|---------|
| `scraper/pharmacies_for_webapp_import.json` | **297 pharmacies à importer** |
| `frontend/.env.local` | Configuration Firebase |
| `GUIDE_DEPLOIEMENT_FINAL.md` | Guide détaillé |

---

## 🔥 EN CAS DE PROBLÈME

### Les pharmacies ne s'affichent pas après l'import?

```typescript
// Vérifier dans: frontend/src/services/firebaseService.ts (ligne 25)
const USE_REAL_BACKEND = true; // DOIT être true !
```

### L'import web ne fonctionne pas ?

```bash
# Utiliser Firebase Console directement
https://console.firebase.google.com
→ Votre projet → Firestore → Import/Export
```

### Firebase timeout ?

```typescript
// Dans firebaseService.ts, augmenter le timeout (ligne 28)
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000)
```

---

## ✅ SYSTÈME DE GARDE

**Comment ça marche:**

Le système lit directement le champ `isGuardToday` et `status` des données importées.

- Si `isGuardToday = true` → Pharmacie sera affichée comme "De Garde"
- Le champ `groupe` (1-4) est aussi stocké pour référence

**Pour mettre à jour les gardes:**

1. Re-lancer le scraper (récupère les nouvelles gardes depuis ONPBF)
2. Re-importer les données via l'interface admin

---

## 🚀 ORDRE DES PRIORITÉS

1. **MAINTENANT** → Importer les 297 pharmacies
2. **AUJOURD'HUI** →  Tester toutes les fonctionnalités
3. **CE SOIR** → Déployer sur Vercel
4. **DEMAIN** → Collecter feedbacks utilisateurs
5. **CETTE SEMAINE** → Ajuster selon feedbacks

---

## 📞 RÉSUMÉ ULTRA-RAPIDE

```
🎯 OBJECTIF: Application prête ce soir
📊 DONNÉES: 297 pharmacies ready
⏱️ TEMPS RESTANT: ~15 minutes max
🔴 BLOQUANT: Import des données (ÉTAPE 1)
🟢 STATUS: 95% complété
```

---

**GO ! Lancez l'import maintenant ! 🚀**
