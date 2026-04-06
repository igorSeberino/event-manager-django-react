import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  ArrowUpRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

const PAGE_SIZE = 9;

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

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
  return { day: parts[2], month: months[parseInt(parts[1], 10) - 1] };
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

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "PENDING", label: "Pendentes" },
  { value: "REJECTED", label: "Rejeitados" },
];

export default function Eventos() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const sentinelRef = useRef(null);

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        const data = res.data.results || res.data;
        setCategories(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const isAppending = isMobile && page > 1;
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("ordering", "-event_date");
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedStatus) params.set("status", selectedStatus);

    api
      .get(`/events/?${params.toString()}`)
      .then((res) => {
        const data = res.data.results || res.data;
        const count = res.data.count ?? data.length;
        const pages = Math.ceil(count / PAGE_SIZE) || 1;

        if (isAppending) {
          setEvents((prev) => [...prev, ...data]);
        } else {
          setEvents(data);
        }
        setTotalCount(count);
        setTotalPages(pages);
        setHasMore(page < pages);
      })
      .catch(() => setError("Não foi possível carregar os eventos no momento."))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [page, searchTerm, selectedCategory, selectedStatus, isMobile]);

  // Infinite scroll observer (mobile only)
  useEffect(() => {
    if (!isMobile || !hasMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMobile, hasMore, loadingMore]);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setLoading(true);
    setError(null);
    setPage(1);
    if (isMobile) setEvents([]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setLoading(true);
    setError(null);
    setPage(1);
    if (isMobile) setEvents([]);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus;
  const activeFilterCount = [
    searchTerm,
    selectedCategory,
    selectedStatus,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      <div className="fixed top-[-20%] left-[-15%] w-[600px] h-[600px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[200px] opacity-25 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-15%] w-[600px] h-[600px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[200px] opacity-15 z-0 pointer-events-none"></div>
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[150px] opacity-10 z-0 pointer-events-none"></div>

      <Navbar activePage="eventos" />

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <p className="text-[#ACDCEE] text-sm font-semibold uppercase tracking-widest mb-2">
                Catálogo
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#F0FBFF] tracking-tight mb-3">
                Explorar Eventos
              </h2>
              <p className="text-[#F0FBFF]/60 text-sm max-w-lg leading-relaxed">
                Encontre workshops, minicursos e palestras. Participe e expanda
                seu conhecimento acadêmico.
              </p>
            </div>

            {/* Search + Filter toggle */}
            <div className="w-full lg:w-auto flex gap-2.5">
              <div className="relative group flex-1 lg:w-80">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-[#F0FBFF]/30 group-focus-within:text-[#ACDCEE] transition-colors duration-200"
                  />
                </div>
                <input
                  type="text"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF] text-sm rounded-2xl focus:ring-1 focus:ring-[#2E94B9]/50 focus:border-[#2E94B9]/30 focus:bg-white/[0.06] block pl-11 pr-4 py-3 transition-all duration-200 outline-none placeholder-[#F0FBFF]/25"
                  placeholder="Buscar por título, local, descrição..."
                  value={searchTerm}
                  onChange={(e) =>
                    handleFilterChange(setSearchTerm)(e.target.value)
                  }
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  showFilters
                    ? "bg-[#2E94B9]/15 border border-[#2E94B9]/30 text-[#ACDCEE]"
                    : "bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF]/60 hover:text-[#ACDCEE] hover:border-white/[0.12]"
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2E94B9] text-[#F0FBFF] text-[10px] font-bold flex items-center justify-center shadow-lg">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-5">
              {/* Status pills */}
              <div>
                <label className="block text-[11px] font-semibold text-[#F0FBFF]/40 uppercase tracking-widest mb-3">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        handleFilterChange(setSelectedStatus)(opt.value)
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                        selectedStatus === opt.value
                          ? "bg-[#2E94B9] text-[#F0FBFF] shadow-[0_4px_12px_rgba(46,148,185,0.3)]"
                          : "bg-white/[0.04] text-[#F0FBFF]/50 border border-white/[0.06] hover:border-white/[0.12] hover:text-[#F0FBFF]/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category pills */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#F0FBFF]/40 uppercase tracking-widest mb-3">
                    Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleFilterChange(setSelectedCategory)("")
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                        !selectedCategory
                          ? "bg-[#2E94B9] text-[#F0FBFF] shadow-[0_4px_12px_rgba(46,148,185,0.3)]"
                          : "bg-white/[0.04] text-[#F0FBFF]/50 border border-white/[0.06] hover:border-white/[0.12] hover:text-[#F0FBFF]/70"
                      }`}
                    >
                      Todas
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          handleFilterChange(setSelectedCategory)(cat.id)
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                          selectedCategory === cat.id
                            ? "bg-[#2E94B9] text-[#F0FBFF] shadow-[0_4px_12px_rgba(46,148,185,0.3)]"
                            : "bg-white/[0.04] text-[#F0FBFF]/50 border border-white/[0.06] hover:border-white/[0.12] hover:text-[#F0FBFF]/70"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <span className="text-[11px] text-[#F0FBFF]/35 font-medium">
                    {totalCount} resultado{totalCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-[11px] text-[#F0FBFF]/40 hover:text-red-400 transition-colors cursor-pointer font-medium"
                  >
                    <X size={12} />
                    Limpar tudo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-white/[0.08] border-t-[#ACDCEE] rounded-full animate-spin mb-5"></div>
            <p className="text-[#F0FBFF]/40 text-sm font-medium">
              Carregando eventos...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/[0.06] border border-red-500/[0.12] rounded-2xl p-8 text-center text-red-300/80 text-sm w-full max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                  <CalendarIcon size={28} className="text-[#F0FBFF]/20" />
                </div>
                <h3 className="text-lg font-bold text-[#F0FBFF]/80 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-[#F0FBFF]/40 text-sm mb-6 max-w-sm text-center">
                  Não encontramos eventos que correspondam aos seus filtros.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[#ACDCEE] hover:text-[#F0FBFF] text-sm font-medium transition-colors cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {events.map((event) => {
                    const { day, month } = getDayAndMonth(event.event_date);
                    const isPast =
                      event.event_date &&
                      new Date(event.event_date) < new Date();

                    return (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/eventos/${event.id}`)}
                        className={`group flex flex-col rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                          isPast
                            ? "bg-white/[0.02] border-white/[0.04] opacity-70 hover:opacity-90"
                            : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.10] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1"
                        }`}
                      >
                        {/* Cover */}
                        <div className="h-36 bg-gradient-to-br from-[#2E94B9]/20 via-[#2E94B9]/10 to-transparent relative flex-shrink-0">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtNC45NyA0LjAzLTkgOS05czktNC4wMyA5LTktNC4wMy05LTktOS00LjAzIDkgOS05IDkgNC4wMyA5IDl6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

                          {/* Date badge */}
                          <div className="absolute -bottom-5 left-5 z-20">
                            <div className="bg-[#2E94B9] rounded-xl flex flex-col items-center justify-center w-[60px] h-[60px] shadow-[0_8px_20px_rgba(46,148,185,0.4)]">
                              <span className="text-[9px] font-bold uppercase text-[#F0FBFF]/80 tracking-widest leading-none mb-0.5">
                                {month}
                              </span>
                              <span className="text-[22px] font-extrabold text-[#F0FBFF] leading-none">
                                {day}
                              </span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                            <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#F0FBFF]/70 tracking-wide">
                              {event.category || "Geral"}
                            </span>
                            {isPast && (
                              <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-semibold text-red-300/80 tracking-wide">
                                Encerrado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="pt-9 pb-5 px-5 flex flex-col flex-grow">
                          <h3 className="text-[15px] font-bold text-[#F0FBFF] leading-snug group-hover:text-[#ACDCEE] transition-colors duration-200 mb-2.5 line-clamp-2">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="text-[#F0FBFF]/40 text-[13px] mb-4 line-clamp-2 flex-grow leading-relaxed">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-col gap-1.5 mt-auto text-[12px]">
                            <div className="flex items-center gap-2 text-[#F0FBFF]/45">
                              <Clock size={13} className="text-[#ACDCEE]/60" />
                              <span>
                                {formatTime(event.event_date) ||
                                  "Horário a definir"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[#F0FBFF]/45">
                              <MapPin size={13} className="text-[#ACDCEE]/60" />
                              <span className="truncate">
                                {event.location || "Local a definir"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[#F0FBFF]/45">
                              <Users size={13} className="text-[#ACDCEE]/60" />
                              <span>{event.capacity} vagas</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/[0.05] px-5 py-3.5 flex justify-between items-center">
                          <span className="text-[12px] font-semibold text-[#ACDCEE]/60 group-hover:text-[#ACDCEE] transition-colors duration-200">
                            Ver detalhes
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-[#2E94B9]/20 flex items-center justify-center transition-all duration-200">
                            <ArrowUpRight
                              size={14}
                              className="text-[#F0FBFF]/30 group-hover:text-[#ACDCEE] transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Infinite scroll sentinel (mobile) */}
                {isMobile && hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-10">
                    {loadingMore && (
                      <Loader2
                        size={24}
                        className="text-[#ACDCEE] animate-spin"
                      />
                    )}
                  </div>
                )}

                {/* Indicador de fim de lista (mobile) */}
                {isMobile && !hasMore && events.length > 0 && (
                  <div className="flex justify-center py-8">
                    <span className="bg-white/[0.02] border border-white/[0.04] backdrop-blur-xs px-4 py-2 rounded-full text-[#F0FBFF]/40 text-[13px] font-medium flex items-center gap-2">
                      Sem mais eventos disponíveis
                    </span>
                  </div>
                )}

                {/* Pagination (desktop) */}
                {!isMobile && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-14">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#F0FBFF]/40 hover:text-[#ACDCEE] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={15} /> Anterior
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                                page === pageNum
                                  ? "bg-[#2E94B9] text-[#F0FBFF] shadow-[0_4px_12px_rgba(46,148,185,0.3)]"
                                  : "text-[#F0FBFF]/30 hover:text-[#F0FBFF]/60 hover:bg-white/[0.04]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#F0FBFF]/40 hover:text-[#ACDCEE] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Próxima <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
