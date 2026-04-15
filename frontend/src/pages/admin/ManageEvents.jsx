import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  Eye,
  Clock,
  MapPin,
  User,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendente",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  APPROVED: {
    label: "Aprovado",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    label: "Rejeitado",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
};

const TABS = [
  { key: "all", label: "Todos" },
  { key: "PENDING", label: "Pendentes" },
  { key: "APPROVED", label: "Aprovados" },
  { key: "REJECTED", label: "Rejeitados" },
];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    api
      .get("/events/")
      .then((res) => setEvents(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (eventId, status) => {
    setActionId(eventId);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/events/${eventId}/`, { status });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: res.data.status } : e,
        ),
      );
      setFeedbackMsg({
        type: "success",
        text: `Evento ${status === "APPROVED" ? "aprovado" : "rejeitado"} com sucesso.`,
      });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao atualizar status.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (eventId) => {
    setActionId(eventId);
    setFeedbackMsg(null);
    try {
      await api.delete(`/events/${eventId}/`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setFeedbackMsg({ type: "success", text: "Evento excluído." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao excluir evento.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setActionId(null);
      setConfirmDelete(null);
    }
  };

  const filtered = events.filter((e) => {
    if (activeTab !== "all" && e.status !== activeTab) return false;
    if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
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
            <AdminSidebar activeSection="eventos" />
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Eventos</h1>
            <p className="text-[#F0FBFF]/50 mb-6">
              Aprove, rejeite ou exclua eventos
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
                  placeholder="Buscar por título..."
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
                Carregando eventos...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-[#F0FBFF]/50">
                Nenhum evento encontrado.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((event) => {
                  const statusCfg =
                    STATUS_CONFIG[event.status] || STATUS_CONFIG.PENDING;
                  return (
                    <div
                      key={event.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusCfg.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                              ></span>
                              {statusCfg.label}
                            </span>
                            {event.category && (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0FBFF]/50 bg-white/5 px-2.5 py-1 rounded-md">
                                {event.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold truncate mb-1">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-xs text-[#F0FBFF]/45">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(event.event_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {event.organizer}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={() => navigate(`/eventos/${event.id}`)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer text-[#ACDCEE]"
                          >
                            <Eye size={14} /> Ver
                          </button>

                          {event.status !== "APPROVED" && (
                            <button
                              onClick={() => updateStatus(event.id, "APPROVED")}
                              disabled={actionId === event.id}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all cursor-pointer text-emerald-400 disabled:opacity-50"
                            >
                              <CheckCircle size={14} /> Aprovar
                            </button>
                          )}

                          {event.status !== "REJECTED" && (
                            <button
                              onClick={() => updateStatus(event.id, "REJECTED")}
                              disabled={actionId === event.id}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-all cursor-pointer text-amber-400 disabled:opacity-50"
                            >
                              <XCircle size={14} /> Rejeitar
                            </button>
                          )}

                          {confirmDelete === event.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(event.id)}
                                disabled={actionId === event.id}
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
                              onClick={() => setConfirmDelete(event.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all cursor-pointer text-red-400"
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
