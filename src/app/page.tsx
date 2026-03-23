import Link from 'next/link';
import TitanHero from '@/components/titan/TitanHero';
import TitanPhilosophy from '@/components/titan/TitanPhilosophy';
import TitanStore from '@/components/titan/TitanStore';
import TitanPricing from '@/components/titan/TitanPricing';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent-gold/30">

      {/* Matte Stealth Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-background/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simple geometric logo placeholder */}
            <div className="flex items-center justify-center w-8 h-8 bg-surface rounded-sm border border-white/[0.08]">
              <div className="w-3 h-3 bg-accent-gold transform rotate-45" />
            </div>
            <span className="text-xl font-display tracking-widest uppercase text-white">TITAN X</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-xs font-sans font-medium uppercase tracking-[0.2em] text-white/50">
            <a href="#protocol" className="hover:text-accent-gold transition-colors">The Protocol</a>
            <a href="#performance" className="hover:text-accent-gold transition-colors">Arsenal</a>
            <a href="#elite" className="hover:text-white transition-colors">Elite Status</a>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
              Access
            </Link>
            <Link href="/register" className="bg-white text-background px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Initiate
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Cinematic 3D Section */}
        <TitanHero />

        {/* Storytelling Phase */}
        <TitanPhilosophy />

        {/* E-Commerce Global Store Phase */}
        <TitanStore />

        {/* Subscription Engine Layer */}
        <div id="elite">
          <TitanPricing />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-24 border-t border-white/[0.03] text-center bg-background">
        <div className="flex justify-center gap-8 mb-12 text-white/40 text-[10px] font-medium uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Manifesto</a>
        </div>
        <div className="flex items-center justify-center mb-6">
          <div className="w-4 h-4 bg-accent-gold transform rotate-45 opacity-20" />
        </div>
        <p className="text-white/20 text-[10px] font-sans uppercase tracking-[0.3em]">
          TITAN X PERFORMANCE © {new Date().getFullYear()}
        </p>
      </footer>

    </div>
  );
}
