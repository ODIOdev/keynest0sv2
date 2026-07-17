"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function MediaUploader() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Uploading...");
    const form = e.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) {
      setStatus("Upload failed");
      return;
    }
    setStatus("Uploaded");
    form.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-dashed border-[#cfcfcf] bg-white p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Upload images</h2>
        <p className="text-sm text-[#758696]">
          Upload property, category, or agent images. Files are stored in{" "}
          <code>/public/uploads</code>.
        </p>
      </div>
      <label className="field">
        <span>Image file</span>
        <input name="file" type="file" accept="image/*" required />
      </label>
      <label className="field">
        <span>Alt text</span>
        <input name="alt" placeholder="Front elevation" />
      </label>
      <button className="btn-primary" type="submit">
        Upload
      </button>
      {status ? <p className="text-sm text-[#758696]">{status}</p> : null}
    </form>
  );
}
