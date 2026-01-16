import requests
import json
import time

def get_neighborhood_coords():
    neighborhoods = [
        "Pissy", "Dapoya", "Koulouba", "Gounghin", "Patte d'Oie", "1200 Logements", "Dassasgho", 
        "Bogodogo", "Tampouy", "Somgandé", "Wayalghin", "Zone 1", "Karpala", "Ouaga 2000", 
        "Balkuy", "Cissin", "Bonheur-Ville", "Larlé", "Paspanga", "Kouritenga", "Zogona"
    ]
    
    results = {}
    headers = {'User-Agent': 'PharmaApp-Scraper/1.0'}
    
    for nh in neighborhoods:
        try:
            url = f"https://nominatim.openstreetmap.org/search?q={nh}, Ouagadougou, Burkina Faso&format=json&limit=1"
            r = requests.get(url, headers=headers, timeout=10)
            data = r.json()
            if data:
                results[nh.lower()] = {
                    'lat': float(data[0]['lat']),
                    'lon': float(data[0]['lon'])
                }
                print(f"Found {nh}: {results[nh.lower()]}")
            time.sleep(1.2) # Rate limit
        except:
            print(f"Failed {nh}")
            
    return results

def apply_fallbacks():
    print("Fetching neighborhood coordinates...")
    nh_coords = get_neighborhood_coords()
    
    with open('pharmacies_burkina_updated.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated = 0
    for p in data:
        if p['latitude'] != 0: continue
        
        # Check if address contains a neighborhood name
        addr_lower = p['adresse'].lower()
        for nh, coords in nh_coords.items():
            if nh in addr_lower:
                p['latitude'] = coords['lat']
                p['longitude'] = coords['lon']
                updated += 1
                print(f"Fallback for {p['nom_pharmacie']}: Neighborhood {nh}")
                break
                
    print(f"Updated {updated} pharmacies with neighborhood fallbacks.")
    
    with open('pharmacies_burkina_final.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    apply_fallbacks()
