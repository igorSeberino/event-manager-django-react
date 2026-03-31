import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Calendar as CalendarIcon,
  MapPin,
  Menu,
  X,
  GraduationCap,
  User,
  ChevronDown,
  Bookmark,
  LogOut,
  Clock,
  Search,
  Filter,
} from "lucide-react";

// Funções utilitárias
function getDayAndMonth(dateString) {
  if (!dateString) return { day: "", month: "" };
  const parts = dateString.split("T")[0].split("-");
  const months = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];
  return {
    day: parts[2],
    month: months[parseInt(parts[1], 10) - 1],
  };
}

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Eventos() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const firstName = user?.name?.split(" ")[0] || user?.username || "Usuário";

  useEffect(() => {
    axios
      .get("/events/")
      .then((response) => {
        const data = response.data.results || response.data;
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Não foi possível carregar os eventos no momento.");
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/logout/");
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate("/");
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full transition-all duration-300">
        {/* TRUQUE: Fundo Glassmorphism isolado no -z-10 para não bugar o blur dos dropdowns */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#475053]/85 backdrop-blur-md -webkit-backdrop-filter border-b border-black/20 shadow-sm -z-10"></div>

        <div className="flex justify-between items-center max-w-7xl mx-auto p-4 md:px-8 relative z-10">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="p-2 bg-gradient-to-br from-[#2E94B9]/40 to-transparent rounded-xl border border-white/5 shadow-inner">
              <GraduationCap size={28} className="text-[#ACDCEE]" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#F0FBFF]">
              Eventos
              <span className="text-[#ACDCEE] font-light">Acadêmicos</span>
            </h1>
          </div>

          {/* Botão Menu Mobile */}
          <button
            className="lg:hidden text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Navegação Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex gap-8 font-medium text-sm tracking-wide">
              <button
                onClick={() => navigate("/")}
                className="text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors drop-shadow-sm cursor-pointer"
              >
                Início
              </button>
              <button
                onClick={() => navigate("/eventos")}
                className="text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors cursor-pointer"
              >
                Eventos
              </button>
            </nav>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

            {/* Área do Usuário Desktop */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20 hover:cursor-pointer group shadow-sm"
                >
                  <div className="p-1.5 bg-gradient-to-br from-[#2E94B9]/40 to-[#2E94B9]/10 rounded-full border border-[#2E94B9]/50 shadow-inner group-hover:scale-105 transition-transform">
                    <User size={18} className="text-[#ACDCEE]" />
                  </div>
                  <span className="text-[#F0FBFF] font-medium text-sm tracking-wide">
                    {firstName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#ACDCEE] transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Perfil Desktop - Blur mínimo e opacidade baixa */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#475053]/20 backdrop-blur-xs -webkit-backdrop-filter border border-white/10 border-t-white/20 border-l-white/20 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => navigate("/perfil")}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <User size={16} className="text-[#ACDCEE]" /> Meu Perfil
                    </button>
                    <button
                      onClick={() => navigate("/minhas-inscricoes")}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Bookmark size={16} className="text-[#ACDCEE]" /> Minhas
                      Inscrições
                    </button>

                    <div className="h-px w-full bg-white/10 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="group flex items-center gap-2 bg-[#2E94B9]/10 hover:bg-[#2E94B9] text-[#ACDCEE] hover:text-[#F0FBFF] border border-[#2E94B9]/50 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  <User size={16} /> <span>Login</span>
                </button>
                <button
                  className="bg-[#2E94B9] text-[#F0FBFF] hover:bg-[#1f7596] px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:cursor-pointer"
                  onClick={() => navigate("/cadastro")}
                >
                  Cadastro
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menu Mobile - Glassmorphism leve (opacidade baixa) e alinhado perfeitamente ao header */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full flex flex-col p-5 bg-gradient-to-b from-white/10 to-[#475053]/20 backdrop-blur-md -webkit-backdrop-filter border-b border-white/10 rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-40 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2 mb-4">
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[#F0FBFF] hover:bg-white/10 rounded-xl transition-colors font-medium cursor-pointer"
              >
                Início
              </button>
              <button
                onClick={() => {
                  navigate("/eventos");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[#F0FBFF]/90 hover:bg-white/10 rounded-xl transition-colors font-medium cursor-pointer"
              >
                Eventos
              </button>
            </nav>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              {user ? (
                <div className="bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-t-white/20 border-l-white/10 border-b-black/20 border-r-black/20 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                    <div className="p-2.5 bg-gradient-to-br from-[#2E94B9]/30 to-[#2E94B9]/10 rounded-full border border-[#2E94B9]/50 shadow-inner">
                      <User size={24} className="text-[#ACDCEE]" />
                    </div>
                    <div>
                      <span className="block text-[#F0FBFF] font-bold text-xl leading-none">
                        {firstName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <button
                      onClick={() => {
                        navigate("/perfil");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 rounded-xl transition-all duration-300 font-medium cursor-pointer"
                    >
                      <User size={18} className="text-[#ACDCEE]" /> Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate("/minhas-inscricoes");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 rounded-xl transition-all duration-300 font-medium cursor-pointer"
                    >
                      <Bookmark size={18} className="text-[#ACDCEE]" /> Minhas
                      Inscrições
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500 hover:to-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <LogOut size={18} /> <span>Sair</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9]/10 hover:bg-[#2E94B9] text-[#ACDCEE] hover:text-[#F0FBFF] border border-[#2E94B9]/50 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                  >
                    <User size={18} /> <span>Login</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/cadastro");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9] text-[#F0FBFF] hover:bg-[#1f7596] px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <span>Cadastro</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 lg:px-8 w-full">
        {/* Cabeçalho da Seção & Busca */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#F0FBFF] tracking-tight drop-shadow-md mb-2">
              Explorar Eventos
            </h2>
            <p className="text-[#F0FBFF]/70 text-base max-w-xl">
              Encontre workshops, minicursos e palestras. Participe e expanda
              seu conhecimento acadêmico.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative group w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className="text-[#ACDCEE]/70 group-focus-within:text-[#ACDCEE] transition-colors"
                />
              </div>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 text-[#F0FBFF] text-sm rounded-xl focus:ring-2 focus:ring-[#2E94B9] focus:border-transparent block pl-10 p-3 backdrop-blur-sm transition-all outline-none placeholder-[#F0FBFF]/40"
                placeholder="Buscar por título, local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[#ACDCEE] px-4 py-3 rounded-xl transition-all backdrop-blur-sm font-medium text-sm cursor-pointer">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#2E94B9]/30 border-t-[#ACDCEE] rounded-full animate-spin mb-4"></div>
            <p className="text-[#ACDCEE] font-medium animate-pulse">
              Carregando catálogo de eventos...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 text-center text-red-300 w-full max-w-lg mx-auto">
            <p>{error}</p>
          </div>
        )}

        {/* Eventos Grid */}
        {!loading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 text-center text-[#F0FBFF]/70 flex flex-col items-center">
                <CalendarIcon size={48} className="text-[#ACDCEE]/40 mb-4" />
                <h3 className="text-xl font-bold text-[#F0FBFF] mb-2">
                  Nenhum evento encontrado
                </h3>
                <p>Não encontramos eventos que correspondam à sua busca.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-6 text-[#ACDCEE] hover:text-[#F0FBFF] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredEvents.map((event) => {
                  const { day, month } = getDayAndMonth(event.event_date);

                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/eventos/${event.id}`)}
                      className="group flex flex-col bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl rounded-2xl border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(46,148,185,0.2)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E94B9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Event Cover / Header */}
                      <div className="h-32 bg-gradient-to-br from-[#2E94B9]/30 to-[#475053] relative border-b border-white/10 flex-shrink-0">
                        {event.cover_image && (
                          <img
                            src={event.cover_image}
                            alt={event.title}
                            className="w-full h-full object-cover mix-blend-overlay opacity-60"
                          />
                        )}

                        <div className="absolute -bottom-6 left-6 z-20 bg-[#2E94B9] rounded-xl flex flex-col items-center justify-center min-w-[65px] h-[65px] text-center border-2 border-[#475053] shadow-lg">
                          <span className="block text-[10px] font-bold uppercase text-[#F0FBFF] tracking-widest leading-none mb-0.5 mt-1">
                            {month}
                          </span>
                          <span className="block text-2xl font-extrabold text-[#F0FBFF] leading-none">
                            {day}
                          </span>
                        </div>

                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ACDCEE]">
                            {event.category?.name || "Geral"}
                          </span>
                        </div>
                      </div>

                      {/* Event Body */}
                      <div className="pt-10 pb-6 px-6 flex flex-col flex-grow relative z-10">
                        <h3 className="text-xl font-bold text-[#F0FBFF] leading-snug group-hover:text-[#ACDCEE] transition-colors mb-3 line-clamp-2">
                          {event.title}
                        </h3>

                        {event.short_description && (
                          <p className="text-[#F0FBFF]/70 text-sm mb-4 line-clamp-2 flex-grow">
                            {event.short_description}
                          </p>
                        )}

                        <div className="flex flex-col gap-2 mt-auto text-[#F0FBFF]/80 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#ACDCEE]" />
                            <span>
                              {event.event_date
                                ? formatTime(event.event_date)
                                : "Horário a definir"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#ACDCEE]" />
                            <span className="truncate">
                              {event.location || "Local a definir"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Event Footer */}
                      <div className="border-t border-white/10 p-4 bg-white/5 group-hover:bg-[#2E94B9]/10 transition-colors relative z-10 flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#ACDCEE]">
                          Saiba mais
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#2E94B9] transition-colors">
                          <Search size={14} className="text-[#F0FBFF]" />
                        </div>
                      </div>
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
