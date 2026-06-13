import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cocoa px-5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
