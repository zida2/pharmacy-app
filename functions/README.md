# 🏥 PharmaBF - Système de Scraping Automatique

## 📋 Vue d'ensemble

Ce système scrape automatiquement toutes les pharmacies du Burkina Faso depuis le site ANAC et les synchronise avec Firebase Firestore.

## ✨ Fonctionnalités

- ✅ Scraping de toutes les villes du Burkina Faso (20 villes principales)
- ✅ Détection automatique des changements
- ✅ Mise à jour intelligente (pas de doublons)
- ✅ Fonction HTTP pour tests manuels
- ✅ Cron automatique toutes les nuits à minuit
- ✅ Logs détaillés pour monitoring
- ✅ Support des pharmacies de garde
- ✅ Gestion des erreurs et retry

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd functions
npm install
```

### 2. Configurer Firebase

Assurez-vous que Firebase CLI est installé:

```bash
npm install -g firebase-tools
firebase login
```

Initialiser Firebase (si pas déjà fait):

```bash
firebase init functions
```

### 3. Variables d'environnement (optionnel)

Pour sécuriser l'accès HTTP, créez un fichier `.env`:

```bash
SCRAPER_API_KEY=votre_cle_secrete_ici
```

Puis configurez-le dans Firebase:

```bash
firebase functions:config:set scraper.api_key="votre_cle_secrete_ici"
```

## 📦 Déploiement

### Déployer toutes les fonctions

```bash
firebase deploy --only functions
```

### Déployer une fonction spécifique

```bash
firebase deploy --only functions:scrapePharmacies
firebase deploy --only functions:scrapeDailyPharmacies
```

## 🌐 Utilisation

### 1. Test manuel (HTTP)

Lancer un scraping complet manuellement:

```bash
curl https://us-central1-[PROJECT-ID].cloudfunctions.net/scrapePharmacies
```

Avec clé API (si configurée):

```bash
curl "https://us-central1-[PROJECT-ID].cloudfunctions.net/scrapePharmacies?key=votre_cle_secrete"
```

### 2. Test d'une ville spécifique

```bash
curl "https://us-central1-[PROJECT-ID].cloudfunctions.net/testScrapeVille?ville=Ouagadougou"
```

### 3. Obtenir les statistiques

```bash
curl https://us-central1-[PROJECT-ID].cloudfunctions.net/getPharmaciesStats
```

### 4. Exécution planifiée (automatique)

La fonction `scrapeDailyPharmacies` s'exécute automatiquement tous les jours à minuit (heure Burkina Faso).

Aucune action requise de votre part.

## 📊 Structure des données Firestore

### Collection: `pharmacies`

Chaque document représente une pharmacie:

```javascript
{
  nom: "Pharmacie Centrale - Ouagadougou",
  adresse: "Avenue Kwame Nkrumah",
  telephone: "+226 25 30 40 50",
  ville: "Ouagadougou",
  isGarde: false,
  source: "ANAC",
  changed: false,
  docId: "pharmacie_centrale_ouagadougou",
  scrapedAt: Timestamp,
  lastUpdated: Timestamp,
  previousUpdate: Timestamp | null
}
```

### Clé unique

Chaque pharmacie a un ID unique basé sur:
```
nom_ville (normalisé en lowercase, sans accents ni espaces)
```

## 🔍 Logs et Monitoring

### Voir les logs en temps réel

```bash
firebase functions:log --only scrapePharmacies
```

### Logs détaillés incluent:

- ✅ Nombre de pharmacies par ville
- ✅ Nouvelles pharmacies créées
- ✅ Pharmacies mises à jour
- ✅ Changements détectés
- ✅ Erreurs rencontrées

## ⚙️ Configuration avancée

### Modifier les villes scrapées

Éditez le tableau `VILLES_BURKINA` dans `functions/index.js`:

```javascript
const VILLES_BURKINA = [
    'Ouagadougou',
    'Bobo-Dioulasso',
    // ... ajoutez vos villes
];
```

### Modifier l'horaire du cron

Dans `functions/index.js`, ligne avec `.schedule()`:

```javascript
.schedule('0 0 * * *') // Minuit tous les jours
// Autres exemples:
// '0 */6 * * *'  // Toutes les 6 heures
// '0 2 * * *'    // 2h du matin
// '0 0 * * 1'    // Lundi à minuit
```

### Augmenter le timeout ou mémoire

```javascript
.runWith({
    timeoutSeconds: 540,  // 9 minutes max
    memory: '2GB'         // 256MB, 512MB, 1GB, 2GB
})
```

## ⚠️ IMPORTANT: Adapter les sélecteurs CSS

Le code actuel utilise des **données fictives (mock)** pour le développement.

Pour scraper le vrai site ANAC, vous DEVEZ:

1. **Inspecter le HTML du site ANAC** avec les DevTools du navigateur
2. **Identifier les sélecteurs CSS** corrects pour:
   - Nom de la pharmacie
   - Adresse
   - Téléphone
   - Badge "de garde"

3. **Modifier la fonction `scrapePharmaciesByVille()`** ligne ~60:

```javascript
// Remplacer ces sélecteurs par les vrais:
const nom = $el.find('.pharmacy-name').text().trim();
const adresse = $el.find('.pharmacy-address').text().trim();
const telephone = $el.find('.pharmacy-phone').text().trim();
```

4. **Retirer la fonction `generateMockPharmacies()`** une fois en production

## 🐛 Résolution de problèmes

### Erreur: "Function timed out"

Augmentez le timeout:
```javascript
.runWith({ timeoutSeconds: 540 })
```

### Erreur: "Quota exceeded"

Le scraping génère beaucoup d'écritures Firestore. Surveillez vos quotas Firebase.

### Aucune pharmacie trouvée

1. Vérifiez que l'URL du site ANAC est correcte
2. Vérifiez les sélecteurs CSS
3. Ajoutez des `console.log()` pour débugger
4. Testez avec `testScrapeVille` pour une ville

### Pharmacies en double

Le système utilise une clé unique `nom_ville`. Si le nom change légèrement, un doublon peut être créé.

## 📱 Utilisation dans l'app React

Votre app React récupère automatiquement les données mises à jour:

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';

// Récupérer toutes les pharmacies
const pharmaciesRef = collection(db, 'pharmacies');
const snapshot = await getDocs(pharmaciesRef);

// Récupérer les pharmacies d'une ville
const q = query(pharmaciesRef, where('ville', '==', 'Ouagadougou'));
const citySnapshot = await getDocs(q);

// Récupérer les pharmacies de garde
const gardeQuery = query(pharmaciesRef, where('isGarde', '==', true));
const gardeSnapshot = await getDocs(gardeQuery);
```

## 📈 Estimation des coûts

### Firebase Functions
- Gratuit jusqu'à 2 millions d'invocations/mois
- Scraping quotidien = 30 invocations/mois ✅ GRATUIT

### Firestore
- Gratuit jusqu'à 50,000 lectures + 20,000 écritures/jour
- ~100 pharmacies × 20 villes = 2,000 écritures/jour ✅ GRATUIT

## 🔒 Sécurité

### Protéger l'endpoint HTTP

Ajoutez une clé API:

```javascript
const apiKey = req.query.key;
if (apiKey !== process.env.SCRAPER_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
}
```

### Règles Firestore

Assurez-vous que seules les Cloud Functions peuvent écrire:

```javascript
match /pharmacies/{docId} {
    allow read: if true;
    allow write: if false; // Seules les fonctions peuvent écrire
}
```

## 📞 Support

Pour toute question ou problème:
1. Consultez les logs Firebase
2. Vérifiez la console Firebase
3. Testez avec les fonctions de test HTTP

## 🎉 Prêt à déployer !

```bash
cd functions
npm install
firebase deploy --only functions
```

Votre système de scraping est maintenant opérationnel ! 🚀
