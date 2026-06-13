"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { PasswordField, PasswordStrength } from "../_components/fields";
import { AuthSubmit } from "../_components/buttons";
import { inlineLinkSx } from "../_components/swap";

export default function ResetForm() {
  const t = useTranslations("auth.reset");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (password.length < 8) {
      setPwError(true);
      ok = false;
    }
    if (confirm !== password) {
      setConfirmError(t("confirmMismatch"));
      ok = false;
    }
    if (!ok) return;

    setLoading(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => router.push("/login"), 900);
    }, 800);
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 2 }}>
      <PasswordField
        label={t("password")}
        autoComplete="new-password"
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={(v) => {
          setPassword(v);
          setPwError(false);
        }}
        error={pwError}
      >
        <PasswordStrength value={password} hint={t("hint")} />
      </PasswordField>

      <PasswordField
        label={t("confirm")}
        autoComplete="new-password"
        placeholder={t("confirmPlaceholder")}
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          setConfirmError("");
        }}
        error={!!confirmError}
        message={confirmError}
        messageError
      />

      <AuthSubmit
        label={t("submit")}
        loadingLabel={done ? t("submitDone") : t("submitLoading")}
        loading={loading}
      />

      <Box sx={{ textAlign: "center", fontSize: "14px" }}>
        <Link href="/login" underline="none" sx={inlineLinkSx}>
          {t("back")}
        </Link>
      </Box>
    </Box>
  );
}
