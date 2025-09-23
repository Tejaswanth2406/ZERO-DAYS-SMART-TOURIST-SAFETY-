import { TouristID, GpsPosition, Vitals } from './types';

export const MOCK_TOURISTS: TouristID[] = [
  {
    id: 'a1b2c3d4e5f6g7h8',
    name: 'Alice Johnson',
    passportHash: 'hash_alice',
    tripItinerary: { startDate: '2024-08-01', endDate: '2024-08-10' },
    emergencyContacts: 'Bob Johnson +1-555-0001',
    blockchainTx: 'tx_alice_reg',
    healthInfo: { bloodGroup: 'A+', allergies: 'None' },
    iotDevice: { deviceId: 'IOT-ALICE', paired: true },
  },
  {
    id: 'i9j0k1l2m3n4o5p6',
    name: 'Carlos Rodriguez',
    passportHash: 'hash_carlos',
    tripItinerary: { startDate: '2024-08-02', endDate: '2024-08-12' },
    emergencyContacts: 'Maria Rodriguez +34-555-0002',
    blockchainTx: 'tx_carlos_reg',
    healthInfo: { bloodGroup: 'O-', allergies: 'Shellfish' },
    iotDevice: { deviceId: 'IOT-CARLOS', paired: true },
  },
  {
    id: 'q7r8s9t0u1v2w3x4',
    name: 'Emily White',
    passportHash: 'hash_emily',
    tripItinerary: { startDate: '2024-07-30', endDate: '2024-08-08' },
    emergencyContacts: 'David White +44-555-0003',
    blockchainTx: 'tx_emily_reg',
    healthInfo: { bloodGroup: 'B+', allergies: 'Pollen' },
    iotDevice: { deviceId: 'IOT-EMILY', paired: false },
  },
  {
    id: 'y5z6a7b8c9d0e1f2',
    name: 'Kenji Tanaka',
    passportHash: 'hash_kenji',
    tripItinerary: { startDate: '2024-08-03', endDate: '2024-08-15' },
    emergencyContacts: 'Yuki Tanaka +81-555-0004',
    blockchainTx: 'tx_kenji_reg',
    healthInfo: { bloodGroup: 'AB+', allergies: 'None' },
    iotDevice: { deviceId: 'IOT-KENJI', paired: true },
  },
  {
    id: 'g3h4i5j6k7l8m9n0',
    name: 'Fatima Al-Jamil',
    passportHash: 'hash_fatima',
    tripItinerary: { startDate: '2024-08-05', endDate: '2024-08-20' },
    emergencyContacts: 'Hassan Al-Jamil +966-555-0005',
    blockchainTx: 'tx_fatima_reg',
    healthInfo: { bloodGroup: 'O+', allergies: 'Dust' },
    iotDevice: { deviceId: 'IOT-FATIMA', paired: false },
  },
];

export const MOCK_POSITIONS: Record<string, GpsPosition> = {
  'a1b2c3d4e5f6g7h8': { lat: 19.0810, lng: 72.8740 },
  'i9j0k1l2m3n4o5p6': { lat: 19.0700, lng: 72.8800 },
  'q7r8s9t0u1v2w3x4': { lat: 19.0755, lng: 72.8795 },
  'y5z6a7b8c9d0e1f2': { lat: 19.0780, lng: 72.8710 },
  'g3h4i5j6k7l8m9n0': { lat: 19.0725, lng: 72.8760 },
};

export const MOCK_VITALS: Record<string, Vitals> = {
    'a1b2c3d4e5f6g7h8': { heartRate: 80, status: 'normal' },
    'i9j0k1l2m3n4o5p6': { heartRate: 72, status: 'normal' },
    'y5z6a7b8c9d0e1f2': { heartRate: 85, status: 'normal' },
};

const firstNames = ['John', 'Jane', 'Peter', 'Mary', 'David', 'Sarah', 'Michael', 'Linda', 'Chris', 'Patricia', 'Robert', 'Jennifer'];
const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];

for (let i = 0; i < 75; i++) {
    const id = Math.random().toString(16).slice(2);
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${i}`;
    MOCK_TOURISTS.push({
        id: id,
        name: name,
        passportHash: `hash_${id}`,
        tripItinerary: { startDate: '2024-08-01', endDate: '2024-08-10' },
        emergencyContacts: 'Contact ' + i,
        blockchainTx: `tx_${id}`,
        healthInfo: { bloodGroup: 'A+', allergies: 'None' },
        iotDevice: { deviceId: `IOT-${id.substring(0,6)}`, paired: Math.random() > 0.3 },
    });

    MOCK_POSITIONS[id] = {
        lat: 19.0760 + (Math.random() - 0.5) * 0.15,
        lng: 72.8777 + (Math.random() - 0.5) * 0.15,
    };

    if (MOCK_TOURISTS[MOCK_TOURISTS.length - 1].iotDevice?.paired) {
        MOCK_VITALS[id] = {
            heartRate: 60 + Math.floor(Math.random() * 40),
            status: 'normal',
        };
    }
}