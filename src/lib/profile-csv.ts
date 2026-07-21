import type { ProfileSocialLink } from "@/lib/auth-types";

export type ProfileCsvData = {
  fullName: string;
  phone: string;
  zipZone: string;
  dateOfBirth: string;
  gender: string;
  socialLinks: ProfileSocialLink[];
};

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function newSocialId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `social-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a downloadable profile CSV (profile fields + social rows). */
export function buildProfileCsv(data: ProfileCsvData & { email?: string }) {
  const lines = [
    [
      "section",
      "platform",
      "handle",
      "full_name",
      "phone",
      "zip_zone",
      "date_of_birth",
      "gender",
      "email",
    ]
      .map(escapeCsv)
      .join(","),
    [
      "profile",
      "",
      "",
      data.fullName,
      data.phone,
      data.zipZone,
      data.dateOfBirth,
      data.gender,
      data.email || "",
    ]
      .map(escapeCsv)
      .join(","),
  ];

  for (const social of data.socialLinks) {
    if (!social.handle.trim()) continue;
    lines.push(
      ["social", social.platform, social.handle, "", "", "", "", "", ""]
        .map(escapeCsv)
        .join(","),
    );
  }

  return `${lines.join("\n")}\n`;
}

export function downloadProfileCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse a profile CSV. Accepts the export format or a simple header row. */
export function parseProfileCsv(text: string): ProfileCsvData {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const hasSection = header.includes("section");

  let fullName = "";
  let phone = "";
  let zipZone = "";
  let dateOfBirth = "";
  let gender = "";
  const socialLinks: ProfileSocialLink[] = [];

  if (hasSection) {
    const idx = {
      section: header.indexOf("section"),
      platform: header.indexOf("platform"),
      handle: header.indexOf("handle"),
      full_name: header.indexOf("full_name"),
      phone: header.indexOf("phone"),
      zip_zone: header.indexOf("zip_zone"),
      date_of_birth: header.indexOf("date_of_birth"),
      gender: header.indexOf("gender"),
    };

    for (const line of lines.slice(1)) {
      const cells = parseCsvLine(line);
      const section = (cells[idx.section] || "").toLowerCase();
      if (section === "profile") {
        if (idx.full_name >= 0) fullName = cells[idx.full_name] || fullName;
        if (idx.phone >= 0) phone = cells[idx.phone] || phone;
        if (idx.zip_zone >= 0) zipZone = cells[idx.zip_zone] || zipZone;
        if (idx.date_of_birth >= 0) {
          dateOfBirth = cells[idx.date_of_birth] || dateOfBirth;
        }
        if (idx.gender >= 0) gender = cells[idx.gender] || gender;
      } else if (section === "social") {
        const platform = (cells[idx.platform] || "Other").trim() || "Other";
        const handle = (cells[idx.handle] || "").trim();
        if (handle) {
          socialLinks.push({ id: newSocialId(), platform, handle });
        }
      }
    }
  } else {
    const nameIdx = header.indexOf("full_name");
    const phoneIdx = header.indexOf("phone");
    const zipIdx = header.indexOf("zip_zone");
    const dobIdx = header.indexOf("date_of_birth");
    const genderIdx = header.indexOf("gender");
    const platformIdx = header.indexOf("social_platform");
    const handleIdx = header.indexOf("social_handle");

    if (
      nameIdx < 0 &&
      phoneIdx < 0 &&
      zipIdx < 0 &&
      dobIdx < 0 &&
      genderIdx < 0
    ) {
      throw new Error(
        "Unrecognized CSV. Export a profile CSV first, or include full_name / phone / zip_zone columns.",
      );
    }

    for (const line of lines.slice(1)) {
      const cells = parseCsvLine(line);
      if (nameIdx >= 0 && cells[nameIdx]) fullName = cells[nameIdx];
      if (phoneIdx >= 0 && cells[phoneIdx]) phone = cells[phoneIdx];
      if (zipIdx >= 0 && cells[zipIdx]) zipZone = cells[zipIdx];
      if (dobIdx >= 0 && cells[dobIdx]) dateOfBirth = cells[dobIdx];
      if (genderIdx >= 0 && cells[genderIdx] !== undefined) {
        gender = cells[genderIdx];
      }
      const platform = (platformIdx >= 0 ? cells[platformIdx] : "") || "Other";
      const handle = (handleIdx >= 0 ? cells[handleIdx] : "").trim();
      if (handle) {
        socialLinks.push({
          id: newSocialId(),
          platform: platform.trim() || "Other",
          handle,
        });
      }
    }
  }

  return { fullName, phone, zipZone, dateOfBirth, gender, socialLinks };
}
