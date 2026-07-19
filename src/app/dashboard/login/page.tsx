import { redirect } from "next/navigation";
import { AUTH } from "@/lib/auth-routes";

/** Legacy path — middleware also redirects here. */
export default function LegacyLoginPage() {
  redirect(AUTH.signIn);
}
