# 🇧🇫 Scraper ONPBF - Pharmacies du Burkina Faso

Extraction automatique des pharmacies depuis le site officiel de l'**Ordre National des Pharmaciens du Burkina Faso (ONPBF)**.

## 🚀 Démarrage Rapide

### Vous débutez ? Deux options disponibles :

#### Option 1 : Python (Recommandé pour débutants) 🐍
```bash
# Windows
install_python.bat
run_scraper.bat

# Linux/Mac
pip install -r requirements.txt
python scraper.py
```

#### Option 2 : JavaScript (Version originale) 📜
```bash
npm install
npm start
```

## 📚 Documentation

- **[INDEX.md](INDEX.md)** - Index de toute la documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Guide de démarrage rapide (Python)
- **[README_PYTHON.md](README_PYTHON.md)** - Documentation Python complète
- **[SUMMARY.md](SUMMARY.md)** - Résumé complet du projet

## ✨ Fonctionnalités

- ✅ **Scraping automatisé** de l'annuaire complet
- ✅ **Calendrier de garde** avec identification des pharmacies de garde
- ✅ **Export JSON** pour intégration dans l'application
- ✅ **Export Excel** pour analyse manuelle
- ✅ **Géocodage optionnel** (coordonnées GPS)
- ✅ **Synchronisation Firestore** (optionnel)

## 📊 Données Extraites

Pour chaque pharmacie :
- Nom, Ville, Quartier, Adresse complète
- Téléphone (formaté +226...)
- Groupe de garde
- Statut (GARDE ou NORMALE)
- Période de garde si applicable
- Heures d'ouverture

## 🔄 Deux Versions Disponibles

### Version Python 🐍
**Avantages :**
- ✅ Installation simplifiée (ChromeDriver automatique)
- ✅ Scripts Windows (.bat) pour faciliter l'utilisation
- ✅ Logging détaillé en français
- ✅ Tests d'installation inclus

**Utilisation :**
```bash
# Installation
install_python.bat

# Exécution
run_scraper.bat

# Test
test_install.bat
```

### Version JavaScript 📜
**Avantages :**
- ✅ Plus rapide
- ✅ Déjà testée en production
- ✅ Synchronisation Firestore intégrée

**Utilisation :**
```bash
# Installation
npm install

# Exécution
npm start

# Sync Firestore
node sync_final.js
```

## 📁 Structure du Projet

```
scraper/
├── 🐍 Python
│   ├── scraper.py              ← Scraper principal
│   ├── requirements.txt        ← Dépendances
│   ├── test_installation.py    ← Tests
│   ├── install_python.bat      ← Installation
│   ├── run_scraper.bat         ← Exécution
│   └── test_install.bat        ← Test
│
├── 📜 JavaScript
│   ├── index.js                ← Scraper principal
│   ├── discovery.js            ← Découverte
│   ├── enrich.js               ← Enrichissement
│   ├── sync_final.js           ← Sync Firestore
│   └── package.json            ← Dépendances
│
├── 📚 Documentation
│   ├── INDEX.md                ← Index complet
│   ├── QUICKSTART.md           ← Guide rapide
│   ├── README_PYTHON.md        ← Doc Python
│   ├── SUMMARY.md              ← Résumé complet
│   └── RECAP.md                ← Récapitulatif
│
└── 📊 Données (générées)
    ├── pharmacies_burkina.json      ← Python
    ├── pharmacies_burkina.xlsx      ← Python
    └── pharmacies_final.json        ← JavaScript
```

## 🎯 Quelle Version Choisir ?

| Critère | Python | JavaScript |
|---------|--------|------------|
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Installation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommandation :**
- **Débutants** → Python
- **Production** → Les deux fonctionnent
- **Développement** → Python (plus facile à modifier)

## 🆘 Besoin d'Aide ?

### Documentation par niveau

1. **Débutant** → [QUICKSTART.md](QUICKSTART.md)
2. **Utilisateur** → [README_PYTHON.md](README_PYTHON.md)
3. **Développeur** → [SUMMARY.md](SUMMARY.md)
4. **Navigation** → [INDEX.md](INDEX.md)

### Problèmes courants

**Python n'est pas reconnu**
→ Réinstallez Python et cochez "Add Python to PATH"

**Selenium not installed**
→ Lancez `install_python.bat`

**ChromeDriver not found**
→ Normalement géré automatiquement par webdriver-manager

**Le scraper ne trouve rien**
→ Vérifiez votre connexion Internet et que le site ONPBF est accessible

## 📦 Installation Détaillée

### Python
```bash
# 1. Vérifier Python
python --version

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Tester l'installation
python test_installation.py

# 4. Lancer le scraper
python scraper.py
```

### JavaScript
```bash
# 1. Vérifier Node.js
node --version

# 2. Installer les dépendances
npm install

# 3. Lancer le scraper
npm start
```

## 🔧 Configuration

### Géocodage (Python)
Pour activer le géocodage, modifiez `scraper.py` ligne 456 :
```python
data = scraper.run(enable_geocoding=True, export_excel=True)
```

### Synchronisation Firestore (JavaScript)
1. Téléchargez `serviceAccountKey.json` depuis Firebase
2. Placez-le dans le dossier `scraper`
3. Créez `.env` depuis `.env.example`
4. Réglez `SYNC_TO_FIRESTORE=true`
5. Lancez `node sync_final.js`

## 📊 Résultats

Les deux versions produisent des données au même format :

```json
{
  "id": "onpbf_1",
  "nom_pharmacie": "PHARMACIE CENTRALE",
  "ville": "OUAGADOUGOU",
  "quartier": "ZONE 1",
  "adresse_complete": "ZONE 1, Avenue Kwame N'Krumah",
  "telephone": "+22625123456",
  "type_service": "GARDE",
  "groupe": "GROUPE 1",
  "periode_garde": "Du lundi 30 Décembre 2024 au Lundi 06 Janvier 2025",
  "date_debut_garde": "2024-12-30",
  "date_fin_garde": "2025-01-06",
  "heures_ouverture": "24h/24",
  "latitude": 0.0,
  "longitude": 0.0,
  "source": "ONPBF",
  "date_mise_a_jour": "2026-01-16T18:59:00"
}
```

## 🌐 Source de Données

- **Annuaire** : https://ordrepharmacien.bf/index.php/service/annuaire-pharmacie/
- **Garde** : https://ordrepharmacien.bf/index.php/service/pharmacie-garde/

## 📝 Licence

Usage libre pour le projet Pharmacy App Burkina Faso.

---

**Créé avec ❤️ pour le projet Pharmacy App Burkina Faso 🇧🇫**

**Dernière mise à jour :** 2026-01-16  
**Version :** 1.0.0
