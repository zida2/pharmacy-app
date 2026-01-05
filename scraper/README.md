# Professional Scraper ONPBF 🇧🇫

Ce script permet d'extraire automatiquement l'intégralité des pharmacies du Burkina Faso depuis le site officiel de l'Ordre National des Pharmaciens (ONPBF).

## Fonctionnalités
- ✅ **Navigation Automatisée** via Puppeteer (gère le JavaScript et DataTables).
- ✅ **Annuaire Complet** : Extrait Nom, Ville, Téléphone, Groupe et Adresse.
- ✅ **Gestion des Gardes** : Analyse le calendrier de rotation par groupe pour identifier les pharmacies actuellement de garde.
- ✅ **Export Excel** : Génère un fichier `.xlsx` prêt à l'emploi.
- ✅ **Sync Firestore** (Optionnel) : Met à jour directement votre base de données Firebase.

## Installation
1. Allez dans le dossier `scraper` :
   ```bash
   cd scraper
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

## Utilisation
Pour lancer l'extraction simple (vers Excel) :
```bash
npm start
```

## Synchronisation Firestore
Pour mettre à jour automatiquement votre application :
1. Téléchargez votre `serviceAccountKey.json` depuis la console Firebase (Paramètres du projet > Comptes de service).
2. Placez le fichier dans le dossier `scraper`.
3. Créez un fichier `.env` à partir de `.env.example` et réglez `SYNC_TO_FIRESTORE=true`.
4. Lancez le script.

## Notes
Le script est configuré pour être robuste (délais anti-blocage, timeouts). Il parcourt toutes les pages de l'annuaire automatiquement.
