import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ForgotForm from "./ForgotForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.meta.forgot");
  return { title: t("title"), description: t("description") };
}

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
