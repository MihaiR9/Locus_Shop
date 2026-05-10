"use client";

import { useRouter } from "next/navigation";

export function LoginMockButton() {
  const router = useRouter();

  function handleLogin() {
    document.cookie = "locus-admin-session=mock; path=/; max-age=86400; samesite=lax";
    router.push("/admin");
  }

  return (
    <button type="button" className="btn btn-solid admin-login-btn" onClick={handleLogin}>
      intră în admin (mock)
      <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
        <use href="#arrow-right" />
      </svg>
    </button>
  );
}
