import React from 'react';
import { School, User } from 'lucide-react';
import itelLogo from '../assets/itel_logo.png';

interface HeaderProps {
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

export const Header = ({ onAdminClick, isAdmin }: HeaderProps) => {
  return (
    <header className="flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 p-4 justify-between border-b border-primary/10">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-lg">
          <img
            src={itelLogo}
            alt="ITEL Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            {isAdmin ? 'ITEL Admin' : 'ITEL GERAÇÕES Eventos'}
          </h2>
          {isAdmin && <p className="text-xs text-slate-500 dark:text-slate-400">Todas as Gerações 2024</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isAdmin && (
          <a className="hidden md:block text-sm font-medium hover:text-primary transition-colors" href="#contatos">
            Contatos
          </a>
        )}
        <button
          onClick={onAdminClick}
          className="flex items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
