/**
 * Utility functions for geolocation and distance calculations
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates
): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1 = toRadians(coord1.latitude);
    const lat2 = toRadians(coord2.latitude);
    const deltaLat = toRadians(coord2.latitude - coord1.latitude);
    const deltaLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Get user's current location
 * Returns promise with coordinates or default to Ouagadougou center
 */
export async function getUserLocation(): Promise<Coordinates> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            // Default to Ouagadougou center if geolocation not available
            resolve({ latitude: 12.3714, longitude: -1.5197 });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                // Log the specific error for debugging
                console.warn("Geolocation error:", error.code, error.message);
                // On error, default to Ouagadougou center
                resolve({ latitude: 12.3714, longitude: -1.5197 });
            },
            {
                enableHighAccuracy: true, // Request GPS-level accuracy
                timeout: 15000, // 15 seconds to get location
                maximumAge: 60000, // Cache for only 1 minute (fresher location)
            }
        );
    });
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
}

/**
 * Sort pharmacies by distance from user location
 */
export function sortByDistance<T extends { location: { coordinates: Coordinates } }>(
    items: T[],
    userLocation: Coordinates
): T[] {
    return items.sort((a, b) => {
        const distA = calculateDistance(userLocation, a.location.coordinates);
        const distB = calculateDistance(userLocation, b.location.coordinates);
        return distA - distB;
    });
}
