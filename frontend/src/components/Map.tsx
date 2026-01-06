"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

import { Pharmacy } from "@/services/types";

interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
    initialCenter?: [number, number]; // [lng, lat]
    initialZoom?: number;
    initialPitch?: number;
    initialBearing?: number;
    pharmacies?: Pharmacy[];
    userLocation?: [number, number] | null;
    searchLocation?: [number, number] | null;
    destination?: [number, number] | null;
    transportMode?: "walking" | "motorcycle" | "car";
}

export default function Map({
    initialCenter = [-1.5197, 12.3714], // Default: Ouagadougou
    initialZoom = 12,
    initialPitch = 0,
    initialBearing = 0,
    pharmacies = [],
    userLocation,
    searchLocation,
    destination,
    transportMode = "motorcycle",
    className,
    ...props
}: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const userMarkerRef = useRef<maplibregl.Marker | null>(null);
    const searchMarkerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (map.current && isLoaded) {
            const center = initialCenter;
            if (typeof center[0] === 'number' && typeof center[1] === 'number') {
                map.current.flyTo({
                    center: center,
                    zoom: initialZoom,
                    pitch: initialPitch,
                    bearing: initialBearing,
                    essential: true
                });
            }
        }
    }, [initialCenter, initialZoom, isLoaded]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            // OpenFreeMap Liberty style is much more detailed for West Africa
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: initialCenter,
            zoom: initialZoom,
            pitch: initialPitch,
            bearing: initialBearing,
        });

        // Add 3D buildings layer whenever possible
        map.current.on('style.load', () => {
            // Basic 3D building extrusion if data allows
            // Note: Current style might not have 'building' layer, but this is the standard way just in case
        });

        map.current.addControl(new maplibregl.NavigationControl(), "top-right");
        map.current.addControl(new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
        }), "top-right");

        map.current.on("load", () => {
            setIsLoaded(true);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        }
    }, []); // Only init once

    // Update User Marker & Center if needed
    useEffect(() => {
        if (!map.current || !isLoaded || !userLocation) return;

        // Safety check for nulls in coordinates
        if (typeof userLocation[0] !== 'number' || typeof userLocation[1] !== 'number' ||
            isNaN(userLocation[0]) || isNaN(userLocation[1])) return;

        // Fly to user location on first acquisition or button click
        map.current.flyTo({
            center: userLocation,
            zoom: 15,
            padding: { top: 100, bottom: 200, left: 0, right: 0 },
            essential: true
        });

        // Create user marker element if not exists
        let el = userMarkerRef.current?.getElement();
        if (!el) {
            el = document.createElement('div');
            el.className = 'user-marker';
            el.innerHTML = `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
                    <div class="absolute w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm shadow-primary/50"></div>
                    </div>
                </div>
            `;
            const validLng = isFinite(userLocation[0]) ? userLocation[0] : -1.5197;
            const validLat = isFinite(userLocation[1]) ? userLocation[1] : 12.3714;
            userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([validLng, validLat])
                .addTo(map.current);
        } else {
            const validLng = isFinite(userLocation[0]) ? userLocation[0] : (userMarkerRef.current?.getLngLat().lng || -1.5197);
            const validLat = isFinite(userLocation[1]) ? userLocation[1] : (userMarkerRef.current?.getLngLat().lat || 12.3714);
            userMarkerRef.current?.setLngLat([validLng, validLat]);
        }
    }, [userLocation, isLoaded]);

    // Update Search Marker
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        if (searchLocation) {
            let el = searchMarkerRef.current?.getElement();
            if (!el) {
                el = document.createElement('div');
                el.className = 'search-marker';
                el.innerHTML = `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute w-8 h-8 bg-red-500/30 rounded-full animate-ping"></div>
                        <div class="relative w-6 h-6 bg-red-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white font-bold text-[8px]">
                            🔍
                        </div>
                   </div>
                `;
                searchMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat(searchLocation)
                    .addTo(map.current);
            } else {
                searchMarkerRef.current?.setLngLat(searchLocation);
            }
        } else {
            searchMarkerRef.current?.remove();
            searchMarkerRef.current = null;
        }
    }, [searchLocation, isLoaded]);

    // Update Route
    useEffect(() => {
        if (!map.current || !isLoaded || !userLocation || !destination) {
            if (map.current?.getLayer('route')) map.current.removeLayer('route');
            if (map.current?.getSource('route')) map.current.removeSource('route');
            return;
        }

        const fetchRoute = async () => {
            try {
                if (!userLocation || !destination || !userLocation[0] || !userLocation[1] || !destination[0] || !destination[1]) return;
                const profile = transportMode === 'walking' ? 'foot' : 'driving';
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/${profile}/${userLocation[0]},${userLocation[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes[0]) {
                    const route = data.routes[0].geometry;

                    if (map.current?.getSource('route')) {
                        (map.current.getSource('route') as maplibregl.GeoJSONSource).setData({
                            type: 'Feature',
                            properties: {},
                            geometry: route
                        });
                    } else {
                        map.current?.addSource('route', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: route
                            }
                        });

                        map.current?.addLayer({
                            id: 'route',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#6366f1',
                                'line-width': 5,
                                'line-opacity': 0.75
                            }
                        });
                    }

                    // Fit map to show both points
                    const coordinates = route.coordinates;
                    const bounds = coordinates.reduce((acc: maplibregl.LngLatBounds, coord: [number, number]) => {
                        return acc.extend(coord);
                    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

                    map.current?.fitBounds(bounds, {
                        padding: { top: 180, bottom: 280, left: 50, right: 50 },
                        duration: 1000
                    });
                }
            } catch (error) {
                console.error("Routing error:", error);
            }
        };

        fetchRoute();
    }, [userLocation, destination, isLoaded, transportMode]);

    // Update Pharmacy Markers
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        // Clear existing pharmacy markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pharmacies.forEach(pharmacy => {
            if (!pharmacy.location || typeof pharmacy.location.lat !== 'number' || typeof pharmacy.location.lng !== 'number') return;
            const color = pharmacy.status === "guard" ? "#818cf8" : pharmacy.status === "open" ? "#10b981" : "#6b7280";

            // Custom HTML Marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `
                <div class="relative flex items-center justify-center group cursor-pointer">
                    <!-- Ripple effect for open/guard -->
                    ${(pharmacy.status === 'open' || pharmacy.status === 'guard') ? `
                        <div class="absolute w-10 h-10 bg-${pharmacy.status === 'guard' ? 'primary' : 'emerald-500'}/20 rounded-full animate-ping"></div>
                    ` : ''}
                    
                    <!-- Main Marker Pin (Modern & Smaller) -->
                    <div class="relative w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-${pharmacy.status === 'guard' ? 'primary' : pharmacy.status === 'open' ? 'emerald-500' : 'gray-400'} transform transition-all group-hover:scale-125 group-hover:-translate-y-2">
                        <span class="text-sm">${pharmacy.status === 'guard' ? '🟣' : pharmacy.status === 'open' ? '🟢' : '⚪'}</span>
                    </div>

                    <!-- Pharmacy Name Label (NOW HIDDEN BY DEFAULT - ONLY ON HOVER) -->
                    <div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl border border-white/10 translate-y-2 group-hover:translate-y-0">
                        ${pharmacy.name}
                    </div>
                    
                    <!-- Triangle Tip for label -->
                    <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none"></div>
                </div>
            `;

            // Create Popup
            const popup = new maplibregl.Popup({ offset: 35, closeButton: false, className: 'premium-popup' })
                .setHTML(`
                    <div class="p-0 border-none rounded-3xl overflow-hidden shadow-2xl min-w-[220px] bg-white dark:bg-zinc-950">
                        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 border-b border-indigo-100 dark:border-indigo-800/30">
                            <h3 style="color: var(--foreground); font-weight: 900; font-style: italic;">${pharmacy.name}</h3>
                            <div style="font-size: 10px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                                ${pharmacy.status === 'guard' ? 'Pharmacie de Garde' : 'Pharmacie Conventionnée'}
                            </div>
                        </div>
                        <div class="p-4">
                            <div style="color: var(--muted-foreground); font-size: 12px; margin-bottom: 12px;">
                                📍 ${pharmacy.location.address || "Ouagadougou"}
                            </div>
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-1.5">
                                    <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: ${pharmacy.status === 'open' ? '#10b981' : pharmacy.status === 'guard' ? '#6366f1' : '#94a3b8'};"></span>
                                    <span style="font-size: 10px; font-weight: 900; text-transform: uppercase;">${pharmacy.status === 'open' ? 'Ouvert' : pharmacy.status === 'guard' ? 'De Garde' : 'Fermé'}</span>
                                </div>
                                ${pharmacy.distance ? `<span style="font-size: 12px; font-weight: 900; color: #6366f1;">${pharmacy.distance.toFixed(1)} km</span>` : ''}
                            </div>
                            <button onclick="window.location.href='/pharmacy?id=${pharmacy.id}'" style="width: 100%; padding: 10px; background-color: #6366f1; color: white; font-size: 10px; font-weight: 900; text-transform: uppercase; border-radius: 12px; border: none; cursor: pointer;">
                                Ouvrir la fiche
                            </button>
                        </div>
                    </div>
                `);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([pharmacy.location.lng, pharmacy.location.lat])
                .setPopup(popup)
                .addTo(map.current!);

            // Add event listener to select on map page if needed
            el.addEventListener('click', () => {
                // This will trigger the popup by default, but we can also trigger page selection
                const event = new CustomEvent('pharmacySelected', { detail: pharmacy });
                window.dispatchEvent(event);
            });

            markersRef.current.push(marker);
        });

    }, [pharmacies, isLoaded]);

    return (
        <div
            className={cn("relative w-full h-full overflow-hidden rounded-xl border border-border shadow-sm", className)}
            {...props}
        >
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 backdrop-blur-sm z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}
