"use client";

import React from "react";

export function PixelLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 font-black ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_3px_6px_rgba(47,45,76,0.35)]"
      >
        {/* Outer rounded mark */}
        <rect x="2" y="2" width="28" height="28" rx="9" fill="#1677B8" />
        {/* Pixel diagonal route grid */}
        <rect x="6" y="8" width="4" height="4" fill="#FFC21A" />
        <rect x="10" y="12" width="4" height="4" fill="#FFC21A" />
        <rect x="14" y="16" width="4" height="4" fill="#FFFFFF" />
        <rect x="18" y="20" width="4" height="4" fill="#F4A2C0" />
        <rect x="22" y="24" width="4" height="4" fill="#F4A2C0" />
        {/* NFC wave dots */}
        <rect x="18" y="8" width="3" height="3" fill="#9ED8C9" />
        <rect x="22" y="12" width="3" height="3" fill="#9ED8C9" />
        <rect x="10" y="20" width="3" height="3" fill="#B984B6" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-[var(--expo-navy)]">
        Fexpo
      </span>
    </div>
  );
}

export function PixelStar({ className = "w-5 h-5", color = "#FFC21A" }: { className?: string; color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      {/* Chispa de cuatro puntas, suave: antes era un sprite de pasos ortogonales. */}
      <path
        d="M10 1C10.3 4.6 11 6.9 12.2 8.1 13.4 9.3 15.5 10 19 10 15.5 10 13.4 10.7 12.2 11.9 11 13.1 10.3 15.4 10 19 9.7 15.4 9 13.1 7.8 11.9 6.6 10.7 4.5 10 1 10 4.5 10 6.6 9.3 7.8 8.1 9 6.9 9.7 4.6 10 1Z"
        fill={color}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PixelTrophy({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="2" width="16" height="10" fill="#FFC21A" stroke="#2F2D4C" strokeWidth="2" />
      <rect x="2" y="4" width="4" height="4" fill="#FFC21A" stroke="#2F2D4C" strokeWidth="1.5" />
      <rect x="18" y="4" width="4" height="4" fill="#FFC21A" stroke="#2F2D4C" strokeWidth="1.5" />
      <rect x="10" y="12" width="4" height="5" fill="#2F2D4C" />
      <rect x="6" y="17" width="12" height="4" fill="#B984B6" stroke="#2F2D4C" strokeWidth="2" />
    </svg>
  );
}

export function PixelRewardChest({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
      {/* Cofre de premio, con esquinas redondeadas y sin el contorno navy duro del sprite original. */}
      <rect x="4" y="12" width="24" height="16" rx="5" fill="#B984B6" />
      <path d="M4 16C4 13.8 5.8 12 8 12H24C26.2 12 28 13.8 28 16V18H4V16Z" fill="#8357A5" />
      <rect x="9" y="12" width="3" height="16" rx="1.5" fill="#FFC21A" opacity="0.9" />
      <rect x="20" y="12" width="3" height="16" rx="1.5" fill="#FFC21A" opacity="0.9" />
      <circle cx="16" cy="19" r="4" fill="#FFC21A" />
      <circle cx="16" cy="19" r="1.4" fill="#8357A5" />
    </svg>
  );
}

export function PixelNfcPlaque({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      {/* Placa NFC: esquinas suaves, sin el borde navy duro ni el trazo en escuadra. */}
      <rect x="3" y="3" width="34" height="34" rx="12" fill="#1677B8" />
      <rect x="8" y="8" width="24" height="24" rx="8" fill="#FFFFFF" />
      <path
        d="M15 26V14L21 26V14"
        stroke="#1677B8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M25 13C28 16 28 24 25 27" stroke="#62BE5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M28 16C29.5 18 29.5 22 28 24" stroke="#62BE5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PixelCharacter({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className={className}>
      {/* Hair / Cap */}
      <rect x="20" y="8" width="24" height="8" fill="#2F2D4C" />
      <rect x="16" y="12" width="32" height="8" fill="#1677B8" />
      <rect x="40" y="16" width="12" height="4" fill="#FFC21A" />
      {/* Head / Face */}
      <rect x="20" y="20" width="24" height="16" fill="#F28A72" />
      {/* Eyes */}
      <rect x="24" y="24" width="4" height="4" fill="#2F2D4C" />
      <rect x="36" y="24" width="4" height="4" fill="#2F2D4C" />
      {/* Body / Shirt */}
      <rect x="16" y="36" width="32" height="20" rx="2" fill="#B984B6" stroke="#2F2D4C" strokeWidth="2" />
      <rect x="26" y="36" width="12" height="10" fill="#FFFFFF" />
      {/* Smartphone in hand */}
      <rect x="42" y="40" width="12" height="18" rx="2" fill="#2F2D4C" />
      <rect x="44" y="42" width="8" height="12" fill="#82B5E3" />
      <rect x="47" y="46" width="2" height="4" fill="#FFC21A" />
    </svg>
  );
}

export function PixelMapPin({ className = "w-6 h-6", color = "#F28A72" }: { className?: string; color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      {/* Pin de mapa clásico: antes era un contorno en escalones, ahora una gota suave. */}
      <path
        d="M12 22C12 22 19 14.6 19 9.5C19 5.4 15.9 2 12 2C8.1 2 5 5.4 5 9.5C5 14.6 12 22 12 22Z"
        fill={color}
      />
      <circle cx="12" cy="9.5" r="3" fill="#FFFFFF" />
    </svg>
  );
}

export function PixelBadge({ text, color = "bg-[var(--expo-yellow)]" }: { text: string; color?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide text-[var(--expo-navy)] shadow-sm ${color}`}
    >
      <PixelStar className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
