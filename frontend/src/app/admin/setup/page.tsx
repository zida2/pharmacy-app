"use client";

import React, { useState } from "react";
import { db } from "@/services/firebase";
import { writeBatch, doc, collection, serverTimestamp } from "firebase/firestore";

export default function AdminSetupPage() {
    const [status, setStatus] = useState<string>("Ready");
    const [logs, setLogs] = useState<string[]>([]);

    const log = (msg: string) => setLogs(prev => [...prev, msg]);

    const importCollection = async (collectionName: string, jsonFile: string) => {
        try {
            setStatus(`Importing ${collectionName}...`);
            log(`Fetching ${jsonFile}...`);

            const res = await fetch(`/data/${jsonFile}`);
            if (!res.ok) throw new Error(`Failed to fetch ${jsonFile}`);

            const data = await res.json();
            log(`Loaded ${data.length} items. Writing to Firestore...`);

            const batchSize = 400; // Firestore limit 500
            let total = 0;

            for (let i = 0; i < data.length; i += batchSize) {
                const batch = writeBatch(db);
                const chunk = data.slice(i, i + batchSize);

                chunk.forEach((item: any) => {
                    const docId = item.id.toString().replace(/\//g, '_');
                    const ref = doc(db, collectionName, docId);

                    // Add timestamps
                    const itemData = {
                        ...item,
                        updatedAt: serverTimestamp()
                    };

                    batch.set(ref, itemData, { merge: true });
                });

                await batch.commit();
                total += chunk.length;
                log(`  ✅ Batch committed: ${total}/${data.length}`);
            }

            log(`🎉 Finished importing ${collectionName}!`);
            setStatus("Ready");
        } catch (error: any) {
            console.error(error);
            log(`❌ Error: ${error.message}`);
            setStatus("Error");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Initial Setup</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => importCollection('pharmacies', 'pharmacies.json')}
                    className="btn bg-green-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-green-700 transition"
                >
                    <span className="text-xl">💊</span>
                    <span className="font-bold">Import Pharmacies</span>
                    <span className="text-xs opacity-70">Existing + OSM</span>
                </button>

                <button
                    onClick={() => importCollection('clinics', 'clinics.json')}
                    className="btn bg-blue-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-blue-700 transition"
                >
                    <span className="text-xl">🏥</span>
                    <span className="font-bold">Import Clinics</span>
                    <span className="text-xs opacity-70">From OSM</span>
                </button>

                <button
                    onClick={() => importCollection('dentists', 'dentists.json')}
                    className="btn bg-cyan-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-cyan-700 transition"
                >
                    <span className="text-xl">🦷</span>
                    <span className="font-bold">Import Dentists</span>
                    <span className="text-xs opacity-70">From OSM</span>
                </button>

                <button
                    onClick={() => importCollection('insurance_providers', 'insurance_providers.json')}
                    className="btn bg-purple-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-purple-700 transition"
                >
                    <span className="text-xl">🛡️</span>
                    <span className="font-bold">Import Insurance</span>
                    <span className="text-xs opacity-70">Static Data</span>
                </button>
            </div>

            <div className="bg-zinc-900 text-green-400 p-4 rounded-xl font-mono text-sm h-96 overflow-y-auto border border-zinc-800">
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
                    <span className="font-bold text-white">Console Logs</span>
                    <span className="text-xs">{status}</span>
                </div>
                {logs.length === 0 && <span className="opacity-50">Waiting for command...</span>}
                {logs.map((l, i) => (
                    <div key={i} className="mb-1">{l}</div>
                ))}
            </div>
        </div>
    );
}
