@echo off
echo ========================================
echo Scraper ONPBF - Pharmacies Burkina Faso
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé!
    echo Lancez d'abord: install_python.bat
    pause
    exit /b 1
)

echo Démarrage du scraping...
echo.
echo [INFO] Cela peut prendre quelques minutes
echo [INFO] Le navigateur s'exécute en arrière-plan
echo.

python scraper.py

if errorlevel 1 (
    echo.
    echo [ERREUR] Le scraping a échoué
    echo Vérifiez que ChromeDriver est installé
    pause
    exit /b 1
)

echo.
echo ========================================
echo Scraping terminé!
echo ========================================
echo.
echo Fichiers générés:
echo   - pharmacies_burkina.json
echo   - pharmacies_burkina.xlsx
echo.
pause
