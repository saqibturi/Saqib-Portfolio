import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase";
export const metadata = {
  title: "Owner sign in",
  robots: { index: false, follow: false },
};
export default function Login() {
  return <AuthForm configured={configured()} />;
}
