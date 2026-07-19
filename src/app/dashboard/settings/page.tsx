import { redirect } from "next/navigation";
import { SETTINGS } from "@/lib/settings-routes";

export default function SettingsIndexPage() {
  redirect(SETTINGS.profile);
}
