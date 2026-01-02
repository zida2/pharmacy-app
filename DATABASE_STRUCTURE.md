# 📊 Structure de la Base de Données Firebase

## Collections Firestore

### 1️⃣ **users**
```javascript
{
  uid: string,
  phoneNumber: string,
  name: string,
  email?: string,
  addresses: [
    {
      id: string,
      label: string, // "Maison", "Bureau"
      address: string,
      location: { lat: number, lng: number },
      isDefault: boolean
    }
  ],
  paymentMethods: [
    {
      id: string,
      type: "orange" | "mtn" | "moov",
      phoneNumber: string,
      isDefault: boolean
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2️⃣ **pharmacies**
```javascript
{
  id: string,
  name: string,
  ownerId: string, // référence à users (pharmacien)
  location: {
    lat: number,
    lng: number,
    address: string,
    commune: string,
    city: string
  },
  phone: string,
  email?: string,
  status: "open" | "closed" | "guard",
  openingHours: [
    {
      day: 0-6, // 0 = Dimanche
      open: "08:00",
      close: "20:00",
      isClosed: boolean
    }
  ],
  rating: number, // 0-5
  reviewCount: number,
  isVerified: boolean,
  isGuardToday: boolean,
  deliveryAvailable: boolean,
  deliveryFee: number,
  deliveryRadius: number, // en km
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3️⃣ **products**
```javascript
{
  id: string,
  name: string,
  description: string,
  category: "medicament" | "parapharmacie" | "materiel",
  images: [string], // URLs
  requiresPrescription: boolean,
  createdAt: timestamp
}
```

### 4️⃣ **pharmacy_inventory**
```javascript
{
  id: string,
  pharmacyId: string,
  productId: string,
  price: number,
  stock: number,
  inStock: boolean,
  lastUpdated: timestamp
}
```

### 5️⃣ **orders**
```javascript
{
  id: string,
  orderNumber: string, // "ORD-20251227-0001"
  userId: string,
  pharmacyId: string,
  items: [
    {
      productId: string,
      productName: string,
      quantity: number,
      unitPrice: number,
      totalPrice: number
    }
  ],
  subtotal: number,
  deliveryFee: number,
  total: number,
  deliveryMode: "delivery" | "pickup",
  deliveryAddress?: {
    address: string,
    location: { lat: number, lng: number }
  },
  paymentMethod: "orange" | "mtn" | "moov" | "card",
  paymentStatus: "pending" | "paid" | "failed",
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "completed" | "cancelled",
  estimatedTime?: string,
  deliveryPersonId?: string,
  deliveryLocation?: { lat: number, lng: number }, // Position en temps réel
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6️⃣ **reviews**
```javascript
{
  id: string,
  pharmacyId: string,
  userId: string,
  userName: string,
  rating: number, // 1-5
  comment: string,
  orderId?: string,
  createdAt: timestamp
}
```

### 7️⃣ **delivery_persons**
```javascript
{
  id: string,
  name: string,
  phone: string,
  vehicleType: "moto" | "car",
  isAvailable: boolean,
  currentLocation?: { lat: number, lng: number },
  rating: number,
  deliveryCount: number,
  createdAt: timestamp
}
```

## Indexes recommandés

```javascript
// pharmacy_inventory
- pharmacyId + productId (composite)
- productId + inStock

// orders
- userId + createdAt
- pharmacyId + status + createdAt
- status + createdAt

// reviews
- pharmacyId + createdAt
```

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Pharmacies
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (get(/databases/$(database)/documents/pharmacies/$(pharmacyId)).data.ownerId == request.auth.uid);
    }
    
    // Products
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Admin only via backend
    }
    
    // Pharmacy Inventory
    match /pharmacy_inventory/{inventoryId} {
      allow read: if true;
      allow write: if request.auth != null; // Pharmacy owner only
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     resource.data.pharmacyId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.pharmacies);
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```
