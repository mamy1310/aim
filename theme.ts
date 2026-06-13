import { createTheme } from "@mui/material/styles";
import type { CSSProperties } from "react";

import LinkBehavior from "@/app/_components/LinkBehavior";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    display: CSSProperties;
    bodyLg: CSSProperties;
  }
  interface TypographyVariantsOptions {
    display?: CSSProperties;
    bodyLg?: CSSProperties;
  }
  interface TypeBackground {
    sunk: string;
  }
  interface Palette {
    dividerSoft: string;
    elevation1: string;
    elevation2: string;
    elevation3: string;
    ill1: string;
    ill2: string;
    ill3: string;
    ill4: string;
    ill5: string;
    ill6: string;
  }
  interface PaletteOptions {
    dividerSoft?: string;
    elevation1?: string;
    elevation2?: string;
    elevation3?: string;
    ill1?: string;
    ill2?: string;
    ill3?: string;
    ill4?: string;
    ill5?: string;
    ill6?: string;
  }
  interface Theme {
    radius: { sm: number; md: number; lg: number; full: number };
  }
  interface ThemeOptions {
    radius?: { sm: number; md: number; lg: number; full: number };
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display: true;
    bodyLg: true;
  }
}

const FONT_SERIF =
  'var(--font-newsreader), "Newsreader", ui-serif, Georgia, serif';
