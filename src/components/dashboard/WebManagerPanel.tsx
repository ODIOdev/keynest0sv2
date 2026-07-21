"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type {
  SiteProcessStep,
  SiteSettings,
  SiteStat,
  SiteTestimonial,
} from "@/lib/types";

type SectionId =
  | "brand"
  | "hero"
  | "featured"
  | "about"
  | "journey"
  | "choose"
  | "stats"
  | "process"
  | "agents"
  | "testimonials"
  | "blog";

const SECTIONS: {
  id: SectionId;
  title: string;
  hint: string;
  preview: string;
}[] = [
  {
    id: "brand",
    title: "Brand",
    hint: "Logo, name, and tagline across the site",
    preview: "Header · Footer · Preloader",
  },
  {
    id: "hero",
    title: "Hero",
    hint: "First viewport headline, support copy, and background",
    preview: "Home · Top",
  },
  {
    id: "featured",
    title: "Featured properties",
    hint: "Section title above featured listings",
    preview: "Home · Listings",
  },
  {
    id: "about",
    title: "About",
    hint: "Story block with image",
    preview: "Home · About",
  },
  {
    id: "journey",
    title: "Categories journey",
    hint: "Heading above property type carousel",
    preview: "Home · Categories",
  },
  {
    id: "choose",
    title: "Why choose us",
    hint: "Dark feature section copy and image",
    preview: "Home · Choose",
  },
  {
    id: "stats",
    title: "Stats",
    hint: "Headline and success metrics",
    preview: "Home · Numbers",
  },
  {
    id: "process",
    title: "Process",
    hint: "Three-step buying journey with images",
    preview: "Home · Process",
  },
  {
    id: "agents",
    title: "Agents",
    hint: "Section title for agent marquee",
    preview: "Home · Agents",
  },
  {
    id: "testimonials",
    title: "Testimonials",
    hint: "Quotes, names, and avatars",
    preview: "Home · Stories",
  },
  {
    id: "blog",
    title: "Blog",
    hint: "Section title for latest posts",
    preview: "Home · Blog",
  },
];

async function uploadImage(file: File, alt: string) {
  const data = new FormData();
  data.append("file", file);
  data.append("alt", alt);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) throw new Error("Upload failed");
  const asset = (await res.json()) as { url?: string };
  if (!asset.url) throw new Error("Upload failed");
  return asset.url;
}

