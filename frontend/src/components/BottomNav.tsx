"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingCart, MapPin, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { auth } from "@/services/firebase";

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { items } = useCart();

    const navItems = [
        {
            label: "Accueil",
            icon: Home,
            path: "/",
            active: pathname === "/",
        },
        {
            label: "Panier",
            icon: ShoppingCart,
            path: "/checkout",
            active: pathname === "/checkout",
            badge: items.length > 0 ? items.length : undefined,
        },
        {
            label: "Carte",
            icon: MapPin,
            path: "/map",
            active: pathname === "/map",
        },
        {
            label: "Profil",
            icon: User,
            path: "/profile",
            active: pathname === "/profile",
        },
    ];

    const handleNav = (path: string) => {
        if (path === "/profile" && !auth.currentUser) {
            router.push("/login");
            return;
        }
        router.push(path);
    };

    // Hide on some pages if needed (e.g. login, scanner)
    const hideOn = ["/login", "/scanner"];
    if (hideOn.includes(pathname)) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 pt-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
            <div className="max-w-lg mx-auto pointer-events-auto">
                <div className="glass-card rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/10 bg-white/10 dark:bg-black/40 backdrop-blur-2xl">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleNav(item.path)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-[1.5rem] transition-all duration-300 flex-1 relative group",
                                item.active
                                    ? "bg-primary text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] scale-105"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            {item.badge && (
                                <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-lg ring-2 ring-background">
                                    {item.badge}
                                </span>
                            )}
                            <item.icon
                                size={22}
                                className={cn(
                                    "transition-all duration-300",
                                    item.active ? "scale-110 active:scale-90" : "group-hover:scale-110"
                                )}
                            />
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter transition-opacity duration-300",
                                item.active ? "opacity-100" : "opacity-60"
                            )}>
                                {item.label}
                            </span>

                            {/* Active Indicator Dot */}
                            {item.active && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
