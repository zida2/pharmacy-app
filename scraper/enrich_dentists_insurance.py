"""
Script d'enrichissement des DENTISTES et ASSURANCES pour l'écosystème santé
Auteur: PharmaBF Team
"""

import json
import requests
import os
import time

OSM_API_URL = "https://overpass-api.de/api/interpreter"

def fetch_osm_data(amenity_type, timeout=120):
    """Récupère les données depuis OpenStreetMap"""
    print(f"🌍 Récupération des '{amenity_type}' depuis OSM...")
    query = f"""
    [out:json][timeout:{timeout}];
    area["ISO3166-1"="BF"].searchArea;
    (
      node["amenity"="{amenity_type}"](area.searchArea);
      way["amenity"="{amenity_type}"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    """
    
    try:
        response = requests.post(OSM_API_URL, data={"data": query}, timeout=timeout)
        if response.status_code == 200:
            data = response.json()
            items = []
            for element in data.get("elements", []):
                if element["type"] == "node":
                    lat = element["lat"]
                    lon = element["lon"]
                elif element["type"] == "way":
                    continue  # Skip ways for simplicity
                else:
                    continue

                tags = element.get("tags", {})
                name = tags.get("name", "Sans nom")
                
                item = {
                    "id": f"osm_{amenity_type}_{element['id']}",
                    "type": amenity_type,
                    "name": name,
                    "location": {
                        "lat": lat,
                        "lng": lon,
                        "address": tags.get("addr:street", tags.get("addr:suburb", "")),
                        "city": tags.get("addr:city", "Burkina Faso")
                    },
                    "phone": tags.get("phone", tags.get("contact:phone", "NC")),
                    "source": "OpenStreetMap",
                    "gps_validated": False,
                    "gps_source": "osm"
                }
                
                # Add specialties for dentists if available
                if amenity_type == "dentist":
                    item["specialties"] = []
                    item["services"] = ["Consultation", "Soins dentaires"]
                    item["acceptsInsurance"] = False
                
                items.append(item)
            
            print(f"  ✅ {len(items)} éléments trouvés.")
            return items
        else:
            print(f"  ❌ Erreur OSM: {response.status_code}")
            return []
    except Exception as e:
        print(f"  ❌ Exception OSM: {e}")
        return []


