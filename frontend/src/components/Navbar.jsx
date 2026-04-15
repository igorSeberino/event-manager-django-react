import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Menu,
  X,
  GraduationCap,
  User,
  ChevronDown,
  Bookmark,
  LogOut,
  CalendarRange,
  CalendarPlus,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar({ activePage }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const firstName = user?.name?.split(" ")[0] || user?.username || "Usuário";

  const handleLogout = async () => {
    try {
      await api.post("/logout/");
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate("/");
  };

  const isOrganizerOrAdmin =
    user?.role === "ORGANIZER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const navLinks = [
    { label: "Início", path: "/", key: "home" },
    { label: "Eventos", path: "/eventos", key: "eventos" },
    ...(isOrganizerOrAdmin
      ? [{ label: "Meus Eventos", path: "/meus-eventos", key: "meus-eventos" }]
      : []),
    ...(isAdmin ? [{ label: "Admin", path: "/admin", key: "admin" }] : []),
  ];

  const profileMenuItems = [
    {
      label: "Meu Perfil",
      path: "/perfil",
      icon: <User size={16} className="text-[#ACDCEE]" />,
      mobileIcon: <User size={18} className="text-[#ACDCEE]" />,
      show: true,
    },
    {
      label: "Minhas Inscrições",
      path: "/minhas-inscricoes",
      icon: <Bookmark size={16} className="text-[#ACDCEE]" />,
      mobileIcon: <Bookmark size={18} className="text-[#ACDCEE]" />,
      show: true,
    },
    {
      label: "Meus Eventos",
      path: "/meus-eventos",
      icon: <CalendarRange size={16} className="text-[#ACDCEE]" />,
      mobileIcon: <CalendarRange size={18} className="text-[#ACDCEE]" />,
      show: isOrganizerOrAdmin,
    },
    {
      label: "Criar Evento",
      path: "/eventos/novo",
      icon: <CalendarPlus size={16} className="text-[#ACDCEE]" />,
      mobileIcon: <CalendarPlus size={18} className="text-[#ACDCEE]" />,
      show: isOrganizerOrAdmin,
    },
    {
      label: "Painel Admin",
      path: "/admin",
      icon: <LayoutDashboard size={16} className="text-[#ACDCEE]" />,
      mobileIcon: <LayoutDashboard size={18} className="text-[#ACDCEE]" />,
      show: isAdmin,
    },
  ].filter((item) => item.show);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#475053]/85 backdrop-blur-md border-b border-black/20 shadow-sm -z-10"></div>

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

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-[#F0FBFF] hover:text-[#ACDCEE] transition-colors cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex gap-8 font-medium text-sm tracking-wide">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => navigate(link.path)}
                className={`transition-colors drop-shadow-sm cursor-pointer ${
                  activePage === link.key
                    ? "text-[#F0FBFF]"
                    : "text-[#F0FBFF]/80 hover:text-[#ACDCEE]"
                }`}
              >
                {link.label}
              </button>
            ))}
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
                <div className="absolute right-0 mt-3 w-56 bg-[#475053]/20 backdrop-blur-xs border border-white/10 border-t-white/20 border-l-white/20 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}

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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full flex flex-col p-5 bg-gradient-to-b from-white/10 to-[#475053]/20 backdrop-blur-md border-b border-white/10 rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-40 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2 mb-4">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  navigate(link.path);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer hover:bg-white/10 ${
                  activePage === link.key
                    ? "text-[#F0FBFF]"
                    : "text-[#F0FBFF]/80"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
            {user ? (
              <div className="bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-t-white/20 border-l-white/10 border-b-black/20 border-r-black/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-gradient-to-br from-[#2E94B9]/30 to-[#2E94B9]/10 rounded-full border border-[#2E94B9]/50 shadow-inner">
                    <User size={24} className="text-[#ACDCEE]" />
                  </div>
                  <span className="block text-[#F0FBFF] font-bold text-xl leading-none">
                    {firstName}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-[#F0FBFF]/90 hover:text-[#F0FBFF] hover:bg-white/10 rounded-xl transition-all duration-300 font-medium cursor-pointer"
                    >
                      {item.mobileIcon} {item.label}
                    </button>
                  ))}
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
  );
}
