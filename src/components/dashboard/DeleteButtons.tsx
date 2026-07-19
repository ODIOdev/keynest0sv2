"use client";

import { useRouter } from "next/navigation";
import { stashCategoryUndo } from "@/components/dashboard/CategoryUndoToast";

export function DeletePropertyButton({
  id,
  className = "text-sm text-red-600",
}: {
  id: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch(`/api/properties?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    const data = await res.json();
    stashCategoryUndo({
      category: data.category,
      linkedPropertyIds: data.linkedPropertyIds ?? [],
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      className="cat-tile__btn cat-tile__btn--danger"
      onClick={() => void onDelete()}
    >
      Delete
    </button>
  );
}

export function DeleteMediaButton({
  id,
  variant = "text",
}: {
  id: string;
  variant?: "text" | "icon";
}) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/upload?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        className="media-recent__delete"
        onClick={() => void onDelete()}
        aria-label="Delete image"
        title="Delete"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="text-sm text-red-600"
      onClick={() => void onDelete()}
    >
      Delete
    </button>
  );
}

export function DeleteAgentButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-red-600"
      onClick={async () => {
        await fetch(`/api/agents?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}
