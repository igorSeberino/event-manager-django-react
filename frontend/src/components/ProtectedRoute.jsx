import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#475053] flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
            <ShieldX size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#F0FBFF] mb-2">
            Acesso Negado
          </h2>
          <p className="text-[#F0FBFF]/60 mb-8">
            Você não tem permissão para acessar esta página.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#2E94B9] hover:bg-[#1f7596] text-[#F0FBFF] px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <ArrowLeft size={18} /> Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  return children;
}
