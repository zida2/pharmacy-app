# 🇧🇫 Scraper Python - Pharmacies du Burkina Faso

Ce scraper Python moderne permet d'extraire automatiquement les données des pharmacies du Burkina Faso depuis le site officiel de l'**Ordre National des Pharmaciens du Burkina Faso (ONPBF)**.

## ✨ Fonctionnalités

- ✅ **Scraping automatisé** avec Selenium (gère JavaScript et pagination)
- ✅ **Annuaire complet** : Nom, Ville, Téléphone, Groupe, Adresse
- ✅ **Calendrier de garde** : Identifie les pharmacies actuellement de garde
- ✅ **Export JSON** : Format prêt pour l'intégration
- ✅ **Export Excel** : Fichier `.xlsx` pour analyse
- ✅ **Géocodage optionnel** : Coordonnées GPS via OpenStreetMap
- ✅ **Logging détaillé** : Suivi en temps réel du processus

## 📋 Prérequis

### 1. Python 3.8+
Vérifiez votre version :
```bash
python --version
```

### 2. ChromeDriver
Le scraper utilise Selenium avec Chrome. Vous devez installer ChromeDriver :

**Option A : Installation automatique (recommandé)**
```bash
pip install webdriver-manager
```

**Option B : Installation manuelle**
1. Téléchargez ChromeDriver : https://chromedriver.chromium.org/
2. Placez-le dans votre PATH système

## 🚀 Installation

### 1. Installer les dépendances Python
```bash
cd scraper
pip install -r requirements.txt
```

### 2. Vérifier l'installation
```bash
python scraper.py --help
```

## 💻 Utilisation

### Scraping basique (sans géocodage)
```bash
python scraper.py
```

Cela va :
- Extraire toutes les pharmacies de l'annuaire
- Récupérer le calendrier de garde
- Générer `pharmacies_burkina.json`
- Générer `pharmacies_burkina.xlsx`

### Scraping avec géocodage (plus lent)
Pour obtenir les coordonnées GPS de chaque pharmacie :

```python
# Modifier dans scraper.py, ligne ~450
data = scraper.run(enable_geocoding=True, export_excel=True)
```

⚠️ **Attention** : Le géocodage prend ~1 seconde par pharmacie (limite OpenStreetMap). Pour 300 pharmacies = ~5 minutes.

## 📊 Format des données

### JSON
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
  "latitude": 12.3714,
  "longitude": -1.5197,
  "source": "ONPBF",
  "date_mise_a_jour": "2026-01-16T18:59:00"
}
```

### Excel
Toutes les colonnes ci-dessus dans un fichier `.xlsx` prêt pour Excel/Google Sheets.

## 🔧 Configuration avancée

### Mode headless
Par défaut, le navigateur s'exécute en arrière-plan. Pour voir le navigateur :

```python
scraper = PharmacyScraper(headless=False)
```

### Personnaliser les exports
```python
# JSON uniquement
scraper.run(enable_geocoding=False, export_excel=False)

# Excel uniquement
scraper.save_to_excel(data, "mon_fichier.xlsx")
```

## 🐛 Dépannage

### Erreur : "ChromeDriver not found"
```bash
# Solution 1 : Installer webdriver-manager
pip install webdriver-manager

# Puis modifier scraper.py :
from webdriver_manager.chrome import ChromeDriverManager
self.driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
```

### Erreur : "Selenium not installed"
```bash
pip install selenium
```

### Erreur : "Pandas not installed"
```bash
pip install pandas openpyxl
```

### Le scraper ne trouve pas les données
- Vérifiez votre connexion Internet
- Le site ONPBF peut être temporairement indisponible
- Essayez en mode non-headless pour voir ce qui se passe

## 📝 Différences avec la version JavaScript

| Aspect | JavaScript (Node.js) | Python |
|--------|---------------------|--------|
| **Performance** | Plus rapide | Légèrement plus lent |
| **Facilité** | Nécessite Node.js | Plus simple pour les débutants |
| **Dépendances** | Puppeteer | Selenium + ChromeDriver |
| **Géocodage** | Axios | Requests |
| **Export** | XLSX library | Pandas (plus puissant) |

## 🔄 Automatisation

### Exécution quotidienne (Windows)
Créez un fichier `update_pharmacies.bat` :
```batch
@echo off
cd "c:\Users\Dési InnovaTech\Desktop\ci\pharmacy-app\scraper"
python scraper.py
echo Scraping terminé!
pause
```

Puis ajoutez-le au Planificateur de tâches Windows.

### Exécution quotidienne (Linux/Mac)
Ajoutez à votre crontab :
```bash
0 2 * * * cd /path/to/scraper && python scraper.py
```

## 📦 Intégration avec Firebase

Pour synchroniser automatiquement avec Firestore, utilisez le script JavaScript existant :
```bash
node sync_final.js
```

Ou créez un script Python similaire avec `firebase-admin` :
```bash
pip install firebase-admin
```

## 🤝 Contribution

Ce scraper est conçu pour être robuste et maintenable. N'hésitez pas à l'améliorer !

## 📄 Licence

Usage libre pour le projet Pharmacy App.

## 🆘 Support

En cas de problème, vérifiez :
1. ✅ Python 3.8+ installé
2. ✅ ChromeDriver installé et dans le PATH
3. ✅ Dépendances installées (`pip install -r requirements.txt`)
4. ✅ Connexion Internet active
5. ✅ Site ONPBF accessible

---

**Créé avec ❤️ pour le projet Pharmacy App Burkina Faso**
