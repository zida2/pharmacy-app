@echo off
echo ========================================
echo Test d'installation du Scraper ONPBF
echo ========================================
echo.

python test_installation.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo Des problemes ont ete detectes!
    echo ========================================
    echo.
    echo Lancez install_python.bat pour corriger
    pause
    exit /b 1
)

echo.
pause
