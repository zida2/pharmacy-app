# 🏥 PLAN D'IMPLÉMENTATION : ÉCOSYSTÈME SANTÉ COMPLET BURKINA FASO

## 📋 Vue d'ensemble

**Objectif** : Transformer l'application de pharmacies (297 actuellement) en un écosystème santé complet incluant **pharmacies, cliniques, dentistes, assurances**, avec **commandes, rendez-vous, communication, GPS précis** et **couverture complète** (~400 pharmacies).

**Base actuelle** : ✅ 297 pharmacies avec géolocalisation, commandes, consultation

---

## 🎯 PHASE 1 : FONDATIONS (Semaine 1)

### 1.1 Extension du Modèle de Données

#### Nouveaux Types de Prestataires
```typescript
// types.ts - Extensions
export type ProviderType = "pharmacy" | "clinic" | "hospital" | "dentist" | "insurance";

export interface HealthProvider {
    id: string;
    type: ProviderType;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
        city: string;
        quartier?: string;
    };
    phone: string;
    email?: string;
    status: "open" | "closed" | "guard" | "available" | "unavailable";
    
    // GPS Validation
    gps_validated: boolean; // ✅ Flag coordonnées GPS précises
    gps_accuracy?: number; // Précision en mètres
    gps_source?: "manual" | "nominatim" | "osm" | "google";
    gps_last_updated?: Date;
    
    // Contact & Communication
    whatsapp?: string;
    website?: string;
    social?: {
        facebook?: string;
        instagram?: string;
    };
    
    // Horaires
    openingHours?: OpeningHour[];
    
    // Statut & Badges
    isVerified: boolean;
    isPremium?: boolean;
    lastUpdated: Date;
    badges?: ("verified" | "recent_update" | "partner" | "guard")[];
    
    // Rating
    rating?: number;
    reviewCount?: number;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface Clinic extends HealthProvider {
    type: "clinic" | "hospital";
    specialties: string[]; // ["Médecine générale", "Pédiatrie", "Gynécologie", ...]
    services: string[]; // ["Consultation", "Urgences", "Laboratoire", "Imagerie"]
    hasEmergency: boolean;
    hasAmbulance: boolean;
    hasBeds: boolean;
    bedCount?: number;
    acceptsInsurance: boolean;
    acceptedInsurances?: string[]; // IDs des assurances acceptées
}

export interface Dentist extends HealthProvider {
    type: "dentist";
    specialties: string[]; // ["Orthodontie", "Implants", "Blanchiment", ...]
    services: string[]; // ["Consultation", "Détartrage", "Extraction", ...]
    acceptsInsurance: boolean;
    acceptedInsurances?: string[];
}

export interface InsuranceProvider extends HealthProvider {
    type: "insurance";
    coverageTypes: string[]; // ["Santé", "Maternité", "Dentaire", ...]
    coverageRate: number; // Taux de couverture moyen (ex: 80%)
    plans: {
        name: string;
        description: string;
        monthlyPremium: number;
        coverage: string[];
    }[];
    partnersCount: number; // Nombre de prestataires partenaires
    claimsPhone: string; // Numéro pour déclarations
    emergencyPhone: string;
}

// Appointment Types
export interface Appointment {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    
    providerId: string;
    providerType: ProviderType;
    providerName: string;
    
    appointmentDate: Date;
    appointmentTime: string; // "09:00"
    consultationType: string; // "Consultation générale", "Urgence", "Contrôle"
    specialty?: string; // Pour cliniques/dentistes
    
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
    notes?: string;
    
    // Notifications
    reminderSent?: boolean;
    confirmationSent?: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}

// Feedback/Report System
export interface Report {
    id: string;
    userId: string;
    providerId: string;
    providerType: ProviderType;
    
    type: "closed" | "wrong_hours" | "wrong_location" | "phone_error" | "other";
    description: string;
    location?: {
        lat: number;
        lng: number;
    };
    
    status: "pending" | "reviewed" | "resolved" | "rejected";
    adminNotes?: string;
    
    createdAt: Date;
    resolvedAt?: Date;
}

// Emergency Request
export interface EmergencyRequest {
    id: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    requestType: "pharmacy" | "clinic" | "ambulance" | "dentist";
    timestamp: Date;
    resolved: boolean;
}
```

