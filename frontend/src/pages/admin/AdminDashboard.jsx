import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Calendar,
  Users,
  ClipboardList,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/events/"),
      api.get("/users/"),
      api.get("/registrations/"),
      api.get("/categories/"),
    ])
      .then(([eventsRes, usersRes, regsRes, catsRes]) => {
        const events = eventsRes.data.results || eventsRes.data;
        const users = usersRes.data.results || usersRes.data;
        const registrations = regsRes.data.results || regsRes.data;
        const categories = catsRes.data.results || catsRes.data;

        const eventCount = eventsRes.data.count ?? events.length;
        const userCount = usersRes.data.count ?? users.length;
        const regCount = regsRes.data.count ?? registrations.length;

        const pending = events.filter((e) => e.status === "PENDING").length;
        const approved = events.filter((e) => e.status === "APPROVED").length;
        const rejected = events.filter((e) => e.status === "REJECTED").length;

        setStats({
          events: eventCount,
          users: userCount,
          registrations: regCount,
          categories: categories.length,
          pending,
          approved,
          rejected,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total de Eventos",
          value: stats.events,
          icon: Calendar,
          color: "text-[#2E94B9]",
          bgColor: "bg-[#2E94B9]/10",
        },
        {
          label: "Usuários",
          value: stats.users,
          icon: Users,
          color: "text-purple-400",
          bgColor: "bg-purple-500/10",
        },
        {
          label: "Inscrições",
          value: stats.registrations,
          icon: ClipboardList,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
        },
        {
          label: "Categorias",
          value: stats.categories,
          icon: Tag,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
        },
      ]
    : [];

  const eventStatusCards = stats
    ? [
        {
          label: "Pendentes",
          value: stats.pending,
          icon: Clock,
          color: "text-amber-400",
          path: "/admin/eventos",
        },
        {
          label: "Aprovados",
          value: stats.approved,
          icon: CheckCircle,
          color: "text-emerald-400",
          path: "/admin/eventos",
        },
        {
          label: "Rejeitados",
          value: stats.rejected,
          icon: XCircle,
          color: "text-red-400",
          path: "/admin/eventos",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="admin" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-52 flex-shrink-0">
            <AdminSidebar activeSection="dashboard" />
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-[#F0FBFF]/50 mb-8">Visão geral do sistema</p>

            {loading ? (
              <div className="text-center py-20 text-[#ACDCEE]">
                Carregando estatísticas...
              </div>
            ) : (
              <>
                {/* Main stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                      >
                        <div
                          className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-3`}
                        >
                          <Icon size={20} className={card.color} />
                        </div>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-[#F0FBFF]/50 mt-1">
                          {card.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Event status breakdown */}
                <h2 className="text-lg font-semibold mb-4">
                  Status dos Eventos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {eventStatusCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.label}
                        onClick={() => navigate(card.path)}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 text-left hover:bg-white/8 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={card.color} />
                            <span className="text-sm font-medium text-[#F0FBFF]/70">
                              {card.label}
                            </span>
                          </div>
                          <span className="text-xl font-bold">
                            {card.value}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-[#ACDCEE]/40 group-hover:text-[#ACDCEE] transition-colors">
                          Ver detalhes
                          <ArrowRight size={12} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Gerenciar Eventos",
                      path: "/admin/eventos",
                      icon: Calendar,
                    },
                    {
                      label: "Gerenciar Usuários",
                      path: "/admin/usuarios",
                      icon: Users,
                    },
                    {
                      label: "Gerenciar Categorias",
                      path: "/admin/categorias",
                      icon: Tag,
                    },
                    {
                      label: "Criar Evento",
                      path: "/eventos/novo",
                      icon: Calendar,
                    },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-[#F0FBFF]/70 hover:text-[#F0FBFF] transition-all cursor-pointer"
                      >
                        <Icon size={16} className="text-[#ACDCEE]" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
