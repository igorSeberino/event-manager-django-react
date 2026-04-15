import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  CalendarPlus,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarRange,
  ClipboardList,
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

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/events/?organizer=${user.id}`)
      .then((res) => {
        setEvents(res.data.results || res.data);
      })
      .catch(() => setError("Erro ao carregar eventos."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (eventId) => {
    setDeletingId(eventId);
    setFeedbackMsg(null);
    try {
      await api.delete(`/events/${eventId}/`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setFeedbackMsg({ type: "success", text: "Evento excluído com sucesso." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao excluir evento.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="meus-eventos" />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-10 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#F0FBFF] flex items-center gap-3">
              <CalendarRange className="text-[#2E94B9]" />
              Meus Eventos
            </h1>
            <p className="text-[#F0FBFF]/60 mt-1">
              Gerencie os eventos que você organizou
            </p>
          </div>
          <button
            onClick={() => navigate("/eventos/novo")}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2E94B9] to-[#1f7596] hover:from-[#1f7596] hover:to-[#2E94B9] text-[#F0FBFF] font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg border-t border-white/20 cursor-pointer"
          >
            <CalendarPlus size={18} /> Criar Evento
          </button>
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

        {loading && (
          <div className="text-center py-20 text-[#ACDCEE]">
            Carregando seus eventos...
          </div>
        )}

        {error && <div className="text-center py-20 text-red-400">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <CalendarRange
              size={48}
              className="mx-auto text-[#ACDCEE]/40 mb-4"
            />
            <p className="text-[#F0FBFF]/60 text-lg mb-4">
              Você ainda não criou nenhum evento.
            </p>
            <button
              onClick={() => navigate("/eventos/novo")}
              className="text-[#2E94B9] hover:text-[#ACDCEE] font-medium transition-colors cursor-pointer"
            >
              Criar seu primeiro evento
            </button>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="flex flex-col gap-4">
            {events.map((event) => {
              const statusCfg =
                STATUS_CONFIG[event.status] || STATUS_CONFIG.PENDING;
              const isPast = new Date(event.event_date) < new Date();

              return (
                <div
                  key={event.id}
                  className={`bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl rounded-2xl p-5 border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${isPast ? "opacity-60" : ""}`}
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
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0FBFF] bg-[#2E94B9]/30 px-2.5 py-1 rounded-md">
                            {event.category}
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0FBFF]/50 bg-white/5 px-2.5 py-1 rounded-md">
                            Encerrado
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => navigate(`/eventos/${event.id}`)}
                        className="text-lg font-bold text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors cursor-pointer truncate"
                      >
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#F0FBFF]/60">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#ACDCEE]" />
                          {formatDate(event.event_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#ACDCEE]" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#ACDCEE]" />
                          {event.capacity} vagas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {event.status === "APPROVED" && (
                        <button
                          onClick={() =>
                            navigate(`/eventos/${event.id}/inscricoes`)
                          }
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer text-[#ACDCEE]"
                        >
                          <ClipboardList size={14} /> Inscritos
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/eventos/${event.id}/editar`)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer text-[#ACDCEE]"
                      >
                        <Pencil size={14} /> Editar
                      </button>

                      {confirmDeleteId === event.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="px-3 py-2 text-xs font-medium bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === event.id ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer text-[#F0FBFF]/60"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(event.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all cursor-pointer text-red-400"
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
      </main>
    </div>
  );
}
