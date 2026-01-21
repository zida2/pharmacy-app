"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    ShieldAlert,
    Database,
    Users,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    {
        title: "Vue d'ensemble",
        path: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Validation GPS",
        path: "/admin/validation",
        icon: MapPin
    },
    {
        title: "Signalements",
        path: "/admin/reports",
        icon: ShieldAlert
    },
    {
        title: "Prestataires",
        path: "/admin/providers",
        icon: Users
    },
    {
        title: "Données & Setup",
        path: "/admin/setup",
        icon: Database
    },
    {
        title: "Configuration",
        path: "/admin/settings",
        icon: Settings
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 hidden md:flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                    PharmaBF Admin
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Console de gestion</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon
                                size={20}
                                className={cn(
                                    "transition-transform group-hover:scale-110",
                                    isActive ? "text-white" : "text-primary/70"
                                )}
                            />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
