import type { ReactNode } from "react";
import Box from "@mui/material/Box";

export default function SwapLink({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        fontSize: "14px",
        color: "text.secondary",
        pt: 0.5,
        "& a": {
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: "1px",
          "&:hover": { borderColor: "text.disabled" },
        },
      }}
    >
      {children}
    </Box>
  );
}

export const inlineLinkSx = {
  color: "text.primary",
  borderBottom: "1px solid",
  borderColor: "divider",
  pb: "1px",
  "&:hover": { borderColor: "text.disabled" },
} as const;
