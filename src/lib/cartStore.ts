import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string | null;
    category: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    total: () => number;
    count: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product) => set((state) => {
                const existing = state.items.find(i => i.id === product.id);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    };
                }
                return { items: [...state.items, { ...product, quantity: 1 }] };
            }),

            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),

            updateQuantity: (id, quantity) => set((state) => ({
                items: quantity <= 0
                    ? state.items.filter(i => i.id !== id)
                    : state.items.map(i => i.id === id ? { ...i, quantity } : i)
            })),

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
            count: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
        }),
        { name: 'gymflow-cart' }
    )
);
