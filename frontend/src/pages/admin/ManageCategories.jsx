import { useState, useEffect } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Check,
  Tag,
  Layers,
} from "lucide-react";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Category form state
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  // Subcategory form state
  const [newSubName, setNewSubName] = useState("");
  const [newSubCatId, setNewSubCatId] = useState("");
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");
  const [confirmDeleteSub, setConfirmDeleteSub] = useState(null);
  const [savingSub, setSavingSub] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/categories/"), api.get("/subcategories/")])
      .then(([catRes, subRes]) => {
        setCategories(catRes.data.results || catRes.data);
        setSubcategories(subRes.data.results || subRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Category CRUD ---
  const createCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post("/categories/", { name: newCatName.trim() });
      setCategories((prev) => [...prev, res.data]);
      setNewCatName("");
      setFeedbackMsg({ type: "success", text: "Categoria criada." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao criar categoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingCat(false);
    }
  };

  const updateCategory = async (catId) => {
    if (!editCatName.trim()) return;
    setSavingCat(true);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/categories/${catId}/`, {
        name: editCatName.trim(),
      });
      setCategories((prev) => prev.map((c) => (c.id === catId ? res.data : c)));
      setEditingCatId(null);
      setFeedbackMsg({ type: "success", text: "Categoria atualizada." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao atualizar categoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCategory = async (catId) => {
    setSavingCat(true);
    setFeedbackMsg(null);
    try {
      await api.delete(`/categories/${catId}/`);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setSubcategories((prev) => prev.filter((s) => s.category !== catId));
      setConfirmDeleteCat(null);
      setFeedbackMsg({ type: "success", text: "Categoria excluída." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao excluir categoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingCat(false);
    }
  };

  // --- Subcategory CRUD ---
  const createSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCatId) return;
    setSavingSub(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post("/subcategories/", {
        name: newSubName.trim(),
        category: newSubCatId,
      });
      setSubcategories((prev) => [...prev, res.data]);
      setNewSubName("");
      setNewSubCatId("");
      setFeedbackMsg({ type: "success", text: "Subcategoria criada." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao criar subcategoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingSub(false);
    }
  };

  const updateSubcategory = async (subId) => {
    if (!editSubName.trim()) return;
    setSavingSub(true);
    setFeedbackMsg(null);
    try {
      const res = await api.patch(`/subcategories/${subId}/`, {
        name: editSubName.trim(),
      });
      setSubcategories((prev) =>
        prev.map((s) => (s.id === subId ? res.data : s)),
      );
      setEditingSubId(null);
      setFeedbackMsg({ type: "success", text: "Subcategoria atualizada." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao atualizar subcategoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingSub(false);
    }
  };

  const deleteSubcategory = async (subId) => {
    setSavingSub(true);
    setFeedbackMsg(null);
    try {
      await api.delete(`/subcategories/${subId}/`);
      setSubcategories((prev) => prev.filter((s) => s.id !== subId));
      setConfirmDeleteSub(null);
      setFeedbackMsg({ type: "success", text: "Subcategoria excluída." });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || "Erro ao excluir subcategoria.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setSavingSub(false);
    }
  };

  const getCategoryName = (catId) =>
    categories.find((c) => c.id === catId)?.name || "—";

  return (
    <div className="min-h-screen bg-[#475053] text-[#F0FBFF] font-sans relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2E94B9] rounded-full mix-blend-overlay filter blur-[180px] opacity-30 z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ACDCEE] rounded-full mix-blend-overlay filter blur-[180px] opacity-20 z-0 pointer-events-none"></div>

      <Navbar activePage="admin" />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-52 flex-shrink-0">
            <AdminSidebar activeSection="categorias" />
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Categorias</h1>
            <p className="text-[#F0FBFF]/50 mb-6">
              Crie, edite e exclua categorias e subcategorias
            </p>

            {feedbackMsg && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {feedbackMsg.text}
              </div>
            )}

            {loading ? (
              <div className="text-center py-20 text-[#ACDCEE]">
                Carregando...
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Categories Section */}
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Tag size={18} className="text-[#2E94B9]" />
                    Categorias
                    <span className="text-xs font-medium text-[#F0FBFF]/30 bg-white/5 px-2 py-0.5 rounded-md">
                      {categories.length}
                    </span>
                  </h2>

                  {/* Add form */}
                  <form onSubmit={createCategory} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nova categoria..."
                      className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F0FBFF] placeholder-[#F0FBFF]/40 focus:outline-none focus:border-[#2E94B9]/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={savingCat || !newCatName.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#2E94B9] hover:bg-[#1f7596] text-[#F0FBFF] rounded-lg transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Plus size={16} /> Criar
                    </button>
                  </form>

                  {/* List */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {categories.length === 0 ? (
                      <p className="text-center py-8 text-[#F0FBFF]/40 text-sm">
                        Nenhuma categoria.
                      </p>
                    ) : (
                      categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          {editingCatId === cat.id ? (
                            <>
                              <input
                                type="text"
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#F0FBFF] focus:outline-none focus:border-[#2E94B9]/50"
                                autoFocus
                              />
                              <button
                                onClick={() => updateCategory(cat.id)}
                                disabled={savingCat}
                                className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer text-emerald-400"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingCatId(null)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[#F0FBFF]/40"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-grow text-sm font-medium">
                                {cat.name}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditCatName(cat.name);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[#ACDCEE]/50 hover:text-[#ACDCEE]"
                              >
                                <Pencil size={14} />
                              </button>
                              {confirmDeleteCat === cat.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => deleteCategory(cat.id)}
                                    disabled={savingCat}
                                    className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-md transition-all cursor-pointer"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteCat(null)}
                                    className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer text-[#F0FBFF]/40"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteCat(cat.id)}
                                  className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-red-400/40 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subcategories Section */}
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Layers size={18} className="text-[#2E94B9]" />
                    Subcategorias
                    <span className="text-xs font-medium text-[#F0FBFF]/30 bg-white/5 px-2 py-0.5 rounded-md">
                      {subcategories.length}
                    </span>
                  </h2>

                  {/* Add form */}
                  <form
                    onSubmit={createSubcategory}
                    className="flex gap-2 mb-4"
                  >
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Nova subcategoria..."
                      className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F0FBFF] placeholder-[#F0FBFF]/40 focus:outline-none focus:border-[#2E94B9]/50 transition-all"
                    />
                    <select
                      value={newSubCatId}
                      onChange={(e) => setNewSubCatId(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F0FBFF] focus:outline-none focus:border-[#2E94B9]/50 transition-all appearance-none max-w-[140px]"
                    >
                      <option value="" className="bg-[#475053]">
                        Categoria...
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          className="bg-[#475053]"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={savingSub || !newSubName.trim() || !newSubCatId}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#2E94B9] hover:bg-[#1f7596] text-[#F0FBFF] rounded-lg transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Plus size={16} /> Criar
                    </button>
                  </form>

                  {/* List */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {subcategories.length === 0 ? (
                      <p className="text-center py-8 text-[#F0FBFF]/40 text-sm">
                        Nenhuma subcategoria.
                      </p>
                    ) : (
                      subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          {editingSubId === sub.id ? (
                            <>
                              <input
                                type="text"
                                value={editSubName}
                                onChange={(e) => setEditSubName(e.target.value)}
                                className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#F0FBFF] focus:outline-none focus:border-[#2E94B9]/50"
                                autoFocus
                              />
                              <button
                                onClick={() => updateSubcategory(sub.id)}
                                disabled={savingSub}
                                className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer text-emerald-400"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingSubId(null)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[#F0FBFF]/40"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {sub.name}
                                </p>
                                <p className="text-[10px] text-[#F0FBFF]/30">
                                  {getCategoryName(sub.category)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingSubId(sub.id);
                                  setEditSubName(sub.name);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[#ACDCEE]/50 hover:text-[#ACDCEE]"
                              >
                                <Pencil size={14} />
                              </button>
                              {confirmDeleteSub === sub.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => deleteSubcategory(sub.id)}
                                    disabled={savingSub}
                                    className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-md transition-all cursor-pointer"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteSub(null)}
                                    className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer text-[#F0FBFF]/40"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteSub(sub.id)}
                                  className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-red-400/40 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
