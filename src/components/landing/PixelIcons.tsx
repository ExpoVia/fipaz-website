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
        className="shrink-0 drop-shadow-[2px_2px_0_#2F2D4C]"
      >
        {/* Outer pixel border */}
        <rect x="2" y="2" width="28" height="28" rx="6" fill="#1677B8" stroke="#2F2D4C" strokeWidth="2.5" />
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
      <path
        d="M9 1H11V5H15V7H19V9H15V13H11V17H9V13H5V9H1V7H5V5H9V1Z"
        fill={color}
        stroke="#2F2D4C"
        strokeWidth="1.5"
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
      {/* Chest body */}
      <rect x="4" y="10" width="24" height="18" rx="2" fill="#B984B6" stroke="#2F2D4C" strokeWidth="2" />
      <rect x="4" y="10" width="24" height="6" fill="#8357A5" stroke="#2F2D4C" strokeWidth="2" />
      {/* Gold lock & bands */}
      <rect x="8" y="10" width="3" height="18" fill="#FFC21A" />
      <rect x="21" y="10" width="3" height="18" fill="#FFC21A" />
      <rect x="13" y="14" width="6" height="6" fill="#FFC21A" stroke="#2F2D4C" strokeWidth="1.5" />
      <rect x="15" y="16" width="2" height="2" fill="#2F2D4C" />
    </svg>
  );
}

export function PixelNfcPlaque({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      <rect x="3" y="3" width="34" height="34" rx="6" fill="#1677B8" stroke="#2F2D4C" strokeWidth="2.5" />
      <rect x="7" y="7" width="26" height="26" rx="4" fill="#FFFFFF" />
      {/* NFC icon */}
      <path
        d="M14 26V14L20 26V14"
        stroke="#1677B8"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="23" y="14" width="3" height="12" fill="#62BE5A" />
      <rect x="27" y="17" width="2" height="6" fill="#62BE5A" />
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
      <path
        d="M12 2H8V4H6V8H8V12H10V16H12V22H14V16H16V12H18V8H20V4H18V2H12Z"
        fill={color}
        stroke="#2F2D4C"
        strokeWidth="1.5"
      />
      <rect x="10" y="6" width="4" height="4" fill="#FFFFFF" />
    </svg>
  );
}

export function PixelBadge({ text, color = "bg-[var(--expo-yellow)]" }: { text: string; color?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--expo-navy)] border-2 border-[var(--expo-navy)] ${color} shadow-[2px_2px_0_var(--expo-navy)] font-mono rounded-sm`}
    >
      <PixelStar className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
