import requests
import json
import difflib

def get_osm_pharmacies():
    url = 'https://overpass-api.de/api/interpreter'
    query = """
    [out:json];
    area["name"="Burkina Faso"]->.searchArea;
    (
      node["amenity"="pharmacy"](area.searchArea);
      way["amenity"="pharmacy"](area.searchArea);
      rel["amenity"="pharmacy"](area.searchArea);
    );
    out center;
    """
    response = requests.post(url, data={'data': query})
    if response.status_code == 200:
        return response.json().get('elements', [])
    return []

def match_and_merge():
    print("Fetching OSM data...")
    osm_elements = get_osm_pharmacies()
    print(f"Found {len(osm_elements)} pharmacies in OSM.")
    
    osm_list = []
    for el in osm_elements:
        name = el.get('tags', {}).get('name', '')
        if not name: continue
        lat = el.get('lat') or el.get('center', {}).get('lat')
        lon = el.get('lon') or el.get('center', {}).get('lon')
        if lat and lon:
            osm_list.append({'name': name, 'lat': lat, 'lon': lon})
            
    print("Loading scraped data...")
    with open('pharmacies_burkina.json', 'r', encoding='utf-8') as f:
        scraped_data = json.load(f)
        
    updated_count = 0
    for p in scraped_data:
        if p['latitude'] != 0: continue
        
        # Try to find a match in OSM
        best_match = None
        highest_ratio = 0
        
        scraped_name = p['nom_pharmacie'].lower().replace('pharmacie', '').strip()
        
        for osm_p in osm_list:
            osm_name = osm_p['name'].lower().replace('pharmacie', '').strip()
            ratio = difflib.SequenceMatcher(None, scraped_name, osm_name).ratio()
            
            if ratio > highest_ratio:
                highest_ratio = ratio
                best_match = osm_p
        
        if highest_ratio > 0.8: # Confidence threshold
            p['latitude'] = best_match['lat']
            p['longitude'] = best_match['lon']
            updated_count += 1
            print(f"Matched: {p['nom_pharmacie']} -> {best_match['name']} ({highest_ratio:.2f})")
            
    print(f"Updated {updated_count} pharmacies with OSM data.")
    
    with open('pharmacies_burkina_updated.json', 'w', encoding='utf-8') as f:
        json.dump(scraped_data, f, indent=2, ensure_ascii=False)
    print("Saved results to pharmacies_burkina_updated.json")

if __name__ == "__main__":
    match_and_merge()
