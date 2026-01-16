@echo off
echo ========================================
echo Installation du Scraper Python ONPBF
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé!
    echo.
    echo Téléchargez Python depuis: https://www.python.org/downloads/
    echo Assurez-vous de cocher "Add Python to PATH" lors de l'installation
    pause
    exit /b 1
)

echo [OK] Python est installé
python --version
echo.

REM Installer les dépendances
echo Installation des dépendances Python...
echo.
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo [ERREUR] Échec de l'installation des dépendances
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation terminée avec succès!
echo ========================================
echo.
echo Pour lancer le scraper:
echo   python scraper.py
echo.
pause
