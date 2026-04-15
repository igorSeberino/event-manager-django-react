import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  UserPlus,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validação simples de senha no front-end
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/users/", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMsg("Conta criada com sucesso! Redirecionando...");

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        // Tenta capturar a mensagem de erro específica do Django (ex: e-mail já existe)
        const backendError = Object.values(error.response.data)[0];
        setErrorMsg(
          Array.isArray(backendError)
            ? backendError[0]
            : "Erro ao criar conta. Verifique os dados.",
        );
      } else {
        setErrorMsg("Erro ao conectar com o servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden flex flex-col justify-center items-center p-4">
      {/* Elementos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[150px] opacity-30 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[150px] opacity-20 z-0 pointer-events-none"></div>

      {/* Botão de Voltar */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-[#ACDCEE] hover:text-[#F0FBFF] font-medium transition-colors hover:cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar para Início
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Header do Cadastro */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#2E94B9]/40 to-transparent rounded-2xl border border-white/5 shadow-inner">
            <GraduationCap size={40} className="text-[#ACDCEE]" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide text-[#F0FBFF]">
            Criar <span className="text-[#ACDCEE] font-light">Conta</span>
          </h1>
          <p className="text-[#F0FBFF]/70 text-sm font-light mt-1 text-center">
            Junte-se à plataforma e participe dos eventos
          </p>
        </div>

        {/* Card de Cadastro */}
        <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-b-black/20 border-r-black/20 border-t-white/20 border-l-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E94B9]/10 rounded-full filter blur-[40px] pointer-events-none"></div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 flex flex-col gap-4"
          >
            {/* Mensagens de Erro ou Sucesso */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-200 text-sm px-4 py-3 rounded-xl text-center">
                {successMsg}
              </div>
            )}

            {/* Input Nome */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#ACDCEE] tracking-wide ml-1">
                Nome Completo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-[#ACDCEE]/70 group-focus-within:text-[#ACDCEE] transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  required
                  className="w-full bg-black/20 border border-white/10 focus:border-[#2E94B9] rounded-xl pl-11 pr-4 py-2.5 text-[#F0FBFF] placeholder-white/30 outline-none transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            {/* Input E-mail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#ACDCEE] tracking-wide ml-1">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className="text-[#ACDCEE]/70 group-focus-within:text-[#ACDCEE] transition-colors"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Digite seu e-mail"
                  required
                  className="w-full bg-black/20 border border-white/10 focus:border-[#2E94B9] rounded-xl pl-11 pr-4 py-2.5 text-[#F0FBFF] placeholder-white/30 outline-none transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#ACDCEE] tracking-wide ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className="text-[#ACDCEE]/70 group-focus-within:text-[#ACDCEE] transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-black/20 border border-white/10 focus:border-[#2E94B9] rounded-xl pl-11 pr-12 py-2.5 text-[#F0FBFF] placeholder-white/30 outline-none transition-all duration-300 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#ACDCEE]/70 hover:text-[#ACDCEE] hover:cursor-pointer transition-colors bg-transparent border-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Input Confirmar Senha */}
            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-sm font-semibold text-[#ACDCEE] tracking-wide ml-1">
                Confirmar Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className="text-[#ACDCEE]/70 group-focus-within:text-[#ACDCEE] transition-colors"
                  />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                  className="w-full bg-black/20 border border-white/10 focus:border-[#2E94B9] rounded-xl pl-11 pr-12 py-2.5 text-[#F0FBFF] placeholder-white/30 outline-none transition-all duration-300 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#ACDCEE]/70 hover:text-[#ACDCEE] hover:cursor-pointer transition-colors bg-transparent border-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Botão Cadastrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full group relative bg-gradient-to-br from-[#2E94B9] to-[#1f7596] text-[#F0FBFF] font-semibold py-3.5 px-6 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_24px_rgba(46,148,185,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 border-t border-white/20 hover:cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="animate-pulse">Criando conta...</span>
              ) : (
                <>
                  Finalizar Cadastro
                  <UserPlus
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center text-sm text-[#F0FBFF]/70 relative z-10">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#ACDCEE] hover:text-[#F0FBFF] font-semibold transition-colors bg-transparent border-none p-0 hover:cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
