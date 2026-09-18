"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";

import { categories } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import type { StandCategory } from "@/types/demo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegistrationForm() {
  const router = useRouter();
  const registerCompany = usePanelStore((state) => state.registerCompany);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<StandCategory | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !category || !contactEmail.trim() || !description.trim()) {
      setErrorMsg("Completa todos los campos para continuar.");
      return;
    }
    if (!EMAIL_PATTERN.test(contactEmail.trim())) {
      setErrorMsg("Ingresa un correo de contacto válido.");
      return;
    }

    setLoading(true);
    registerCompany({
      name: name.trim(),
      category,
      contactEmail: contactEmail.trim(),
      description: description.trim(),
    });

    setTimeout(() => {
      router.push("/panel/mi-stand");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 pb-16">
      <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] space-y-5">
        <div>
          <label htmlFor="company-name" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
            Nombre de la empresa <span className="text-rose-500">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Altura Labs"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-black text-[var(--expo-navy)]">
            Categoría <span className="text-rose-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl border-2 px-2 py-2.5 text-center text-xs font-black transition-all ${
                  category === cat.id
                    ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)]"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="company-email" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
            Correo de contacto <span className="text-rose-500">*</span>
          </label>
          <input
            id="company-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contacto@tuempresa.com"
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="company-description" className="mb-1 block text-sm font-black text-[var(--expo-navy)]">
            Describe tu empresa en una frase <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="company-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Plataforma de desarrollo de apps móviles con IA para el mercado andino."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs font-medium text-slate-500">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--expo-blue)]" />
        <span>
          Tu zona y código de stand se asignan automáticamente según tu categoría. Podrás completar el resto de tu perfil después.
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-xl border-2 border-rose-500 bg-rose-50 p-4 text-xs font-black text-rose-800">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 border-3 border-[var(--expo-navy)] bg-[var(--expo-yellow)] py-4 text-center text-lg font-black text-[var(--expo-navy)] shadow-[6px_6px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 hover:bg-[#FFE066] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Creando tu cuenta...</span>
          </>
        ) : (
          <>
            <span>Registrar mi empresa</span>
            <UserPlus className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
