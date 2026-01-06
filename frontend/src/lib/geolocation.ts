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
    coord1: Coordinates | null | undefined,
    coord2: Coordinates | null | undefined
): number {
    if (!coord1 || !coord2 || typeof coord1.latitude !== 'number' || typeof coord2.latitude !== 'number') {
        return 999;
    }

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
            resolve({ latitude: 12.3714, longitude: -1.5197 });
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000, // Reduced to 10s for first try
            maximumAge: 300000,
        };

        const success = (position: GeolocationPosition) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        };

        const error = (err: GeolocationPositionError) => {
            console.warn("High accuracy geolocation failed, trying low accuracy...", err.code);
            // Fallback to low accuracy if high accuracy fails or times out
            navigator.geolocation.getCurrentPosition(
                (pos) => success(pos),
                (err2) => {
                    console.warn("Low accuracy geolocation also failed:", err2.code);
                    resolve({ latitude: 12.3714, longitude: -1.5197 });
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
            );
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
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
