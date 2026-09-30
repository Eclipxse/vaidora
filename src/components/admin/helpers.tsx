"use client";
import { useEffect, useRef } from "react";
import { X } from "../icons";
export async function request<T = Record<string, unknown>>(
  url: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const r = await fetch(url, {
    method,
    headers:
      body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}
export async function upload(file: File) {
  const f = new FormData();
  f.set("file", file);
  return request<{ url: string; width: number; height: number }>(
    "/api/admin/upload",
    f,
  );
}
export function Notice({ message }: { message: string }) {
  return message ? (
    <div className="admin-notice" role="status">
      {message}
    </div>
  ) : null;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="admin-dialog" onCancel={onClose}>
      <div className="dialog-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Close editor"
          onClick={onClose}
        >
          <X size={23} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
