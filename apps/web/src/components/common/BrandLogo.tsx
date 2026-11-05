import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function BrandLogo({ className = "", size = "md", showTagline = true }: BrandLogoProps) {
  const badgeSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const svgSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Chrome V-emblem */}
      <div
        className={`${badgeSizes[size]} rounded-lg bg-gradient-to-tr from-[#002A5D] via-[#003F87] to-[#00B4D8] p-0.5 shadow-md flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
          <svg
            className={`${svgSizes[size]} text-[#003F87] transition-transform group-hover:scale-110 duration-200`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35L2.5 4h4.15L12 14.88 17.35 4h4.15L12 21.35z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-extrabold tracking-wider text-[#003F87] leading-none`}>
          VINFAST
        </span>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
            Vietnam Official
          </span>
        )}
      </div>
    </Link>
  );
}