---

### 1.2 Structure Firestore Étendue

#### Collections à créer/modifier :

```javascript
// ✅ EXISTANT - À étendre
pharmacies/ (297 docs actuellement)
  - Ajouter : gps_validated, gps_accuracy, gps_source, badges

// 🆕 NOUVEAUX
clinics/ 
  {id}/
    - Tous les champs de HealthProvider + Clinic
    
dentists/
  {id}/
    - Tous les champs de HealthProvider + Dentist
    
insurance_providers/
  {id}/
    - Tous les champs de HealthProvider + InsuranceProvider

appointments/
  {id}/
    - Tous les champs de Appointment
    - Index: userId, providerId, appointmentDate, status

reports/
  {id}/
    - Tous les champs de Report
    - Index: providerId, status, createdAt

emergency_requests/
  {id}/
    - Tous les champs de EmergencyRequest
    - Index: userId, timestamp, resolved

// GPS Validation Queue
gps_validation_queue/
  {id}/
    - providerId, providerType, oldCoords, newCoords, status, requestedAt
```

---

### 1.3 Enrichissement GPS des 297 Pharmacies

**Script Python** : `scraper/enrich_gps.py`

```python
import json
import requests
import time
from typing import Dict, List, Optional

def geocode_nominatim(address: str, city: str = "Burkina Faso") -> Optional[Dict]:
    """Géocode une adresse via Nominatim (OpenStreetMap)"""
    query = f"{address}, {city}"
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "countrycodes": "bf"  # Burkina Faso
    }
    headers = {
        "User-Agent": "PharmaBF/1.0 (contact@pharmabf.bf)"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            return {
                "lat": float(result["lat"]),
                "lng": float(result["lon"]),
                "display_name": result.get("display_name"),
                "importance": float(result.get("importance", 0))
            }
    except Exception as e:
        print(f"Erreur géocodage pour '{query}': {e}")
    
    return None

def enrich_pharmacies_gps(input_file: str, output_file: str):
    """Enrichit les coordonnées GPS de toutes les pharmacies"""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        pharmacies = json.load(f)
    
    print(f"📍 Enrichissement GPS de {len(pharmacies)} pharmacies...")
    
    enriched = 0
    failed = 0
    
    for i, pharmacy in enumerate(pharmacies, 1):
        print(f"\n[{i}/{len(pharmacies)}] {pharmacy.get('nom_pharmacie', 'Unknown')}")
        
        # Vérifier si coordonnées manquantes ou (0, 0)
        current_lat = pharmacy.get('latitude', 0)
        current_lng = pharmacy.get('longitude', 0)
        
        needs_enrichment = (
            current_lat == 0 or 
            current_lng == 0 or 
            abs(current_lat) < 0.01 or 
            abs(current_lng) < 0.01
        )
        
        if needs_enrichment:
            address = pharmacy.get('adresse_complete', '') or pharmacy.get('quartier', '')
            city = pharmacy.get('ville', 'Ouagadougou')
            
            if address:
                result = geocode_nominatim(address, city)
                
                if result:
                    pharmacy['latitude'] = result['lat']
                    pharmacy['longitude'] = result['lng']
                    pharmacy['gps_validated'] = False  # Nécessite validation manuelle
                    pharmacy['gps_source'] = 'nominatim'
                    pharmacy['gps_accuracy'] = 100  # ~100m pour Nominatim
                    pharmacy['gps_enriched'] = True
                    enriched += 1
                    print(f"  ✅ Coordonnées mises à jour: ({result['lat']}, {result['lng']})")
                else:
                    pharmacy['gps_validated'] = False
                    pharmacy['gps_needs_manual'] = True
                    failed += 1
                    print(f"  ❌ Impossible de géocoder")
                
                time.sleep(1)  # Rate limiting Nominatim
        else:
            pharmacy['gps_validated'] = False  # À valider manuellement
            pharmacy['gps_source'] = pharmacy.get('gps_source', 'scraper')
            print(f"  ℹ️  Coordonnées existantes: ({current_lat}, {current_lng})")
    
    # Sauvegarder
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(pharmacies, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"✅ Enrichissement terminé !")
    print(f"  • {enriched} pharmacies enrichies")
    print(f"  • {failed} échecs")
    print(f"  • Fichier sauvegardé : {output_file}")

if __name__ == "__main__":
    enrich_pharmacies_gps(
        "pharmacies_for_webapp_import.json",
        "pharmacies_gps_enriched.json"
    )
```

