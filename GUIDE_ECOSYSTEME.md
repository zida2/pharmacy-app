# 🏥 Guide de Lancement : Écosystème Santé

Votre application est maintenant capable de gérer pharmacies, cliniques, dentistes et assurances !

## 🚀 Étape 1 : Importer les données

Une interface d'administration a été créée pour peupler la base de données Firebase facilement.

1.  Ouvrez l'application (http://localhost:3000).
2.  Allez sur la page cachée : **`/admin/setup`**
3.  Cliquez successivement sur les 4 boutons :
    *   💊 **Import Pharmacies** (Importe les 297 + OSM = ~374 pharmacies)
    *   🏥 **Import Clinics** (Toutes les cliniques/CSPS du Burkina via OSM)
    *   🦷 **Import Dentists** (Dentistes détectés)
    *   🛡️ **Import Insurance** (Données exemples : SONAR, UAB, etc.)

> **Note** : Regardez les logs dans la console noire en bas de l'écran pour confirmer le succès.

## 📱 Étape 2 : Tester l'application Utilisateur

1.  Cliquez sur l'onglet **"Santé"** (icône Activité/Battement de cœur) dans la barre de navigation.
2.  Vous verrez la liste complète.
3.  Testez les **Filtres** (Cliniques, Dentistes...).
4.  Testez le bouton **URGENCE** (affiche rouge, filtre garde/urgences).
5.  Activez la géolocalisation pour voir les distances réelles.

## 🛠️ Maintenance & Mise à jour

- Les scripts de scraping sont dans `scraper/enrich_ecosystem.py`.
- Pour mettre à jour les données OSM :
  1. `cd scraper`
  2. `python enrich_ecosystem.py` (nécessite Python + requests)
  3. Copiez les JSON générés (`scraper/ecosystem_data/*.json`) vers `frontend/public/data/`.
  4. Refaites l'import via `/admin/setup`.

## 🔒 Sécurité (POST-LANCEMENT)

Une fois l'import terminé et l'application lancée, pensez à **restreindre les droits d'écriture** dans `firestore.rules` pour éviter que n'importe qui ne puisse modifier les cliniques.

Remplacer :
```javascript
match /clinics/{id} { allow write: if true; }
```
Par :
```javascript
match /clinics/{id} { allow write: if request.auth.token.admin == true; }
```

Bon lancement ! 🚀
