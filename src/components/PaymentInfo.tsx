import React from 'react';
import { CreditCard, Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { GalleryCarousel } from './GalleryCarousel';

export const PaymentInfo = () => {
  const [copied, setCopied] = useState(false);
  const iban = "AO06 0006 0000 296689623014 5";

  const copyIban = () => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-12" id="pagamento">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 bg-primary rounded-full"></div>
        <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">Informações de Pagamento</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-primary/10 order-2 md:order-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <CreditCard className="text-primary w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Valor do Investimento</p>
                <p className="text-slate-900 dark:text-white text-3xl font-black">32.000 KZ</p>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-primary font-bold flex items-center gap-2">
                Dados Bancários BFA
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-primary/5">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">IBAN</p>
                <p className="text-slate-900 dark:text-white font-mono text-base md:text-lg break-all">{iban}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Titular da Conta</p>
                  <p className="text-slate-900 dark:text-white text-sm font-bold">Karen L. B. Cruz Manaças</p>
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-primary text-xs font-bold mb-1 uppercase tracking-tighter">Multicaixa EXPRESS</p>
                <p className="text-slate-900 dark:text-white font-black text-xl tracking-wider">923 344 482</p>
              </div>
            </div>
          </div>
          <button
            onClick={copyIban}
            className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? 'Copiado!' : 'Copiar IBAN'}</span>
          </button>
        </div>
        <div className="order-1 md:order-2">
          <GalleryCarousel />
        </div>
      </div>
    </section>
  );
};
