# 🚀 Guide de Démarrage Rapide - Scraper Python

## Installation en 3 étapes

### 1️⃣ Vérifier Python
```bash
python --version
```
Si Python n'est pas installé, téléchargez-le depuis [python.org](https://www.python.org/downloads/)

### 2️⃣ Installer les dépendances
**Windows :**
```bash
install_python.bat
```

**Linux/Mac :**
```bash
pip install -r requirements.txt
```

### 3️⃣ Lancer le scraper
**Windows :**
```bash
run_scraper.bat
```

**Linux/Mac :**
```bash
python scraper.py
```

## 📦 Résultat

Après l'exécution, vous obtiendrez :
- ✅ `pharmacies_burkina.json` - Format JSON pour l'application
- ✅ `pharmacies_burkina.xlsx` - Fichier Excel pour analyse

## ⚡ Avantages de la version Python

### ✅ Installation automatique de ChromeDriver
Le scraper utilise `webdriver-manager` qui télécharge et configure automatiquement ChromeDriver. **Pas besoin de l'installer manuellement !**

### ✅ Gestion d'erreurs robuste
- Logging détaillé à chaque étape
- Messages d'erreur clairs en français
- Récupération automatique en cas d'échec

### ✅ Export flexible
- JSON pour intégration directe
- Excel pour analyse manuelle
- Géocodage optionnel

## 🔍 Que fait le scraper ?

1. **Connexion au site ONPBF** (ordrepharmacien.bf)
2. **Extraction de l'annuaire** complet (toutes les pages)
3. **Récupération du calendrier de garde**
4. **Normalisation des données** (téléphones, adresses, etc.)
5. **Identification des pharmacies de garde** actuelles
6. **Export JSON + Excel**

## 📊 Données extraites

Pour chaque pharmacie :
- Nom
- Ville
- Quartier
- Adresse complète
- Téléphone (formaté +226...)
- Groupe de garde
- Statut (GARDE ou NORMALE)
- Période de garde si applicable
- Heures d'ouverture

## 🆘 Problèmes courants

### "Python n'est pas reconnu"
➡️ Réinstallez Python et cochez "Add Python to PATH"

### "Selenium not installed"
➡️ Lancez `install_python.bat` ou `pip install -r requirements.txt`

### "ChromeDriver not found"
➡️ Normalement géré automatiquement par webdriver-manager
➡️ Si problème persiste : `pip install webdriver-manager --upgrade`

### Le scraper ne trouve rien
➡️ Vérifiez votre connexion Internet
➡️ Le site ONPBF peut être temporairement indisponible
➡️ Essayez en mode non-headless pour voir le navigateur

## 🔄 Comparaison avec la version JavaScript

| Critère | JavaScript | Python |
|---------|-----------|--------|
| **Installation** | npm install | pip install |
| **ChromeDriver** | Manuel | Automatique ✅ |
| **Facilité** | Moyen | Facile ✅ |
| **Performance** | Rapide | Moyen |
| **Export Excel** | XLSX lib | Pandas (plus puissant) ✅ |
| **Logs** | Console | Logging structuré ✅ |

## 💡 Utilisation avancée

### Activer le géocodage
Modifiez la ligne 456 dans `scraper.py` :
```python
data = scraper.run(enable_geocoding=True, export_excel=True)
```

### Mode visible (voir le navigateur)
```python
scraper = PharmacyScraper(headless=False)
```

### Export personnalisé
```python
scraper.save_to_json(data, "mes_pharmacies.json")
scraper.save_to_excel(data, "mes_pharmacies.xlsx")
```

## 🎯 Prochaines étapes

1. ✅ Lancer le scraper
2. ✅ Vérifier les fichiers générés
3. ✅ Intégrer les données dans l'application
4. ✅ Automatiser l'exécution quotidienne (optionnel)

---

**Besoin d'aide ?** Consultez `README_PYTHON.md` pour la documentation complète.
