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
    role?: "user" | "admin" | "pharmacy";
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

// 🏥 Pharmacy Types
export interface Pharmacy {
    id: string;
    name: string;
    ownerId?: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
        commune?: string;
        city?: string;
    };
    phone?: string;
    email?: string;
    status: "open" | "closed" | "guard";
    openingHours?: OpeningHour[];
    rating?: number;
    reviewCount?: number;
    isVerified?: boolean;
    isGuardToday?: boolean;
    guardGroup?: string; // Group A, B, C, D for automated rotation
    deliveryAvailable?: boolean;
    deliveryFee?: number;
    deliveryRadius?: number;
    distance?: number; // Calculated on client
    source?: string; // Data source identifier (Fused, Discovery, etc)
    createdAt?: any;
    updatedAt?: any;
}

export interface OpeningHour {
    day: number; // 0-6
    open: string;
    close: string;
    isClosed: boolean;
}

// 💊 Product Types
export interface Product {
    id: string;
    name: string;
    description?: string;
    activeIngredient?: string; // Molecule name for generic search like Alliance
    category?: "medicament" | "parapharmacie" | "materiel";
    images?: string[];
    requiresPrescription?: boolean;
    price?: number; // From inventory
    pharmacyId?: string; // From inventory
    inStock?: boolean; // From inventory
    stock?: number; // From inventory
    inventoryId?: string; // Reference to pharmacy_inventory doc
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
    dosage: string; // e.g. "1 comprimé"
    frequency: string; // e.g. "3 fois par jour"
    times: string[]; // e.g. ["08:00", "14:00", "20:00"]
    startDate: string;
    duration?: string; // e.g. "7 jours"
    isActive: boolean;
    createdAt: any;
}

// 🛡️ Insurance Types
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
