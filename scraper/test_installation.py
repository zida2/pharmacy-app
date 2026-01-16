#!/usr/bin/env python3
"""
Script de test pour vérifier l'installation du scraper
"""

import sys

def test_imports():
    """Teste que toutes les dépendances sont installées"""
    print("🔍 Vérification des dépendances...\n")
    
    tests = {
        'selenium': False,
        'webdriver_manager': False,
        'pandas': False,
        'openpyxl': False,
        'requests': False
    }
    
    # Test Selenium
    try:
        import selenium
        from selenium import webdriver
        tests['selenium'] = True
        print(f"✅ Selenium {selenium.__version__}")
    except ImportError as e:
        print(f"❌ Selenium non installé: {e}")
    
    # Test webdriver-manager
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        tests['webdriver_manager'] = True
        print("✅ webdriver-manager installé")
    except ImportError as e:
        print(f"⚠️  webdriver-manager non installé (optionnel): {e}")
    
    # Test Pandas
    try:
        import pandas as pd
        tests['pandas'] = True
        print(f"✅ Pandas {pd.__version__}")
    except ImportError as e:
        print(f"❌ Pandas non installé: {e}")
    
    # Test openpyxl
    try:
        import openpyxl
        tests['openpyxl'] = True
        print(f"✅ openpyxl {openpyxl.__version__}")
    except ImportError as e:
        print(f"❌ openpyxl non installé: {e}")
    
    # Test requests
    try:
        import requests
        tests['requests'] = True
        print(f"✅ Requests {requests.__version__}")
    except ImportError as e:
        print(f"⚠️  Requests non installé (optionnel): {e}")
    
    print("\n" + "="*60)
    
    # Résumé
    required = ['selenium', 'pandas', 'openpyxl']
    optional = ['webdriver_manager', 'requests']
    
    required_ok = all(tests[pkg] for pkg in required)
    
    if required_ok:
        print("✅ Toutes les dépendances requises sont installées!")
        print("\n🚀 Vous pouvez lancer le scraper avec:")
        print("   python scraper.py")
    else:
        print("❌ Certaines dépendances requises sont manquantes!")
        print("\n💡 Installez-les avec:")
        print("   pip install -r requirements.txt")
        return False
    
    # Info sur les optionnelles
    if not tests['webdriver_manager']:
        print("\n⚠️  webdriver-manager n'est pas installé.")
        print("   Vous devrez installer ChromeDriver manuellement.")
        print("   Ou installez-le avec: pip install webdriver-manager")
    
    if not tests['requests']:
        print("\n⚠️  requests n'est pas installé.")
        print("   Le géocodage sera désactivé.")
        print("   Installez-le avec: pip install requests")
    
    print("="*60)
    return True


def test_chrome():
    """Teste que Chrome/ChromeDriver est accessible"""
    print("\n🔍 Vérification de Chrome/ChromeDriver...\n")
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        # Essayer avec webdriver-manager
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            
            print("📦 Test avec webdriver-manager...")
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.quit()
            print("✅ Chrome/ChromeDriver fonctionne avec webdriver-manager!")
            return True
        except Exception as e:
            print(f"⚠️  webdriver-manager a échoué: {e}")
            
            # Essayer sans webdriver-manager
            print("\n📦 Test avec ChromeDriver depuis le PATH...")
            try:
                driver = webdriver.Chrome(options=chrome_options)
                driver.quit()
                print("✅ Chrome/ChromeDriver fonctionne depuis le PATH!")
                return True
            except Exception as e2:
                print(f"❌ ChromeDriver non trouvé: {e2}")
                print("\n💡 Solutions:")
                print("   1. Installez webdriver-manager: pip install webdriver-manager")
                print("   2. Ou téléchargez ChromeDriver: https://chromedriver.chromium.org/")
                return False
    
    except ImportError:
        print("❌ Selenium n'est pas installé!")
        return False


def main():
    """Point d'entrée principal"""
    print("="*60)
    print("🧪 TEST D'INSTALLATION DU SCRAPER ONPBF")
    print("="*60)
    print()
    
    # Test des imports
    if not test_imports():
        sys.exit(1)
    
    # Test de Chrome
    if not test_chrome():
        print("\n⚠️  Le scraper pourrait ne pas fonctionner correctement.")
        print("   Installez les dépendances manquantes et réessayez.")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🎉 TOUS LES TESTS SONT PASSÉS!")
    print("="*60)
    print("\n✨ Le scraper est prêt à l'emploi!")
    print("\n🚀 Lancez-le avec:")
    print("   python scraper.py")
    print("\nOu utilisez le script:")
    print("   run_scraper.bat")
    print("="*60)


if __name__ == "__main__":
    main()
