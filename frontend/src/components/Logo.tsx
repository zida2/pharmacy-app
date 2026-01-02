import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    showText?: boolean;
}

const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
};

export default function Logo({ size = "md", className, showText = false }: LogoProps) {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className={cn(sizeMap[size], "relative")}>
                <img
                    src="/logo.png"
                    alt="PharmaBF - Pharmacies du Burkina Faso"
                    className="w-full h-full object-contain drop-shadow-lg"
                />
            </div>
            {showText && (
                <div className="text-center">
                    <h1 className="text-2xl font-black italic tracking-tighter text-foreground">
                        PharmaBF
                    </h1>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        Burkina Faso
                    </p>
                </div>
            )}
        </div>
    );
}
