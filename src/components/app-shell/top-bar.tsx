import { ArrowLeft, UserRound } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title: string;
  description: string;
  onOpenProfile: () => void;
  isProfileActive: boolean;
}

export function TopBar({
  title,
  description,
  onOpenProfile,
  isProfileActive,
}: TopBarProps) {
  return (
    <header className="app-topbar">
      <Link
        className="app-topbar-action"
        href="/"
        aria-label="Volver al sitio de ExpoVia"
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.5} />
        <span className="hidden min-[360px]:inline">Sitio</span>
      </Link>

      <div className="min-w-0 text-center" aria-live="polite">
        <p className="truncate text-sm font-black text-white">{title}</p>
        <p className="sr-only">{description}</p>
      </div>

      <button
        type="button"
        className={`app-topbar-avatar ${isProfileActive ? "is-active" : ""}`}
        aria-label="Abrir mi perfil"
        aria-current={isProfileActive ? "page" : undefined}
        onClick={onOpenProfile}
      >
        <UserRound aria-hidden="true" size={20} strokeWidth={2.5} />
      </button>
    </header>
  );
}
