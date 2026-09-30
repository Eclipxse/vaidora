"use client";
import { createContext, useContext, useEffect, useState } from "react";
const Context = createContext<{
  saved: string[];
  toggle: (id: string) => void;
}>({ saved: [], toggle: () => {} });
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("vaidora-favorites") || "[]");
      if (Array.isArray(v)) setSaved(v.filter((x) => typeof x === "string"));
    } catch {}
  }, []);
  const toggle = (id: string) =>
    setSaved((old) => {
      const next = old.includes(id)
        ? old.filter((s) => s !== id)
        : [...old, id];
      try {
        localStorage.setItem("vaidora-favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  return (
    <Context.Provider value={{ saved, toggle }}>{children}</Context.Provider>
  );
}
export const useFavorites = () => useContext(Context);
