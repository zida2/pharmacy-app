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
    destination?: [number, number] | null;
}

export default function Map({
    initialCenter = [-1.5197, 12.3714], // Default: Ouagadougou
    initialZoom = 12,
    initialPitch = 0,
    initialBearing = 0,
    pharmacies = [],
    userLocation,
    destination,
    className,
    ...props
}: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const userMarkerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (map.current && isLoaded) {
            map.current.flyTo({
                center: initialCenter,
                zoom: initialZoom,
                pitch: initialPitch,
                bearing: initialBearing,
                essential: true
            });
        }
    }, [initialCenter, initialZoom, isLoaded]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
            center: initialCenter,
            zoom: initialZoom,
            pitch: initialPitch,
            bearing: initialBearing,
            attributionControl: false,
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

    // Update User Marker
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        if (userLocation) {
            // Create user marker element if not exists
            let el = userMarkerRef.current?.getElement();
            if (!el) {
                el = document.createElement('div');
                el.className = 'user-marker';
                el.innerHTML = `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                        <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
                    </div>
                `;
                userMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat(userLocation)
                    .addTo(map.current);
            } else {
                userMarkerRef.current?.setLngLat(userLocation);
            }
        } else {
            userMarkerRef.current?.remove();
            userMarkerRef.current = null;
        }
    }, [userLocation, isLoaded]);

    // Update Route
    useEffect(() => {
        if (!map.current || !isLoaded || !userLocation || !destination) {
            if (map.current?.getLayer('route')) map.current.removeLayer('route');
            if (map.current?.getSource('route')) map.current.removeSource('route');
            return;
        }

        const fetchRoute = async () => {
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`
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
    }, [userLocation, destination, isLoaded]);

    // Update Pharmacy Markers
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        // Clear existing pharmacy markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pharmacies.forEach(pharmacy => {
            const color = pharmacy.status === "guard" ? "#818cf8" : pharmacy.status === "open" ? "#10b981" : "#6b7280";

            // Custom HTML Marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `
                <div class="relative flex items-center justify-center group cursor-pointer">
                    <!-- Ripple effect for open/guard -->
                    ${(pharmacy.status === 'open' || pharmacy.status === 'guard') ? `
                        <div class="absolute w-12 h-12 bg-${pharmacy.status === 'guard' ? 'primary' : 'emerald-500'}/20 rounded-full animate-ping"></div>
                    ` : ''}
                    
                    <!-- Main Marker Pin -->
                    <div class="relative w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-${pharmacy.status === 'guard' ? 'primary' : pharmacy.status === 'open' ? 'emerald-500' : 'gray-400'} transform transition-all group-hover:scale-125 group-hover:-translate-y-1">
                        <span class="text-lg">${pharmacy.status === 'guard' ? '🟣' : pharmacy.status === 'open' ? '🟢' : '⚪'}</span>
                        
                        <!-- Mini status indicator -->
                        <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-${pharmacy.status === 'guard' ? 'primary' : pharmacy.status === 'open' ? 'emerald-500' : 'gray-400'}"></div>
                    </div>
                    
                    <!-- Bottom Tip -->
                    <div class="absolute -bottom-1 w-2 h-2 bg-white rotate-45 transform border-r border-b border-gray-200"></div>

                    <!-- Pharmacy Name Label -->
                    <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-border/50 shadow-xl pointer-events-none">
                        <span class="text-[9px] font-black text-foreground whitespace-nowrap uppercase tracking-tighter">${pharmacy.name}</span>
                    </div>
                </div>
            `;

            // Create Popup
            const popup = new maplibregl.Popup({ offset: 35, closeButton: false, className: 'premium-popup' })
                .setHTML(`
                    <div class="p-0 border-none rounded-3xl overflow-hidden glass-card shadow-2xl min-w-[220px]">
                        <div class="bg-primary/10 p-4 border-b border-primary/5">
                            <h3 class="font-black text-foreground italic leading-tight">${pharmacy.name}</h3>
                            <div class="text-[10px] font-black text-primary uppercase tracking-widest mt-1">${pharmacy.status === 'guard' ? 'Pharmacied de Garde' : 'Pharmacie Conventionnée'}</div>
                        </div>
                        <div class="p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md">
                            <div class="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-3">
                                📍 ${pharmacy.location.address || "Ouagadougou"}
                            </div>
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-${pharmacy.status === 'open' ? 'emerald-500' : pharmacy.status === 'guard' ? 'primary' : 'gray-400'} shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></span>
                                    <span class="text-[10px] font-black uppercase tracking-tighter">${pharmacy.status === 'open' ? 'Ouvert' : pharmacy.status === 'guard' ? 'De Garde' : 'Fermé'}</span>
                                </div>
                                ${pharmacy.distance ? `<span class="text-xs font-black text-primary">${pharmacy.distance.toFixed(1)} km</span>` : ''}
                            </div>
                            <button onclick="window.location.href='/pharmacy?id=${pharmacy.id}'" class="w-full py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition active:scale-95">
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
