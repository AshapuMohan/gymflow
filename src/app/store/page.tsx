import { prisma } from "@/lib/prisma";
import StoreProductCard from "@/components/store/StoreProductCard";
import CartDrawer from "@/components/store/CartDrawer";
import CheckoutAutoTrigger from "@/components/store/CheckoutAutoTrigger";
import { ShoppingBag } from "lucide-react";

const CATEGORIES = ["All", "Equipment", "Apparel", "Supplements", "Accessories"];

interface StorePageProps {
    searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
    const params = await searchParams;
    const category = params?.category;
    const search = params?.search;

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            ...(category && category !== 'All' ? { category } : {}),
            ...(search ? { name: { contains: search } } : {}),
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 relative">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-gold/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <ShoppingBag className="text-accent-gold" size={20} />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-gold font-bold">Titan Arsenal</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display uppercase tracking-widest text-white mb-4">
                        Equipment Store
                    </h1>
                    <p className="text-white/40 font-sans text-base">
                        Premium gear engineered for elite performance.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-10 flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <a
                            key={cat}
                            href={`/store?category=${cat}`}
                            className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-colors ${(category === cat || (!category && cat === 'All'))
                                ? 'bg-accent-gold text-background'
                                : 'glass border border-white/[0.05] text-white/50 hover:text-white hover:border-accent-gold/30'
                                }`}
                        >
                            {cat}
                        </a>
                    ))}

                    <form method="GET" action="/store" className="ml-auto">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search products..."
                            className="bg-surface/50 border border-white/[0.08] rounded-lg px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold/50 transition-colors font-sans text-sm w-52"
                        />
                    </form>
                </div>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <div className="glass rounded-2xl border border-white/[0.05] h-64 flex flex-col items-center justify-center gap-4">
                        <ShoppingBag size={32} className="text-white/20" />
                        <p className="text-white/30 text-sm">
                            {search ? `No products matching "${search}"` : "No products available yet."}
                        </p>
                        {search && (
                            <a href="/store" className="text-xs text-accent-gold underline underline-offset-4">View all products</a>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-white/30 mb-6">{products.length} products</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <StoreProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    category={product.category}
                                    description={product.description}
                                    imageUrl={product.imageUrl}
                                    inventory={product.inventory}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Cart Drawer and checkout trigger - always mounted */}
            <CartDrawer />
            <CheckoutAutoTrigger />
        </div>
    );
}
