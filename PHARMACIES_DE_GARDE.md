# 🌙 Système de Pharmacies de Garde - DONNÉES RÉELLES

## 📋 Vue d'ensemble

Ce système récupère **automatiquement** les **vraies pharmacies de garde** depuis le **site officiel de l'ANAC** (Agence Nationale de Normalisation et de Contrôle du Burkina Faso).

**⚠️ IMPORTANT**: Ce système utilise des **DONNÉES RÉELLES** - pas de rotation fictive ou aléatoire. Les utilisateurs dépendent de ces informations pour trouver des pharmacies ouvertes en cas d'urgence.

## 🔄 Fonctionnement

### 1. Source des données
- **Site officiel**: https://www.anacburkina.org/pharmacies-garde
- **Fréquence de mise à jour**: Publication quotidienne par l'ANAC
- **Autorité**: Données officielles du gouvernement burkinabè

### 2. Processus automatique

```
6h00 (tous les jours)
    ↓
Scraping du site ANAC
    ↓
Extraction de la liste des pharmacies de garde
    ↓
Matching intelligent avec la base de données
    (similarité de noms + téléphones)
    ↓
Mise à jour de Firestore
    (isGuardToday: true/false)
    ↓
✅ Données disponibles pour les utilisateurs
```

### 3. Algorithme de matching

Le système utilise un algorithme de **similarité** pour matcher les pharmacies scrapées avec celles de la base:

- **Comparaison de noms** (score de 0 à 100%)
- **Vérification des téléphones** (bonus de +20%)
- **Seuil d'acceptation**: 70% de similarité minimum

Exemple:
```
Site ANAC: "Pharmacie du Faso - Ouaga"
Base de données: "Pharmacie du Faso"
→ Match: 85% → ✅ Accepté
```

## 🛠️ Configuration requise

### 1. Dépendances (déjà installées)
```json
{
  "axios": "^1.6.0",
  "cheerio": "^1.0.0-rc.12"
}
```

### 2. Cloud Functions déployées
```bash
cd functions
firebase deploy --only functions:updateRealGuardPharmacies,functions:manualUpdateRealGuardPharmacies,functions:testGuardScraping
```

### 3. Calendrier d'exécution
- **Automatique**: Tous les jours à **6h00** (fuseau Africa/Ouagadougou)
- **Manuel**: Via l'interface `/admin/guard` ou l'API HTTP

## 📡 API Endpoints

### 1. Mise à jour automatique (Scheduled)
```
Fonction: updateRealGuardPharmacies
Trigger: Cloud Scheduler (cron: "0 6 * * *")
Fuseau: Africa/Ouagadougou
```

### 2. Mise à jour manuelle (HTTP)
```bash
POST https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/manualUpdateRealGuardPharmacies

Response:
{
  "success": true,
  "message": "X pharmacies de garde mises à jour depuis ANAC",
  "data": {
    "total": 374,
    "scraped": 12,
    "matched": 10,
    "unmatched": 2,
    "guardPharmacies": [...]
  }
}
```

### 3. Test de scraping (HTTP - sans mise à jour)
```bash
GET https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/testGuardScraping

Response:
{
  "success": true,
  "count": 12,
  "pharmacies": [...],
  "message": "Scraping test réussi (aucune mise à jour effectuée)"
}
```

## 🎯 Utilisation

### Interface Admin

1. Accédez à `/admin/guard`
2. Cliquez sur **"Mettre à jour les pharmacies de garde"**
3. Le système scrape automatiquement le site ANAC
4. Résultats affichés avec statistiques

### Programmation

```javascript
// Dans votre code frontend
const guardPharmacies = await firebaseService.searchMedicines('pharmacie de garde');
// Retourne uniquement les pharmacies avec isGuardToday === true
```

## ⚠️ Gestion des erreurs

### Problème: Site ANAC inaccessible
**Solution**: Le système lèvera une erreur et conservera les données de la veille
```javascript
catch (error) {
  console.error('❌ Site ANAC inaccessible');
  // Les anciennes données restent en place
}
```

### Problème: Aucune pharmacie matchée
**Raisons possibles**:
1. **Structure HTML du site a changé** → Mettre à jour les sélecteurs CSS
2. **Noms trop différents** → Vérifier l'algorithme de similarité
3. **Données ANAC vides** → Vérifier manuellement le site

**Action**: Vérifier les logs de la fonction dans Firebase Console

### Problème: Trop de pharmacies non matchées
**Solution**: Ajuster le seuil de similarité (actuellement 70%)
```javascript
// Dans guard_pharmacies.js, ligne ~180
if (totalScore >= 70 && bestMatch) {  // Diminuer à 60 si nécessaire
```

## 🔍 Débogage

### Vérifier le scraping sans mise à jour
```bash
curl https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/testGuardScraping
```

### Voir les logs en temps réel
```bash
firebase functions:log --only updateRealGuardPharmacies
```

### Tester localement
```bash
cd functions
npm run serve
# Puis appelez http://localhost:5001/YOUR_PROJECT/europe-west1/testGuardScraping
```

## 📝 Maintenance

### Mise à jour des sélecteurs CSS

Si le site ANAC change sa structure HTML, mettre à jour les sélecteurs dans `functions/guard_pharmacies.js`:

```javascript
// Ligne ~86-108
$('.pharmacy-guard-item, .pharmacie-garde, .guard-pharmacy').each()
```

**Marche à suivre**:
1. Visiter https://www.anacburkina.org/pharmacies-garde
2. Inspecter le HTML (F12)
3. Identifier les classes/IDs des pharmacies de garde
4. Mettre à jour les sélecteurs
5. Tester avec `testGuardScraping`
6. Déployer: `firebase deploy --only functions`

### Ajout de sources alternatives

Si ANAC n'est pas disponible, ajouter des sources alternatives dans `scrapeFallbackSources()`:

```javascript
// Exemples de sources alternatives
- Page Facebook de l'Ordre des Pharmaciens
- API gouvernementale (si disponible)
- Sites d'actualités locales (LeFaso.net, etc.)
```

## 📊 Monitoring

### Métriques à surveiller
1. **Taux de matching**: Devrait être > 80%
2. **Nombre de pharmacies de garde**: Généralement 10-15
3. **Erreurs de scraping**: Devrait être < 5%
4. **Temps d'exécution**: < 60 secondes

### Alertes recommandées
- ⚠️ Si 0 pharmacie de garde trouvée
- ⚠️ Si taux de matching < 50%
- ⚠️ Si erreur de scraping 3 jours consécutifs

## 🚀 Optimisations futures

1. **Cache intelligent**: Ne re-scraper que si changement détecté
2. **Historique**: Sauvegarder l'historique des pharmacies de garde
3. **Notifications**: Alerter les admins en cas d'erreur
4. **Multi-sources**: Combiner plusieurs sources pour plus de fiabilité
5. **Machine Learning**: Améliorer le matching avec ML

## 📞 Support

En cas de problème:
1. Vérifier les logs Firebase
2. Tester manuellement le scraping via `/admin/guard`
3. Consulter ce README
4. Contacter l'équipe technique

---

**Dernière mise à jour**: 23 janvier 2026  
**Auteur**: Équipe PharmaBF  
**Version**: 2.0 (Scraping réel ANAC)
