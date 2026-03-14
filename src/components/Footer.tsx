import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-surface-light bg-surface-dark/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-text-secondary opacity-80">
            <ShieldAlert className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium tracking-wide">
              StreamVault
            </span>
          </div>
          
          <div className="text-xs text-text-muted max-w-2xl text-center md:text-right leading-relaxed">
            <p className="mb-2 font-semibold">
              DMCA / Legal Disclaimer
            </p>
            <p>
              This website does not host any media files on its server or network. 
              All video content and streams are provided by non-affiliated third parties. 
              We merely index links found publicly on the internet. We do not hold responsibility 
              for the content hosted on external websites. If you have any legal issues please 
              contact the appropriate media file owners or host sites.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-surface/50 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted opacity-60">
          <p>© {new Date().getFullYear()} StreamVault. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-gold transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
