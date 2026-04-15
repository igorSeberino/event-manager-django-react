import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  Bookmark,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trash2,
  AlertCircle,
} from "lucide-react";

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const TABS = [
  { key: "all", label: "Todas" },
  { key: "upcoming", label: "Próximos" },
  { key: "past", label: "Encerrados" },
];

export default function MinhasInscricoes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    Promise.all([
      api.get(`/registrations/?user=${user.id}`),
      api.get("/events/"),
    ])
      .then(([regRes, evtRes]) => {
        const regs = regRes.data.results || regRes.data;
        const evts = evtRes.data.results || evtRes.data;

        const eventMap = Object.fromEntries(evts.map((e) => [e.id, e]));

        const myRegistrations = regs.map((r) => ({
          ...r,
          eventData: eventMap[r.event] || null,
        }));

        setItems(myRegistrations);
      })
      .catch(() => setError("Não foi possível carregar suas inscrições."))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancelRegistration = async (regId, e) => {
    e.stopPropagation();
    setCancellingId(regId);
    setFeedbackMsg(null);
    try {
      await api.delete(`/registrations/${regId}/`);
      setItems((prev) => prev.filter((item) => item.id !== regId));
      setFeedbackMsg({
        type: "success",
        text: "Inscrição cancelada com sucesso.",
      });
    } catch {
      setFeedbackMsg({ type: "error", text: "Erro ao cancelar inscrição." });
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    const eventDate = item.eventData?.event_date
      ? new Date(item.eventData.event_date)
      : null;
    if (activeTab === "upcoming") return eventDate && eventDate >= now;
    if (activeTab === "past") return eventDate && eventDate < now;
    return true;
  });

  const stats = {
    total: items.length,
    upcoming: items.filter(
      (i) => i.eventData?.event_date && new Date(i.eventData.event_date) >= now,
    ).length,
    checkedIn: items.filter((i) => i.check_in).length,
  };

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage={null} />

      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-4 py-10 md:py-14 lg:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark size={28} className="text-[#2E94B9]" />
          <h2 className="text-3xl font-extrabold text-[#F0FBFF] tracking-tight">
            Minhas Inscrições
          </h2>
        </div>

        {/* Feedback */}
        {feedbackMsg && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
              feedbackMsg.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
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

        {/* Stats */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-[#ACDCEE]">
                {stats.total}
              </p>
              <p className="text-xs text-[#F0FBFF]/50 font-medium uppercase tracking-wider mt-1">
                Total
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-[#2E94B9]">
                {stats.upcoming}
              </p>
              <p className="text-xs text-[#F0FBFF]/50 font-medium uppercase tracking-wider mt-1">
                Próximos
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold text-green-400">
                {stats.checkedIn}
              </p>
              <p className="text-xs text-[#F0FBFF]/50 font-medium uppercase tracking-wider mt-1">
                Check-ins
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && items.length > 0 && (
          <div className="flex gap-2 mb-8 bg-white/5 border border-white/10 rounded-xl p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#2E94B9] text-[#F0FBFF] shadow-md"
                    : "text-[#F0FBFF]/60 hover:text-[#F0FBFF] hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#2E94B9]/30 border-t-[#ACDCEE] rounded-full animate-spin mb-4"></div>
            <p className="text-[#ACDCEE] font-medium animate-pulse">
              Carregando suas inscrições...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 text-center flex flex-col items-center">
            <Calendar size={48} className="text-[#ACDCEE]/40 mb-4" />
            <h3 className="text-xl font-bold text-[#F0FBFF] mb-2">
              Nenhuma inscrição encontrada
            </h3>
            <p className="text-[#F0FBFF]/60 mb-6">
              Você ainda não se inscreveu em nenhum evento.
            </p>
            <button
              onClick={() => navigate("/eventos")}
              className="flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Explorar eventos <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          items.length > 0 &&
          filteredItems.length === 0 && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 text-center">
              <p className="text-[#F0FBFF]/60">
                Nenhuma inscrição nesta categoria.
              </p>
            </div>
          )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredItems.map((item) => {
              const evt = item.eventData;
              const isPast = evt?.event_date && new Date(evt.event_date) < now;
              const isCancelling = cancellingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => evt && navigate(`/eventos/${evt.id}`)}
                  className="group bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl rounded-2xl p-5 border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(46,148,185,0.15)] hover:bg-white/15 transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2E94B9]/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                  {/* Check-in status */}
                  <div className="relative z-10 flex-shrink-0">
                    {item.check_in ? (
                      <div className="flex items-center gap-1.5 text-green-300 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle size={18} /> Check-in realizado
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#ACDCEE]/70 text-xs font-bold uppercase tracking-wider">
                        <XCircle size={18} /> Aguardando check-in
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 flex-grow">
                    <h4 className="text-lg font-bold text-[#F0FBFF] group-hover:text-[#ACDCEE] transition-colors mb-2 leading-snug">
                      {evt?.title || "Evento indisponível"}
                    </h4>

                    <div className="flex flex-wrap gap-4 text-[#F0FBFF]/70 text-xs font-medium">
                      {evt?.event_date && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#ACDCEE]" />
                          <span>{formatDateTime(evt.event_date)}</span>
                        </div>
                      )}
                      {evt?.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#ACDCEE]" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      {evt?.category && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#ACDCEE]/60 bg-white/5 px-2 py-0.5 rounded-full">
                          {evt.category}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex-shrink-0 flex flex-col items-end gap-2">
                    {isPast && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Encerrado
                      </span>
                    )}
                    <span className="text-[10px] text-[#F0FBFF]/40">
                      Inscrito em{" "}
                      {new Date(item.registered_at).toLocaleDateString("pt-BR")}
                    </span>
                    {!isPast && !item.check_in && (
                      <button
                        onClick={(e) => handleCancelRegistration(item.id, e)}
                        disabled={isCancelling}
                        className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50 mt-1"
                        title="Cancelar inscrição"
                      >
                        <Trash2 size={14} />
                        {isCancelling ? "Cancelando..." : "Cancelar"}
                      </button>
                    )}
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
