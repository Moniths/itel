import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Clock, GraduationCap, Search, Download, FileText, CheckCircle, XCircle, Eye, Trash2, X, Bell, Newspaper, Camera, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Registration {
  id: string;
  name: string;
  phone: string;
  entry_year: number;
  exit_year: number;
  photo_url: string;
  payment_proof_url: string;
  status: 'pending' | 'paid' | 'unpaid';
  generation: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
}

interface Reminder {
  id: string;
  message: string;
  remind_at: string;
  created_at: string;
}

export const AdminDashboard = () => {
  interface GalleryItem {
    id: string;
    image_url: string;
    created_at: string;
  }

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGen, setFilterGen] = useState('All');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'registrations' | 'feed' | 'reminders' | 'gallery'>('registrations');

  // States for new entries
  const [newPost, setNewPost] = useState('');
  const [newReminder, setNewReminder] = useState({ message: '', date: '' });
  const [newGalleryImage, setNewGalleryImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
    fetchPosts();
    fetchReminders();
    fetchGallery();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const fetchReminders = async () => {
    const { data } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
    setReminders(data || []);
  };

  const fetchGallery = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setGallery(data || []);
  };

  const savePost = async () => {
    if (!newPost.trim()) return;
    const { error } = await supabase.from('posts').insert([{ content: newPost }]);
    if (error) alert(error.message);
    else {
      setNewPost('');
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta publicação?')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts(); // Corrected from fetchReminders()
  };

  const saveGalleryImage = async () => {
    if (!newGalleryImage) return;
    setUploadingImage(true);
    try {
      const fileExt = newGalleryImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, newGalleryImage);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('gallery').insert([{
        image_url: uploadData.path
      }]);

      if (dbError) throw dbError;

      setNewGalleryImage(null);
      fetchGallery();
    } catch (error: any) {
      alert('Erro ao carregar imagem: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteGalleryImage = async (id: string, path: string) => {
    if (!confirm('Tem certeza que deseja apagar esta imagem?')) return;
    try {
      await supabase.storage.from('gallery').remove([path]);
      await supabase.from('gallery').delete().eq('id', id);
      fetchGallery();
    } catch (error: any) {
      alert('Erro ao apagar imagem: ' + error.message);
    }
  };

  const saveReminder = async () => {
    if (!newReminder.message.trim() || !newReminder.date) return;
    const { error } = await supabase.from('reminders').insert([{
      message: newReminder.message,
      remind_at: new Date(newReminder.date).toISOString()
    }]);
    if (error) alert(error.message);
    else {
      setNewReminder({ message: '', date: '' });
      fetchReminders();
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este lembrete?')) return;
    await supabase.from('reminders').delete().eq('id', id);
    fetchReminders();
  };

  const sendBroadcastSMS = async (message: string) => {
    const paidRegistrations = registrations.filter(r => r.status === 'paid');
    if (paidRegistrations.length === 0) {
      alert('Não há participantes com status Pago para enviar SMS.');
      return;
    }

    if (!confirm(`Deseja enviar este SMS para ${paidRegistrations.length} participantes pagos?`)) return;

    let successCount = 0;
    for (const reg of paidRegistrations) {
      const authId = '627915097680715652';
      const secretKey = 'r0HwbKF80OiS0yd2AJs8Jwi4kjJhbK7Rl5TYZeGvTQ0KmZzWWPJda9cbD13j2uBCJAO8RmtnB9H4dwJCx96SvL3j9MWKS5aRCNzU';
      const from = 'ITEListas';
      const cleanPhone = reg.phone.replace(/\s/g, '');
      const url = `https://app.smshubangola.com/api/sendsms?to=${cleanPhone}&message=${encodeURIComponent(message)}&auth_id=${authId}&secret_key=${secretKey}&from=${from}`;

      try {
        await fetch(url);
        successCount++;
      } catch (e) {
        console.error('Error sending broadcast SMS to', reg.phone, e);
      }
    }
    alert(`Broadcast finalizado. ${successCount} SMS enviados com sucesso.`);
  };

  const sendSMS = async (name: string, phone: string) => {
    const authId = '627915097680715652';
    const secretKey = 'r0HwbKF80OiS0yd2AJs8Jwi4kjJhbK7Rl5TYZeGvTQ0KmZzWWPJda9cbD13j2uBCJAO8RmtnB9H4dwJCx96SvL3j9MWKS5aRCNzU';
    const from = 'ITEListas';
    const message = `Ola ${name}, a sua inscricao para o Evento Todas as Geracoes ITEL foi confirmada com sucesso. Bem-vindo!`;

    const cleanPhone = phone.replace(/\s/g, '');

    const url = `https://app.smshubangola.com/api/sendsms?to=${cleanPhone}&message=${encodeURIComponent(message)}&auth_id=${authId}&secret_key=${secretKey}&from=${from}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log('SMS Hub Response:', result);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const updateStatus = async (id: string, status: 'paid' | 'unpaid') => {
    const registration = registrations.find(r => r.id === id);

    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      if (status === 'paid' && registration) {
        sendSMS(registration.name, registration.phone);
      }
      fetchRegistrations();
    }
  };

  const deleteRegistration = async (id: string) => {
    const password = prompt('Para apagar este registo, insira a senha de administrador:');

    if (password === 'ADMitel2026') {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao apagar registo: ' + error.message);
      } else {
        fetchRegistrations();
      }
    } else if (password !== null) {
      alert('Senha incorreta. Operação cancelada.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Telefone', 'Geração', 'Ano Ingresso', 'Ano Saída', 'Estado', 'Data Inscrição'];
    const data = filteredRegistrations.map(reg => [
      reg.name,
      reg.phone,
      reg.generation,
      reg.entry_year,
      reg.exit_year,
      reg.status === 'paid' ? 'Pago' : reg.status === 'pending' ? 'Pendente' : 'Não Pago',
      new Date(reg.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...data].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscritos_itel_2026_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    doc.text('Lista de Inscritos - Evento Todas as Gerações ITEL 2026', 14, 15);

    const tableColumn = ['Nome', 'Telefone', 'Geração', 'Estado', 'Data'];
    const tableRows = filteredRegistrations.map(reg => [
      reg.name,
      reg.phone,
      reg.generation,
      reg.status === 'paid' ? 'Pago' : reg.status === 'pending' ? 'Pendente' : 'Não Pago',
      new Date(reg.created_at).toLocaleString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`inscritos_itel_2026_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const getFileUrl = (bucket: string, path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.generation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGen = filterGen === 'All' || reg.generation === filterGen;
    return matchesSearch && matchesGen;
  });

  const stats = {
    total: registrations.length,
    paid: registrations.filter(r => r.status === 'paid').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    generations: new Set(registrations.map(r => r.generation)).size
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users />} label="Total de Inscritos" value={stats.total} trend="+12%" color="primary" />
        <StatCard icon={<CreditCard />} label="Total Pagos" value={stats.paid} trend="+8%" color="green" />
        <StatCard icon={<Clock />} label="Comprovativos Pendentes" value={stats.pending} trend="Pendente" color="orange" />
        <StatCard icon={<GraduationCap />} label="Gerações Ativas" value={stats.generations} trend="Ativo" color="purple" />
      </div>
      <div className="flex overflow-x-auto gap-3 mb-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center no-scrollbar">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'registrations' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
        >
          <Users className="w-5 h-5" />
          Participantes
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
        >
          <Newspaper className="w-5 h-5" />
          Feed de Notícias
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'reminders' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
        >
          <Bell className="w-5 h-5" />
          Lembretes
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'gallery' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}
        >
          <Camera className="w-5 h-5" />
          Galeria
        </button>
      </div>

      {activeTab === 'registrations' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Gestão de Participantes</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Visualize e gira todas as inscrições do evento</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Pesquisar por nome ou geração (ex: G19)..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm py-2 pl-3 pr-8"
                  value={filterGen}
                  onChange={(e) => setFilterGen(e.target.value)}
                >
                  <option value="All">Todas as Gerações</option>
                  {Array.from(new Set(registrations.map(r => r.generation))).sort().map(gen => (
                    <option key={gen} value={gen}>{gen}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">Geração</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Data de Inscrição</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">A carregar inscrições...</td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Nenhuma inscrição encontrada.</td>
                  </tr>
                ) : filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                          {reg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{reg.name}</p>
                          <p className="text-xs text-slate-500">{reg.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">
                        {reg.generation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center gap-1.5 font-medium ${reg.status === 'paid' ? 'text-green-600' :
                        reg.status === 'pending' ? 'text-orange-600' : 'text-slate-400'
                        }`}>
                        <span className={`size-1.5 rounded-full ${reg.status === 'paid' ? 'bg-green-500' :
                          reg.status === 'pending' ? 'bg-orange-500' : 'bg-slate-400'
                          }`}></span>
                        {reg.status === 'paid' ? 'Pago' : reg.status === 'pending' ? 'Pendente' : 'Não Pago'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(reg.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReg(reg);
                            setShowDetailModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium text-sm px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Detalhes
                        </button>
                        <div className="flex gap-1 border-l border-slate-200 dark:border-slate-800 pl-2 ml-1">
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(reg.id, 'paid')}
                                className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                                title="Marcar como Pago"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateStatus(reg.id, 'unpaid')}
                                className="text-orange-600 hover:text-orange-700 p-1 hover:bg-orange-50 rounded"
                                title="Marcar como Não Pago"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteRegistration(reg.id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            title="Apagar Registo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {
        activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Criar Nova Publicação</h2>
              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary min-h-[120px]"
                placeholder="Escreva o conteúdo da publicação que aparecerá no feed da página inicial..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <button
                onClick={savePost}
                className="mt-4 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Publicar no Feed
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">Publicações Ativas</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.length === 0 ? (
                  <p className="p-10 text-center text-slate-500">Nenhuma publicação encontrada.</p>
                ) : posts.map(post => (
                  <div key={post.id} className="p-6 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-primary uppercase mb-1">{new Date(post.created_at).toLocaleString()}</p>
                      <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Criar Lembrete / Alerta</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data do Evento/Alerta</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mensagem do Alerta</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Ex: Faltam 2 dias para o grande evento! Garanta que tem o seu código QR pronto."
                    value={newReminder.message}
                    onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={saveReminder}
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-colors"
                >
                  Guardar Lembrete
                </button>
                <button
                  onClick={() => sendBroadcastSMS(newReminder.message)}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Enviar SMS para Todos os Pagos
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold">Histórico de Lembretes</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reminders.length === 0 ? (
                  <p className="p-10 text-center text-slate-500">Nenhum lembrete registado.</p>
                ) : reminders.map(rem => (
                  <div key={rem.id} className="p-6 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">DATA: {new Date(rem.remind_at).toLocaleString()}</p>
                      <p className="text-slate-700 dark:text-slate-300">{rem.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => sendBroadcastSMS(rem.message)}
                        className="text-primary hover:bg-primary/5 p-2 rounded-lg"
                        title="Reenviar SMS"
                      >
                        <Bell className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <h2 className="text-xl font-bold mb-2">Gestão de Galeria</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-widest opacity-60">Adicione imagens de eventos passados para o carrossel</p>

              <div className="max-w-md mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 font-semibold italic">
                      {newGalleryImage ? newGalleryImage.name : 'Clique para selecionar uma imagem'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setNewGalleryImage(e.target.files?.[0] || null)}
                  />
                </label>

                <button
                  disabled={!newGalleryImage || uploadingImage}
                  onClick={saveGalleryImage}
                  className="mt-6 w-full bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  Carregar para o Evento
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Imagens Ativas ({gallery.length})</h2>
                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">{gallery.length}</div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 italic font-medium">Nenhuma imagem na galeria ainda.</div>
                ) : gallery.map(item => (
                  <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800">
                    <img
                      src={getFileUrl('gallery', item.image_url) || ''}
                      alt="Evento"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => deleteGalleryImage(item.id, item.image_url)}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all hover:scale-110 active:scale-90 shadow-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Detail Modal */}
      {
        showDetailModal && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Detalhes da Inscrição</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</p>
                      <p className="text-lg font-semibold">{selectedReg.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telefone</p>
                      <p className="text-lg font-semibold">{selectedReg.phone}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ano Ingresso</p>
                        <p className="text-lg font-semibold">{selectedReg.entry_year}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ano Saída</p>
                        <p className="text-lg font-semibold">{selectedReg.exit_year}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Geração</p>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
                        {selectedReg.generation}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <p className={`font-bold ${selectedReg.status === 'paid' ? 'text-green-500' :
                        selectedReg.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                        {selectedReg.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foto de Perfil</p>
                      {selectedReg.photo_url ? (
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <img
                            src={getFileUrl('photos', selectedReg.photo_url) || ''}
                            alt="Foto Perfil"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 italic text-sm">
                          Nenhuma foto enviada
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comprovativo de Pagamento</p>
                      {selectedReg.payment_proof_url ? (
                        <a
                          href={getFileUrl('proofs', selectedReg.payment_proof_url) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors group"
                        >
                          <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-sm">Ver Comprovativo</p>
                            <p className="text-[10px] opacity-70">Clique para abrir em nova aba</p>
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 italic text-sm text-center">
                          Nenhum comprovativo enviado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </main >
  );
};

const StatCard = ({ icon, label, value, trend, color }: any) => {
  const colorClasses: any = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'text-green-600 bg-green-100' : 'text-slate-500 bg-slate-100'
          }`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
};
