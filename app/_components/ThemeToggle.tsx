"use client";

import { useEffect, useState } from "react";
import { useColorScheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import IconButton from "@mui/material/IconButton";

import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle() {
  const t = useTranslations("common");
  const { mode, systemMode, setMode } = useColorScheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolved = mode === "system" ? systemMode : mode;
  const isDark = mounted && resolved === "dark";

  return (
    <IconButton
      type="button"
      aria-label={t("actions.toggleTheme")}
      onClick={() => setMode(isDark ? "light" : "dark")}
      sx={{
        width: 36,
        height: 36,
        borderRadius: "999px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.secondary",
        fontSize: "16px",
        "&:hover": { color: "text.primary", borderColor: "text.disabled" },
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
