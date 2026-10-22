"use client";

import React, { useState } from "react";
import { PixelStar } from "../landing/PixelIcons";
import { Send, Loader2, Shield } from "lucide-react";

interface FeedbackFormProps {
  onSubmitted: () => void;
}

export function FeedbackForm({ onSubmitted }: FeedbackFormProps) {
  const [participantType, setParticipantType] = useState<string>("Visitante");
  const [valueRating, setValueRating] = useState<number>(0);
  const [easeRating, setEaseRating] = useState<number>(0);
  const [intentRating, setIntentRating] = useState<number>(0);
  const [valuableFeature, setValuableFeature] = useState<string[]>([]);
  
  const [confusingPart, setConfusingPart] = useState<string>("");
  const [missingFeature, setMissingFeature] = useState<string>("");
  const [singleChange, setSingleChange] = useState<string>("");
  const [additionalComment, setAdditionalComment] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const participantOptions = ["Visitante", "Expositor", "Organizador"];
  
  const featureOptions = [
    "Mapa",
    "Búsqueda",
    "NFC",
    "Misiones",
    "Recompensas",
    "Perfil de expositor",
  ];

  const toggleFeature = (feature: string) => {
    if (valuableFeature.includes(feature)) {
      setValuableFeature(valuableFeature.filter((f) => f !== feature));
    } else {
      setValuableFeature([...valuableFeature, feature]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (valueRating === 0 || easeRating === 0 || intentRating === 0) {
      setErrorMsg("Por favor califica los 3 aspectos generales (1 a 5 estrellas).");
      return;
    }

    setLoading(true);

    // Simulate clean frontend submission delay
    setTimeout(() => {
      setLoading(false);
      onSubmitted();
    }, 1000);
  };

  const renderRatingScale = (
    label: string,
    currentValue: number,
    onChange: (val: number) => void
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-extrabold text-[var(--expo-navy)] dark:text-[#F5F9FF]">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            type="button"
            key={val}
            onClick={() => onChange(val)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 font-mono text-sm font-black transition-all ${
              currentValue >= val
                ? "border-[var(--expo-navy)] bg-[var(--expo-yellow)] text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] dark:border-[#FFCA35] dark:bg-[#FFCA35] dark:text-[#0B1220] dark:shadow-none"
                : "border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6] dark:hover:bg-[#16233D]/80"
            }`}
          >
            {val}
          </button>
        ))}
        {currentValue > 0 && (
          <span className="ml-2 font-mono text-xs font-bold text-[var(--expo-blue)] dark:text-[#A9D0FF]">
            {currentValue}/5
          </span>
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* Participant Type Selection */}
      <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none">
        <label className="block text-sm font-black text-[var(--expo-navy)] mb-3 dark:text-[#F5F9FF]">
          ¿En qué calidad participas en la feria? <span className="text-rose-500">*</span>
        </label>

        <div className="grid grid-cols-3 gap-3">
          {participantOptions.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setParticipantType(option)}
              className={`rounded-xl border-2 py-3 px-2 text-center text-sm font-black transition-all ${
                participantType === option
                  ? "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[3px_3px_0_var(--expo-navy)] dark:border-[#1479F5] dark:bg-[#1479F5] dark:shadow-none"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6] dark:hover:bg-[#16233D]/80"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] space-y-6 dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none">
        <h3 className="text-base font-black text-[var(--expo-navy)] border-b border-slate-200 pb-3 flex items-center gap-2 dark:border-[#223354] dark:text-[#F5F9FF]">
          <PixelStar className="w-4 h-4 text-amber-400" />
          Evaluación general (1 a 5)
        </h3>

        {renderRatingScale("Valor percibido de la solución", valueRating, setValueRating)}
        {renderRatingScale("Facilidad de uso e interacción", easeRating, setEaseRating)}
        {renderRatingScale("Intención de uso en una próxima feria", intentRating, setIntentRating)}
      </div>

      {/* Valuable Features Selection */}
      <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none">
        <label className="block text-sm font-black text-[var(--expo-navy)] mb-1 dark:text-[#F5F9FF]">
          ¿Qué función te pareció más valiosa?
        </label>
        <p className="text-xs text-slate-500 font-medium mb-4 dark:text-[#B8C7E6]">Puedes elegir una o varias opciones.</p>

        <div className="flex flex-wrap gap-2.5">
          {featureOptions.map((feat) => {
            const isSelected = valuableFeature.includes(feat);
            return (
              <button
                type="button"
                key={feat}
                onClick={() => toggleFeature(feat)}
                className={`rounded-lg border-2 px-3.5 py-2 text-xs font-extrabold transition-all ${
                  isSelected
                    ? "border-[var(--expo-navy)] bg-[var(--expo-mint)] text-[var(--expo-navy)] shadow-[2px_2px_0_var(--expo-navy)] dark:border-emerald-500/50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:shadow-none"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6] dark:hover:border-[#1479F5]"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {feat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea Questions */}
      <div className="rounded-2xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[6px_6px_0_var(--expo-navy)] space-y-6 dark:border-[#223354] dark:bg-[#101A2E] dark:shadow-none">
        <div>
          <label className="block text-sm font-black text-[var(--expo-navy)] mb-1 dark:text-[#F5F9FF]">
            ¿Qué parte te resultó confusa?
          </label>
          <textarea
            rows={3}
            value={confusingPart}
            onChange={(e) => setConfusingPart(e.target.value)}
            placeholder="Ejemplo: La indicación de la ruta o la forma de activar el NFC..."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6]/40 dark:focus:border-[#1479F5]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-[var(--expo-navy)] mb-1 dark:text-[#F5F9FF]">
            ¿Qué función te hizo falta?
          </label>
          <textarea
            rows={3}
            value={missingFeature}
            onChange={(e) => setMissingFeature(e.target.value)}
            placeholder="Ejemplo: Notificaciones de eventos en vivo o agenda de exposiciones..."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6]/40 dark:focus:border-[#1479F5]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-[var(--expo-navy)] mb-1 dark:text-[#F5F9FF]">
            Si pudieras cambiar una sola cosa, ¿cuál sería?
          </label>
          <textarea
            rows={3}
            value={singleChange}
            onChange={(e) => setSingleChange(e.target.value)}
            placeholder="Ejemplo: El tamaño de los mapas o los puntos requeridos para misiones..."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6]/40 dark:focus:border-[#1479F5]"
          />
        </div>

        <div>
          <label className="block text-sm font-black text-[var(--expo-navy)] mb-1 dark:text-[#F5F9FF]">
            Comentario adicional (Opcional)
          </label>
          <textarea
            rows={2}
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            placeholder="Cualquier idea o sugerencia adicional..."
            className="w-full rounded-xl border-2 border-slate-300 p-3 text-sm font-medium focus:border-[var(--expo-blue)] focus:outline-none dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6]/40 dark:focus:border-[#1479F5]"
          />
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 p-3 rounded-xl border border-slate-200 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#B8C7E6]">
        <Shield className="h-4 w-4 text-[var(--expo-blue)] shrink-0 dark:text-[#1479F5]" />
        <span>No recopilamos ni solicitamos datos personales identificables ni información sensible.</span>
      </div>

      {/* Validation Error Message */}
      {errorMsg && (
        <div className="rounded-xl border-2 border-rose-500 bg-rose-50 p-4 text-xs font-black text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 border-3 border-[var(--expo-navy)] bg-[var(--expo-yellow)] py-4 text-center text-lg font-black text-[var(--expo-navy)] shadow-[6px_6px_0_var(--expo-navy)] transition-all hover:-translate-y-0.5 hover:bg-[#FFE066] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 dark:border-[#223354] dark:bg-[#FFCA35] dark:text-[#0B1220] dark:shadow-none"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Enviando feedback...</span>
          </>
        ) : (
          <>
            <span>Enviar feedback</span>
            <Send className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
