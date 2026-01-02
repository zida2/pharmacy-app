# 🔥 Guide de Configuration Firebase pour Débutants

Pas de panique ! C'est très simple. Suivez ces étapes une à une.

## Étape 1 : Créer le projet
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Connectez-vous avec votre compte Google.
3. Cliquez sur **"Créer un projet"** (ou "Ajouter un projet").
4. Donnez un nom (ex: `pharmacy-app-ci`) et cliquez sur **Continuer**.
5. Désactivez Google Analytics (pas besoin pour l'instant) et cliquez sur **Créer le projet**.
6. Attendez que ça finisse et cliquez sur **Continuer**.

## Étape 2 : Créer l'application Web
1. Une fois dans le projet, vous verrez des icônes rondes (iOS, Android, Web `</>`). Cliquez sur l'icône Web **`</>`**.
2. Nom de l'app : `Pharmacy Web`
3. Ne cochez pas "Firebase Hosting" pour l'instant.
4. Cliquez sur **Enregistrer l'application**.
5. **IMPORTANT** : Vous allez voir un bloc de code `const firebaseConfig = { ... }`.
   Laissez cette page ouverte ou copiez ces valeurs. Nous allons les mettre dans votre fichier `.env.local`.

## Étape 3 : Configurer le Code (VS Code)
1. Dans VS Code, regardez dans le dossier `frontend`.
2. Créez un nouveau fichier nommé `.env.local` (s'il n'existe pas déjà).
3. Copiez le contenu suivant et remplacez les valeurs par celles de l'Étape 2 :

```env
NEXT_PUBLIC_FIREBASE_API_KEY="votre_apiKey"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="votre_authDomain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="votre_projectId"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="votre_storageBucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="votre_messagingSenderId"
NEXT_PUBLIC_FIREBASE_APP_ID="votre_appId"
```

> **Note :** Gardez les guillemets.

## Étape 4 : Activer Firestore (Base de données)
1. Retournez sur la Console Firebase.
2. Dans le menu de gauche, cliquez sur **"Création"** > **"Firestore Database"**.
3. Cliquez sur **"Créer une base de données"**.
4. Emplacement : Choisissez `eur3` (Europe West) ou laissez par défaut. Cliquez sur **Suivant**.
5. **Règles de sécurité** : Choisissez **"Darrer en mode test"** (Start in test mode).
   * *Cela permet de lire/écrire sans bloquer pendant le développement (valide 30 jours).*
6. Cliquez sur **Activer**.

## Étape 5 : Activer l'Authentification (Optionnel pour le début)
1. Dans le menu de gauche, cliquez sur **"Création"** > **"Authentication"**.
2. Cliquez sur **"Commencer"**.
3. Dans l'onglet "Mode de connexion", choisissez **"Téléphone"**.
4. Activez-le et cliquez sur **Enregistrer**.
   * *Pour tester facilement, vous pouvez ajouter un "Numéro de téléphone pour le test" dans cette même section (ex: `+225 0102030405` code: `123456`).*

---

## 🎉 C'est tout !

Votre application est maintenant connectée.

**Pour vérifier que ça marche :**
1. J'ai ajouté un bouton **"Initialiser la Base de Données"** dans la page Admin (`/admin/pharmacy`).
2. Cliquez dessus une fois votre serveur lancé (`npm run dev`).
3. Cela va envoyer nos fausses données (pharmacies, produits) vers votre VRAI Firestore.
4. Ensuite, allez voir dans la Console Firebase > Firestore Database, vous verrez vos données apparaître !
