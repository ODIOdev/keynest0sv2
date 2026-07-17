"use client";

import { useRouter } from "next/navigation";

export function DeletePropertyButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-red-600"
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
  return (
    <button
      type="button"
      className="text-sm text-red-600"
      onClick={async () => {
        await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}

export function DeleteMediaButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-red-600"
      onClick={async () => {
        await fetch(`/api/upload?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
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
