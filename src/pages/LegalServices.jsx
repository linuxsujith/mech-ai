import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Car, Shield, Globe } from 'lucide-react';

const SERVICES = [
  {
    name: 'Parivahan',
    description: 'Ministry of Road Transport & Highways — Official transport portal for vehicle registration, permits, and online services.',
    url: 'https://parivahan.gov.in/',
    icon: Car,
  },
  {
    name: 'Sarathi',
    description: 'Driving License services — Apply, renew, or check status of your driving license online.',
    url: 'https://sarathi.parivahan.gov.in/',
    icon: FileText,
  },
  {
    name: 'Vahan',
    description: 'Vehicle registration and information system — Check vehicle details, pay road tax, and manage documents.',
    url: 'https://vahan.parivahan.gov.in/',
    icon: Shield,
  },
  {
    name: 'Karnataka RTO',
    description: 'Karnataka Transport Department — Regional transport office services for Karnataka state.',
    url: 'https://transport.karnataka.gov.in/',
    icon: Globe,
  },
];

export default function LegalServices() {
  return (
    <div data-testid="legal-services-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="mono-label">Official Portals</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          VEHICLE <span className="text-[#D4AF37]">SERVICES</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-10">Access official government vehicle service portals</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map(({ name, description, url, icon: Icon }, i) => (
            <motion.a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              data-testid={`service-${name.toLowerCase().replace(/\s/g, '-')}`}
              className="glass-panel p-6 border-l-2 border-[#D4AF37]/30 hover:border-[#D4AF37] group transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 border border-zinc-800 flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-colors">
                  <Icon className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-wide mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
            </motion.a>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 glass-panel p-5" data-testid="services-disclaimer">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="text-[#D4AF37] font-bold">NOTICE:</span> These links redirect to official Government of India portals.
            MECHAI is not affiliated with these services. All transactions on external portals are governed by their respective terms and policies.
            Links open in new tabs for your convenience.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
