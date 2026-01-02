# 💊 PharmaCI - Application Mobile de Pharmacie

Application mobile-first pour rechercher, comparer et commander des médicaments dans les pharmacies de Côte d'Ivoire.

## 🚀 Fonctionnalités

### Pour les Utilisateurs
- ✅ **Recherche de médicaments** avec géolocalisation
- ✅ **Carte interactive** (MapLibre) avec marqueurs de pharmacies
- ✅ **Filtres avancés** (distance, statut ouvert/fermé)
- ✅ **Comparaison de prix** entre pharmacies
- ✅ **Commande en ligne** avec paiement Mobile Money
- ✅ **Suivi de commande** en temps réel
- ✅ **Choix livraison/retrait**
- ✅ **Système d'avis** et notes
- ✅ **Profil utilisateur** avec historique

### Pour les Pharmacies (Admin)
- ✅ **Tableau de bord** avec statistiques
- ✅ **Gestion d'inventaire** (produits, prix, stock)
- ✅ **Gestion des commandes**
- ✅ **Horaires d'ouverture**
- ✅ **Statut pharmacie de garde**

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS v4
- **Carte**: MapLibre GL (sans Google Maps)
- **Icons**: Lucide React
- **TypeScript**: Types stricts

### Backend
- **BaaS**: Firebase
  - **Authentication**: Phone number + OTP
  - **Database**: Firestore
  - **Storage**: Firebase Storage (images)
  - **Functions**: Cloud Functions (optionnel)

## 📦 Installation

```bash
# Installation des dépendances
cd frontend
npm install --legacy-peer-deps

# Variables d'environnement
# Créez un fichier .env.local avec vos clés Firebase

# Lancement du serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔑 Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez:
   - **Authentication** > Phone
   - **Firestore Database**
   - **Storage**
3. Créez `.env.local` avec vos clés:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Importez la structure de données depuis `DATABASE_STRUCTURE.md`

## 📱 Pages Implémentées

1. **/** - Page d'accueil avec recherche et carte
2. **/results** - Liste de résultats avec filtres
3. **/map** - Vue carte avec itinéraires
4. **/pharmacy/[id]** - Détails d'une pharmacie
5. **/cart** - Panier d'achat
6. **/checkout** - Paiement et livraison
7. **/orders/[id]** - Suivi de commande
8. **/login** - Connexion via OTP
9. **/profile** - Profil utilisateur
10. **/admin/pharmacy** - Admin pharmacie

## 🗄️ Structure de la Base de Données

Voir `DATABASE_STRUCTURE.md` pour la structure complète de Firestore incluant:
- Users
- Pharmacies
- Products
- Pharmacy Inventory
- Orders
- Reviews
- Delivery Persons

## 🎨 Design System

### Couleurs
- **Primary**: Teal (#0d9488)
- **Secondary**: Slate (#f1f5f9)
- **Accent**: Emerald (#f0fdf4)
- **Background**: Slate-50 (#f8fafc)

### Composants Réutilisables
- `SearchBar` - Barre de recherche
- `PharmacyCard` - Carte de pharmacie
- `ProductCard` - Carte de produit
- `Map` - Carte interactive

## 🚦 Prochaines Étapes

- [ ] Intégration API de paiement (Orange Money, Moov Money)
- [ ] Notifications push (Firebase Cloud Messaging)
- [ ] Système de chat en direct
- [ ] Mode hors ligne (PWA)
- [ ] Tests unitaires et E2E
- [ ] Déploiement (Vercel/Firebase Hosting)

## 📄 Licence

MIT

## 👥 Auteurs

PharmaCI Team - 2024
