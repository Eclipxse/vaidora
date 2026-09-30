import type { ReactNode } from "react";

export function StoreIntro({
  title,
  description,
  children,
  tone = "cobalt",
}: {
  title: string;
  description: string;
  children?: ReactNode;
  tone?: "cobalt" | "citron" | "paper";
}) {
  return (
    <header className={`page-heading store-intro intro-${tone}`}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="intro-aside">{children}</div>}
    </header>
  );
}
