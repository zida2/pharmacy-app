# 🚀 GUIDE DE DÉPLOIEMENT FINAL - PharmaBF

## ✅ État Actuel

Votre application est **presque prête** pour le déploiement ! Voici ce qui est en place :

### Infrastructure ✓
- ✅ Application Next.js fonctionnelle
- ✅ Firebase configuré (Auth + Firestore)
- ✅ Interface admin d'import créée
- ✅ Données de 297 pharmacies prêtes

### Fonctionnalités ✓
- ✅ Recherche et carte interactive
- ✅ Authentification utilisateur  
- ✅ Panier et commandes
- ✅ Chat avec pharmaciens
- ✅ Gestion des traitements
- ✅ Support assurance maladie

---

## 📊 IMPORT DES DONNÉES (ÉTAPE CRITIQUE)

### Option 1: Import via Interface Web (RECOMMANDÉ)

1. **Ouvrir l'interface d'import**
   ```
   http://localhost:3000/admin/import
   ```

2. **Uploader le fichier**
   - Fichier: `scraper/pharmacies_for_webapp_import.json`
   - Taille: 297 pharmacies
   - L'import prendra environ 2-3 minutes

3. **Vérifier l'import**
   - Attendez le message de succès
   - Vérifiez que le nombre affiché est: 297 pharmacies importées

### Option 2: Import Manuel via Firebase Console

Si l'interface web ne fonctionne pas :

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. Allez dans Firestore Database
4. Importez via l'onglet "Import/Export"

---

## 🔧 CONFIGURATION FINALE

### 1. Variables d'environnement

Vérifiez que `frontend/.env.local` contient :

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=votre_clé
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Mode Production (IMPORTANT !)
NEXT_PUBLIC_USE_FIREBASE=true
```

### 2. Firestore Rules

Assurez-vous que les règles Firestore sont configurées :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pharmacies - Lecture publique, écriture admin
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Commandes - Utilisateurs authentifiés
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Assurances
    match /insurances/{insuranceId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Traitements
    match /treatments/{treatmentId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Consultations
    match /consultations/{consultationId} {
      allow read, write: if request.auth != null;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 DÉPLOIEMENT EN PRODUCTION

### Vercel (RECOMMANDÉ)

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Se connecter à Vercel**
   ```bash
   vercel login
   ```

3. **Déployer**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configurer les variables d'environnement**
   - Allez sur le dashboard Vercel
   - Ajoutez toutes les variables `.env.local`
   - Redéployez

### Alternative: Firebase Hosting

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## ⚡ MISES À JOUR DES PHARMACIES DE GARDE

### Mise à jour manuelle (Hebdomadaire)

1. **Lancer le scraper**
   ```bash
   cd scraper
   node index.js
   ```

2. **Préparer les données**
   ```bash
   node prepare-for-webapp.js
   ```

3. **Importer via l'interface**
   - http://votre-domaine.com/admin/import
   - Upload `pharmacies_for_webapp_import.json`

### Automatisation future (Optionnel)

Créer une GitHub Action ou un Cloud Function qui :
- S'exécute chaque samedi à 18h
- Lance le scraper
- Met à jour automatiquement Firestore

---

## 🧪 TESTS AVANT LANCEMENT

### Checklist de vérification

- [ ] **Import des pharmacies réussi**
  - Vérifier dans Firebase Console : Collection `pharmacies` doit avoir ~297 documents

- [ ] **Authentification fonctionnelle**
  - Créer un compte test
  - Se connecter / Se déconnecter
  
- [ ] **Recherche opérationnelle**
  - Rechercher une pharmacie
  - Vérifier la carte
  - Filtrer par pharmacie de garde

- [ ] **Commande test**
  - Ajouter un produit au panier (si disponible)
  - Passer une commande
  - Vérifier dans /orders

- [ ] **Responsive design**
  - Tester sur mobile
  - Tester sur tablette
  - Tester sur desktop

---

## 📱 MODE HORS-LIGNE (PWA)

Votre app est déjà configurée comme PWA. Pour l'installer :

1. Sur mobile: "Ajouter à l'écran d'accueil"
2. Sur desktop: Icône d'installation dans la barre d'adresse

---

## 🐛 DÉPANNAGE

### Les pharmacies n'apparaissent pas

1. Vérifiez que l'import a réussi dans Firebase Console
2. Vérifiez que `USE_REAL_BACKEND = true` dans `firebaseService.ts`
3. Vérifiez les permissions Firestore

### Erreur "Firebase Timeout"

1. Vérifiez votre connexion internet
2. Augmentez le timeout dans `firebaseService.ts`
3. Vérifiez que les règles Firestore permettent la lecture

### Les gardes ne s'affichent pas correctement

1. Vérifiez que `isGuardToday` est bien défini dans les données
2. Vérifiez que le champ `status` contient "guard" pour les pharmacies de garde

---

## 📈 PROCHAINES ÉTAPES

### Court terme
1. ✅ Importer les 297 pharmacies
2. ✅ Déployer sur Vercel
3. ⏳ Tester avec des vrais utilisateurs
4. ⏳ Collecter les feedbacks

### Moyen terme
1. Ajouter un inventaire de médicaments
2. Intégrer paiement mobile money réel
3. Système de livraison avec géolocalisation
4. Notifications push

### Long terme
1. Application mobile native (React Native)
2. Dashboard pharmacien
3. Système de points de fidélité
4. Intégration assurance automatique

---

## 🆘 SUPPORT

En cas de problème :
1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs Firebase Console
3. Consultez la documentation Firebase

---

## 📝 NOTES IMPORTANTES

⚠️ **AVANT LE LANCEMENT PUBLIC**
- Activez les quotas Firebase appropriés
- Configurez un système de sauvegarde
- Mettez en place un monitoring (Sentry, LogRocket)
- Préparez un plan de support client

💡 **CONSEIL**
Commencez avec un soft launch (groupe limité) avant le lancement public complet.

---

**Dernière mise à jour:** 18 janvier 2026
**Version:** 1.0.0
**Statut:** ✅ Prêt pour le déploiement
