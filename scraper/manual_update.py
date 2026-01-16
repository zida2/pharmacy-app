import json

def update_with_manual_coords():
    # Coords from browser subagent
    manual_coords = [
      {"nom_pharmacie": "Archanges", "lat": 12.3316752, "lon": -1.5846717},
      {"nom_pharmacie": "Bang-Pooré", "lat": 12.4227162, "lon": -1.5400065},
      {"nom_pharmacie": "Baowendsom", "lat": 12.4034896, "lon": -1.5774674},
      {"nom_pharmacie": "Beatitudes", "lat": 12.307367, "lon": -1.528376},
      {"nom_pharmacie": "Barkwende", "lat": 12.3740155, "lon": -1.6084379},
      {"nom_pharmacie": "Avenir", "lat": 12.3752224, "lon": -1.4939591},
      {"nom_pharmacie": "Benaia", "lat": 12.3499844, "lon": -1.4792868},
      {"nom_pharmacie": "Bonheur", "lat": 12.3139852, "lon": -1.5551909},
      {"nom_pharmacie": "Camille", "lat": 12.3757877, "lon": -1.4788303},
      {"nom_pharmacie": "Centre", "lat": 12.3701112, "lon": -1.5243046}
    ]
    
    with open('pharmacies_burkina_updated.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated = 0
    for mc in manual_coords:
        for p in data:
            if mc['nom_pharmacie'].lower() in p['nom_pharmacie'].lower():
                if p['latitude'] == 0:
                    p['latitude'] = mc['lat']
                    p['longitude'] = mc['lon']
                    updated += 1
                    break
                    
    print(f"Updated {updated} pharmacies manually.")
    
    with open('pharmacies_burkina_updated.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    update_with_manual_coords()
