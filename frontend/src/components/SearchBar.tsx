"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (value: string) => void;
}

export default function SearchBar({
    className,
    onSearch,
    ...props
}: SearchBarProps) {
    return (
        <div className={cn("relative w-full max-w-2xl mx-auto group", className)}>
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 transition-transform group-focus-within:scale-110">
                <Search className="h-5 w-5 text-primary group-focus-within:text-primary transition-colors font-bold" />
            </div>
            <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="w-full pl-14 pr-6 py-5 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] border-2 border-white/50 dark:border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-[10px] focus:ring-primary/10 transition-all font-bold text-lg"
                {...props}
            />
            <div className="absolute inset-0 rounded-[2rem] -z-10 bg-gradient-to-r from-primary/5 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        </div>
    );
}
