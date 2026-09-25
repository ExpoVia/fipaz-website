import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 font-black transition-all disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--expo-navy)] bg-[var(--expo-yellow)] text-[var(--expo-navy)] shadow-[3px_3px_0_var(--expo-navy)] enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 enabled:active:shadow-none",
  secondary:
    "border-[var(--expo-navy)] bg-white text-[var(--expo-navy)] enabled:hover:bg-[var(--expo-bg)]",
  danger:
    "border-rose-900 bg-rose-600 text-white enabled:hover:bg-rose-700",
  ghost:
    "border-transparent text-[var(--expo-navy)] enabled:hover:bg-[var(--expo-bg)]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClasses({ variant = "secondary", size = "md", className }: ButtonStyleOptions) {
  return clsx(BASE, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  loading?: boolean;
  leadingIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  className,
  loading = false,
  leadingIcon,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : leadingIcon}
      {children}
    </button>
  );
}

interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    ButtonStyleOptions {
  href: string;
  leadingIcon?: ReactNode;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  leadingIcon,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(buttonClasses({ variant, size, className }), "hover:-translate-y-0.5")}
      {...rest}
    >
      {leadingIcon}
      {children}
    </Link>
  );
}