const FONT_SANS =
  'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_MONO =
  'var(--font-geist-mono), "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },

  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#101418",
          light: "#70757b",
          dark: "#040608",
          contrastText: "#fcfdfe",
        },
        secondary: {
          main: "#174b72",
          light: "#dee9f3",
          dark: "#003057",
          contrastText: "#fcfdfe",
        },
        success: {
          main: "#306c48",
          light: "#dcf2e3",
        },
        error: {
          main: "#aa342c",
          light: "#ffe5df",
        },
        warning: {
          main: "#b57639",
          light: "#ffe8d2",
        },
        info: {
          main: "#24648b",
          light: "#daeefe",
        },
        grey: {
          50: "#fcfdfe",
          100: "#f4f6f8",
          200: "#eceef0",
          300: "#e1e3e5",
          400: "#b4b8bb",
          500: "#8e9397",
          600: "#595e63",
          700: "#292e34",
          800: "#101418",
          900: "#040608",
        },
        text: {
          primary: "#191d22",
          secondary: "#595e63",
          disabled: "#8e9397",
        },
        divider: "#e1e3e5",
        dividerSoft: "#eceef0",
        background: {
          default: "#fcfdfe",
          paper: "#ffffff",
          sunk: "#f4f6f8",
        },
        elevation1:
          "0 1px 0 oklch(0.91 0.004 240 / 0.6), 0 1px 2px oklch(0.2 0.01 250 / 0.04)",
        elevation2:
          "0 1px 0 oklch(0.91 0.004 240 / 0.8), 0 1px 2px oklch(0.2 0.01 250 / 0.04), 0 8px 24px -12px oklch(0.2 0.01 250 / 0.08)",
        elevation3:
          "0 1px 0 oklch(0.91 0.004 240 / 0.9), 0 2px 4px oklch(0.2 0.01 250 / 0.06), 0 24px 64px -24px oklch(0.2 0.01 250 / 0.18)",
        Alert: {
          errorStandardBg: "#ffe5df",
          errorColor: "#aa342c",
          errorIconColor: "#aa342c",
          successStandardBg: "#dcf2e3",
          successColor: "#306c48",
          successIconColor: "#306c48",
          warningStandardBg: "#ffe8d2",
          warningColor: "#b57639",
          warningIconColor: "#b57639",
          infoStandardBg: "#daeefe",
          infoColor: "#24648b",
          infoIconColor: "#24648b",
        },
        ill1: "oklch(0.93 0.018 245)",
        ill2: "oklch(0.86 0.030 245)",
        ill3: "oklch(0.74 0.045 245)",
        ill4: "oklch(0.55 0.060 245)",
        ill5: "oklch(0.88 0.020 70)",
        ill6: "oklch(0.85 0.035 160)",
      },
    },

    dark: {
      palette: {
        primary: {
          main: "#e7ecf0",
          light: "#576574",
          dark: "#f7fbfd",
          contrastText: "#0e1114",
        },
        secondary: {
          main: "#7fb5dc",
          light: "#163045",
          dark: "#aed7f5",
          contrastText: "#0e1114",
        },
        success: {
          main: "#88c99e",
          light: "#152c1e",
        },
        error: {
          main: "#ef958a",
          light: "#451e1a",
        },
        warning: {
          main: "#f1ad71",
          light: "#482b0e",
        },
        info: {
          main: "#84bfe9",
          light: "#112e42",
        },
        grey: {
          50: "#0a0d10",
          100: "#0e1114",
          200: "#14181c",
          300: "#1f2328",
          400: "#292e34",
          500: "#53595e",
          600: "#81878c",
          700: "#b3b8bd",
          800: "#e7ecf0",
          900: "#f7fbfd",
        },
        text: {
          primary: "#e7ecf0",
          secondary: "#b3b8bd",
          disabled: "#81878c",
        },
        divider: "#292e34",
        dividerSoft: "#1f2328",
        background: {
          default: "#0e1114",
          paper: "#14181c",
          sunk: "#0a0d10",
        },
        elevation1: "0 1px 0 oklch(0.30 0.012 250 / 0.6)",
        elevation2:
          "0 1px 0 oklch(0.30 0.012 250 / 0.6), 0 1px 2px oklch(0 0 0 / 0.25)",
        elevation3:
          "0 1px 0 oklch(0.30 0.012 250 / 0.7), 0 2px 4px oklch(0 0 0 / 0.3), 0 24px 64px -24px oklch(0 0 0 / 0.45)",
        Alert: {
          errorStandardBg: "#451e1a",
          errorColor: "#ef958a",
          errorIconColor: "#ef958a",
          successStandardBg: "#152c1e",
          successColor: "#88c99e",
          successIconColor: "#88c99e",
          warningStandardBg: "#482b0e",
          warningColor: "#f1ad71",
          warningIconColor: "#f1ad71",
          infoStandardBg: "#112e42",
          infoColor: "#84bfe9",
          infoIconColor: "#84bfe9",
        },
        ill1: "oklch(0.30 0.040 245)",
        ill2: "oklch(0.36 0.050 245)",
        ill3: "oklch(0.46 0.060 245)",
        ill4: "oklch(0.65 0.070 245)",
        ill5: "oklch(0.40 0.040 70)",
        ill6: "oklch(0.40 0.045 160)",
      },
      overlays: Array(25).fill("none") as string[] &
        import("@mui/material/styles").Overlays,
    },
  },

  shadows: [
    "none",
    "var(--mui-palette-elevation1)",
    ...Array(4).fill("var(--mui-palette-elevation2)"),
    ...Array(19).fill("var(--mui-palette-elevation3)"),
  ] as unknown as import("@mui/material/styles").Shadows,

  spacing: 8,

  shape: {
    borderRadius: 10,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 999,
  },

  typography: {
    fontFamily: FONT_SANS,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,

    display: {
      fontFamily: FONT_SERIF,
      fontSize: "3.5rem",
      fontWeight: 500,
      lineHeight: 1.04,
      letterSpacing: "-0.022em",
    },
    h1: {
      fontFamily: FONT_SERIF,
      fontSize: "2.5rem",
      fontWeight: 500,
      lineHeight: 1.08,
      letterSpacing: "-0.018em",
    },
    h2: {
      fontFamily: FONT_SERIF,
      fontSize: "1.875rem",
      fontWeight: 500,
      lineHeight: 1.14,
      letterSpacing: "-0.014em",
    },
    h3: {
      fontFamily: FONT_SERIF,
      fontSize: "1.375rem",
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: "-0.010em",
    },
    h4: {
      fontFamily: FONT_SERIF,
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.25,
      letterSpacing: "-0.006em",
    },
    h5: {
      fontFamily: FONT_SERIF,
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "-0.004em",
    },
    h6: {
      fontFamily: FONT_SERIF,
      fontSize: "0.9375rem",
      fontWeight: 500,
      lineHeight: 1.35,
      letterSpacing: "-0.002em",
    },
    bodyLg: {
      fontFamily: FONT_SANS,
      fontSize: "1.0625rem",
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
    },
    body1: {
      fontSize: "0.9375rem",
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
    },
    caption: {
      fontSize: "0.8125rem",
      fontWeight: 400,
      lineHeight: 1.45,
      letterSpacing: 0,
    },
    overline: {
      fontFamily: FONT_MONO,
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    button: {
      fontFamily: FONT_SANS,
      fontSize: "0.9375rem",
      fontWeight: 500,
      letterSpacing: 0,
      textTransform: "none",
    },
  },

  components: {
    MuiLink: {
      defaultProps: { component: LinkBehavior },
    },
    MuiButtonBase: {
      defaultProps: { LinkComponent: LinkBehavior },
    },
    MuiButton: {
      styleOverrides: {
        sizeSmall: { minHeight: 36, padding: "0 14px", fontSize: "0.875rem" },
        sizeMedium: { minHeight: 44, padding: "0 18px" },
        sizeLarge: { minHeight: 52, padding: "0 24px", fontSize: "1rem" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: { paddingTop: 10, paddingBottom: 10 },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { minHeight: 60, "@media (min-width:600px)": { minHeight: 60 } },
      },
    },
  },
});

export default theme;