def enrich_insurance_data():
    """Enrichit les données d'assurance avec plus de détails"""
    print("\n💼 Enrichissement des assurances santé...")
    
    insurances = [
        {
            "id": "ins_sonar",
            "name": "SONAR Assurances",
            "type": "insurance",
            "location": {
                "lat": 12.368,
                "lng": -1.527,
                "address": "Avenue Kwame N'Krumah",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 33 33 33",
            "email": "contact@sonar.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Maternité", "Dentaire", "Hospitalisation"],
            "coverageRate": 80,
            "plans": [
                {
                    "name": "Plan Classique",
                    "description": "Couverture santé de base",
                    "monthlyPremium": 15000,
                    "coverage": ["Consultation", "Médicaments", "Hospitalisation"]
                },
                {
                    "name": "Plan Premium",
                    "description": "Couverture complète avec maternité",
                    "monthlyPremium": 25000,
                    "coverage": ["Consultation", "Médicaments", "Hospitalisation", "Maternité", "Dentaire"]
                }
            ],
            "partnersCount": 150,
            "claimsPhone": "+226 25 33 33 35",
            "emergencyPhone": "+226 70 00 00 01",
            "website": "www.sonar.bf",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        },
        {
            "id": "ins_uab",
            "name": "UAB Assurances",
            "type": "insurance",
            "location": {
                "lat": 12.366,
                "lng": -1.521,
                "address": "Avenue de la Nation",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 30 30 30",
            "email": "info@uab.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Maternité", "Optique", "Dentaire"],
            "coverageRate": 80,
            "plans": [
                {
                    "name": "UAB Santé Individuel",
                    "description": "Pour les particuliers",
                    "monthlyPremium": 12000,
                    "coverage": ["Consultation", "Médicaments", "Analyses"]
                },
                {
                    "name": "UAB Santé Famille",
                    "description": "Couverture familiale (4 personnes)",
                    "monthlyPremium": 35000,
                    "coverage": ["Consultation", "Médicaments", "Hospitalisation", "Maternité"]
                }
            ],
            "partnersCount": 200,
            "claimsPhone": "+226 25 30 30 35",
            "emergencyPhone": "+226 70 00 00 02",
            "website": "www.uab.bf",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        },
        {
            "id": "ins_sunu",
            "name": "SUNU Assurances",
            "type": "insurance",
            "location": {
                "lat": 12.365,
                "lng": -1.522,
                "address": "Rue du Commerce",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 31 31 31",
            "email": "sunu@sunu.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Accidents", "Hospitalisation"],
            "coverageRate": 70,
            "plans": [
                {
                    "name": "SUNU Santé+",
                    "description": "Couverture standard",
                    "monthlyPremium": 10000,
                    "coverage": ["Consultation", "Médicaments"]
                }
            ],
            "partnersCount": 100,
            "claimsPhone": "+226 25 31 31 35",
            "emergencyPhone": "+226 70 00 00 03",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        },
        {
            "id": "ins_coris",
            "name": "CORIS Assurances",
            "type": "insurance",
            "location": {
                "lat": 12.358,
                "lng": -1.51,
                "address": "Zone ZACA",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 49 49 49",
            "email": "contact@coris.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Maternité", "Dentaire", "Optique"],
            "coverageRate": 80,
            "plans": [
                {
                    "name": "CORIS Santé Essentiel",
                    "description": "Couverture de base économique",
                    "monthlyPremium": 8000,
                    "coverage": ["Consultation", "Pharmacie"]
                },
                {
                    "name": "CORIS Santé Premium",
                    "description": "Couverture complète",
                    "monthlyPremium": 30000,
                    "coverage": ["Consultation", "Pharmacie", "Hospitalisation", "Maternité", "Dentaire"]
                }
            ],
            "partnersCount": 180,
            "claimsPhone": "+226 25 49 49 50",
            "emergencyPhone": "+226 70 00 00 04",
            "website": "www.coris.bf",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        },
        {
            "id": "ins_raynal",
            "name": "RAYNAL Assurances",
            "type": "insurance",
            "location": {
                "lat": 12.37,
                "lng": -1.53,
                "address": "Koulouba",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 30 00 00",
            "email": "raynal@raynal.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Maternité"],
            "coverageRate": 75,
            "plans": [
                {
                    "name": "RAYNAL Santé Pro",
                    "description": "Pour professionnels",
                    "monthlyPremium": 18000,
                    "coverage": ["Consultation", "Médicaments", "Hospitalisation"]
                }
            ],
            "partnersCount": 120,
            "claimsPhone": "+226 25 30 00 05",
            "emergencyPhone": "+226 70 00 00 05",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        },
        {
            "id": "ins_allianz",
            "name": "Allianz Burkina Faso",
            "type": "insurance",
            "location": {
                "lat": 12.371,
                "lng": -1.525,
                "address": "Avenue de la Liberté",
                "city": "Ouagadougou"
            },
            "phone": "+226 25 32 32 32",
            "email": "info@allianz.bf",
            "status": "available",
            "coverageTypes": ["Santé", "Vie", "Accidents", "Maternité"],
            "coverageRate": 85,
            "plans": [
                {
                    "name": "Allianz Santé Excellence",
                    "description": "Couverture internationale",
                    "monthlyPremium": 45000,
                    "coverage": ["Consultation", "Pharmacie", "Hospitalisation", "Évacuation sanitaire"]
                }
            ],
            "partnersCount": 250,
            "claimsPhone": "+226 25 32 32 35",
            "emergencyPhone": "+226 70 00 00 06",
            "website": "www.allianz.bf",
            "isVerified": True,
            "source": "Manual Import",
            "gps_validated": True
        }
    ]
    
    print(f"  ✅ {len(insurances)} compagnies d'assurance enrichies.")
    return insurances


def main():
    print("="*60)
    print("🏥 ENRICHISSEMENT ÉCOSYSTÈME SANTÉ - DENTISTES & ASSURANCES")
    print("="*60)
    
    # Créer le dossier de sortie si nécessaire
    output_dir = os.path.join(os.path.dirname(__file__), "..", "ecosystem_data")
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Récupérer les dentistes depuis OSM
    dentists = fetch_osm_data("dentist", timeout=120)
    
    # 2. Enrichir les assurances
    insurances = enrich_insurance_data()
    
    # 3. Sauvegarder les résultats
    dentists_file = os.path.join(output_dir, "dentists.json")
    with open(dentists_file, 'w', encoding='utf-8') as f:
        json.dump(dentists, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Dentistes sauvegardés: {dentists_file}")
    
    insurance_file = os.path.join(output_dir, "insurance_providers.json")
    with open(insurance_file, 'w', encoding='utf-8') as f:
        json.dump(insurances, f, ensure_ascii=False, indent=2)
    print(f"💾 Assurances sauvegardées: {insurance_file}")
    
    print("\n" + "="*60)
    print("✅ ENRICHISSEMENT TERMINÉ !")
    print("="*60)
    print(f"📊 Statistiques:")
    print(f"   - Dentistes: {len(dentists)}")
    print(f"   - Assurances: {len(insurances)}")
    print("\n📝 Prochaine étape: Importer ces données dans Firestore via /admin/setup")


if __name__ == "__main__":
    main()
