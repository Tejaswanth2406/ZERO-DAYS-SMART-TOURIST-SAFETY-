export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'kn' | 'ur';
export type View = 'welcome' | 'registration' | 'tourist_dashboard' | 'authority_dashboard' | 'login';

export interface GpsPosition {
    lat: number;
    lng: number;
}

export interface Vitals {
    heartRate: number;
    status: 'normal' | 'abnormal';
}

export interface TouristID {
    id: string; // digitalId
    name: string; // fullName
    passportHash: string;
    tripItinerary: {
        startDate: string;
        endDate: string;
    };
    emergencyContacts: string;
    blockchainTx: string;
    healthInfo: {
        bloodGroup?: string;
        allergies?: string;
    };
    iotDevice?: {
        deviceId: string;
        paired: boolean;
    };
}

export interface GeoFence {
    id: string;
    name: string;
    zone: {
        center: GpsPosition;
        radius: number;
    };
    riskLevel: 'safe' | 'restricted' | 'danger';
}

export interface SafetyScore {
    touristId: string;
    currentScore: number;
    lastUpdate: Date;
}

export type IncidentType = 'sos' | 'geofence' | 'inactivity' | 'iot';

export interface Incident {
    id: string;
    touristId: string;
    location: GpsPosition;
    time: Date;
    type: IncidentType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'reported' | 'acknowledged' | 'resolved';
    evidenceHash: string;
    blockchainTx: string;
}

export interface EFIR {
    id: string;
    incidentId: string;
    touristId: string;
    generatedAt: Date;
    pdfHash: string;
    blockchainTx: string;
}

export enum LedgerEntryType {
    REGISTRATION = 'REGISTRATION',
    INCIDENT_REPORT = 'INCIDENT_REPORT',
    E_FIR_GENERATED = 'E_FIR_GENERATED'
}

export interface LedgerEntry {
    id: number;
    timestamp: Date;
    type: LedgerEntryType;
    data: {
        summary: string;
        referenceId: string;
        blockchainTx: string;
    };
}

export interface Alert {
    id: number;
    timestamp: Date;
    type: IncidentType | 'info' | 'error' | 'dahn';
    message: string;
    location?: GpsPosition;
}

// Types for the new interactive transmission control
export type MeshStatus = 'IDLE' | 'SEARCHING' | 'RELAYING' | 'SUCCESS' | 'FAIL';
export type LoraStatus = 'IDLE' | 'CHECKING' | 'TRANSMITTING' | 'SUCCESS' | 'FAIL';
export type SatelliteStatus = 'IDLE' | 'CHECKING' | 'TRANSMITTING' | 'SUCCESS' | 'FAIL';

export interface TransmissionLogEntry {
    id: number;
    timestamp: Date;
    message: string;
    status: 'info' | 'success' | 'error' | 'system';
}

// Types for Anomaly Detection
export type AnomalyStatus = 'MONITORING' | 'TRIGGERED';

export interface AnomalyStates {
    geofence: AnomalyStatus;
    inactivity: AnomalyStatus;
    vitals: AnomalyStatus;
}