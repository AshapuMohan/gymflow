"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartSystem() {
    const [isOpen, setIsOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [cartItems, setCartItems] = useState([
        { id: '1', name: 'Metallic Dumbbell 20kg', price: 99.99, quantity: 1, image: '' },
        { id: '2', name: 'Glow Barbell', price: 149.99, quantity: 1, image: '' }
    ]);

    const total = cartItems.reduce((acc: number, item: { price: number; quantity: number }) => acc + (item.price * item.quantity), 0);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 w-16 h-16 bg-neon-red text-white rounded-full flex items-center justify-center shadow-2xl neon-glow-red z-50 hover:scale-110 active:scale-90 transition-all"
            >
                <ShoppingCart size={24} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md glass z-[70] p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">YOUR <span className="text-neon-red">CORE</span></h2>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6">
                                {cartItems.map((item: { id: string; name: string; price: number; quantity: number; image: string }) => (
                                    <div key={item.id} className="flex gap-4 p-4 glass rounded-[1.5rem] border-white/5 group">
                                        <div className="w-20 h-20 bg-neutral-900 rounded-xl overflow-hidden border border-white/10" />
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold uppercase tracking-tight text-white mb-1">{item.name}</h4>
                                                <p className="text-electric-blue font-bold tracking-widest text-xs">${item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3 glass p-1 rounded-full">
                                                    <button className="w-6 h-6 flex items-center justify-center hover:text-neon-red transition-colors"><Minus size={14} /></button>
                                                    <span className="text-xs font-black">{item.quantity}</span>
                                                    <button className="w-6 h-6 flex items-center justify-center hover:text-electric-blue transition-colors"><Plus size={14} /></button>
                                                </div>
                                                <button className="text-neutral-500 hover:text-white transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/10">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-neutral-500 uppercase font-bold tracking-widest text-xs">Total Amount</span>
                                    <span className="text-3xl font-black text-white italic">${total.toFixed(2)}</span>
                                </div>
                                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-neon-red hover:text-white transition-all shadow-2xl">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
