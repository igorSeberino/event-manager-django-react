import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/events/")
      .then((response) => {
        setFeaturedEvents(response.data.results);
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

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[150px] opacity-30 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[150px] opacity-20 z-0 pointer-events-none"></div>

      <header className="sticky top-0 z-50 bg-[#475053]/80 backdrop-blur-lg border-b border-[#ACDCEE]/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto p-4 md:px-8">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="p-2 bg-gradient-to-br from-[#2E94B9]/40 to-transparent rounded-xl border border-white/5 shadow-inner">
              <GraduationCap size={28} className="text-[#ACDCEE]" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#F0FBFF]">
              Eventos
              <span className="text-[#ACDCEE] font-light">Acadêmicos</span>
            </h1>
          </div>

          <button
            className="lg:hidden text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex gap-8 font-medium text-sm tracking-wide">
              <a
                href="#"
                className="text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors drop-shadow-sm"
              >
                Início
              </a>
              <a
                href="#"
                className="text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors"
              >
                Eventos
              </a>
              <a
                href="#"
                className="text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors"
              >
                Minhas Inscrições
              </a>
            </nav>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

            <button
              className="group flex items-center gap-2 bg-[#2E94B9]/10 hover:bg-[#2E94B9] text-[#ACDCEE] hover:text-[#F0FBFF] border border-[#2E94B9]/50 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-[0_4px_12px_rgba(46,148,185,0.3)] hover:cursor-pointer"
              onClick={() => navigate("/login")}
            >
              <User size={16} />
              <span>Login</span>
            </button>
            <button
              className="bg-[#2E94B9] text-[#F0FBFF] hover:bg-[#1f7596] px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-[0_4px_12px_rgba(46,148,185,0.3)] hover:cursor-pointer"
              onClick={() => navigate("/cadastro")}
            >
              Cadastro
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden flex flex-col p-4 bg-[#475053]/95 backdrop-blur-xl border-t border-[#ACDCEE]/10 absolute w-full left-0 shadow-2xl z-50">
            <nav className="flex flex-col gap-4 mb-6">
              <a
                href="#"
                className="block text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors font-medium"
              >
                Início
              </a>
              <a
                href="#"
                className="block text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors font-medium"
              >
                Eventos
              </a>
              <a
                href="#"
                className="block text-[#F0FBFF]/90 hover:text-[#ACDCEE] transition-colors font-medium"
              >
                Minhas Inscrições
              </a>
            </nav>

            <div className="pt-4 border-t border-white/10 flex flex-row gap-3">
              <button
                className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9]/10 hover:bg-[#2E94B9] text-[#ACDCEE] hover:text-[#F0FBFF] border border-[#2E94B9]/50 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <User size={18} />
                <span>Login</span>
              </button>
              <button
                className="flex-1 flex justify-center items-center gap-2 bg-[#2E94B9] text-[#F0FBFF] hover:bg-[#1f7596] px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:cursor-pointer"
                onClick={() => navigate("/cadastro")}
              >
                <span>Cadastro</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20 lg:px-8">
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
          <button className="group relative bg-gradient-to-br from-[#2E94B9] to-[#1f7596] text-[#F0FBFF] font-semibold py-4 px-8 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(46,148,185,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 border-t border-white/20 hover:cursor-pointer">
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
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10 hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
              <a
                href="#"
                className="group flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium transition-colors hover:cursor-pointer"
              >
                Ver todos{" "}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
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
                    className="group bg-gradient-to-r from-white/10 to-transparent backdrop-blur-xl rounded-2xl p-5 
                             border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 
                             shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(46,148,185,0.15)] 
                             hover:bg-white/15 hover:scale-[1.02] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden hover:cursor-pointer"
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

                    <div className="relative z-10 flex-shrink-0 mt-2 sm:mt-0">
                      <button className="w-full sm:w-auto px-4 py-2 rounded-lg font-semibold bg-white/5 border border-t-white/20 border-[#ACDCEE]/20 text-[#ACDCEE] hover:bg-[#2E94B9] hover:border-[#2E94B9] hover:text-[#F0FBFF] transition-all duration-300 flex justify-center hover:cursor-pointer">
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
