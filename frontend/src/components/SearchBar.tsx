"use client";

import React from "react";
import { Search, X } from "lucide-react";
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
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-transform group-focus-within:scale-110">
                <Search className="h-5 w-5 text-primary/70 group-focus-within:text-primary transition-colors font-bold" />
            </div>
            <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="input-standard pl-12 pr-10 bg-secondary border-none shadow-sm"
                {...props}
            />
            {props.value && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (props.onChange) {
                            const event = {
                                target: { value: "" }
                            } as React.ChangeEvent<HTMLInputElement>;
                            props.onChange(event);
                        }
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
