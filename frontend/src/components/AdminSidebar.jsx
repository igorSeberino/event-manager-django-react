import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, Tag } from "lucide-react";

const links = [
  {
    label: "Dashboard",
    path: "/admin",
    key: "dashboard",
    icon: LayoutDashboard,
  },
  { label: "Eventos", path: "/admin/eventos", key: "eventos", icon: Calendar },
  { label: "Usuários", path: "/admin/usuarios", key: "usuarios", icon: Users },
  {
    label: "Categorias",
    path: "/admin/categorias",
    key: "categorias",
    icon: Tag,
  },
];

export default function AdminSidebar({ activeSection }) {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-row lg:flex-col gap-2 mb-8 lg:mb-0 overflow-x-auto pb-2 lg:pb-0">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = activeSection === link.key;
        return (
          <button
            key={link.key}
            onClick={() => navigate(link.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#2E94B9]/20 text-[#ACDCEE] border border-[#2E94B9]/30"
                : "text-[#F0FBFF]/60 hover:text-[#F0FBFF] hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
