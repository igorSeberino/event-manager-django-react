import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Clock,
} from "lucide-react";

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

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}/`),
      api.get(`/registrations/?event=${id}`),
    ])
      .then(([eventRes, regsRes]) => {
        setEvent(eventRes.data);
        setRegistrations(regsRes.data.results || regsRes.data);
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleCheckIn = async (reg) => {
    setTogglingId(reg.id);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/registrations/${reg.id}/`, {
        check_in: !reg.check_in,
      });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === reg.id ? { ...r, check_in: res.data.check_in } : r,
        ),
      );
      setFeedbackMsg({
        type: "success",
        text: res.data.check_in
          ? `Check-in de ${reg.user_name} realizado!`
          : `Check-in de ${reg.user_name} desfeito.`,
      });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao atualizar check-in.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setTogglingId(null);
    }
  };

  const checkedInCount = registrations.filter((r) => r.check_in).length;

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="meus-eventos" />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 lg:px-8">
        <button
          onClick={() => navigate("/meus-eventos")}
          className="flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar aos meus eventos
        </button>

        {loading && (
          <div className="text-center py-20 text-[#ACDCEE]">
            Carregando inscrições...
          </div>
        )}

        {error && <div className="text-center py-20 text-red-400">{error}</div>}

        {!loading && !error && event && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#F0FBFF] mb-1">
                Inscrições — {event.title}
              </h1>
              <p className="text-[#F0FBFF]/50 text-sm">
                {formatDate(event.event_date)} · {event.location}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Users size={20} className="mx-auto text-[#ACDCEE] mb-2" />
                <p className="text-2xl font-bold">{registrations.length}</p>
                <p className="text-xs text-[#F0FBFF]/50">Inscritos</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <UserCheck
                  size={20}
                  className="mx-auto text-emerald-400 mb-2"
                />
                <p className="text-2xl font-bold">{checkedInCount}</p>
                <p className="text-xs text-[#F0FBFF]/50">Check-ins</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hidden sm:block">
                <Users size={20} className="mx-auto text-amber-400 mb-2" />
                <p className="text-2xl font-bold">{event.capacity}</p>
                <p className="text-xs text-[#F0FBFF]/50">Capacidade</p>
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

            {registrations.length === 0 ? (
              <div className="text-center py-16">
                <Users size={48} className="mx-auto text-[#ACDCEE]/30 mb-4" />
                <p className="text-[#F0FBFF]/50">Nenhuma inscrição ainda.</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-2xl border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold text-[#F0FBFF]/40 uppercase tracking-wider border-b border-white/5">
                  <span>Participante</span>
                  <span>Inscrito em</span>
                  <span>Status</span>
                  <span>Ação</span>
                </div>

                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#ACDCEE]/50 uppercase">
                          {(reg.user_name || "P").charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#F0FBFF]/80 truncate">
                        {reg.user_name || "Participante"}
                      </span>
                    </div>

                    <span className="text-xs text-[#F0FBFF]/40 flex items-center gap-1.5">
                      <Clock size={12} className="hidden sm:inline" />
                      {formatDate(reg.registered_at)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border w-fit ${
                        reg.check_in
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${reg.check_in ? "bg-emerald-400" : "bg-amber-400"}`}
                      ></span>
                      {reg.check_in ? "Presente" : "Aguardando"}
                    </span>

                    <button
                      onClick={() => toggleCheckIn(reg)}
                      disabled={togglingId === reg.id}
                      className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all cursor-pointer disabled:opacity-50 w-fit ${
                        reg.check_in
                          ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      {togglingId === reg.id
                        ? "..."
                        : reg.check_in
                          ? "Desfazer"
                          : "Check-in"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
