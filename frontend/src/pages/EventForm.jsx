import { useState, useEffect } from "react";
import api from "../services/api";
import {
  Type,
  FileText,
  MapPin,
  Calendar,
  Users,
  Tag,
  Layers,
} from "lucide-react";

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-[#F0FBFF] placeholder-[#F0FBFF]/40 focus:outline-none focus:border-[#2E94B9]/50 focus:ring-1 focus:ring-[#2E94B9]/30 transition-all";

const labelClass = "block text-sm font-medium text-[#F0FBFF]/80 mb-2";

export default function EventForm({
  initialData,
  onSubmit,
  isSubmitting,
  title,
}) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    event_date: initialData?.event_date
      ? initialData.event_date.slice(0, 16)
      : "",
    capacity: initialData?.capacity || "",
    category_id: initialData?.category_id || "",
    subcategory_id: initialData?.subcategory_id || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([api.get("/categories/"), api.get("/subcategories/")])
      .then(([catRes, subRes]) => {
        setCategories(catRes.data.results || catRes.data);
        setSubcategories(subRes.data.results || subRes.data);
      })
      .catch(() => {});
  }, []);

  const filteredSubcategories = formData.category_id
    ? subcategories.filter((sc) => sc.category === formData.category_id)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "category_id") {
        next.subcategory_id = "";
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Título é obrigatório";
    if (!formData.description.trim())
      newErrors.description = "Descrição é obrigatória";
    if (!formData.location.trim()) newErrors.location = "Local é obrigatório";
    if (!formData.event_date) {
      newErrors.event_date = "Data é obrigatória";
    } else if (new Date(formData.event_date) <= new Date()) {
      newErrors.event_date = "A data deve ser no futuro";
    }
    if (!formData.capacity || Number(formData.capacity) < 1) {
      newErrors.capacity = "Capacidade deve ser pelo menos 1";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      event_date: new Date(formData.event_date).toISOString(),
      capacity: Number(formData.capacity),
    };
    if (formData.category_id) payload.category_id = formData.category_id;
    if (formData.subcategory_id)
      payload.subcategory_id = formData.subcategory_id;

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-[#F0FBFF] mb-2">{title}</h2>

      {/* Title */}
      <div>
        <label className={labelClass}>Título</label>
        <div className="relative">
          <Type
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
          />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nome do evento"
            className={inputClass}
          />
        </div>
        {errors.title && (
          <p className="text-red-400 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Descrição</label>
        <div className="relative">
          <FileText
            size={18}
            className="absolute left-3.5 top-3.5 text-[#ACDCEE]/60"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o evento..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-[#F0FBFF] placeholder-[#F0FBFF]/40 focus:outline-none focus:border-[#2E94B9]/50 focus:ring-1 focus:ring-[#2E94B9]/30 transition-all resize-none"
          />
        </div>
        {errors.description && (
          <p className="text-red-400 text-xs mt-1">{errors.description}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className={labelClass}>Local</label>
        <div className="relative">
          <MapPin
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Local do evento"
            className={inputClass}
          />
        </div>
        {errors.location && (
          <p className="text-red-400 text-xs mt-1">{errors.location}</p>
        )}
      </div>

      {/* Date and Capacity row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Data e Hora</label>
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
            />
            <input
              type="datetime-local"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          {errors.event_date && (
            <p className="text-red-400 text-xs mt-1">{errors.event_date}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Capacidade</label>
          <div className="relative">
            <Users
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
            />
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Vagas"
              min="1"
              className={inputClass}
            />
          </div>
          {errors.capacity && (
            <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>
          )}
        </div>
      </div>

      {/* Category and Subcategory row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoria (opcional)</label>
          <div className="relative">
            <Tag
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
            />
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Nenhuma</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#475053]">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Subcategoria (opcional)</label>
          <div className="relative">
            <Layers
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ACDCEE]/60"
            />
            <select
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
              disabled={!formData.category_id}
              className={`${inputClass} appearance-none disabled:opacity-40`}
            >
              <option value="">Nenhuma</option>
              {filteredSubcategories.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#475053]">
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#2E94B9] to-[#1f7596] hover:from-[#1f7596] hover:to-[#2E94B9] text-[#F0FBFF] font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(46,148,185,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-t border-white/20"
      >
        {isSubmitting
          ? "Salvando..."
          : initialData
            ? "Salvar Alterações"
            : "Criar Evento"}
      </button>
    </form>
  );
}
