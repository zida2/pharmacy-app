"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Pharmacy, Product } from "@/services/types";

export interface CartItem {
    product: Partial<Product>;
    pharmacyId: string;
    pharmacyName: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Partial<Product>, pharmacy: Pharmacy) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Use a separate effect for hydration to avoid SSR mismatch
    useEffect(() => {
        const saved = localStorage.getItem("pharma_cart");
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("pharma_cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Partial<Product>, pharmacy: Pharmacy) => {
        setItems(prev => {
            // Restriction: Only one pharmacy at a time to keep logic simple for delivery
            if (prev.length > 0 && prev[0].pharmacyId !== pharmacy.id) {
                if (!confirm("Votre panier contient des articles d'une autre pharmacie. Voulez-vous remplacer votre panier par cette nouvelle sélection ?")) {
                    return prev;
                }
                return [{ product, pharmacyId: pharmacy.id, pharmacyName: pharmacy.name, quantity: 1 }];
            }

            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, pharmacyId: pharmacy.id, pharmacyName: pharmacy.name, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setItems([]);

    const totalPrice = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
