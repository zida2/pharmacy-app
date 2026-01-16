# 📚 Index de la Documentation - Scraper ONPBF

## 🚀 Démarrage Rapide

**Vous débutez ?** Commencez ici :

1. **[QUICKSTART.md](QUICKSTART.md)** ← Commencez ici !
   - Installation en 3 étapes
   - Lancement du scraper
   - Premiers résultats

2. **Test de l'installation**
   ```bash
   test_install.bat
   ```

3. **Lancement du scraper**
   ```bash
   run_scraper.bat
   ```

## 📖 Documentation Complète

### Pour Python 🐍

- **[README_PYTHON.md](README_PYTHON.md)** - Documentation complète
  - Prérequis détaillés
  - Installation pas à pas
  - Configuration avancée
  - Dépannage complet

- **[SUMMARY.md](SUMMARY.md)** - Résumé complet
  - Ce qui a été créé
  - Comparaison JavaScript vs Python
  - Fonctionnalités détaillées
  - Utilisation avancée

- **[RECAP.md](RECAP.md)** - Récapitulatif
  - Structure du projet
  - Différences entre versions
  - Recommandations d'utilisation

### Pour JavaScript 📜

- **[README.md](README.md)** - Documentation JavaScript
  - Installation Node.js
  - Utilisation de Puppeteer
  - Synchronisation Firestore

## 🔧 Fichiers Techniques

### Code Source

| Fichier | Description | Langage |
|---------|-------------|---------|
| `scraper.py` | Scraper Python principal | Python |
| `index.js` | Scraper JavaScript principal | JavaScript |
| `discovery.js` | Découverte de pharmacies | JavaScript |
| `enrich.js` | Enrichissement des données | JavaScript |
| `sync_final.js` | Synchronisation Firestore | JavaScript |

### Configuration

| Fichier | Description |
|---------|-------------|
| `requirements.txt` | Dépendances Python |
| `package.json` | Dépendances Node.js |
| `.env.example` | Template de configuration |
| `.gitignore` | Exclusions Git |

### Scripts Windows

| Fichier | Description |
|---------|-------------|
| `install_python.bat` | Installation automatique Python |
| `run_scraper.bat` | Lancement du scraper Python |
| `test_install.bat` | Test de l'installation |

### Tests

| Fichier | Description |
|---------|-------------|
| `test_installation.py` | Vérification des dépendances |

## 📊 Données Générées

| Fichier | Source | Format |
|---------|--------|--------|
| `pharmacies_burkina.json` | Python | JSON |
| `pharmacies_burkina.xlsx` | Python | Excel |
| `pharmacies_final.json` | JavaScript | JSON |
| `discovered_pharmacies.json` | JavaScript | JSON |
| `pharmacies_canonical.json` | JavaScript | JSON |

## 🎯 Guides par Cas d'Usage

### Je veux juste récupérer les données
1. Lisez [QUICKSTART.md](QUICKSTART.md)
2. Lancez `install_python.bat`
3. Lancez `run_scraper.bat`
4. Récupérez `pharmacies_burkina.json`

### Je veux comprendre comment ça marche
1. Lisez [README_PYTHON.md](README_PYTHON.md)
2. Consultez le code dans `scraper.py`
3. Lisez [SUMMARY.md](SUMMARY.md) pour les détails

### Je veux modifier le scraper
1. Lisez [README_PYTHON.md](README_PYTHON.md) - Section "Configuration avancée"
2. Étudiez le code dans `scraper.py`
3. Testez avec `python test_installation.py`

### Je veux automatiser l'exécution
1. Lisez [README_PYTHON.md](README_PYTHON.md) - Section "Automatisation"
2. Créez une tâche planifiée Windows
3. Ou configurez un cron (Linux/Mac)

### Je veux synchroniser avec Firestore
1. Version JavaScript : `node sync_final.js`
2. Version Python : À implémenter (voir [SUMMARY.md](SUMMARY.md))

## 🆘 Aide et Dépannage

### Problèmes d'installation
→ Consultez [README_PYTHON.md](README_PYTHON.md) - Section "Dépannage"

### Erreurs d'exécution
→ Consultez [SUMMARY.md](SUMMARY.md) - Section "Dépannage"

### Questions générales
→ Consultez [QUICKSTART.md](QUICKSTART.md) - Section "Problèmes courants"

## 📞 Ressources Externes

### Dépendances Python
- [Selenium](https://selenium-python.readthedocs.io/)
- [Pandas](https://pandas.pydata.org/)
- [webdriver-manager](https://github.com/SergeyPirogov/webdriver_manager)

### Dépendances JavaScript
- [Puppeteer](https://pptr.dev/)
- [Firebase Admin](https://firebase.google.com/docs/admin/setup)

### Source de données
- [ONPBF - Ordre National des Pharmaciens du Burkina Faso](https://ordrepharmacien.bf/)

## 🗺️ Navigation Rapide

```
📁 scraper/
│
├── 🚀 DÉMARRAGE
│   ├── QUICKSTART.md          ← Commencez ici !
│   ├── install_python.bat     ← Installation
│   ├── run_scraper.bat        ← Exécution
│   └── test_install.bat       ← Test
│
├── 📖 DOCUMENTATION
│   ├── INDEX.md               ← Vous êtes ici
│   ├── README_PYTHON.md       ← Doc Python complète
│   ├── README.md              ← Doc JavaScript
│   ├── SUMMARY.md             ← Résumé complet
│   └── RECAP.md               ← Récapitulatif
│
├── 🐍 PYTHON
│   ├── scraper.py             ← Code principal
│   ├── test_installation.py   ← Tests
│   └── requirements.txt       ← Dépendances
│
├── 📜 JAVASCRIPT
│   ├── index.js               ← Code principal
│   ├── discovery.js           ← Découverte
│   ├── enrich.js              ← Enrichissement
│   ├── sync_final.js          ← Sync Firestore
│   └── package.json           ← Dépendances
│
└── 📊 DONNÉES
    ├── pharmacies_burkina.json     ← Python
    ├── pharmacies_burkina.xlsx     ← Python
    └── pharmacies_final.json       ← JavaScript
```

## ✅ Checklist de Démarrage

- [ ] Lire [QUICKSTART.md](QUICKSTART.md)
- [ ] Installer Python 3.8+
- [ ] Lancer `install_python.bat`
- [ ] Tester avec `test_install.bat`
- [ ] Lancer `run_scraper.bat`
- [ ] Vérifier les fichiers générés
- [ ] Intégrer les données dans l'application

## 🎓 Niveaux de Documentation

### Niveau 1 : Débutant
→ [QUICKSTART.md](QUICKSTART.md)

### Niveau 2 : Utilisateur
→ [README_PYTHON.md](README_PYTHON.md)

### Niveau 3 : Développeur
→ [SUMMARY.md](SUMMARY.md) + Code source

### Niveau 4 : Expert
→ Tous les fichiers + Modification du code

---

**Dernière mise à jour :** 2026-01-16  
**Version :** 1.0.0  
**Projet :** Pharmacy App Burkina Faso 🇧🇫
