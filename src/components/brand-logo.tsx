import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  variant?: "light" | "dark" | "crest-only";
  width?: number;
  height?: number;
  priority?: boolean;
}

export function BrandLogo({
  className = "",
  variant = "light",
  width,
  height,
  priority = false,
}: BrandLogoProps) {
  if (variant === "crest-only") {
    const w = width || 44;
    const h = height || 36;
    return (
      <Link
        href="/"
        className={`inline-flex items-center ${className}`}
        aria-label="Vaidora Perfume home"
      >
        <Image
          src="/lotus-crest.png"
          alt="Vaidora Perfume Crest"
          width={w}
          height={h}
          preload={priority}
          className="object-contain"
        />
      </Link>
    );
  }

  const defaultW = width || 170;
  const defaultH = height || 88;

  return (
    <Link
      href="/"
      className={`header-brand-link inline-flex items-center ${className}`}
      aria-label="Vaidora Perfume home"
    >
      <Image
        src="/vaidora-logo-transparent.png"
        alt="Vaidora Perfume"
        width={defaultW}
        height={defaultH}
        preload={priority}
        className="header-brand-logo object-contain"
      />
    </Link>
  );
}
