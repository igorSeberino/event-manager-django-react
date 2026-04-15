import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import EventForm from "./EventForm";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}/`),
      api.get("/categories/"),
      api.get("/subcategories/"),
    ])
      .then(([eventRes, catRes, subRes]) => {
        const ev = eventRes.data;
        const categories = catRes.data.results || catRes.data;
        const subcategories = subRes.data.results || subRes.data;

        const matchedCategory = categories.find((c) => c.name === ev.category);
        const matchedSubcategory = subcategories.find(
          (s) => s.name === ev.subcategory,
        );

        setEvent({
          ...ev,
          category_id: matchedCategory?.id || "",
          subcategory_id: matchedSubcategory?.id || "",
        });

        if (user.role !== "ADMIN" && ev.organizer !== user.name) {
          setError("Você não tem permissão para editar este evento.");
        }
      })
      .catch(() => setError("Erro ao carregar evento."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      await api.patch(`/events/${id}/`, payload);
      setFeedbackMsg({
        type: "success",
        text: "Evento atualizado com sucesso!",
      });
      setTimeout(() => navigate("/meus-eventos"), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao atualizar evento.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="meus-eventos" />

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-10 lg:px-8">
        <button
          onClick={() => navigate("/meus-eventos")}
          className="flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar aos meus eventos
        </button>

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
            Carregando evento...
          </div>
        )}

        {error && <div className="text-center py-20 text-red-400">{error}</div>}

        {!loading && !error && event && (
          <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.25)]">
            <EventForm
              initialData={event}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              title="Editar Evento"
            />
          </div>
        )}
      </main>
    </div>
  );
}
