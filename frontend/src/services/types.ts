// 👤 User Types
export interface User {
    uid: string;
    phoneNumber: string;
    name: string;
    email?: string;
    addresses: Address[];
    paymentMethods: PaymentMethod[];
    createdAt: any;
    updatedAt: any;
    role?: "user" | "admin" | "pharmacy" | "clinic" | "dentist" | "insurance";
}

export interface Address {
    id: string;
    label: string;
    address: string;
    location: { lat: number; lng: number };
    isDefault: boolean;
}

export interface PaymentMethod {
    id: string;
    type: "orange" | "mtn" | "moov";
    phoneNumber: string;
    isDefault: boolean;
}

// 🏥 Health Provider Base Types
export type ProviderType = "pharmacy" | "clinic" | "hospital" | "dentist" | "insurance";

export interface HealthProvider {
    id: string;
    type: ProviderType;
    name: string;
    ownerId?: string;
    location: {
        lat: number;
        lng: number;
        address: string;
        city?: string;
        quartier?: string;
    };
    phone: string;
    email?: string;
    status: "open" | "closed" | "guard" | "available" | "unavailable";

    // GPS Validation
    gps_validated?: boolean;
    gps_accuracy?: number; // meters
    gps_source?: "manual" | "nominatim" | "osm" | "google";
    gps_last_updated?: any;

    // Contact & Social
    whatsapp?: string;
    website?: string;

    // Status & Badges
    isVerified?: boolean;
    badges?: ("verified" | "recent_update" | "partner" | "guard")[];

    // Rating
    rating?: number;
    reviewCount?: number;

    createdAt?: any;
    updatedAt?: any;
}

// 🏥 Pharmacy Types (Extends HealthProvider implicitly via structure compatibility)
export interface Pharmacy extends HealthProvider {
    type: "pharmacy";
    openingHours?: OpeningHour[];
    isGuardToday?: boolean;
    guardGroup?: string;
    deliveryAvailable?: boolean;
    deliveryFee?: number;
    deliveryRadius?: number;
    distance?: number;
    source?: string;
}

export interface OpeningHour {
    day: number; // 0-6
    open: string;
    close: string;
    isClosed: boolean;
}

// 🏥 Clinic & Hospital Types
export interface Clinic extends HealthProvider {
    type: "clinic" | "hospital";
    specialties: string[]; // ["Médecine générale", "Pédiatrie", "Gynécologie", ...]
    services: string[]; // ["Consultation", "Urgences", "Laboratoire", "Imagerie"]
    hasEmergency: boolean;
    hasAmbulance: boolean;
    hasBeds: boolean;
    bedCount?: number;
    openingHours?: OpeningHour[];
    acceptsInsurance: boolean;
    acceptedInsurances?: string[];
}

// 🦷 Dentist Types
export interface Dentist extends HealthProvider {
    type: "dentist";
    specialties: string[]; // ["Orthodontie", "Implants", "Blanchiment"]
    services: string[];
    openingHours?: OpeningHour[];
    acceptsInsurance: boolean;
    acceptedInsurances?: string[];
}

// 🛡️ Insurance Provider Types
export interface InsuranceProvider extends HealthProvider {
    type: "insurance";
    coverageTypes: string[]; // ["Santé", "Maternité", "Dentaire"]
    coverageRate: number; // avg percentage
    plans: {
        name: string;
        description: string;
        monthlyPremium: number;
        coverage: string[];
    }[];
    partnersCount: number;
    claimsPhone: string;
    emergencyPhone: string;
}

// 📅 Appointment Types
export interface Appointment {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;

    providerId: string;
    providerType: ProviderType;
    providerName: string;

    appointmentDate: string; // ISO Date string
    appointmentTime: string; // "09:00"
    consultationType: string;
    specialty?: string;

    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
    notes?: string;

    createdAt: any;
    updatedAt: any;
}

// 📢 Report / Feedback Types
export interface Report {
    id: string;
    userId: string;
    providerId: string;
    providerType: ProviderType;
    providerName?: string;

    type: "closed" | "wrong_hours" | "wrong_location" | "phone_error" | "other";
    description: string;
    location?: {
        lat: number;
        lng: number;
    };

    status: "pending" | "reviewed" | "resolved" | "rejected";
    adminNotes?: string;

    createdAt: any;
    resolvedAt?: any;
}

// 🚨 Emergency Request Types
export interface EmergencyRequest {
    id: string;
    userId: string;
    location: {
        lat: number;
        lng: number;
    };
    requestType: "pharmacy" | "clinic" | "ambulance" | "dentist";
    status: "active" | "resolved" | "cancelled";
    createdAt: any;
}

// 💊 Product Types
export interface Product {
    id: string;
    name: string;
    description?: string;
    activeIngredient?: string;
    category?: "medicament" | "parapharmacie" | "materiel";
    images?: string[];
    requiresPrescription?: boolean;
    price?: number;
    pharmacyId?: string;
    inStock?: boolean;
    stock?: number;
    inventoryId?: string;
    createdAt?: any;
}

export interface PharmacyInventory {
    id: string;
    pharmacyId: string;
    productId: string;
    price: number;
    stock: number;
    inStock: boolean;
    lastUpdated: any;
}

// 🛒 Order Types
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    pharmacyId: string;
    pharmacyName?: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryMode: "delivery" | "pickup";
    deliveryAddress?: {
        address: string;
        location: { lat: number; lng: number };
    };
    paymentMethod: "orange" | "mtn" | "moov" | "card";
    paymentPhoneNumber?: string;
    agentCode?: string;
    prescriptionImageUrl?: string;
    paymentStatus: "pending" | "paid" | "failed";
    status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "completed" | "cancelled" | "quote_requested" | "quote_received";
    estimatedTime?: string;
    deliveryPersonId?: string;
    deliveryLocation?: { lat: number; lng: number };
    isChronic?: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

// ⭐ Review Types
export interface Review {
    id: string;
    pharmacyId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    orderId?: string;
    createdAt: any;
}

// 🏥 Delivery Person Types
export interface DeliveryPerson {
    id: string;
    name: string;
    phone: string;
    vehicleType: "moto" | "car";
    isAvailable: boolean;
    currentLocation?: { lat: number; lng: number };
    rating: number;
    deliveryCount: number;
    createdAt: any;
}

// 🩺 Tele-consultation Types
export interface Consultation {
    id: string;
    userId: string;
    userName: string;
    pharmacistId?: string;
    pharmacistName?: string;
    pharmacyId?: string;
    status: "pending" | "active" | "completed" | "cancelled";
    type: "chat" | "video";
    subject?: string;
    lastMessage?: string;
    unreadCount?: number;
    createdAt: any;
    updatedAt: any;
}

export interface ChatMessage {
    id: string;
    consultationId: string;
    senderId: string;
    senderName: string;
    senderRole: "user" | "pharmacist";
    text: string;
    type: "text" | "image" | "prescription";
    fileUrl?: string;
    createdAt: any;
}

// 💊 Pill Reminder Types
export interface Treatment {
    id: string;
    userId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    times: string[];
    startDate: string;
    duration?: string;
    isActive: boolean;
    createdAt: any;
}

// 🛡️ Insurance Types (User's personal insurance)
export interface Insurance {
    id: string;
    userId: string;
    provider: string; // e.g. "SONAR", "UAB", "Caisse"
    policyNumber: string;
    coverageRate: number; // e.g. 80 for 80%
    expiryDate: string;
    beneficiaries: string[];
    isVerified: boolean;
    cardImageUrl?: string;
    createdAt: any;
}
