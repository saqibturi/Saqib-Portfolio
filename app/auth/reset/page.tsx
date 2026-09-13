import { AuthForm } from "@/components/auth-form";
import { owner } from "@/lib/supabase";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};
export default async function Reset() {
  if (!(await owner())) redirect("/login");
  return <AuthForm reset />;
}
