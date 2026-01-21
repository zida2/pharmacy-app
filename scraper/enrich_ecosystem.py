import json
import requests
import time
import os
import math

# Configuration
# Configuration
INPUT_FILE = os.path.join(os.path.dirname(__file__), "pharmacies_for_webapp_import.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "ecosystem_data")
OSM_API_URL = "https://overpass-api.de/api/interpreter"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calcule la distance en km entre deux points"""
    if lat1 == 0 or lat2 == 0: return 9999
    
    R = 6371  # Rayon de la terre en km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def fetch_osm_data(amenity_type, timeout=120):
    """Récupère les données OSM pour un type donné (pharmacy, clinic, dentist, hospital)"""
    print(f"🌍 Récupération des '{amenity_type}' depuis OSM...")
    query = f"""
    [out:json][timeout:{timeout}];
    area["ISO3166-1"="BF"][admin_level=2]->.searchArea;
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
                    # Pour les 'ways', on prend le centre (bounding box approx)
                    # Note: overpass 'out center' serait mieux, mais on fait simple
                    # Ici on ignore les ways sans center explicit pour simplifier, 
                    # ou on utilise 'center' si disponible dans la réponse overpass modifiée
                    # Pour l'instant on se concentre sur les nodes
                    continue
                else:
                    continue

                tags = element.get("tags", {})
                name = tags.get("name", "Sans nom")
                
                item = {
                    "id": f"osm_{amenity_type}_{element['id']}",
                    "type": amenity_type if amenity_type != "hospital" else "clinic", # Map hospital -> clinic for simplicity
                    "name": name,
                    "location": {
                        "lat": lat,
                        "lng": lon,
                        "address": tags.get("addr:street", tags.get("addr:suburb", "")),
                        "city": tags.get("addr:city", "Burkina Faso")
                    },
                    "phone": tags.get("phone", tags.get("contact:phone", "NC")),
                    "source": "OpenStreetMap",
                    "gps_validated": False, # OSM data is usually good but let's flag it
                    "gps_source": "osm"
                }
                items.append(item)
            
            print(f"  ✅ {len(items)} éléments trouvés.")
            return items
        else:
            print(f"  ❌ Erreur OSM: {response.status_code}")
            return []
    except Exception as e:
        print(f"  ❌ Exception OSM: {e}")
        return []

def enrich_pharmacies():
    """Charge les pharmacies existantes, les enrichit via Nominatim si nécessaire, et fusionne avec OSM"""
    
    # 1. Charger existantes
    existing_pharmacies = []
    if os.path.exists(INPUT_FILE):
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            existing_pharmacies = json.load(f)
    print(f"📦 {len(existing_pharmacies)} pharmacies existantes chargées.")

    # 2. OSM Pharmacies
    osm_pharmacies = fetch_osm_data("pharmacy")
    
    # 3. Fusionner (éviter doublons par nom et distance)
    # On garde la liste 'existing' comme base, on ajoute OSM si pas de match
    
    final_pharmacies = []
    
    # Convertir existing au nouveau format unifié si besoin, ou garder tel quel
    # Le format actuel est un peu mixte (nom_pharmacie vs name)
    # On va standardiser vers le format HealthProvider
    
    for p in existing_pharmacies:
        # Map fields
        lat = p.get('latitude', 0)
        lng = p.get('longitude', 0)
        name = p.get('nom_pharmacie', p.get('name', 'Inconnue'))
        
        # Enrichissement basique (placeholder logic pour Nominatim pour speed run)
        # Dans une vraie run, on ferait l'appel HTTP Nominatim ici.
        # Pour ce "speed run", on va marquer ceux sans GPS pour scan futur ou utiliser une fake coord si ville connue?
        # Non, on garde (0,0) mais on flag
        
        geo_ok = (lat != 0 and lng != 0)
        
        std_p = {
            "id": p.get('id', f"legacy_{int(time.time())}_{name[:3]}"),
            "type": "pharmacy",
            "name": name,
            "location": {
                "lat": float(lat),
                "lng": float(lng),
                "address": p.get('adresse_complete', p.get('quartier', '')),
                "city": p.get('ville', '')
            },
            "phone": p.get('telephone', 'NC'),
            "status": "guard" if p.get('type_service') == 'GARDE' else "open",
            "gps_validated": geo_ok,
            "source": "ONPBF_Scraper"
        }
        final_pharmacies.append(std_p)

    print("🔄 Fusion avec OSM...")
    added_count = 0
    for osm_p in osm_pharmacies:
        is_dup = False
        for ex_p in final_pharmacies:
            dist = calculate_distance(
                osm_p['location']['lat'], osm_p['location']['lng'],
                ex_p['location']['lat'], ex_p['location']['lng']
            )
            # Si distance < 100m ou nom très proche -> doublon
            if dist < 0.1: 
                is_dup = True
                break
            
            # Nom match normalisé
            n1 = osm_p['name'].lower().replace('pharmacie', '').strip()
            n2 = ex_p['name'].lower().replace('pharmacie', '').strip()
            if n1 == n2 and n1 != "": # Nom identique (danger si villes différentes, mais OSM a coords)
                 # Si l'existant n'a pas de coords, on prend celles d'OSM !
                if ex_p['location']['lat'] == 0:
                    ex_p['location'] = osm_p['location']
                    ex_p['gps_validated'] = False
                    ex_p['source'] = "ONPBF+OSM"
                    print(f"  ✨ Coordonnées OSM appliquées à {ex_p['name']}")
                is_dup = True
                break
        
        if not is_dup:
            final_pharmacies.append(osm_p)
            added_count += 1
            
    print(f"✅ Ajouté {added_count} nouvelles pharmacies depuis OSM.")
    print(f"📦 Total Pharmacies: {len(final_pharmacies)}")
    
    with open(f"{OUTPUT_DIR}/pharmacies.json", 'w', encoding='utf-8') as f:
        json.dump(final_pharmacies, f, ensure_ascii=False, indent=2)

def generate_mock_insurances():
    """Génère une liste statique d'assurances majeures au BF"""
    insurances = [
        {"id": "ins_sonar", "name": "SONAR Assurances", "type": "insurance", "coverageRate": 80, "location": {"lat": 12.368, "lng": -1.527, "address": "Av. Kwame N'Krumah", "city": "Ouagadougou"}, "phone": "25 33 33 33"},
        {"id": "ins_uab", "name": "UAB Assurances", "type": "insurance", "coverageRate": 80, "location": {"lat": 12.366, "lng": -1.521, "address": "Av. de la Nation", "city": "Ouagadougou"}, "phone": "25 30 30 30"},
        {"id": "ins_sunu", "name": "SUNU Assurances", "type": "insurance", "coverageRate": 70, "location": {"lat": 12.365, "lng": -1.522, "address": "Rue du Commerce", "city": "Ouagadougou"}, "phone": "25 31 31 31"},
        {"id": "ins_coris", "name": "CORIS Assurances", "type": "insurance", "coverageRate": 80, "location": {"lat": 12.358, "lng": -1.510, "address": "Zone ZACA", "city": "Ouagadougou"}, "phone": "25 49 49 49"},
        {"id": "ins_raynal", "name": "RAYNAL Assurances", "type": "insurance", "coverageRate": 75, "location": {"lat": 12.370, "lng": -1.530, "address": "Koulouba", "city": "Ouagadougou"}, "phone": "25 30 00 00"}
    ]
    with open(f"{OUTPUT_DIR}/insurance_providers.json", 'w', encoding='utf-8') as f:
        json.dump(insurances, f, ensure_ascii=False, indent=2)
    print(f"📦 {len(insurances)} assurances générées.")

def main():
    print("🚀 Démarrage de l'enrichissement de l'écosystème santé...")
    
    # 1. Pharmacies (Merge ONPBF + OSM)
    enrich_pharmacies()
    
    # 2. Cliniques & Hôpitaux
    clinics = fetch_osm_data("clinic")
    hospitals = fetch_osm_data("hospital")
    all_clinics = clinics + hospitals
    # Clean/Dedupe could go here
    with open(f"{OUTPUT_DIR}/clinics.json", 'w', encoding='utf-8') as f:
        json.dump(all_clinics, f, ensure_ascii=False, indent=2)
    
    # 3. Dentistes
    dentists = fetch_osm_data("dentist")
    with open(f"{OUTPUT_DIR}/dentists.json", 'w', encoding='utf-8') as f:
        json.dump(dentists, f, ensure_ascii=False, indent=2)
        
    # 4. Assurances (Mock Data pour l'instant)
    generate_mock_insurances()
    
    print("\n✅ Enrichissement terminé ! Les fichiers JSON sont dans 'scraper/ecosystem_data/'")

if __name__ == "__main__":
    main()
