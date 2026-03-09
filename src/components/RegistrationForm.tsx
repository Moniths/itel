import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GalleryCarousel } from './GalleryCarousel';

export const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    ano_ingresso: '',
    ano_saida: '',
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [comprovativo, setComprovativo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, we would upload files to Supabase Storage first
      // For this demo, we'll simulate the process and save the data

      let fotoUrl = '';
      let comprovativoUrl = '';

      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: fotoData, error: fotoError } = await supabase.storage
          .from('photos')
          .upload(fileName, foto);
        if (fotoError) throw fotoError;
        fotoUrl = fotoData.path;
      }

      if (comprovativo) {
        const fileExt = comprovativo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: compData, error: compError } = await supabase.storage
          .from('proofs')
          .upload(fileName, comprovativo);
        if (compError) throw compError;
        comprovativoUrl = compData.path;
      }

      const { error } = await supabase.from('registrations').insert([
        {
          name: formData.nome,
          phone: formData.telefone,
          entry_year: parseInt(formData.ano_ingresso),
          exit_year: parseInt(formData.ano_saida),
          photo_url: fotoUrl,
          payment_proof_url: comprovativoUrl,
          status: 'pending',
          generation: `G${formData.ano_saida.slice(-2)}`
        },
      ]);

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar inscrição. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Inscrição Enviada!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Obrigado por se inscrever. A nossa equipa irá validar o seu comprovativo em breve.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold"
        >
          Fazer outra inscrição
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 py-20" id="inscricao">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        {/* Gallery Column */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h2 className="text-slate-900 dark:text-white text-4xl font-black mb-4 leading-tight">Reviva Momentos Inesquecíveis</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Veja como foram as edições anteriores do evento Todas as Gerações ITEL. Uma jornada de memórias e conexões.
            </p>
          </div>
          <GalleryCarousel />
        </div>

        {/* Form Column */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 md:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-slate-900 dark:text-white text-3xl font-black mb-3">Garanta o seu Lugar</h2>
            <p className="text-slate-500 dark:text-slate-400">Preencha o formulário para se inscrever na edição 2026.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-primary h-12"
                  placeholder="Seu nome aqui"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Número de Telefone</label>
                <input
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-primary h-12"
                  placeholder="Ex: 923 000 000"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Ano de Ingresso</label>
                <input
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-primary h-12"
                  max="2026" min="1970"
                  placeholder="Ex: 2015"
                  type="number"
                  value={formData.ano_ingresso}
                  onChange={(e) => setFormData({ ...formData, ano_ingresso: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Ano de Graduação (Geração)</label>
                <input
                  required
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-primary h-12"
                  max="2028" min="1970"
                  placeholder="Ex: 2019"
                  type="number"
                  value={formData.ano_saida}
                  onChange={(e) => setFormData({ ...formData, ano_saida: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 italic">O ano de graduação define sua Geração (ex: 2019 = G19)</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Foto de Perfil</label>
                <div className="relative flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-primary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {foto ? foto.name : 'JPG, PNG (Max. 2MB)'}
                      </p>
                    </div>
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFoto(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Comprovativo de Pagamento</label>
                <div className="relative flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-primary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {comprovativo ? comprovativo.name : 'PDF, JPG (Comprovativo)'}
                      </p>
                    </div>
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setComprovativo(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg h-14 px-8 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/40 transition-all hover:shadow-primary/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submeter'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
