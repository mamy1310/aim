import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AuthHead from "../_components/AuthHead";
import ResetForm from "./ResetForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.meta.reset");
  return { title: t("title"), description: t("description") };
}

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.reset");
  return (
    <>
      <AuthHead route="/reset-password" title={t("title")} subtitle={t("subtitle")} />
      <ResetForm />
    </>
  );
}
