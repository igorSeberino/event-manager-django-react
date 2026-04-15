import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Shield,
  Pencil,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Check,
} from "lucide-react";

const ROLE_LABEL = {
  ADMIN: "Administrador",
  ORGANIZER: "Organizador",
  USER: "Usuário",
};

export default function Perfil() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleStartEdit = () => {
    setEditing(true);
    setName(user.name);
    setEmail(user.email);
    setFeedbackMsg(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setName(user.name);
    setEmail(user.email);
    setFeedbackMsg(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/users/${user.id}/`, { name, email });
      login({ ...user, name: res.data.name, email: res.data.email });
      setEditing(false);
      setFeedbackMsg({
        type: "success",
        text: "Perfil atualizado com sucesso!",
      });
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.name?.[0] ||
        "Erro ao atualizar perfil.";
      setFeedbackMsg({ type: "error", text: detail });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setFeedbackMsg({
        type: "error",
        text: "A senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedbackMsg({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setSaving(true);
    setFeedbackMsg(null);
    try {
      await api.patch(`/users/${user.id}/`, { password: newPassword });
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setFeedbackMsg({ type: "success", text: "Senha alterada com sucesso!" });
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.password?.[0] ||
        "Erro ao alterar senha.";
      setFeedbackMsg({ type: "error", text: detail });
    } finally {
      setSaving(false);
    }
  };

  const passwordRequirements = [
    { label: "8+ caracteres", ok: newPassword.length >= 8 },
    { label: "Maiúscula", ok: /[A-Z]/.test(newPassword) },
    { label: "Minúscula", ok: /[a-z]/.test(newPassword) },
    { label: "Número", ok: /[0-9]/.test(newPassword) },
    { label: "Especial", ok: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
    { label: "Coincidem", ok: newPassword && newPassword === confirmPassword },
  ];

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col">
      <div className="fixed top-[-20%] left-[-15%] w-[600px] h-[600px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[200px] opacity-25 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-15%] w-[600px] h-[600px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[200px] opacity-15 z-0 pointer-events-none"></div>

      <Navbar activePage={null} />

      <main className="relative z-10 flex-grow max-w-2xl mx-auto px-4 py-10 md:py-14 lg:px-8 w-full">
        <p className="text-[#ACDCEE] text-sm font-semibold uppercase tracking-widest mb-2">
          Conta
        </p>
        <h2 className="text-3xl font-extrabold text-[#F0FBFF] tracking-tight mb-8">
          Meu Perfil
        </h2>

        {/* Feedback */}
        {feedbackMsg && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/[0.08] border border-emerald-500/[0.15] text-emerald-400"
                : "bg-red-500/[0.08] border border-red-500/[0.15] text-red-400"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {feedbackMsg.text}
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Avatar header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E94B9]/30 to-[#2E94B9]/5 border border-[#2E94B9]/20 flex items-center justify-center">
                <User size={28} className="text-[#ACDCEE]/70" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#F0FBFF]">
                  {editing ? name : user.name}
                </p>
                <p className="text-[13px] text-[#ACDCEE]/60 font-medium mt-1">
                  {ROLE_LABEL[user.role] || user.role}
                </p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 text-[#F0FBFF]/35 hover:text-[#ACDCEE] text-[13px] font-medium transition-colors cursor-pointer"
              >
                <Pencil size={14} /> Editar
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="px-8 py-6 space-y-5">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[#F0FBFF]/30 uppercase tracking-widest mb-2">
                <User size={12} /> Nome completo
              </label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF] text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#2E94B9]/50 focus:border-[#2E94B9]/30 outline-none transition-all"
                />
              ) : (
                <p className="text-[15px] text-[#F0FBFF]/75 py-1">
                  {user.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[#F0FBFF]/30 uppercase tracking-widest mb-2">
                <Mail size={12} /> E-mail
              </label>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF] text-sm rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#2E94B9]/50 focus:border-[#2E94B9]/30 outline-none transition-all"
                />
              ) : (
                <p className="text-[15px] text-[#F0FBFF]/75 py-1">
                  {user.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[#F0FBFF]/30 uppercase tracking-widest mb-2">
                <Shield size={12} /> Perfil de acesso
              </label>
              <p className="text-[15px] text-[#F0FBFF]/75 py-1">
                {ROLE_LABEL[user.role] || user.role}
              </p>
            </div>

            {/* Save / Cancel */}
            {editing && (
              <div className="flex gap-2.5 pt-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !name.trim() || !email.trim()}
                  className="inline-flex items-center gap-2 bg-[#2E94B9] hover:bg-[#2E94B9]/90 text-[#F0FBFF] font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_16px_rgba(46,148,185,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:shadow-none text-sm"
                >
                  <Save size={15} />{" "}
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 text-[#F0FBFF]/40 hover:text-[#F0FBFF]/70 py-2.5 px-5 rounded-xl transition-colors cursor-pointer text-sm font-medium"
                >
                  <X size={15} /> Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security card */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl mt-5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock size={16} className="text-[#ACDCEE]/50" />
              <h3 className="text-sm font-bold text-[#F0FBFF]/70">Segurança</h3>
            </div>
            {!changingPassword && (
              <button
                onClick={() => {
                  setChangingPassword(true);
                  setFeedbackMsg(null);
                }}
                className="flex items-center gap-2 text-[#F0FBFF]/35 hover:text-[#ACDCEE] text-[13px] font-medium transition-colors cursor-pointer"
              >
                <Pencil size={14} /> Alterar senha
              </button>
            )}
          </div>

          <div className="px-8 py-6">
            {changingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#F0FBFF]/30 uppercase tracking-widest mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF] text-sm rounded-xl px-4 py-3 pr-12 focus:ring-1 focus:ring-[#2E94B9]/50 focus:border-[#2E94B9]/30 outline-none transition-all placeholder-[#F0FBFF]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0FBFF]/20 hover:text-[#ACDCEE] cursor-pointer transition-colors"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#F0FBFF]/30 uppercase tracking-widest mb-2">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-[#F0FBFF] text-sm rounded-xl px-4 py-3 pr-12 focus:ring-1 focus:ring-[#2E94B9]/50 focus:border-[#2E94B9]/30 outline-none transition-all placeholder-[#F0FBFF]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0FBFF]/20 hover:text-[#ACDCEE] cursor-pointer transition-colors"
                    >
                      {showConfirmPass ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 pt-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${
                        req.ok ? "text-emerald-400" : "text-[#F0FBFF]/20"
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                      {req.label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-[#2E94B9] hover:bg-[#2E94B9]/90 text-[#F0FBFF] font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_16px_rgba(46,148,185,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:shadow-none text-sm"
                  >
                    <Save size={15} />{" "}
                    {saving ? "Salvando..." : "Alterar senha"}
                  </button>
                  <button
                    onClick={() => {
                      setChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setFeedbackMsg(null);
                    }}
                    className="inline-flex items-center gap-2 text-[#F0FBFF]/40 hover:text-[#F0FBFF]/70 py-2.5 px-5 rounded-xl transition-colors cursor-pointer text-sm font-medium"
                  >
                    <X size={15} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[#F0FBFF]/30 text-sm">
                Altere sua senha a qualquer momento para manter sua conta
                segura.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
