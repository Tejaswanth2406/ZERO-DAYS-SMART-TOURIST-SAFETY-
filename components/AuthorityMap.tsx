import React, { useEffect, useRef } from 'react';
import { TouristID, Incident, GpsPosition, GeoFence } from '../types';

declare const L: any;

interface AuthorityMapProps {
    tourists: TouristID[];
    incidents: Incident[];
    positions: Record<string, GpsPosition>;
    dangerZones: GeoFence[];
}

const getZoneStyle = (riskLevel: GeoFence['riskLevel']) => {
    switch (riskLevel) {
        case 'safe': return { color: '#06b6d4', fillColor: '#0891b2', fillOpacity: 0.1, dashArray: '5, 5' };
        case 'restricted': return { color: '#f59e0b', fillColor: 'rgba(217, 119, 6, 0.5)', fillOpacity: 0.2, dashArray: '10, 10' };
        case 'danger': return { color: '#ef4444', fillColor: 'rgba(220, 38, 38, 0.5)', fillOpacity: 0.2, dashArray: '10, 10' };
        default: return { color: '#6b7280', fillColor: '#4b5563', fillOpacity: 0.1 };
    }
};

const AuthorityMap: React.FC<AuthorityMapProps> = ({ tourists, incidents, positions, dangerZones }) => {
    const mapRef = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const zonesRef = useRef<any[]>([]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('authority-map').setView([19.0760, 72.8777], 12);
            // No tile layer is added, allowing the CSS background to show through.
        }

        // Draw/update danger zones
        zonesRef.current.forEach(zone => zone.remove());
        zonesRef.current = [];
        dangerZones.forEach(zoneData => {
            const style = getZoneStyle(zoneData.riskLevel);
            const circle = L.circle([zoneData.zone.center.lat, zoneData.zone.center.lng], {
                ...style,
                radius: zoneData.zone.radius
            }).addTo(mapRef.current);
            
            circle.bindTooltip(zoneData.name, {
                permanent: true,
                direction: 'center',
                className: 'zone-tooltip'
            });
            zonesRef.current.push(circle);
        });

    }, [dangerZones]);

    useEffect(() => {
        const currentMarkers = markersRef.current;

        tourists.forEach(tourist => {
            const position = positions[tourist.id];
            if (!position) return;

            const activeIncident = incidents.find(i => i.touristId === tourist.id && i.status === 'reported');
            
            let iconHtml;
            let iconSize: [number, number] = [12, 12];
            let iconAnchor: [number, number] = [6, 6];
            let className = 'dummy';

            if (activeIncident) {
                iconSize = [32, 32];
                iconAnchor = [16, 32];
                className = 'pin-container';
                if (activeIncident.severity === 'critical' || activeIncident.severity === 'high') {
                    iconHtml = '<div class="teardrop-pin high-severity-pin animate-pulse-strong"></div>';
                } else {
                    iconHtml = '<div class="teardrop-pin medium-severity-pin"></div>';
                }
            } else {
                iconHtml = '<div class="normal-pin"></div>';
            }


            const touristIcon = L.divIcon({
                html: iconHtml,
                className: className,
                iconSize: iconSize,
                iconAnchor: iconAnchor
            });

            if (currentMarkers[tourist.id]) {
                currentMarkers[tourist.id].setLatLng([position.lat, position.lng]);
                currentMarkers[tourist.id].setIcon(touristIcon);
            } else {
                currentMarkers[tourist.id] = L.marker([position.lat, position.lng], { icon: touristIcon })
                    .addTo(mapRef.current)
                    .bindPopup(`<b>${tourist.name}</b><br>ID: ${tourist.id.substring(0,8)}...`);
            }
        });
        
        // Optional: Remove markers for tourists who are no longer in the list
        Object.keys(currentMarkers).forEach(touristId => {
            if (!tourists.some(t => t.id === touristId)) {
                currentMarkers[touristId].remove();
                delete currentMarkers[touristId];
            }
        });

    }, [tourists, positions, incidents]);

    return <div id="authority-map" className="leaflet-container grid-map-background"></div>;
};

export default AuthorityMap;