---

### 1.4 Complétion Base Pharmacies (297 → 400+)

**Sources** :
1. **ONPBF** (Ordre National des Pharmaciens du Burkina Faso) - scraping existant
2. **OpenStreetMap** - Requêtes Overpass API
3. **Crowdsourcing** - Formulaire "Proposer une pharmacie"

**Script** : `scraper/complete_pharmacies.py`

```python
import requests
import json

def fetch_osm_pharmacies_burkina():
    """Récupère toutes les pharmacies du Burkina via Overpass API"""
    
    query = """
    [out:json][timeout:60];
    area["ISO3166-1"="BF"][admin_level=2];
    (
      node["amenity"="pharmacy"](area);
      way["amenity"="pharmacy"](area);
    );
    out body;
    >;
    out skel qt;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    
    try:
        response = requests.post(url, data={"data": query}, timeout=120)
        data = response.json()
        
        pharmacies = []
        for element in data.get("elements", []):
            if element["type"] == "node":
                pharmacy = {
                    "id": f"osm_{element['id']}",
                    "nom_pharmacie": element.get("tags", {}).get("name", "Pharmacie sans nom"),
                    "latitude": element["lat"],
                    "longitude": element["lon"],
                    "ville": element.get("tags", {}).get("addr:city", ""),
                    "quartier": element.get("tags", {}).get("addr:suburb", ""),
                    "adresse_complete": element.get("tags", {}).get("addr:street", ""),
                    "telephone": element.get("tags", {}).get("phone", ""),
                    "source": "OpenStreetMap",
                    "gps_validated": False,
                    "gps_source": "osm"
                }
                pharmacies.append(pharmacy)
        
        return pharmacies
    except Exception as e:
        print(f"Erreur OSM: {e}")
        return []

def merge_pharmacy_databases(onpbf_file: str, osm_pharmacies: list, output_file: str):
    """Fusionne ONPBF + OSM en évitant les doublons"""
    
    with open(onpbf_file, 'r', encoding='utf-8') as f:
        onpbf = json.load(f)
    
    print(f"ONPBF: {len(onpbf)} pharmacies")
    print(f"OSM: {len(osm_pharmacies)} pharmacies")
    
    # Détecter doublons par proximité (< 50m) et nom similaire
    merged = onpbf.copy()
    added = 0
    
    for osm_p in osm_pharmacies:
        is_duplicate = False
        
        for existing in merged:
            # Distance approximative
            lat_diff = abs(osm_p['latitude'] - existing.get('latitude', 0))
            lng_diff = abs(osm_p['longitude'] - existing.get('longitude', 0))
            
            # ~50m = ~0.0005 degrés
            if lat_diff < 0.0005 and lng_diff < 0.0005:
                # Même nom ?
                if osm_p['nom_pharmacie'].lower() in existing.get('nom_pharmacie', '').lower():
                    is_duplicate = True
                    break
        
        if not is_duplicate:
            merged.append(osm_p)
            added += 1
    
    # Sauvegarder
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Fusion terminée !")
    print(f"  • Total: {len(merged)} pharmacies")
    print(f"  • Nouvelles: {added}")
    print(f"  • Fichier: {output_file}")

if __name__ == "__main__":
    osm = fetch_osm_pharmacies_burkina()
    merge_pharmacy_databases(
        "pharmacies_gps_enriched.json",
        osm,
        "pharmacies_complete_400.json"
    )
```

---

## 🎯 PHASE 2 : INTERFACE UTILISATEUR (Semaine 2)

### 2.1 Page Liste des Prestataires

**Fichier** : `frontend/src/app/providers/page.tsx`

Fonctionnalités :
- ✅ Affichage pharmacies, cliniques, dentistes, assurances
- ✅ Filtres avancés (type, ville, statut, proximité)
- ✅ Recherche intelligente
- ✅ Carte + Liste
- ✅ Badge GPS validé / coordonnées approximatives

