import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [comprovativo2, setComprovativo2] = useState<File | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);

  const handleConsult = async () => {
    if (!searchPhone) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('phone', searchPhone.replace(/\s/g, ''))
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        alert('Inscrição pendente não encontrada para este número.');
        return;
      }

      setFormData({
        nome: data.name,
        telefone: data.phone,
        ano_ingresso: data.entry_year.toString(),
        ano_saida: data.exit_year.toString(),
      });
      setEditingId(data.id);
      setOriginalData(data);
      setIsConsulting(false);
    } catch (error) {
      console.error('Error consulting registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, we would upload files to Supabase Storage first
      // For this demo, we'll simulate the process and save the data

      let fotoUrl = originalData?.photo_url || '';
      let comprovativoUrl = originalData?.payment_proof_url || '';
      let comprovativo2Url = originalData?.payment_proof_2_url || '';

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

      if (comprovativo2) {
        const fileExt = comprovativo2.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: comp2Data, error: comp2Error } = await supabase.storage
          .from('proofs')
          .upload(fileName, comprovativo2);
        if (comp2Error) throw comp2Error;
        comprovativo2Url = comp2Data.path;
      }

      if (editingId) {
        const { error: dbUpdateError } = await supabase
          .from('registrations')
          .update({
            name: formData.nome,
            phone: formData.telefone,
            entry_year: parseInt(formData.ano_ingresso),
            exit_year: parseInt(formData.ano_saida),
            photo_url: fotoUrl,
            payment_proof_url: comprovativoUrl,
            payment_proof_2_url: comprovativo2Url,
            generation: `G${formData.ano_saida.slice(-2)}`
          })
          .eq('id', editingId);
        if (dbUpdateError) throw dbUpdateError;
      } else {
        const { error: dbInsertError } = await supabase.from('registrations').insert([
          {
            name: formData.nome,
            phone: formData.telefone,
            entry_year: parseInt(formData.ano_ingresso),
            exit_year: parseInt(formData.ano_saida),
            photo_url: fotoUrl,
            payment_proof_url: comprovativoUrl,
            payment_proof_2_url: comprovativo2Url,
            status: 'pending',
            generation: `G${formData.ano_saida.slice(-2)}`
          },
        ]);
        if (dbInsertError) throw dbInsertError;
      }

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
        <h2 className="text-3xl font-bold mb-4">{editingId ? 'Inscrição Atualizada!' : 'Inscrição Enviada!'}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {editingId
            ? 'A sua edição foi guardada com sucesso. Continuaremos a validar o seu processo.'
            : 'Obrigado por se inscrever. A nossa equipa irá validar o seu comprovativo em breve.'}
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setEditingId(null);
            setOriginalData(null);
            setFormData({ nome: '', telefone: '', ano_ingresso: '', ano_saida: '' });
          }}
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold"
        >
          {editingId ? 'Voltar ao início' : 'Fazer outra inscrição'}
        </button>
      </div>
    );
  }

  if (isConsulting) {
    return (
      <section className="bg-white dark:bg-slate-900 py-16" id="inscricao">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-6">Consultar Inscrição</h2>
          <p className="text-slate-500 mb-8">Introduza o seu número de telefone para editar a sua inscrição pendente.</p>
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="Número de Telefone"
              className="w-full h-14 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
            <button
              onClick={handleConsult}
              disabled={loading}
              className="w-full h-14 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Consultar'}
            </button>
            <button
              onClick={() => setIsConsulting(false)}
              className="w-full text-slate-500 font-bold"
            >
              Voltar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 py-16" id="inscricao">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-slate-900 dark:text-white text-3xl font-black mb-3">
            {editingId ? 'Editar Inscrição' : 'Formulário de Inscrição'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {editingId
              ? 'Pode atualizar os seus dados ou adicionar o comprovativo da segunda prestação.'
              : 'Preencha os dados abaixo para garantir o seu lugar no evento.'}
          </p>
          {!editingId && (
            <button
              onClick={() => setIsConsulting(true)}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Já se inscreveu? Consulte/Edite aqui
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Foto de Perfil {editingId && '(Opcional)'}</label>
              <div className="relative flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:hover:border-primary transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center px-2">
                      {foto ? foto.name : (originalData?.photo_url ? 'Foto já enviada (v)' : 'JPG, PNG (Max. 2MB)')}
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">1º Comprovativo {editingId && '(Opcional)'}</label>
              <div className="relative flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:hover:border-primary transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center px-2">
                      {comprovativo ? comprovativo.name : (originalData?.payment_proof_url ? '1º já enviado (v)' : 'PDF, JPG (1ª Prest.)')}
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">2º Comprovativo (Opcional)</label>
              <div className="relative flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:hover:border-primary transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center px-2">
                      {comprovativo2 ? comprovativo2.name : (originalData?.payment_proof_2_url ? '2º já enviado (v)' : 'PDF, JPG (2ª Prest.)')}
                    </p>
                  </div>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setComprovativo2(e.target.files?.[0] || null)}
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
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingId ? 'Submeter Edição' : 'Submeter Inscrição')}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ nome: '', telefone: '', ano_ingresso: '', ano_saida: '' });
                setOriginalData(null);
              }}
              className="w-full text-slate-500 font-bold mt-2"
            >
              Cancelar Edição
            </button>
          )}
        </form>
      </div>
    </section>
  );
};
