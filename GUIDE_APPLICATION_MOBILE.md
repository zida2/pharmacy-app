# 📱 Guide : Transformer PharmaBF en Application Mobile Android

## ✅ Ce qui a été fait automatiquement

1. **Configuration Next.js** : Préparé pour le mode production
2. **Installation de Capacitor** : Framework pour créer des apps natives
3. **Correction des erreurs TypeScript** : Tous les fichiers compilent correctement
4. **Ajout de Google Sign-In** : Authentification prioritaire configurée
5. **Projet Android créé** : Dossier `android/` prêt

## 🚀 Prochaines étapes (À faire manuellement)

### Option 1 : Utiliser Android Studio (Recommandé)

1. **Installer Android Studio** (si pas déjà fait)
   - Télécharger : https://developer.android.com/studio
   - Installer avec les composants par défaut

2. **Ouvrir le projet Android**
   ```
   cd android
   ```
   - Ouvrir Android Studio
   - File > Open > Sélectionner le dossier `android`

3. **Construire l'APK**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Attendre la compilation (5-10 minutes la première fois)
   - L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2 : Ligne de commande (Plus rapide si Gradle est installé)

```bash
cd android
./gradlew assembleDebug
```

L'APK sera créé dans : `android/app/build/outputs/apk/debug/app-debug.apk`

## 📦 Installer l'APK sur votre téléphone

1. **Transférer l'APK** sur votre téléphone (USB, email, cloud...)
2. **Activer "Sources inconnues"** dans les paramètres Android
3. **Ouvrir le fichier APK** et installer

## ⚠️ Notes importantes

- **Mode Debug** : L'APK créé est en mode debug (pour tests)
- **Firebase** : Assurez-vous que Google Sign-In est activé dans Firebase Console
- **SHA-1** : Pour la version production, vous devrez ajouter l'empreinte SHA-1 dans Firebase
- **Permissions** : L'app demandera l'accès à la localisation au premier lancement

## 🔧 Commandes utiles

```bash
# Mettre à jour l'app après modifications du code
npm run build
npx cap sync

# Ouvrir dans Android Studio
npx cap open android

# Voir les logs en temps réel
npx cap run android
```

## 📱 Tester l'application

Une fois installée, l'application :
- ✅ Fonctionne hors ligne (données en cache)
- ✅ Utilise Google Sign-In
- ✅ Accède à la géolocalisation
- ✅ Affiche les pharmacies sur une carte
- ✅ Permet de passer des commandes

---

**Besoin d'aide ?** Consultez la documentation Capacitor : https://capacitorjs.com/docs
