import React, { useState } from 'react';
import { Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import itelLogo from '../assets/itel_logo.png';

interface LoginFormProps {
    onLogin: (success: boolean) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (data.session) {
                onLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white p-3 rounded-xl shadow-md mb-4">
                        <img src={itelLogo} alt="ITEL Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Administrativo</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Entre com suas credenciais</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 h-12 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                required
                                type="password"
                                className="w-full pl-10 h-12 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