function ImageField({
  label,
  value,
  uploading,
  onUpload,
  onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="wm-image">
      <div className="wm-image__preview">
        {value ? (
          <Image src={value} alt="" fill className="object-cover" sizes="160px" />
        ) : (
          <span className="wm-image__placeholder">No image</span>
        )}
      </div>
      <div className="wm-image__meta">
        <p className="wm-image__label">{label}</p>
        <div className="wm-image__actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && onClear ? (
            <button
              type="button"
              className="btn-secondary"
              disabled={uploading}
              onClick={onClear}
            >
              Clear
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  hint,
  preview,
  open,
  onToggle,
  children,
  status,
  onSave,
  saving,
}: {
  title: string;
  hint: string;
  preview: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  status: string | null;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <article className={`wm-card${open ? " is-open" : ""}`}>
      <button type="button" className="wm-card__head" onClick={onToggle}>
        <div className="wm-card__copy">
          <p className="wm-card__preview">{preview}</p>
          <h2 className="wm-card__title">{title}</h2>
          <p className="wm-card__hint">{hint}</p>
        </div>
        <span className="wm-card__chevron" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div className="wm-card__body">
          {children}
          <div className="wm-card__footer">
            {status ? <p className="wm-card__status">{status}</p> : <span />}
            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Saving…" : "Save section"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function WebManagerPanel({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [openId, setOpenId] = useState<SectionId | null>("hero");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
    setError(null);
  }

  function patchStat(index: number, next: Partial<SiteStat>) {
    setSettings((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, ...next } : s)),
    }));
    setStatus(null);
  }

  function patchStep(index: number, next: Partial<SiteProcessStep>) {
    setSettings((prev) => ({
      ...prev,
      processSteps: prev.processSteps.map((s, i) =>
        i === index ? { ...s, ...next } : s,
      ),
    }));
    setStatus(null);
  }

  function patchTestimonial(index: number, next: Partial<SiteTestimonial>) {
    setSettings((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t, i) =>
        i === index ? { ...t, ...next } : t,
      ),
    }));
    setStatus(null);
  }

  async function savePatch(patchBody: Partial<SiteSettings>) {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });
      if (!res.ok) throw new Error("Could not save");
      const next = (await res.json()) as SiteSettings;
      setSettings(next);
      setStatus("Saved — live on the public site.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(
    key: string,
    file: File,
    apply: (url: string) => void,
  ) {
    setUploadingKey(key);
    setError(null);
    try {
      const url = await uploadImage(file, key);
      apply(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  }

  function sectionPatch(id: SectionId): Partial<SiteSettings> {
    switch (id) {
      case "brand":
        return {
          brandName: settings.brandName,
          brandLogo: settings.brandLogo,
          tagline: settings.tagline,
        };
      case "hero":
        return {
          heroHeadline: settings.heroHeadline,
          heroSupport: settings.heroSupport,
          heroImage: settings.heroImage,
          heroTitle: settings.heroTitle,
        };
      case "featured":
        return { featuredHeading: settings.featuredHeading };
      case "about":
        return {
          aboutHeading: settings.aboutHeading,
          aboutText: settings.aboutText,
          aboutImage: settings.aboutImage,
        };
      case "journey":
        return { journeyHeading: settings.journeyHeading };
      case "choose":
        return {
          chooseHeading: settings.chooseHeading,
          chooseText: settings.chooseText,
          chooseImage: settings.chooseImage,
        };
      case "stats":
        return {
          statsHeading: settings.statsHeading,
          stats: settings.stats,
        };
      case "process":
        return {
          processHeading: settings.processHeading,
          processSteps: settings.processSteps,
        };
      case "agents":
        return { agentsHeading: settings.agentsHeading };
      case "testimonials":
        return {
          testimonialsHeading: settings.testimonialsHeading,
          testimonials: settings.testimonials,
        };
      case "blog":
        return { blogHeading: settings.blogHeading };
    }
  }

  return (
    <div className="wm">
      <div className="wm-toolbar">
        <div>
          <p className="wm-toolbar__kicker">Public website</p>
          <p className="wm-toolbar__copy">
            Edit each homepage section. Changes publish immediately after save.
          </p>
        </div>
        <div className="wm-toolbar__actions">
          <Link href="/" className="btn-secondary" target="_blank">
            Preview site
          </Link>
          <Link href="/dashboard/media" className="btn-secondary">
            Media library
          </Link>
        </div>
      </div>

      {error ? (
        <p className="wm-banner wm-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="wm-grid">
        {SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            title={section.title}
            hint={section.hint}
            preview={section.preview}
            open={openId === section.id}
            onToggle={() =>
              setOpenId((prev) => (prev === section.id ? null : section.id))
            }
            status={openId === section.id ? status : null}
            saving={saving && openId === section.id}
            onSave={() => void savePatch(sectionPatch(section.id))}
          >
            {section.id === "brand" ? (
              <div className="wm-fields">
                <ImageField
                  label="Logo"
                  value={settings.brandLogo}
                  uploading={uploadingKey === "brandLogo"}
                  onUpload={(file) =>
                    void handleUpload("brandLogo", file, (url) =>
                      patch("brandLogo", url),
                    )
                  }
                  onClear={() => patch("brandLogo", "")}
                />
                <label className="field">
                  <span>Brand name</span>
                  <input
                    value={settings.brandName}
                    onChange={(e) => patch("brandName", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Tagline</span>
                  <input
                    value={settings.tagline}
                    onChange={(e) => patch("tagline", e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {section.id === "hero" ? (
              <div className="wm-fields">
                <ImageField
                  label="Hero background"
                  value={settings.heroImage}
                  uploading={uploadingKey === "heroImage"}
                  onUpload={(file) =>
                    void handleUpload("heroImage", file, (url) =>
                      patch("heroImage", url),
                    )
                  }
                />
                <label className="field">
                  <span>Headline</span>
                  <input
                    value={settings.heroHeadline}
                    onChange={(e) => patch("heroHeadline", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Supporting dialog</span>
                  <textarea
                    rows={3}
                    value={settings.heroSupport}
                    onChange={(e) => patch("heroSupport", e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {section.id === "featured" ? (
              <label className="field">
                <span>Section heading</span>
                <input
                  value={settings.featuredHeading}
                  onChange={(e) => patch("featuredHeading", e.target.value)}
                />
              </label>
            ) : null}

            {section.id === "about" ? (
              <div className="wm-fields">
                <ImageField
                  label="About image"
                  value={settings.aboutImage}
                  uploading={uploadingKey === "aboutImage"}
                  onUpload={(file) =>
                    void handleUpload("aboutImage", file, (url) =>
                      patch("aboutImage", url),
                    )
                  }
                />
                <label className="field">
                  <span>Heading</span>
                  <input
                    value={settings.aboutHeading}
                    onChange={(e) => patch("aboutHeading", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Body copy</span>
                  <textarea
                    rows={5}
                    value={settings.aboutText}
                    onChange={(e) => patch("aboutText", e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {section.id === "journey" ? (
              <label className="field">
                <span>Section heading</span>
                <input
                  value={settings.journeyHeading}
                  onChange={(e) => patch("journeyHeading", e.target.value)}
                />
              </label>
            ) : null}

            {section.id === "choose" ? (
              <div className="wm-fields">
                <ImageField
                  label="Feature image"
                  value={settings.chooseImage}
                  uploading={uploadingKey === "chooseImage"}
                  onUpload={(file) =>
                    void handleUpload("chooseImage", file, (url) =>
                      patch("chooseImage", url),
                    )
                  }
                />
                <label className="field">
                  <span>Heading</span>
                  <input
                    value={settings.chooseHeading}
                    onChange={(e) => patch("chooseHeading", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Body copy</span>
                  <textarea
                    rows={5}
                    value={settings.chooseText}
                    onChange={(e) => patch("chooseText", e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {section.id === "stats" ? (
              <div className="wm-fields">
                <label className="field">
                  <span>Section heading</span>
                  <input
                    value={settings.statsHeading}
                    onChange={(e) => patch("statsHeading", e.target.value)}
                  />
                </label>
                <div className="wm-subgrid">
                  {settings.stats.map((stat, index) => (
                    <div key={index} className="wm-subcard">
                      <p className="wm-subcard__label">Stat {index + 1}</p>
                      <label className="field">
                        <span>Value</span>
                        <input
                          value={stat.value}
                          onChange={(e) =>
                            patchStat(index, { value: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Label</span>
                        <input
                          value={stat.label}
                          onChange={(e) =>
                            patchStat(index, { label: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Description</span>
                        <textarea
                          rows={3}
                          value={stat.description}
                          onChange={(e) =>
                            patchStat(index, { description: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {section.id === "process" ? (
              <div className="wm-fields">
                <label className="field">
                  <span>Section heading</span>
                  <input
                    value={settings.processHeading}
                    onChange={(e) => patch("processHeading", e.target.value)}
                  />
                </label>
                <div className="wm-subgrid wm-subgrid--stack">
                  {settings.processSteps.map((step, index) => (
                    <div key={index} className="wm-subcard">
                      <p className="wm-subcard__label">{step.step || `Step ${index + 1}`}</p>
                      <ImageField
                        label="Step image"
                        value={step.image}
                        uploading={uploadingKey === `process-${index}`}
                        onUpload={(file) =>
                          void handleUpload(`process-${index}`, file, (url) =>
                            patchStep(index, { image: url }),
                          )
                        }
                      />
                      <label className="field">
                        <span>Step label</span>
                        <input
                          value={step.step}
                          onChange={(e) =>
                            patchStep(index, { step: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Title</span>
                        <input
                          value={step.title}
                          onChange={(e) =>
                            patchStep(index, { title: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Copy</span>
                        <textarea
                          rows={3}
                          value={step.text}
                          onChange={(e) =>
                            patchStep(index, { text: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {section.id === "agents" ? (
              <label className="field">
                <span>Section heading</span>
                <input
                  value={settings.agentsHeading}
                  onChange={(e) => patch("agentsHeading", e.target.value)}
                />
              </label>
            ) : null}

            {section.id === "testimonials" ? (
              <div className="wm-fields">
                <label className="field">
                  <span>Section heading</span>
                  <input
                    value={settings.testimonialsHeading}
                    onChange={(e) =>
                      patch("testimonialsHeading", e.target.value)
                    }
                  />
                </label>
                <div className="wm-subgrid">
                  {settings.testimonials.map((item, index) => (
                    <div key={index} className="wm-subcard">
                      <p className="wm-subcard__label">Story {index + 1}</p>
                      <ImageField
                        label="Avatar"
                        value={item.image}
                        uploading={uploadingKey === `testimonial-${index}`}
                        onUpload={(file) =>
                          void handleUpload(
                            `testimonial-${index}`,
                            file,
                            (url) => patchTestimonial(index, { image: url }),
                          )
                        }
                      />
                      <label className="field">
                        <span>Quote</span>
                        <input
                          value={item.quote}
                          onChange={(e) =>
                            patchTestimonial(index, { quote: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Details</span>
                        <textarea
                          rows={3}
                          value={item.text}
                          onChange={(e) =>
                            patchTestimonial(index, { text: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Name</span>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            patchTestimonial(index, { name: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Place</span>
                        <input
                          value={item.place}
                          onChange={(e) =>
                            patchTestimonial(index, { place: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {section.id === "blog" ? (
              <label className="field">
                <span>Section heading</span>
                <input
                  value={settings.blogHeading}
                  onChange={(e) => patch("blogHeading", e.target.value)}
                />
              </label>
            ) : null}
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
