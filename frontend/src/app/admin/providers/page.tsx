"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Search, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function ProvidersManagementPage() {
    const [activeTab, setActiveTab] = useState('pharmacy');
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const collections: { [key: string]: string } = {
        'pharmacy': 'pharmacies',
        'clinic': 'clinics',
        'dentist': 'dentists',
        'insurance': 'insurance_providers'
    };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const collectionName = collections[activeTab];
            let q = query(collection(db, collectionName), limit(50));

            // Note: Search in Firestore is tricky without Algolia/Typesense.
            // Client-side filter for now if list is small, or use simple prefix match if indexed.
            // For this admin panel, fetching 50 is fine.

            const snapshot = await getDocs(q);
            const items: any[] = [];
            snapshot.forEach((doc: any) => {
                items.push({ id: doc.id, ...doc.data() });
            });

            if (searchTerm) {
                // Client side filtering for demo
                const searchLower = searchTerm.toLowerCase();
                setProviders(items.filter(p =>
                    (p.name || p.nom_pharmacie || '').toLowerCase().includes(searchLower)
                ));
            } else {
                setProviders(items);
            }

        } catch (error) {
            console.error("Error fetching providers:", error);
            toast.error("Erreur chargement données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [activeTab, searchTerm]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Prestataires</h1>
                    <p className="text-muted-foreground text-sm">Gérez les pharmacies, cliniques et autres partenaires.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> Ajouter
                </button>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
                {['pharmacy', 'clinic', 'dentist', 'insurance'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === type
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        {type === 'pharmacy' ? 'Pharmacies' :
                            type === 'clinic' ? 'Cliniques' :
                                type === 'dentist' ? 'Dentistes' : 'Assurances'}
                    </button>
                ))}
            </div>

            {/* Search & Stats */}
            <div className="flex items-center gap-4 bg-card p-2 rounded-xl border border-border">
                <Search className="text-muted-foreground ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    className="flex-1 bg-transparent border-none focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/30 text-xs uppercase font-semibold text-muted-foreground">
                            <tr>
                                <th className="p-4">Nom</th>
                                <th className="p-4">Ville / Quartier</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Chargement...</td></tr>
                            ) : providers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun résultat.</td></tr>
                            ) : (
                                providers.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="p-4 font-medium">
                                            {provider.name || provider.nom_pharmacie || "Sans nom"}
                                            {provider.isVerified && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">VERIFIÉ</span>}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {provider.location?.city || provider.ville || "Ouagadougou"}
                                            {provider.location?.address && ` - ${provider.location.address}`}
                                        </td>
                                        <td className="p-4 font-mono text-xs">
                                            {provider.phone || provider.telephone || "NC"}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${provider.status === 'open' ? 'bg-green-100 text-green-700' :
                                                    provider.status === 'guard' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {provider.status || 'Inconnu'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
