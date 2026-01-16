import json

def apply_hardcoded_fallbacks():
    nh_coords = {
        "pissy": [12.3361, -1.5833],
        "koulouba": [12.3683, -1.5208],
        "dassasgho": [12.3853, -1.4886],
        "patte d'oie": [12.3275, -1.5147],
        "1200 logements": [12.3675, -1.4939],
        "gounghin": [12.3567, -1.5561],
        "tampouy": [12.3967, -1.5583],
        "cissin": [12.3367, -1.5556],
        "zone 1": [12.3617, -1.4789],
        "karpala": [12.3217, -1.4689],
        "bogodogo": [12.3483, -1.5033],
        "somgandé": [12.4117, -1.5089],
        "somgande": [12.4117, -1.5089],
        "wayalghin": [12.3883, -1.4689],
        "larlé": [12.3783, -1.5433],
        "larle": [12.3783, -1.5433],
        "paspanga": [12.3833, -1.5233],
        "ouaga 2000": [12.3017, -1.5133],
        "balkuy": [12.2883, -1.4989],
        "dapoya": [12.3783, -1.5208],
        "zogona": [12.3717, -1.4989]
    }
    
    with open('pharmacies_burkina_updated.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated = 0
    for p in data:
        if p['latitude'] != 0: continue
        
        addr_lower = p['adresse'].lower()
        for nh, coords in nh_coords.items():
            if nh in addr_lower:
                p['latitude'] = coords[0]
                p['longitude'] = coords[1]
                updated += 1
                print(f"Hardcoded fallback for {p['nom_pharmacie']}: Neighborhood {nh}")
                break
                
        # If still missing, put at Ouaga center fallback
        if p['latitude'] == 0:
            p['latitude'] = 12.3656
            p['longitude'] = -1.5339
            updated += 1
            print(f"Generic city center for {p['nom_pharmacie']}")
                
    print(f"Final update: {updated} pharmacies geocoded.")
    
    with open('pharmacies_burkina_final.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    apply_hardcoded_fallbacks()
