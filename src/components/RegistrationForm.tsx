import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, Download, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

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
  const [isPaidPass, setIsPaidPass] = useState(false);

  const handleConsult = async () => {
    if (!searchPhone) return;
    setLoading(true);
    setIsPaidPass(false);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('phone', searchPhone.replace(/\s/g, ''))
        .in('status', ['pending', 'paid'])
        .single();

      if (error || !data) {
        alert('Nenhuma inscrição encontrada para este número.');
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
      
      if (data.status === 'paid') {
        setIsPaidPass(true);
      } else {
        setIsConsulting(false);
      }
    } catch (error) {
      console.error('Error consulting registration:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPassPDF = () => {
    if (!originalData) return;
    
    const doc = new jsPDF() as any;
    
    // Pass container styling
    doc.setFillColor(37, 99, 235); // bg-primary
    doc.rect(20, 20, 170, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PASSE DE ACESSO', 105, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Evento Todas as Gerações ITEL', 105, 50, { align: 'center' });
    
    // Body styling
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(20, 60, 170, 100, 'F');
    // Border
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.rect(20, 20, 170, 140, 'D');

    // Content
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Nome:', 30, 80);
    doc.setFont(undefined, 'bold');
    doc.text(originalData.name, 30, 90);
    
    doc.setFont(undefined, 'normal');
    doc.text('Geração:', 30, 110);
    doc.setFont(undefined, 'bold');
    doc.text(originalData.generation, 30, 120);

    doc.setFont(undefined, 'normal');
    doc.text('Telefone:', 120, 110);
    doc.setFont(undefined, 'bold');
    doc.text(originalData.phone, 120, 120);

    // Validation badge
    doc.setFillColor(34, 197, 94); // green-500
    doc.roundedRect(30, 135, 150, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('PAGAMENTO VALIDADO - ACESSO PERMITIDO', 105, 144, { align: 'center' });

    // Footer
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(8);
    doc.text(`Gerado em ${new Date().toLocaleString()}`, 105, 170, { align: 'center' });
    doc.text('Por favor, apresente este passe na entrada do evento.', 105, 175, { align: 'center' });

    doc.save(`passe_itel_${originalData.name.replace(/\s+/g, '_')}.pdf`);
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
        <h2 className="text-3xl font-bold mb-4">{editingId && !isPaidPass ? 'Inscrição Atualizada!' : 'Inscrição Enviada!'}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {editingId && !isPaidPass
            ? 'A sua edição foi guardada com sucesso. Continuaremos a validar o seu processo.'
            : 'Obrigado por se inscrever. A nossa equipa irá validar o seu comprovativo em breve.'}
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setEditingId(null);
            setOriginalData(null);
            setIsPaidPass(false);
            setFormData({ nome: '', telefone: '', ano_ingresso: '', ano_saida: '' });
          }}
          className="bg-primary text-white px-8 py-3 rounded-lg font-bold"
        >
          {editingId && !isPaidPass ? 'Voltar ao início' : 'Fazer outra inscrição'}
        </button>
      </div>
    );
  }

  if (isConsulting && !isPaidPass) {
    return (
      <section className="bg-white dark:bg-slate-900 py-16" id="inscricao">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-6">Consultar Inscrição</h2>
          <p className="text-slate-500 mb-8">Introduza o seu número de telefone para editar a sua inscrição pendente ou ver o seu passe.</p>
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

  if (isPaidPass && originalData) {
    return (
      <section className="bg-white dark:bg-slate-900 py-16" id="pass">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-2">Acesso Garantido!</h2>
          <p className="text-slate-500 mb-8">O seu pagamento está validado. Apresente este passe na entrada do evento.</p>
          
          <div className="bg-gradient-to-br from-primary to-blue-800 rounded-3xl p-1 shadow-2xl shadow-primary/30 mb-8 mt-4 mx-auto max-w-sm">
            <div className="bg-white dark:bg-slate-900 rounded-[22px] overflow-hidden">
              <div className="bg-primary p-6 text-white text-center">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-2xl font-black tracking-tight uppercase">Passe de Acesso</h3>
                <p className="text-blue-100 text-sm opacity-80 mt-1">Gerações ITEL</p>
              </div>
              
              <div className="p-8 space-y-6 text-left relative">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-primary/10 to-transparent"></div>
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-900 rounded-full"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-900 rounded-full"></div>
                
                <div className="border-b border-dashed border-slate-200 dark:border-slate-700 pb-6 border-b-2 relative z-10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                  <p className="text-xl font-bold dark:text-white">{originalData.name}</p>
                </div>
                
                <div className="flex justify-between items-center relative z-10 pt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Geração</p>
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-lg">
                      {originalData.generation}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                    <p className="text-lg font-bold dark:text-white">{originalData.phone}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 rounded-xl flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 relative z-10 border border-green-100 dark:border-green-900/50">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="font-bold text-sm tracking-wide">PAGAMENTO VALIDADO</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={downloadPassPDF}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Descarregar Passe (PDF)
            </button>
            <button
              onClick={() => {
                setIsPaidPass(false);
                setEditingId(null);
                setOriginalData(null);
                setIsConsulting(false);
                setSearchPhone('');
              }}
              className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Voltar ao Início
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
