import { redirect } from "next/navigation";

/** Legacy path — middleware also redirects here. */
export default function LegacyLoginPage() {
  redirect("/sign-in");
}
