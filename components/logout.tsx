"use client";
import { useRouter } from "next/navigation";
import { adminAction } from "./admin-helpers";
export function Logout() {
  const router = useRouter();
  return (
    <button
      className="button secondary small-button"
      onClick={async () => {
        await adminAction({ action: "logout" });
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
