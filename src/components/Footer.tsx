import React from 'react';
import { Phone, MapPin, School } from 'lucide-react';
import itelLogo from '../assets/itel_logo.png';

export const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12" id="contatos">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img
                src={itelLogo}
                alt="ITEL Logo"
                className="h-10 w-auto object-contain bg-white p-1 rounded"
              />
              <span className="font-bold text-lg">ITEL GERAÇÕES Eventos</span>
            </div>
            <p className="text-xs text-primary font-bold italic -mt-2">Poucos, mas bons!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Instituto de Telecomunicações - Formando os líderes tecnológicos do amanhã, desde sempre.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Contatos Oficiais</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>923 344 482</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>925 202 027</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>923 444 092</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white">Localização</h4>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Luanda, Angola</span>
            </div>
            <div className="w-full h-32 rounded-lg bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              <img
                className="w-full h-full object-cover grayscale opacity-50"
                src="https://picsum.photos/seed/luanda/400/200"
                alt="Mapa de Luanda"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-primary rounded-full absolute"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <p>© 2026 ITEL - Instituto de Telecomunicações. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
