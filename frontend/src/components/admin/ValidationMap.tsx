"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

interface ValidationMapProps {
    initialLat: number;
    initialLng: number;
    onLocationSelect: (lat: number, lng: number) => void;
    className?: string;
}

export default function ValidationMap({
    initialLat,
    initialLng,
    onLocationSelect,
    className
}: ValidationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize Map
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            center: [initialLng, initialLat],
            zoom: 16,
            pitch: 0,
        });

        // Add Controls
        map.current.addControl(new maplibregl.NavigationControl(), "top-right");

        map.current.on('load', () => {
            setIsLoaded(true);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Handle Marker Update
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        // Create draggable marker if not exists
        if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({
                draggable: true,
                color: "#ff0000"
            })
                .setLngLat([initialLng, initialLat])
                .addTo(map.current);

            markerRef.current.on('dragend', () => {
                const lngLat = markerRef.current?.getLngLat();
                if (lngLat) {
                    onLocationSelect(lngLat.lat, lngLat.lng);
                }
            });
        } else {
            // Update position if props change and not dragging (simplified)
            markerRef.current.setLngLat([initialLng, initialLat]);
            map.current.flyTo({ center: [initialLng, initialLat] });
        }

    }, [initialLat, initialLng, isLoaded, onLocationSelect]);

    return (
        <div className={cn("rounded-xl overflow-hidden border border-border shadow-sm", className)}>
            <div ref={mapContainer} className="w-full h-full" />
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    Loading Map...
                </div>
            )}
        </div>
    );
}
