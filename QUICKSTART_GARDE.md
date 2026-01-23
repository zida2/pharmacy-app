# 🚀 Installation Rapide - Système Pharmacies de Garde

## ⚡ Démarrage Ultra-Rapide (5 minutes)

### 1️⃣ Déployer les Cloud Functions

```bash
cd functions
firebase deploy --only functions:updateRealGuardPharmacies,functions:manualUpdateRealGuardPharmacies,functions:testGuardScraping
```

**Résultat attendu**:
```
✔ functions[updateRealGuardPharmacies] Successful create operation.
✔ functions[manualUpdateRealGuardPharmacies] Successful create operation.
✔ functions[testGuardScraping] Successful create operation.
```

### 2️⃣ Récupérer les URLs des fonctions

Après le déploiement, Firebase affiche les URLs:
```
Function URL (manualUpdateRealGuardPharmacies):
https://europe-west1-YOUR-PROJECT.cloudfunctions.net/manualUpdateRealGuardPharmacies
```

**Copier cette URL** ⬆️

### 3️⃣ Configurer l'interface admin

Ouvrir: `frontend/src/app/admin/guard/page.tsx`

**Ligne 19**, remplacer:
```typescript
const functionUrl = 'https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/manualUpdateRealGuardPharmacies';
```

Par votre URL copiée à l'étape 2.

### 4️⃣ Tester le système

#### Option A: Via l'interface web
1. Accédez à `http://localhost:3000/admin/guard`
2. Cliquez sur "Mettre à jour les pharmacies de garde"
3. Vérifiez les résultats

#### Option B: Via script (recommandé pour le premier test)
```bash
# Test sans mise à jour (voir ce qui serait scrapé)
curl https://YOUR-URL/testGuardScraping

# Mise à jour réelle
curl -X POST https://YOUR-URL/manualUpdateRealGuardPharmacies
```

#### Option C: Script local
```bash
node test-guard-system.js
```

### 5️⃣ Vérifier que ça marche

Recherchez "pharmacie de garde" dans l'app:
```
✅ Si vous voyez des pharmacies → Système opérationnel!
❌ Si aucune pharmacie → Voir le dépannage ci-dessous
```

---

## 🔧 Dépannage Express

### Problème: "Aucune pharmacie de garde trouvée"

**Cause probable**: Le site ANAC a changé de structure

**Solution**:
1. Visitez https://www.anacburkina.org (ou l'URL correcte)
2. Trouvez la page des pharmacies de garde
3. Faites un clic droit > Inspecter (F12)
4. Identifiez les éléments HTML qui contiennent les pharmacies
5. Mettez à jour les sélecteurs dans `functions/guard_pharmacies.js` ligne 86

**Exemple**:
```javascript
// Si les pharmacies sont dans <div class="pharmacy-card">
$('.pharmacy-card').each((index, element) => {
    const $el = $(element);
    const name = $el.find('.name').text().trim();
    // ...
});
```

### Problème: "Erreur 500 lors du scraping"

**Causes possibles**:
- Site ANAC inaccessible
- Sélecteurs CSS incorrects
- Timeout réseau

**Solution**:
1. Testez manuellement le site ANAC dans votre navigateur
2. Vérifiez les logs: `firebase functions:log`
3. Testez avec `testGuardScraping` pour voir l'erreur exacte

### Problème: "Pharmacies matchées mais noms différents"

**Normal!** L'algorithme de matching peut matcher "Pharmacie du Faso" avec "Phar. Faso"

**Si le taux de matching est < 50%**:
- Vérifiez que les données ANAC sont cohérentes
- Ajustez le seuil de similarité (ligne ~180 dans guard_pharmacies.js)

---

## 📅 Automatisation

Une fois configuré, le système:
- ✅ Scrape automatiquement à **6h00 chaque matin**
- ✅ Met à jour Firestore
- ✅ Les utilisateurs voient les vraies pharmacies de garde

**Aucune intervention manuelle nécessaire!**

---

## 🎯 Checklist Finale

- [ ] Functions déployées
- [ ] URL configurée dans page.tsx
- [ ] Test manuel réussi
- [ ] Au moins 1 pharmacie de garde trouvée
- [ ] Recherche "pharmacie de garde" fonctionne dans l'app
- [ ] Scraping automatique programmé (vérifier Firebase Console > Functions)

---

## 📞 Besoin d'aide?

1. Consultez `PHARMACIES_DE_GARDE.md` (doc complète)
2. Vérifiez les logs Firebase
3. Testez avec `test-guard-system.js`
4. Inspectez le site ANAC manuellement

---

**Temps total d'installation**: ~5-10 minutes  
**Maintenance requise**: Quasi aucune (sauf si ANAC change son site)  
**Fiabilité**: Données officielles gouvernementales ✅
