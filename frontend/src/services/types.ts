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
    deliveryAvailable?: boolean;
    deliveryFee?: number;
    deliveryRadius?: number;
    distance?: number; // Calculated on client
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
    paymentStatus: "pending" | "paid" | "failed";
    status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "completed" | "cancelled";
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

// 🏍️ Delivery Person Types
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
