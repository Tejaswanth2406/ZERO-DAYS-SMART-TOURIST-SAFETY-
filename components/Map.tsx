import React, { useEffect, useRef } from 'react';
import { GpsPosition, GeoFence } from '../types';

declare const L: any; // Use Leaflet from global scope

interface MapDisplayProps {
    position: GpsPosition | null;
    safeZone: GeoFence;
    dangerZones: GeoFence[];
    isOnline: boolean;
}

const getZoneStyle = (riskLevel: GeoFence['riskLevel']) => {
    switch (riskLevel) {
        case 'safe': return { color: '#06b6d4', fillColor: '#0891b2', fillOpacity: 0.2 };
        case 'restricted': return { color: '#f59e0b', fillColor: '#d97706', fillOpacity: 0.3 };
        case 'danger': return { color: '#ef4444', fillColor: '#dc2626', fillOpacity: 0.4 };
        default: return { color: '#6b7280', fillColor: '#4b5563', fillOpacity: 0.1 };
    }
};

const MapDisplay: React.FC<MapDisplayProps> = ({ position, safeZone, dangerZones, isOnline }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const zonesRef = useRef<any[]>([]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([safeZone.zone.center.lat, safeZone.zone.center.lng], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapRef.current);
        }

        // Clear existing zones
        zonesRef.current.forEach(zone => zone.remove());
        zonesRef.current = [];

        // Draw all zones
        const allZones = [safeZone, ...dangerZones];
        allZones.forEach(zoneData => {
            const style = getZoneStyle(zoneData.riskLevel);
            const circle = L.circle([zoneData.zone.center.lat, zoneData.zone.center.lng], {
                ...style,
                radius: zoneData.zone.radius
            }).addTo(mapRef.current);
            zonesRef.current.push(circle);
        });

    }, [safeZone, dangerZones]);

    useEffect(() => {
        if (mapRef.current && position) {
            const latLng = [position.lat, position.lng];
            if (!markerRef.current) {
                const touristIcon = L.divIcon({
                    html: '<div class="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-xl animate-pulse"></div>',
                    className: 'dummy',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });
                markerRef.current = L.marker(latLng, { icon: touristIcon }).addTo(mapRef.current);
            } else {
                markerRef.current.setLatLng(latLng);
            }
            mapRef.current.panTo(latLng);
        }
    }, [position]);

    return (
        <div className="relative h-full w-full">
            <div id="map" className="leaflet-container"></div>
            {!isOnline && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/80 text-black text-xs font-bold px-3 py-1 rounded-full z-[1000]">
                    OFFLINE MODE - Using Cached Map
                </div>
            )}
        </div>
    );
};

export default MapDisplay;
