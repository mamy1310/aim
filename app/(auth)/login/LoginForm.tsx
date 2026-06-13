"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { AlertCircleIcon } from "../../_components/icons";
import { Field, PasswordField, OrDivider } from "../_components/fields";
import { AuthSubmit, GoogleButton } from "../_components/buttons";
import SwapLink, { inlineLinkSx } from "../_components/swap";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const tc = useTranslations("auth.common");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pwError, setPwError] = useState(false);
  const [banner, setBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(false);
    let ok = true;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(tc("emailInvalid"));
      ok = false;
    }
    if (!password) {
      setPwError(true);
      ok = false;
    }
    if (!ok) return;

    setLoading(true);
    setTimeout(() => {
      if (/ok$/i.test(password)) {
        router.push("/dashboard");
      } else {
        setLoading(false);
        setBanner(true);
        setPwError(true);
      }
    }, 700);
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 2 }}>
      {banner ? (
        <Box
          role="alert"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            p: "12px 14px",
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "error.main",
            bgcolor: "error.light",
            color: "error.main",
            fontSize: "13.5px",
            lineHeight: 1.45,
          }}
        >
          <Box component="span" aria-hidden sx={{ display: "inline-flex", fontSize: "16px", mt: "1px" }}>
            <AlertCircleIcon />
          </Box>
          <span>
            <Box component="strong" sx={{ fontWeight: 600 }}>
              {t("bannerTitle")}
            </Box>{" "}
            {t("bannerBody")}
          </span>
        </Box>
      ) : null}

      <Field
        label={tc("email")}
        type="email"
        autoComplete="email"
        placeholder={tc("emailPlaceholder")}
        value={email}
        onChange={(v) => {
          setEmail(v);
          setEmailError("");
          setBanner(false);
        }}
        error={!!emailError}
        message={emailError}
        messageError
      />

      <PasswordField
        label={t("password")}
        autoComplete="current-password"
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={(v) => {
          setPassword(v);
          setPwError(false);
          setBanner(false);
        }}
        error={pwError}
        labelRight={
          <Link href="/forgot-password" underline="none" sx={{ fontSize: "13px", color: "text.secondary", borderBottom: "1px solid", borderColor: "divider", pb: "1px", "&:hover": { color: "text.primary" } }}>
            {t("forgot")}
          </Link>
        }
      />

      <AuthSubmit label={t("submit")} loadingLabel={t("submitLoading")} loading={loading} />

      <OrDivider />
      <GoogleButton />

      <SwapLink>
        {t.rich("swap", {
          link: (chunks) => (
            <Link href="/register" underline="none" sx={inlineLinkSx}>
              {chunks}
            </Link>
          ),
        })}
      </SwapLink>
    </Box>
  );
}
