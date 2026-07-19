"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

const STORAGE_KEY = "cat-undo";
const UNDO_MS = 8000;

export type CategoryUndoPayload = {
  category: Category;
  linkedPropertyIds: string[];
  expiresAt: number;
};

function readPayload(): CategoryUndoPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CategoryUndoPayload;
    if (!data?.category?.id || data.expiresAt <= Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function stashCategoryUndo(payload: Omit<CategoryUndoPayload, "expiresAt">) {
  const data: CategoryUndoPayload = {
    ...payload,
    expiresAt: Date.now() + UNDO_MS,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("cat-undo"));
}

export function CategoryUndoToast() {
  const router = useRouter();
  const [undo, setUndo] = useState<CategoryUndoPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function sync() {
      const next = readPayload();
      setUndo(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!next) return;
      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setUndo(null);
      }, Math.max(0, next.expiresAt - Date.now()));
    }
    sync();
    window.addEventListener("cat-undo", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cat-undo", sync);
      window.removeEventListener("storage", sync);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function onUndo() {
    if (!undo) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    sessionStorage.removeItem(STORAGE_KEY);
    setUndo(null);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restore: true,
        category: undo.category,
        linkedPropertyIds: undo.linkedPropertyIds,
      }),
    });
    router.refresh();
  }

  if (!undo) return null;

  return (
    <div className="cat-undo" role="status">
      <span>“{undo.category.name}” deleted.</span>
      <button type="button" className="cat-undo__btn" onClick={() => void onUndo()}>
        Undo
      </button>
    </div>
  );
}
