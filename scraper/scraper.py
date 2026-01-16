#!/usr/bin/env python3
"""
Scraper Python pour les Pharmacies du Burkina Faso (ONPBF)
Source: https://ordrepharmacien.bf/
"""

import json
import time
import re
from datetime import datetime
from typing import List, Dict, Optional
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import Select
    from selenium.webdriver.chrome.service import Service
except ImportError:
    logger.error("❌ Selenium n'est pas installé. Installez-le avec: pip install selenium")
    exit(1)

try:
    from webdriver_manager.chrome import ChromeDriverManager
    WEBDRIVER_MANAGER_AVAILABLE = True
except ImportError:
    logger.warning("⚠️ webdriver-manager non installé. ChromeDriver doit être dans le PATH.")
    WEBDRIVER_MANAGER_AVAILABLE = False

try:
    import pandas as pd
except ImportError:
    logger.warning("⚠️ Pandas n'est pas installé. L'export Excel sera désactivé.")
    pd = None

try:
    import requests
except ImportError:
    logger.warning("⚠️ Requests n'est pas installé. Le géocodage sera désactivé.")
    requests = None


class PharmacyScraper:
    """Scraper pour extraire les données des pharmacies du Burkina Faso"""
    
    ANNUAIRE_URL = "https://ordrepharmacien.bf/index.php/service/annuaire-pharmacie/"
    GARDE_URL = "https://ordrepharmacien.bf/index.php/service/pharmacie-garde/"
    
    def __init__(self, headless: bool = True):
        """
        Initialise le scraper
        
        Args:
            headless: Si True, le navigateur s'exécute en arrière-plan
        """
        self.headless = headless
        self.driver = None
        self.pharmacies = []
        self.garde_info = []
        
    def setup_driver(self):
        """Configure le driver Selenium"""
        logger.info("🔧 Configuration du navigateur...")
        
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        try:
            if WEBDRIVER_MANAGER_AVAILABLE:
                # Utiliser webdriver-manager pour gérer ChromeDriver automatiquement
                logger.info("📦 Utilisation de webdriver-manager...")
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                # Utiliser ChromeDriver depuis le PATH
                logger.info("📦 Utilisation de ChromeDriver depuis le PATH...")
                self.driver = webdriver.Chrome(options=chrome_options)
            
            logger.info("✅ Navigateur configuré avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur lors de la configuration du navigateur: {e}")
            logger.info("💡 Solutions:")
            logger.info("   1. Installez webdriver-manager: pip install webdriver-manager")
            logger.info("   2. Ou téléchargez ChromeDriver: https://chromedriver.chromium.org/")
            raise
    
    def scrape_annuaire(self) -> List[Dict]:
        """
        Scrape l'annuaire complet des pharmacies
        
        Returns:
            Liste des pharmacies avec leurs informations
        """
        logger.info("📂 Étape 1: Récupération de l'annuaire complet...")
        
        try:
            self.driver.get(self.ANNUAIRE_URL)
            
            # Attendre que la table soit chargée
            wait = WebDriverWait(self.driver, 20)
            wait.until(EC.presence_of_element_located((By.ID, "tablepress-2")))
            
            # Changer l'affichage à 100 éléments par page
            try:
                select_element = Select(self.driver.find_element(By.NAME, "tablepress-2_length"))
                select_element.select_by_value("100")
                time.sleep(2)
                logger.info("📊 Affichage réglé sur 100 éléments par page")
            except Exception as e:
                logger.warning(f"⚠️ Impossible de changer le nombre d'éléments: {e}")
            
            page_num = 1
            all_pharmacies = []
            
            while True:
                logger.info(f"📑 Lecture de la page {page_num}...")
                
                # Extraire les données de la page actuelle
                rows = self.driver.find_elements(By.CSS_SELECTOR, "#tablepress-2 tbody tr")
                
                for row in rows:
                    try:
                        cols = row.find_elements(By.TAG_NAME, "td")
                        if len(cols) >= 4:
                            pharmacy = {
                                'ville': cols[0].text.strip(),
                                'nom_pharmacie': cols[1].text.strip(),
                                'telephone': cols[2].text.strip(),
                                'groupe': cols[3].text.strip(),
                                'adresse_complete': cols[4].text.strip() if len(cols) > 4 else ''
                            }
                            all_pharmacies.append(pharmacy)
                    except Exception as e:
                        logger.warning(f"⚠️ Erreur lors de l'extraction d'une ligne: {e}")
                        continue
                
                # Vérifier s'il y a une page suivante
                try:
                    next_button = self.driver.find_element(
                        By.CSS_SELECTOR, 
                        ".dt-paging-button.next:not(.disabled)"
                    )
                    next_button.click()
                    time.sleep(2)
                    page_num += 1
                except:
                    logger.info("✅ Toutes les pages ont été lues")
                    break
            
            logger.info(f"✅ {len(all_pharmacies)} pharmacies extraites de l'annuaire")
            self.pharmacies = all_pharmacies
            return all_pharmacies
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du scraping de l'annuaire: {e}")
            raise
    
    def scrape_garde(self) -> List[Dict]:
        """
        Scrape le calendrier des pharmacies de garde
        
        Returns:
            Liste des informations de garde
        """
        logger.info("📅 Étape 2: Récupération du calendrier de garde...")
        
        try:
            self.driver.get(self.GARDE_URL)
            time.sleep(3)
            
            # Chercher toutes les tables TablePress
            tables = self.driver.find_elements(By.CSS_SELECTOR, ".tablepress")
            garde_info = []
            
            for table in tables:
                try:
                    rows = table.find_elements(By.CSS_SELECTOR, "tbody tr")
                    for row in rows:
                        cols = row.find_elements(By.TAG_NAME, "td")
                        if len(cols) >= 2:
                            info = {
                                'periode': cols[0].text.strip(),
                                'groupe': cols[1].text.strip(),
                                'ville_garde': cols[2].text.strip() if len(cols) > 2 else ''
                            }
                            garde_info.append(info)
                except Exception as e:
                    logger.warning(f"⚠️ Erreur lors de l'extraction d'une table de garde: {e}")
                    continue
            
            logger.info(f"📊 {len(garde_info)} périodes de garde identifiées")
            self.garde_info = garde_info
            return garde_info
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du scraping des gardes: {e}")
            return []
    
    def parse_garde_dates(self, periode: str) -> Dict[str, str]:
        """
        Parse les dates de garde depuis le texte de période
        
        Args:
            periode: Texte de la période (ex: "Du lundi 30 Décembre 2024 au Lundi 06 Janvier 2025")
            
        Returns:
            Dictionnaire avec start et end
        """
        months = {
            'janvier': '01', 'février': '02', 'fevrier': '02', 'mars': '03', 
            'avril': '04', 'mai': '05', 'juin': '06', 'juillet': '07', 
            'août': '08', 'aout': '08', 'septembre': '09', 'octobre': '10', 
            'novembre': '11', 'décembre': '12', 'decembre': '12'
        }
        
        try:
            # Regex pour capturer DD Mois YYYY
            pattern = r'(\d{1,2})\s+([a-zéû]+)\s+(\d{4})'
            matches = re.findall(pattern, periode, re.IGNORECASE)
            
            if len(matches) >= 2:
                day1, month1, year1 = matches[0]
                day2, month2, year2 = matches[1]
                
                month1_num = months.get(month1.lower(), '01')
                month2_num = months.get(month2.lower(), '01')
                
                start = f"{year1}-{month1_num}-{day1.zfill(2)}"
                end = f"{year2}-{month2_num}-{day2.zfill(2)}"
                
                return {'start': start, 'end': end}
        except Exception as e:
            logger.warning(f"⚠️ Erreur lors du parsing des dates: {e}")
        
        return {'start': 'N/A', 'end': 'N/A'}
    
    def clean_phone(self, phone: str) -> str:
        """
        Nettoie et formate le numéro de téléphone
        
        Args:
            phone: Numéro brut
            
        Returns:
            Numéro formaté
        """
        clean = re.sub(r'\s+', '', phone)
        if not clean.startswith('+226'):
            clean = f'+226{clean}'
        return clean
    
    def normalize_and_enrich(self) -> List[Dict]:
        """
        Normalise les données et enrichit avec les informations de garde
        
        Returns:
            Liste des pharmacies enrichies
        """
        logger.info("🧹 Étape 3: Normalisation et enrichissement...")
        
        final_data = []
        
        for idx, pharm in enumerate(self.pharmacies):
            # Trouver si la pharmacie est de garde
            current_garde = None
            for garde in self.garde_info:
                if (pharm['groupe'] in garde['groupe'] and 
                    (garde['ville_garde'].lower() in pharm['ville'].lower() or 
                     pharm['ville'].lower() in garde['ville_garde'].lower())):
                    current_garde = garde
                    break
            
            # Parser les dates de garde
            dates = {'start': 'N/A', 'end': 'N/A'}
            if current_garde:
                dates = self.parse_garde_dates(current_garde['periode'])
            
            # Extraire le quartier de l'adresse
            quartier = pharm['adresse_complete'].split(',')[0].strip() if pharm['adresse_complete'] else ''
            
            # Créer l'objet final
            pharmacy_data = {
                'id': f"onpbf_{idx + 1}",
                'nom_pharmacie': pharm['nom_pharmacie'],
                'ville': pharm['ville'],
                'quartier': quartier,
                'adresse_complete': pharm['adresse_complete'],
                'telephone': self.clean_phone(pharm['telephone']),
                'type_service': 'GARDE' if current_garde else 'NORMALE',
                'groupe': pharm['groupe'],
                'periode_garde': current_garde['periode'] if current_garde else 'N/A',
                'date_debut_garde': dates['start'],
                'date_fin_garde': dates['end'],
                'heures_ouverture': '24h/24' if current_garde else '08:00-22:00',
                'latitude': 0.0,
                'longitude': 0.0,
                'source': 'ONPBF',
                'date_mise_a_jour': datetime.now().isoformat()
            }
            
            final_data.append(pharmacy_data)
        
        logger.info(f"✅ {len(final_data)} pharmacies normalisées")
        return final_data
    
    def geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        """
        Géocode une adresse avec Nominatim (OpenStreetMap)
        
        Args:
            address: Adresse à géocoder
            
        Returns:
            Dictionnaire avec lat et lng, ou None
        """
        if not requests:
            return None
        
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': 'ONPBF-Scraper-Python/1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            data = response.json()
            
            if data and len(data) > 0:
                return {
                    'lat': float(data[0]['lat']),
                    'lng': float(data[0]['lon'])
                }
        except Exception as e:
            logger.warning(f"⚠️ Erreur de géocodage pour {address}: {e}")
        
        return None
    
    def geocode_all(self, data: List[Dict], delay: float = 1.0) -> List[Dict]:
        """
        Géocode toutes les pharmacies (optionnel, prend du temps)
        
        Args:
            data: Liste des pharmacies
            delay: Délai entre chaque requête (secondes)
            
        Returns:
            Liste des pharmacies avec coordonnées
        """
        logger.info("📍 Géocodage des adresses (1 requête par seconde)...")
        
        for pharmacy in data:
            address = f"{pharmacy['nom_pharmacie']}, {pharmacy['ville']}, Burkina Faso"
            coords = self.geocode_address(address)
            
            if coords:
                pharmacy['latitude'] = coords['lat']
                pharmacy['longitude'] = coords['lng']
                logger.info(f"✅ {pharmacy['nom_pharmacie']}: {coords['lat']}, {coords['lng']}")
            
            time.sleep(delay)
        
        return data
    
    def save_to_json(self, data: List[Dict], filename: str = "pharmacies_burkina.json"):
        """
        Sauvegarde les données en JSON
        
        Args:
            data: Données à sauvegarder
            filename: Nom du fichier
        """
        filepath = f"c:\\Users\\Dési InnovaTech\\Desktop\\ci\\pharmacy-app\\scraper\\{filename}"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 Données sauvegardées dans {filepath}")
    
    def save_to_excel(self, data: List[Dict], filename: str = "pharmacies_burkina.xlsx"):
        """
        Sauvegarde les données en Excel
        
        Args:
            data: Données à sauvegarder
            filename: Nom du fichier
        """
        if not pd:
            logger.warning("⚠️ Pandas non disponible, export Excel ignoré")
            return
        
        filepath = f"c:\\Users\\Dési InnovaTech\\Desktop\\ci\\pharmacy-app\\scraper\\{filename}"
        
        # Nettoyer les caractères illégaux pour Excel
        clean_data = []
        illegal_chars = dict.fromkeys(range(32))
        del illegal_chars[9]  # tab
        del illegal_chars[10] # line feed
        del illegal_chars[13] # carriage return
        
        try:
            from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
        except ImportError:
            ILLEGAL_CHARACTERS_RE = None

        for item in data:
            clean_item = {}
            for k, v in item.items():
                if isinstance(v, str):
                    # Méthode 1: Table de traduction ASCII de base
                    v_clean = v.translate(illegal_chars)
                    
                    # Méthode 2: Regex openpyxl si disponible
                    if ILLEGAL_CHARACTERS_RE:
                        v_clean = ILLEGAL_CHARACTERS_RE.sub("", v_clean)
                        
                    clean_item[k] = v_clean
                else:
                    clean_item[k] = v
            clean_data.append(clean_item)
            
        df = pd.DataFrame(clean_data)
        df.to_excel(filepath, index=False, engine='openpyxl')
        
        logger.info(f"📊 Fichier Excel créé: {filepath}")
    
    def run(self, enable_geocoding: bool = False, export_excel: bool = True):
        """
        Exécute le scraping complet
        
        Args:
            enable_geocoding: Si True, géocode toutes les adresses
            export_excel: Si True, exporte en Excel
        """
        try:
            logger.info("🚀 DÉMARRAGE DU SCRAPER ONPBF (Python)...")
            
            # Setup
            self.setup_driver()
            
            # Scraping
            self.scrape_annuaire()
            self.scrape_garde()
            
            # Normalisation
            final_data = self.normalize_and_enrich()
            
            # Géocodage optionnel
            if enable_geocoding:
                final_data = self.geocode_all(final_data)
            
            # Export
            self.save_to_json(final_data)
            
            if export_excel:
                self.save_to_excel(final_data)
            
            logger.info("🎉 Scraping terminé avec succès!")
            logger.info(f"📈 Total: {len(final_data)} pharmacies")
            
            return final_data
            
        except Exception as e:
            logger.error(f"❌ Erreur fatale: {e}")
            raise
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🏁 Navigateur fermé")


def main():
    """Point d'entrée principal"""
    scraper = PharmacyScraper(headless=True)
    
    # Lancer le scraping (sans géocodage par défaut pour aller plus vite)
    data = scraper.run(enable_geocoding=False, export_excel=True)
    
    print("\n" + "="*60)
    print(f"✨ Scraping terminé! {len(data)} pharmacies extraites.")
    print("="*60)


if __name__ == "__main__":
    main()
