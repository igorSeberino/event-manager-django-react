import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  MapPin,
  Clock,
  Users,
  Tag,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  Check,
  Pencil,
  ClipboardList,
} from "lucide-react";

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STATUS_CONFIG = {
  APPROVED: {
    label: "Ativo",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  PENDING: { label: "Pendente", color: "text-amber-400", dot: "bg-amber-400" },
  REJECTED: { label: "Encerrado", color: "text-red-400", dot: "bg-red-400" },
};

export default function EventoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [registrations, setRegistrations] = useState([]);
  const [registrationId, setRegistrationId] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    const fetchEvent = api.get(`/events/${id}/`);
    const fetchEventRegistrations = api.get(`/registrations/?event=${id}`);
    const fetchMyRegistrations = user
      ? api.get(`/registrations/?user=${user.id}`)
      : Promise.resolve(null);

    Promise.all([fetchEvent, fetchEventRegistrations, fetchMyRegistrations])
      .then(([eventRes, eventRegsRes, myRegsRes]) => {
        setEvent(eventRes.data);
        const eventRegs = eventRegsRes.data.results || eventRegsRes.data;
        setRegistrations(eventRegs);
        if (myRegsRes) {
          const myRegs = myRegsRes.data.results || myRegsRes.data;
          const existing = myRegs.find((r) => r.event === id);
          if (existing) setRegistrationId(existing.id);
        }
      })
      .catch(() => setError("Não foi possível carregar o evento."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleRegister = async () => {
    setRegistering(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post("/registrations/", { event: id });
      setRegistrationId(res.data.id);
      setRegistrations((prev) => [...prev, res.data]);
      setFeedbackMsg({
        type: "success",
        text: "Inscrição realizada com sucesso!",
      });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.event?.[0] ||
        "Erro ao realizar inscrição.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setRegistering(true);
    setFeedbackMsg(null);
    try {
      await api.delete(`/registrations/${registrationId}/`);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      setRegistrationId(null);
      setFeedbackMsg({ type: "success", text: "Inscrição cancelada." });
    } catch {
      setFeedbackMsg({ type: "error", text: "Erro ao cancelar inscrição." });
    } finally {
      setRegistering(false);
    }
  };

  const isPast = event?.event_date && new Date(event.event_date) < new Date();
  const canRegister = user && event?.status === "APPROVED" && !isPast;
  const registeredCount = registrations.length;
  const spotsLeft = event ? event.capacity - registeredCount : 0;
  const occupancyPercent = event
    ? Math.min((registeredCount / event.capacity) * 100, 100)
    : 0;
  const statusConfig = event
    ? STATUS_CONFIG[event.status] || STATUS_CONFIG.PENDING
    : STATUS_CONFIG.PENDING;

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      <div className="fixed top-[-20%] left-[-15%] w-[600px] h-[600px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[200px] opacity-25 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-15%] w-[600px] h-[600px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[200px] opacity-15 z-0 pointer-events-none"></div>

      <Navbar activePage="eventos" />

      <main className="relative z-10 flex-grow max-w-3xl mx-auto px-4 py-10 md:py-14 lg:px-8 w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-white/[0.08] border-t-[#ACDCEE] rounded-full animate-spin mb-5"></div>
            <p className="text-[#F0FBFF]/40 text-sm font-medium">
              Carregando evento...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/[0.06] border border-red-500/[0.12] rounded-2xl p-8 text-center text-red-300/80 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && event && (
          <>
            {/* Navigation */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[#F0FBFF]/30 hover:text-[#ACDCEE] text-sm font-medium transition-colors duration-200 mb-10 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Voltar para eventos
            </button>

            {/* Status + Category badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${statusConfig.color} tracking-wide`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                ></span>
                {statusConfig.label}
              </span>
              {event.category && (
                <>
                  <span className="text-[#F0FBFF]/15">·</span>
                  <span className="text-[11px] font-semibold text-[#F0FBFF]/40 tracking-wide">
                    {event.category}
                  </span>
                </>
              )}
              {event.subcategory && (
                <>
                  <span className="text-[#F0FBFF]/15">·</span>
                  <span className="text-[11px] font-semibold text-[#F0FBFF]/40 tracking-wide">
                    {event.subcategory}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#F0FBFF] leading-[1.15] tracking-tight mb-8">
              {event.title}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#F0FBFF]/55 mb-10">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#ACDCEE]/40" />
                <span>{formatDateTime(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#ACDCEE]/40" />
                <span>{event.location || "Local a definir"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={15} className="text-[#ACDCEE]/40" />
                <span>{event.organizer}</span>
              </div>
            </div>

            {/* Organizer / Admin actions */}
            {user &&
              (user.role === "ADMIN" || event.organizer === user.name) && (
                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={() => navigate(`/eventos/${id}/editar`)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer text-[#ACDCEE]"
                  >
                    <Pencil size={15} /> Editar Evento
                  </button>
                  <button
                    onClick={() => navigate(`/eventos/${id}/inscricoes`)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer text-[#ACDCEE]"
                  >
                    <ClipboardList size={15} /> Gerenciar Inscritos
                  </button>
                </div>
              )}

            {/* Registration CTA + capacity — prominent section */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-5 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Capacity info */}
                <div className="flex-grow">
                  <div className="flex items-baseline gap-2 mb-2.5">
                    <span className="text-2xl font-bold text-[#F0FBFF]">
                      {registeredCount}
                    </span>
                    <span className="text-sm text-[#F0FBFF]/25 font-medium">
                      / {event.capacity} inscritos
                    </span>
                    {spotsLeft > 0 ? (
                      <span className="text-[11px] text-[#ACDCEE]/50 font-medium ml-1">
                        — {spotsLeft} vaga{spotsLeft !== 1 ? "s" : ""} restante
                        {spotsLeft !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-400/70 font-semibold ml-1">
                        — Esgotado
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        occupancyPercent >= 90
                          ? "bg-red-400"
                          : occupancyPercent >= 70
                            ? "bg-amber-400"
                            : "bg-[#2E94B9]"
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* CTA button */}
                <div className="flex-shrink-0">
                  {!user && (
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium transition-colors cursor-pointer"
                    >
                      Login para inscrever-se
                    </button>
                  )}

                  {canRegister && !registrationId && spotsLeft > 0 && (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="inline-flex items-center gap-2 bg-[#2E94B9] hover:bg-[#2489ab] text-[#F0FBFF] font-semibold py-3 px-6 rounded-xl shadow-[0_6px_20px_rgba(46,148,185,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:shadow-none text-sm"
                    >
                      <CalendarCheck size={16} />
                      {registering ? "Inscrevendo..." : "Inscrever-se"}
                    </button>
                  )}

                  {canRegister && !registrationId && spotsLeft <= 0 && (
                    <span className="text-red-400/70 text-sm font-medium">
                      Vagas esgotadas
                    </span>
                  )}

                  {registrationId && (
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                        <CheckCircle size={15} /> Inscrito
                      </span>
                      <button
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="text-[12px] text-[#F0FBFF]/25 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 font-medium"
                      >
                        {registering ? "Cancelando..." : "Cancelar"}
                      </button>
                    </div>
                  )}

                  {user && isPast && (
                    <span className="text-[#F0FBFF]/30 text-sm">
                      Evento encerrado
                    </span>
                  )}

                  {user && event.status !== "APPROVED" && !isPast && (
                    <span className="text-[#F0FBFF]/30 text-sm">
                      Inscrições indisponíveis
                    </span>
                  )}
                </div>
              </div>

              {feedbackMsg && (
                <div
                  className={`flex items-center gap-2.5 mt-4 pt-4 border-t border-white/[0.05] text-sm font-medium ${
                    feedbackMsg.type === "success"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {feedbackMsg.type === "success" ? (
                    <CheckCircle size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}
                  {feedbackMsg.text}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-[11px] font-bold text-[#F0FBFF]/30 uppercase tracking-[0.15em] mb-4">
                Sobre o evento
              </h2>
              <div className="text-[#F0FBFF]/60 text-[15px] leading-[1.85] whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Participants list */}
            {registrations.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-[11px] font-bold text-[#F0FBFF]/30 uppercase tracking-[0.15em]">
                    Participantes
                  </h2>
                  <span className="text-[11px] font-semibold text-[#F0FBFF]/20 bg-white/[0.05] px-2 py-0.5 rounded-md">
                    {registeredCount}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-3 py-3 border-b border-white/[0.03] last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-[#ACDCEE]/50 uppercase">
                          {(reg.user_name || "P").charAt(0)}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[13px] font-medium text-[#F0FBFF]/65 truncate">
                          {reg.user_name || "Participante"}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#F0FBFF]/20 flex-shrink-0">
                        {new Date(reg.registered_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                      {reg.check_in && (
                        <Check
                          size={13}
                          className="text-emerald-400/60 flex-shrink-0"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
