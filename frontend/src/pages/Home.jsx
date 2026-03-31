import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Calendar as CalendarIcon,
  MapPin,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  User,
  ChevronLeft,
  Clock,
  LogOut,
  ChevronDown,
  Bookmark,
} from "lucide-react";

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

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const firstName = user?.name?.split(" ")[0] || user?.username || "Usuário";

  useEffect(() => {
    axios
      .get("/events/")
      .then((response) => {
        // Adaptado caso sua API retorne os dados paginados ou direto
        const data = response.data.results || response.data;
        setFeaturedEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(month, year) {
    return new Date(year, month, 1).getDay();
  }

  const daysInMonth = Array.from(
    { length: getDaysInMonth(currentMonth, currentYear) },
    (_, i) => i + 1,
  );

  const eventDaysSet = new Set(
    featuredEvents
      .filter((ev) => {
        if (!ev.event_date) return false;
        const [year, month] = ev.event_date.split("T")[0].split("-");
        return (
          parseInt(year, 10) === currentYear &&
          parseInt(month, 10) === currentMonth + 1
        );
      })
      .map((ev) => parseInt(ev.event_date.split("T")[0].split("-")[2], 10)),
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const displayedEvents = [...featuredEvents]
    .filter((ev) => ev.event_date && new Date(ev.event_date) >= todayStart)
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    )
    .slice(0, 3);

  const handleLogout = async () => {
    try {
      await axios.post("/logout/");
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      {/* Header com correção de blur para menus suspensos */}
      <header className="sticky top-0 z-50 w-full transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#475053]/85 backdrop-blur-md -webkit-backdrop-filter border-b border-black/20 shadow-sm -z-10"></div>

        <div className="flex justify-between items-center max-w-7xl mx-auto p-4 md:px-8 relative z-10">
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

          <button
            className="lg:hidden text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex gap-8 font-medium text-sm tracking-wide">
              <button
                onClick={() => navigate("/")}
                className="text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors drop-shadow-sm cursor-pointer"
              >
                Início
              </button>
              <button
                onClick={() => navigate("/eventos")}
                className="text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors cursor-pointer"
              >
                Eventos
              </button>
            </nav>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

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

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#475053]/20 backdrop-blur-xs -webkit-backdrop-filter border border-white/10 border-t-white/20 border-l-white/20 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => navigate("/perfil")}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <User size={16} className="text-[#ACDCEE]" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => navigate("/minhas-inscricoes")}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Bookmark size={16} className="text-[#ACDCEE]" />
                      Minhas Inscrições
                    </button>

                    <div className="h-px w-full bg-white/10 my-1"></div>

                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer"
                      onClick={() => handleLogout()}
                    >
                      <LogOut size={16} />
                      Sair
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
                  <User size={16} />
                  <span>Login</span>
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

        {/* Menu Mobile */}
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
                      <User size={18} className="text-[#ACDCEE]" />
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        navigate("/minhas-inscricoes");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 rounded-xl transition-all duration-300 font-medium cursor-pointer"
                    >
                      <Bookmark size={18} className="text-[#ACDCEE]" />
                      Minhas Inscrições
                    </button>
                  </div>

                  <button
                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500 hover:to-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm cursor-pointer"
                    onClick={() => handleLogout()}
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-3">
                  <button
                    className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9]/10 hover:bg-[#2E94B9] text-[#ACDCEE] hover:text-[#F0FBFF] border border-[#2E94B9]/50 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    <User size={18} />
                    <span>Login</span>
                  </button>
                  <button
                    className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9] text-[#F0FBFF] hover:bg-[#1f7596] px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md cursor-pointer"
                    onClick={() => {
                      navigate("/cadastro");
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>Cadastro</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 py-12 md:py-20 lg:px-8 w-full">
        <section className="text-center flex flex-col items-center mb-16 md:mb-24">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-t-white/20 border-[#ACDCEE]/20 bg-[#ACDCEE]/10 backdrop-blur-sm text-[#ACDCEE] text-sm font-medium tracking-wide shadow-lg">
            Plataforma de Gestão 2026
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-[#F0FBFF] tracking-tight drop-shadow-md">
            Conecte-se com o <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ACDCEE] to-[#2E94B9] drop-shadow-sm">
              Conhecimento
            </span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl text-[#F0FBFF]/90 mb-10 font-light leading-relaxed">
            Descubra palestras, minicursos e workshops. Inscreva-se e acompanhe
            sua jornada acadêmica em uma experiência centralizada.
          </p>
          <button
            onClick={() => navigate("/eventos")}
            className="group relative bg-gradient-to-br from-[#2E94B9] to-[#1f7596] text-[#F0FBFF] font-semibold py-4 px-8 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(46,148,185,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 border-t border-white/20 cursor-pointer"
          >
            Explorar Eventos
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <section className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <h3 className="text-2xl font-bold text-[#F0FBFF] tracking-tight drop-shadow-sm mb-6 flex items-center gap-3">
              <CalendarIcon className="text-[#2E94B9]" />
              Agenda Acadêmica
            </h3>

            <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-3xl p-6 border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E94B9]/10 rounded-full filter blur-[40px]"></div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h4 className="font-bold text-lg text-[#F0FBFF] capitalize">
                  {(() => {
                    const months = [
                      "Janeiro",
                      "Fevereiro",
                      "Março",
                      "Abril",
                      "Maio",
                      "Junho",
                      "Julho",
                      "Agosto",
                      "Setembro",
                      "Outubro",
                      "Novembro",
                      "Dezembro",
                    ];
                    return `${months[currentMonth]} ${currentYear}`;
                  })()}
                </h4>
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                  >
                    <ChevronLeft size={18} className="text-[#ACDCEE]" />
                  </button>
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                  >
                    <ChevronRight size={18} className="text-[#ACDCEE]" />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-semibold text-[#ACDCEE]/70 uppercase tracking-wider">
                  <div>D</div>
                  <div>S</div>
                  <div>T</div>
                  <div>Q</div>
                  <div>Q</div>
                  <div>S</div>
                  <div>S</div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-sm">
                  {Array.from({
                    length: getFirstDayOfWeek(currentMonth, currentYear),
                  }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                  {daysInMonth.map((day) => {
                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear();
                    const hasEvent = eventDaysSet.has(day);

                    return (
                      <div
                        key={day}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all duration-300
                          ${isToday ? "bg-[#2E94B9] text-[#F0FBFF] shadow-lg border border-white/20 font-bold" : "text-[#F0FBFF]/80"}
                        `}
                      >
                        {day}
                        {hasEvent && !isToday && (
                          <div className="absolute bottom-1.5 w-1 h-1 bg-[#ACDCEE] rounded-full"></div>
                        )}
                        {hasEvent && isToday && (
                          <div className="absolute bottom-1.5 w-1 h-1 bg-[#F0FBFF] rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-bold text-[#F0FBFF] tracking-tight drop-shadow-sm">
                Eventos em Destaque
              </h3>
              <button
                onClick={() => navigate("/eventos")}
                className="group flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium transition-colors cursor-pointer"
              >
                Ver todos{" "}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5">
              {loading && (
                <div className="text-[#ACDCEE] text-center py-8">
                  Carregando eventos...
                </div>
              )}
              {error && (
                <div className="text-red-400 text-center py-8">{error}</div>
              )}
              {!loading && !error && displayedEvents.length === 0 && (
                <div className="text-[#ACDCEE] text-center py-8">
                  Nenhum evento próximo encontrado.
                </div>
              )}
              {!loading &&
                !error &&
                displayedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/eventos/${event.id}`)}
                    className="group bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl rounded-2xl p-5 
                             border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 
                             shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(46,148,185,0.15)] 
                             hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2E94B9]/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex-shrink-0 bg-black/30 rounded-xl flex flex-col items-center justify-center min-w-[70px] h-[70px] text-center border-b border-white/10 shadow-inner">
                      {(() => {
                        const { day, month } = getDayAndMonth(event.event_date);
                        return (
                          <>
                            <span className="block text-xs font-bold uppercase text-[#ACDCEE] tracking-widest leading-none mb-1">
                              {month}
                            </span>
                            <span className="block text-2xl font-extrabold text-[#F0FBFF] leading-none">
                              {day}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <div className="relative z-10 flex-grow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0FBFF] bg-[#2E94B9] px-2.5 py-1 rounded-md mb-2 inline-block border-t border-white/20">
                        {event.category?.name || "Geral"}
                      </span>
                      <h4 className="text-lg font-bold text-[#F0FBFF] leading-snug group-hover:text-[#ACDCEE] transition-colors mb-2">
                        {event.title}
                      </h4>

                      <div className="flex flex-wrap gap-4 text-[#F0FBFF]/70 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#ACDCEE]" />
                          <span>
                            {event.event_date
                              ? formatTime(event.event_date)
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#ACDCEE]" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex-shrink-0 mt-2 sm:mt-0 pointer-events-none">
                      <button className="w-full sm:w-auto px-4 py-2 rounded-lg font-semibold bg-white/5 border border-t-white/20 border-[#ACDCEE]/20 text-[#ACDCEE] group-hover:bg-[#2E94B9] group-hover:border-[#2E94B9] group-hover:text-[#F0FBFF] transition-all duration-300 flex justify-center">
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
