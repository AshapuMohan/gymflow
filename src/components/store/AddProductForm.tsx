"use client";

import { useState, useRef } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import Image from "next/image";

interface AddProductFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = ["Equipment", "Apparel", "Supplements", "Accessories"];

export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
    const [form, setForm] = useState({
        name: "", category: "Equipment", sku: "", description: "",
        price: "", inventory: "0", imageUrl: ""
    });
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Upload to server
        setUploading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Upload failed.");
                setImagePreview("");
                return;
            }
            setForm(f => ({ ...f, imageUrl: data.url }));
        } catch {
            setError("Image upload failed.");
            setImagePreview("");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || "Failed to add product."); return; }
            onSuccess();
            onClose();
        } catch { setError("An error occurred. Please try again."); }
        finally { setLoading(false); }
    };

    const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl border border-white/[0.08] w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-display uppercase tracking-wider text-white">Add Product</h2>
                    <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">Product Photo</label>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-full h-36 bg-surface/40 border border-dashed border-white/[0.12] hover:border-accent-gold/40 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors relative overflow-hidden group"
                        >
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-xs text-white uppercase tracking-wider">Change Photo</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {uploading ? (
                                        <Upload size={24} className="text-accent-gold animate-bounce" />
                                    ) : (
                                        <ImagePlus size={24} className="text-white/30 group-hover:text-accent-gold transition-colors" />
                                    )}
                                    <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                                        {uploading ? "Uploading..." : "Click to upload photo (PNG, JPG, WEBP — max 5MB)"}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Product Name *</label>
                            <input value={form.name} onChange={e => update("name", e.target.value)} required
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">SKU *</label>
                            <input value={form.sku} onChange={e => update("sku", e.target.value)} required placeholder="e.g. DB-20KG-001"
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Category *</label>
                            <select value={form.category} onChange={e => update("category", e.target.value)}
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Price (USD) *</label>
                            <input type="number" step="0.01" min="0" value={form.price} onChange={e => update("price", e.target.value)} required placeholder="0.00"
                                className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Description</label>
                        <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={2}
                            className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors resize-none" />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Stock Quantity</label>
                        <input type="number" min="0" value={form.inventory} onChange={e => update("inventory", e.target.value)}
                            className="w-full bg-surface/50 border border-white/[0.08] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 border border-white/20 text-white/60 rounded-lg text-xs uppercase tracking-wider hover:border-accent-gold hover:text-accent-gold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || uploading}
                            className="flex-1 py-3 bg-accent-gold text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                            {loading ? "Adding..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
