import { useState, useEffect, useRef } from 'react';
import { GpsPosition, Vitals, GeoFence, IncidentType, Incident, AnomalyStates } from '../types';

interface AnomalyDetectorProps {
    position: GpsPosition | null;
    vitals: Vitals | null;
    dangerZones: GeoFence[];
    addIncident: (type: IncidentType, location: GpsPosition, severity: Incident['severity']) => void;
    updateSafetyScore: (hit: number) => void;
}

const getDistance = (pos1: GpsPosition, pos2: GpsPosition) => {
    const R = 6371e3; // metres
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const useAnomalyDetector = ({
    position,
    vitals,
    dangerZones,
    addIncident,
    updateSafetyScore
}: AnomalyDetectorProps): AnomalyStates => {
    const [anomalyStates, setAnomalyStates] = useState<AnomalyStates>({
        geofence: 'MONITORING',
        inactivity: 'MONITORING',
        vitals: 'MONITORING',
    });
    
    const lastPositionRef = useRef<GpsPosition | null>(null);
    const lastMoveTimeRef = useRef<Date>(new Date());

    // Position-based anomaly detection (Geofence & Inactivity)
    useEffect(() => {
        if (!position) return;

        // 1. Geofence Monitoring
        for (const zone of dangerZones) {
            const distance = getDistance(position, zone.zone.center);
            if (distance < zone.zone.radius) {
                const severity = zone.riskLevel === 'danger' ? 'high' : 'medium';
                const scoreHit = zone.riskLevel === 'danger' ? 35 : 25;
                addIncident('geofence', position, severity);
                updateSafetyScore(scoreHit);
                setAnomalyStates(prev => ({ ...prev, geofence: 'TRIGGERED' }));
                // Note: Cooldown is handled in App.tsx's addIncident
            }
        }

        // 2. Inactivity Detection
        const lastPos = lastPositionRef.current;
        if (lastPos && position.lat === lastPos.lat && position.lng === lastPos.lng) {
            const inactiveDuration = (new Date().getTime() - lastMoveTimeRef.current.getTime()) / 1000;
            if (inactiveDuration > 15) {
                addIncident('inactivity', position, 'medium');
                updateSafetyScore(20);
                setAnomalyStates(prev => ({ ...prev, inactivity: 'TRIGGERED' }));
                lastMoveTimeRef.current = new Date(); // Reset timer to prevent immediate re-trigger
            }
        } else {
            lastPositionRef.current = position;
            lastMoveTimeRef.current = new Date();
        }

    }, [position, dangerZones, addIncident, updateSafetyScore]);

    // Vitals-based anomaly detection
    useEffect(() => {
        if (!vitals || !position) return;
        
        if (vitals.status === 'abnormal') {
            addIncident('iot', position, 'high');
            updateSafetyScore(40);
            setAnomalyStates(prev => ({ ...prev, vitals: 'TRIGGERED' }));
        }

    }, [vitals, position, addIncident, updateSafetyScore]);

    return anomalyStates;
};

export default useAnomalyDetector;
