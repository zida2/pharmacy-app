# 📱 Installation directe via câble USB (Mode Développeur)

## 🔌 Méthode rapide : Installation directe sur téléphone

### Étape 1 : Préparer votre téléphone Android

1. **Activer le Mode Développeur**
   - Allez dans **Paramètres > À propos du téléphone**
   - Tapez **7 fois** sur "Numéro de build"
   - Un message "Vous êtes maintenant développeur" apparaîtra

2. **Activer le Débogage USB**
   - Retournez dans **Paramètres > Options pour les développeurs**
   - Activez **Débogage USB**
   - Activez aussi **Installation via USB** (si disponible)

3. **Connecter le téléphone**
   - Branchez votre téléphone à l'ordinateur avec un câble USB
   - Sur le téléphone, autorisez le débogage USB (popup qui apparaît)
   - Cochez "Toujours autoriser depuis cet ordinateur"

### Étape 2 : Vérifier la connexion

Ouvrez PowerShell et tapez :
```powershell
cd android
.\gradlew installDebug
```

**OU** si vous avez Android Studio installé :
```powershell
npx cap run android
```

### Étape 3 : L'application s'installe automatiquement !

- ✅ L'APK se compile
- ✅ S'installe directement sur votre téléphone
- ✅ L'application se lance automatiquement

## 🚀 Commandes rapides

### Installer et lancer l'app
```bash
cd c:\Users\Dési InnovaTech\Desktop\ci\pharmacy-app\frontend
npx cap run android
```

### Juste installer (sans lancer)
```bash
cd android
.\gradlew installDebug
```

### Voir les logs en direct
```bash
npx cap run android --livereload
```
Cette commande permet de voir les modifications en temps réel sur le téléphone !

## ⚡ Mode Live Reload (Développement rapide)

Pour développer rapidement :
```bash
# Terminal 1 : Lancer le serveur de dev
npm run dev

# Terminal 2 : Lancer l'app avec live reload
npx cap run android --livereload --host=0.0.0.0
```

Maintenant, chaque modification du code se reflète instantanément sur le téléphone ! 🔥

## 🔧 Dépannage

### "Device not found"
- Vérifiez que le débogage USB est activé
- Débranchez/rebranchez le câble
- Essayez un autre câble USB
- Sur Windows, installez les drivers USB du fabricant

### "Unauthorized"
- Sur le téléphone, acceptez la popup de débogage USB
- Cochez "Toujours autoriser"

### L'app ne se lance pas
```bash
# Désinstaller l'ancienne version
adb uninstall com.pharmabf.app

# Réinstaller
npx cap run android
```

## 📊 Vérifier les appareils connectés

```bash
# Voir les téléphones connectés
adb devices

# Devrait afficher quelque chose comme :
# List of devices attached
# ABC123XYZ    device
```

## 🎯 Workflow de développement optimal

1. **Première installation**
   ```bash
   npx cap run android
   ```

2. **Développement avec live reload**
   ```bash
   npm run dev
   npx cap run android --livereload
   ```

3. **Modifications du code** → Se reflètent automatiquement sur le téléphone

4. **Build final pour distribution**
   ```bash
   npm run build
   cd android
   .\gradlew assembleRelease
   ```

---

**Astuce** : Gardez le téléphone branché pendant le développement pour profiter du live reload ! 🚀