### 2.2 Bouton URGENCE

**Composant** : `frontend/src/components/EmergencyButton.tsx`

- Cherche prestataire ouvert le plus proche
- Options : Appeler / Itinéraire (OpenStreetMap)
- Priorité : Pharmacies de garde > Cliniques avec urgences

### 2.3 Communication & Rendez-vous

**Composants** :
- `ContactButtons.tsx` - Appel, WhatsApp, Email
- `AppointmentModal.tsx` - Prise de rendez-vous
- `ChatInterface.tsx` - Messages avec prestataires

### 2.4 Feedback & Signalement

**Composant** : `ReportModal.tsx`

- Signaler erreurs (fermé, horaires, coordonnées)
- Proposer corrections GPS
- Remonte vers Admin

---

## 🎯 PHASE 3 : PLATEFORME PRESTATAIRE (Semaine 3)

### 3.1 Dashboard Prestataire

**Fichier** : `frontend/src/app/provider-dashboard/page.tsx`

Fonctionnalités :
- ✅ Gestion profil (infos, horaires, services)
- ✅ **Définir ma position GPS** sur carte OSM
- ✅ Gestion commandes (pharmacies)
- ✅ Gestion rendez-vous (cliniques/dentistes)
- ✅ Communication clients
- ✅ Statistiques

### 3.2 Validation GPS Interactive

**Composant** : `GPSEditor.tsx`

- Carte interactive (Leaflet + OSM)
- Drag & drop marker
- Validation automatique après correction
- `gps_validated: true` après validation

---

## 🎯 PHASE 4 : PLATEFORME ADMIN (Semaine 4)

### 4.1 Dashboard Admin Complet

**Fichier** : `frontend/src/app/admin/page.tsx`

Sections :
1. **Vue d'ensemble** - Stats globales
2. **Gestion Prestataires** - CRUD pharmacies, cliniques, dentistes, assurances
3. **Validation GPS** - File d'attente des coordonnées à valider
4. **Signalements** - Traiter rapports utilisateurs
5. **Commandes & Rendez-vous** - Supervision
6. **Utilisateurs** - Gestion comptes

### 4.2 Validation GPS en Masse

**Composant** : `admin/GPSValidationQueue.tsx`

- Liste des coordonnées non validées
- Carte avec ancien/nouveau marqueur
- Validation/Rejet en 1 clic

---

## 🎯 PHASE 5 : DONNÉES RÉELLES (Semaine 5)

### 5.1 Cliniques du Burkina Faso

**Sources** :
- Ministère de la Santé
- OpenStreetMap (`amenity=clinic`, `amenity=hospital`)
- Crowdsourcing

**Script** : `scraper/scrape_clinics.py`

**Données cibles** :
- CHU Yalgado Ouédraogo (Ouagadougou)
- Clinique Princesse Sarah
- CliniqueEspoir
- Polyclinique Notre Dame de la Paix
- + ~50 autres cliniques majeures

### 5.2 Dentistes du Burkina Faso

**Sources** :
- Ordre des Chirurgiens-Dentistes du Burkina
- OpenStreetMap (`amenity=dentist`)
- Annuaires locaux

**Données cibles** : ~30-50 cabinets dentaires

### 5.3 Assurances Santé

**Sources** :
- Assurances majeures du BF (SONAR, UAB, Allianz, CORIS, etc.)
- Caisses de Sécurité Sociale
- Mutuelles

**Données manuelles** : ~10-15 assureurs majeurs

---

## 🎯 PHASE 6 : IA & NOTIFICATIONS (Semaine 6)

### 6.1 IA Locale Orientée Action

**Service** : `frontend/src/services/aiAssistant.ts`

