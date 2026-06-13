export const serif = { fontFamily: "var(--font-newsreader), serif" } as const;

export const mono = {
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  textTransform: "uppercase",
} as const;

export const ghostSx = {
  color: "text.primary",
  borderColor: "divider",
  bgcolor: "transparent",
  "&:hover": { borderColor: "text.disabled", bgcolor: "transparent" },
} as const;

export const container = {
  width: "100%",
  maxWidth: "clamp(1040px, 92vw, 1120px)",
  mx: "auto",
  px: { xs: "20px", md: "32px" },
} as const;

export const appBarSx = {
  bgcolor:
    "color-mix(in oklab, var(--mui-palette-background-default) 88%, transparent)",
  backdropFilter: "saturate(1.1) blur(8px)",
  WebkitBackdropFilter: "saturate(1.1) blur(8px)",
  borderBottom: "1px solid",
  borderColor: "dividerSoft",
  color: "text.primary",
} as const;
