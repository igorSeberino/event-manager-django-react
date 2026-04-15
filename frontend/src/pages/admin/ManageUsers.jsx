import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";

const ROLE_CONFIG = {
  USER: {
    label: "Usuário",
    color: "bg-white/10 text-[#F0FBFF]/60 border-white/20",
  },
  ORGANIZER: {
    label: "Organizador",
    color: "bg-[#2E94B9]/10 text-[#2E94B9] border-[#2E94B9]/30",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

const TABS = [
  { key: "all", label: "Todos" },
  { key: "USER", label: "Usuários" },
  { key: "ORGANIZER", label: "Organizadores" },
  { key: "ADMIN", label: "Admins" },
];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    api
      .get("/users/")
      .then((res) => setUsers(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (userId, role) => {
    setActionId(userId);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/users/${userId}/`, { role });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u)),
      );
      setFeedbackMsg({
        type: "success",
        text: `Role alterado para ${ROLE_CONFIG[role].label}.`,
      });
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Erro ao alterar role.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionId(userId);
    setFeedbackMsg(null);
    try {
      await api.delete(`/users/${userId}/`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedbackMsg({ type: "success", text: "Usuário excluído." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao excluir usuário.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionId(null);
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter((u) => {
    if (activeTab !== "all" && u.role !== activeTab) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !u.name?.toLowerCase().includes(term) &&
        !u.email?.toLowerCase().includes(term)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="admin" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-52 flex-shrink-0">
            <AdminSidebar activeSection="usuarios" />
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Usuários</h1>
            <p className="text-[#F0FBFF]/50 mb-6">
              Altere roles e gerencie contas
            </p>

            {/* Search + Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/50"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-[#F0FBFF] placeholder-[#F0FBFF]/40 focus:outline-none focus:border-[#2E94B9]/50 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? "bg-[#2E94B9]/20 text-[#ACDCEE] border-[#2E94B9]/30"
                        : "bg-white/5 text-[#F0FBFF]/50 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {feedbackMsg && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {feedbackMsg.text}
              </div>
            )}

            {loading ? (
              <div className="text-center py-20 text-[#ACDCEE]">
                Carregando usuários...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-[#F0FBFF]/50">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((u) => {
                  const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.USER;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <div
                      key={u.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-[#ACDCEE]/50 uppercase">
                              {(u.name || "U").charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">
                                {u.name}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-[#ACDCEE]/50 bg-[#ACDCEE]/10 px-1.5 py-0.5 rounded">
                                  você
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-[#F0FBFF]/40 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail size={11} /> {u.email}
                              </span>
                              {u.created_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />{" "}
                                  {formatDate(u.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          {/* Role selector */}
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            disabled={isSelf || actionId === u.id}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg border appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-transparent ${roleCfg.color}`}
                          >
                            <option value="USER" className="bg-[#475053]">
                              Usuário
                            </option>
                            <option value="ORGANIZER" className="bg-[#475053]">
                              Organizador
                            </option>
                            <option value="ADMIN" className="bg-[#475053]">
                              Admin
                            </option>
                          </select>

                          {confirmDelete === u.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(u.id)}
                                disabled={actionId === u.id}
                                className="px-3 py-2 text-xs font-medium bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer text-[#F0FBFF]/50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              disabled={isSelf}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all cursor-pointer text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
