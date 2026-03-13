import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RegistrationForm } from './components/RegistrationForm';
import { PaymentInfo } from './components/PaymentInfo';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginForm } from './components/LoginForm';
import { NewsFeed } from './components/NewsFeed';
import { supabase } from './lib/supabase';
import itelLogo from './assets/itel_logo.png';
import bannerBalloons from './assets/banner_balloons.png';

export default function App() {
  const [view, setView] = useState<'registration' | 'admin'>('registration');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuthenticated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // Inactivity timer for admin session (5 minutes)
    let timeoutId: number;

    const resetTimer = () => {
      if (view === 'admin') {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(async () => {
          await supabase.auth.signOut();
          setView('registration');
          alert('Sessão expirada por inatividade.');
        }, 5 * 60 * 1000); // 5 minutes
      }
    };

    if (view === 'admin') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer(); // Initial call
      
      return () => {
        subscription.unsubscribe();
        window.clearTimeout(timeoutId);
        events.forEach(event => document.removeEventListener(event, resetTimer));
      };
    }

    return () => subscription.unsubscribe();
  }, [view]);

  const handleAdminToggle = async () => {
    if (view === 'admin') {
      await supabase.auth.signOut();
      setView('registration');
    } else {
      setView('admin');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
      <Header
        isAdmin={view === 'admin'}
        onAdminClick={handleAdminToggle}
      />

      {view === 'registration' ? (
        <div className="flex-1">
          {/* Hero Section */}
          <div className="relative flex min-h-[520px] flex-col gap-6 bg-slate-900 items-center justify-center p-6 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <img
                className="w-full h-full object-cover"
                src={bannerBalloons}
                alt="Banner de Balões Azuis"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
              <div className="bg-white p-4 rounded-xl shadow-xl mb-2">
                <img
                  alt="Logo ITEL"
                  className="h-16 w-auto object-contain"
                  src={itelLogo}
                />
              </div>
              <p className="text-white text-sm font-bold italic tracking-widest uppercase opacity-80 -mt-2">Poucos, mas bons!</p>
              <div className="flex flex-col gap-3">
                <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Evento Todas as Gerações ITEL
                </h1>
                <p className="text-slate-200 text-base font-normal leading-relaxed max-w-xl mx-auto md:text-lg">
                  Uma celebração única de conhecimento, networking e conexão entre todas as gerações que moldaram o ITEL.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <a
                  className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                  href="#inscricao"
                >
                  Inscreva-se Agora
                </a>
                <a
                  className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white/10 backdrop-blur-md text-white border border-white/20 text-base font-bold hover:bg-white/20 transition-colors"
                  href="#pagamento"
                >
                  Informações de Pagamento
                </a>
              </div>
            </div>
          </div>

          <NewsFeed />
          <PaymentInfo />
          <RegistrationForm />
        </div>
      ) : (
        isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <LoginForm onLogin={(success) => setIsAuthenticated(success)} />
        )
      )}

      <Footer />
    </div>
  );
}
