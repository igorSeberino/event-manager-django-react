import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  Lock,
  CheckCheck,
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

const ATTENDANCE = {
  PRESENT: {
    label: "Presente",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  ABSENT: {
    label: "Falta",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  PENDING: {
    label: "Aguardando",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
};

export default function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}/`),
      api.get(`/registrations/?event=${id}&page_size=1000`),
    ])
      .then(([eventRes, regsRes]) => {
        const ev = eventRes.data;
        setEvent(ev);
        if (user && ev.organizer_id !== user.id && user.role !== "ADMIN") {
          setError(
            "Apenas o organizador do evento pode gerenciar os inscritos.",
          );
          return;
        }
        setRegistrations(regsRes.data.results || regsRes.data);
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const toggleCheckIn = async (reg) => {
    setTogglingId(reg.id);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/registrations/${reg.id}/`, {
        check_in: !reg.check_in,
      });
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === reg.id
            ? {
                ...r,
                check_in: res.data.check_in,
                attendance_status: res.data.attendance_status,
              }
            : r,
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

  const closeEvent = async () => {
    setClosing(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post(`/events/${id}/close/`);
      setEvent(res.data);
      // Inscritos sem check-in passam a contar como falta.
      setRegistrations((prev) =>
        prev.map((r) =>
          r.check_in ? r : { ...r, attendance_status: "ABSENT" },
        ),
      );
      setConfirmClose(false);
      setFeedbackMsg({
        type: "success",
        text: "Evento encerrado. As presenças foram finalizadas.",
      });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao encerrar o evento.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setClosing(false);
    }
  };

  const finished = !!event?.is_finished;
  const isOwner = !!user && !!event && event.organizer_id === user.id;
  const canClose =
    isOwner &&
    event?.status === "APPROVED" &&
    !finished &&
    new Date(event.event_date) <= new Date();

  const presentes = registrations.filter((r) => r.check_in).length;
  const faltas = registrations.filter(
    (r) => r.attendance_status === "ABSENT",
  ).length;

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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#F0FBFF] mb-1">
                  Inscrições — {event.title}
                </h1>
                <p className="text-[#F0FBFF]/50 text-sm">
                  {formatDate(event.event_date)} · {event.location}
                </p>
                {finished && (
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#F0FBFF]/55 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                    <Lock size={12} /> Evento encerrado
                  </span>
                )}
              </div>

              {canClose && (
                <button
                  onClick={() => {
                    setConfirmClose(true);
                    setFeedbackMsg(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#2E94B9] hover:bg-[#1f7596] text-[#F0FBFF] rounded-xl transition-all cursor-pointer flex-shrink-0 shadow-[0_6px_16px_rgba(46,148,185,0.25)]"
                >
                  <CheckCheck size={16} /> Encerrar evento
                </button>
              )}
            </div>

            {/* Confirmação de encerramento */}
            {confirmClose && (
              <div className="mb-6 bg-amber-500/[0.06] border border-amber-500/25 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    size={18}
                    className="text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#F0FBFF]">
                      Encerrar este evento?
                    </p>
                    <p className="text-xs text-[#F0FBFF]/60 mt-1 leading-relaxed">
                      Os inscritos sem check-in serão marcados como{" "}
                      <strong>falta</strong>. Depois de encerrado, não será mais
                      possível alterar presenças, inscritos ou os dados do
                      evento. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={closeEvent}
                    disabled={closing}
                    className="px-4 py-2 text-xs font-semibold bg-[#2E94B9] hover:bg-[#1f7596] text-[#F0FBFF] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {closing ? "Encerrando..." : "Sim, encerrar"}
                  </button>
                  <button
                    onClick={() => setConfirmClose(false)}
                    disabled={closing}
                    className="px-4 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer text-[#F0FBFF]/60"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

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
                <p className="text-2xl font-bold">{presentes}</p>
                <p className="text-xs text-[#F0FBFF]/50">Presentes</p>
              </div>
              {finished ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <UserX size={20} className="mx-auto text-red-400 mb-2" />
                  <p className="text-2xl font-bold">{faltas}</p>
                  <p className="text-xs text-[#F0FBFF]/50">Faltas</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hidden sm:block">
                  <Users size={20} className="mx-auto text-amber-400 mb-2" />
                  <p className="text-2xl font-bold">{event.capacity}</p>
                  <p className="text-xs text-[#F0FBFF]/50">Capacidade</p>
                </div>
              )}
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

                {registrations.map((reg) => {
                  const att =
                    ATTENDANCE[reg.attendance_status] || ATTENDANCE.PENDING;
                  return (
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
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border w-fit ${att.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${att.dot}`}
                        ></span>
                        {att.label}
                      </span>

                      {finished ? (
                        <span className="text-xs text-[#F0FBFF]/25 w-fit">
                          —
                        </span>
                      ) : (
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