```typescript
export class HealthAssistant {
    async processQuery(query: string, userLocation: {lat: number, lng: number}) {
        const intent = this.detectIntent(query);
        
        switch(intent) {
            case "emergency_pharmacy":
                return this.findNearestGuardPharmacy(userLocation);
            
            case "dentist_appointment":
                return this.findAvailableDentists(userLocation);
            
            case "insurance_info":
                return this.getInsuranceInfo(query);
            
            default:
                return this.generalSearch(query, userLocation);
        }
    }
    
    private detectIntent(query: string): string {
        const q = query.toLowerCase();
        
        if (q.includes("garde") || q.includes("urgence")) {
            return "emergency_pharmacy";
        }
        if (q.includes("dentiste") || q.includes("dent")) {
            return "dentist_appointment";
        }
        if (q.includes("assurance") || q.includes("couverture")) {
            return "insurance_info";
        }
        
        return "general";
    }
}
```

### 6.2 Système de Notifications

**Service** : `frontend/src/services/notificationService.ts`

Notifications :
- ✅ Confirmation commande
- ✅ Statut commande (prête, en livraison)
- ✅ Confirmation rendez-vous
- ✅ Rappel rendez-vous (24h avant)
- ✅ Message nouveau prestataire
- ✅ Urgence : pharmacie de garde ouverte à proximité

---

## 🎯 PHASE 7 : MODE HORS-LIGNE (Semaine 7)

### 7.1 Service Worker & Cache

**Fichier** : `frontend/public/sw.js`

Cache :
- Liste complète des prestataires
- Coordonnées GPS essentielles
- Données de garde hebdomadaire
- Interface critique (bouton urgence, carte)

### 7.2 Synchronisation Optimiste

Mise en file d'attente :
- Commandes
- Rendez-vous
- Messages
- Rapports

Synchronisation auto lors de reconnexion.

---

## 📊 MÉTRIQUES DE SUCCÈS

### Couverture
- ✅ **400+ pharmacies** (vs 297 actuellement)
- ✅ **50+ cliniques**
- ✅ **30+ dentistes**
- ✅ **15+ assurances**

### GPS
- ✅ **90%+ coordonnées validées** (gps_validated: true)
- ✅ **Précision < 50m** pour centres urbains
- ✅ **Tolérance ±300m** zones rurales

### Engagement
- ✅ **Bouton Urgence** : < 2 clics pour appeler
- ✅ **Rendez-vous** : Confirmation sous 24h
- ✅ **Signalements** : Traités sous 48h

---

## 🚀 CALENDRIER D'IMPLÉMENTATION

| Semaine | Phase | Livrables |
|---------|-------|-----------|
| 1 | Fondations | Types, Firestore, GPS enrichment, 400 pharmacies |
| 2 | UI Utilisateur | Liste prestataires, Urgence, Filtres, Rendez-vous |
| 3 | Plateforme Prestataire | Dashboard, GPS editor, Gestion RDV |
| 4 | Admin | Dashboard complet, Validation GPS, Signalements |
| 5 | Données | Cliniques, Dentistes, Assurances réelles |
| 6 | IA & Notifs | Assistant IA, Notifications push |
| 7 | Hors-ligne | Service Worker, Cache, Sync |

---

## 🔧 TECHNOLOGIES

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Leaflet** (cartes OSM)
- **React Query** (cache & sync)

### Backend
- **Firebase Firestore** (base de données)
- **Firebase Cloud Functions** (webhooks, notifications)
- **Firebase Cloud Messaging** (push notifications)

### Scraping & Data
- **Python** + BeautifulSoup/Playwright
- **Nominatim** (géocodage)
- **Overpass API** (OSM data)

---

## 📝 NOTES IMPORTANTES

1. **Pas de conseils médicaux** - L'IA oriente uniquement vers prestataires
2. **Paiement non obligatoire** - Prévoir intégration Orange/Moov Money ultérieure
3. **RGPD/Données** - Consentement explicite pour géolocalisation
4. **Modération** - Signalements vérifiés par Admin avant action
5. **Performance** - Lazy loading, pagination, cache agressif

---

## ✅ PROCHAINES ÉTAPES IMMÉDIATES

1. **Valider ce plan** avec l'équipe
2. **Lancer enrichissement GPS** des 297 pharmacies existantes
3. **Scraper OSM** pour compléter à 400+
4. **Créer les nouveaux types TypeScript**
5. **Étendre Firestore** avec nouvelles collections
6. **Développer page liste prestataires**

---

**Prêt à démarrer ? 🚀**

Quelle phase souhaitez-vous prioriser ?
