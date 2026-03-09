import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Clock, GraduationCap, Search, Download, FileText, CheckCircle, XCircle, Eye, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

export const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGen, setFilterGen] = useState('All');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

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

  const updateStatus = async (id: string, status: 'paid' | 'unpaid') => {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
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
        <StatCard icon={<Users />} label="Total Registrants" value={stats.total} trend="+12%" color="primary" />
        <StatCard icon={<CreditCard />} label="Total Paid" value={stats.paid} trend="+8%" color="green" />
        <StatCard icon={<Clock />} label="Pending Proofs" value={stats.pending} trend="Pending" color="orange" />
        <StatCard icon={<GraduationCap />} label="Active Generations" value={stats.generations} trend="Active" color="purple" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Participant Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all event registrations</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Search by name or generation (e.g. G19)..."
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
                <option value="All">All Generations</option>
                {Array.from(new Set(registrations.map(r => r.generation))).sort().map(gen => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Generation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading registrations...</td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No registrations found.</td>
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
                      {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(reg.created_at).toLocaleDateString()}
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

      {/* Detail Modal */}
      {showDetailModal && selectedReg && (
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
      )}
    </main>
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
