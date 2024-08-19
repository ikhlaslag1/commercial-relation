// @mui material components
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import chroma from "chroma-js";

export default styled(Box)(({ theme, ownerState }) => {
  const { palette } = theme;
  const { variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow } = ownerState;

  const { gradients = {}, grey } = palette; // Default gradients to an empty object if undefined

  const colors = {
    white: {
      main: "#ffffff",
      focus: "#ffffff",
    },
    black: {
      light: "#000000",
      main: "#000000",
      focus: "#000000",
    },
    coloredShadows: {
      primary: "#e91e62",
      secondary: "#110e0e",
      info: "#00bbd4",
      success: "#4caf4f",
      warning: "#ff9900",
      error: "#f44336",
      light: "#adb5bd",
      dark: "#404040",
    },
  };
  
  const { black, white, coloredShadows } = colors;

  const linearGradient = (color, colorState, angle = 195) => `linear-gradient(${angle}deg, ${color}, ${colorState})`;
  const pxToRem = (number, baseNumber = 16) => `${number / baseNumber}rem`;

  const borders = {
    borderColor: grey[300],
    borderRadius: {
      xs: pxToRem(1.6),
      sm: pxToRem(2),
      md: pxToRem(6),
      lg: pxToRem(8),
      xl: pxToRem(12),
      xxl: pxToRem(16),
      section: pxToRem(160),
    },
  };
  const { borderRadius: radius } = borders;

  const boxShadow = (offset = [], radius = [], color, opacity, inset = "") => {
    const [x, y] = offset;
    const [blur, spread] = radius;
    return `${inset} ${pxToRem(x)} ${pxToRem(y)} ${pxToRem(blur)} ${pxToRem(spread)} ${rgba(color, opacity)}`;
  };

  const rgba = (color, opacity) => `rgba(${hexToRgb(color)}, ${opacity})`;

  const hexToRgb = (color) => chroma(color).rgb().join(", ");

  const boxShadows = {
    colored: {
      primary: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.primary, 0.4)}`,
      secondary: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.secondary, 0.4)}`,
      info: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.info, 0.4)}`,
      success: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.success, 0.4)}`,
      warning: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.warning, 0.4)}`,
      error: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.error, 0.4)}`,
      light: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.light, 0.4)}`,
      dark: `${boxShadow([0, 4], [20, 0], black.main, 0.14)}, ${boxShadow([0, 7], [10, -5], coloredShadows.dark, 0.4)}`,
    }
  };
  
  const greyColors = {
    "grey-100": grey[100],
    "grey-200": grey[200],
    "grey-300": grey[300],
    "grey-400": grey[400],
    "grey-500": grey[500],
    "grey-600": grey[600],
    "grey-700": grey[700],
    "grey-800": grey[800],
    "grey-900": grey[900],
  };

  const validGradients = [
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ];

  const validColors = [
    "transparent",
    "white",
    "black",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
    "text",
    "grey-100",
    "grey-200",
    "grey-300",
    "grey-400",
    "grey-500",
    "grey-600",
    "grey-700",
    "grey-800",
    "grey-900",
  ];

  const validBorderRadius = ["xs", "sm", "md", "lg", "xl", "xxl", "section"];
  const validBoxShadows = ["xs", "sm", "md", "lg", "xl", "xxl", "inset"];

  let backgroundValue = palette[bgColor]?.main || bgColor || "defaultFallbackColor";

  if (variant === "gradient") {
    backgroundValue = palette[bgColor]
      ? `linear-gradient(195deg, ${palette[bgColor].main}, ${palette[bgColor].dark})`
      : bgColor || "defaultFallbackGradient";
  }

  let colorValue = color;

  if (validColors.includes(color)) {
    colorValue = palette[color] ? palette[color].main : greyColors[color];
  }

  let borderRadiusValue = borderRadius;

  if (validBorderRadius.includes(borderRadius)) {
    borderRadiusValue = radius[borderRadius];
  }

  let boxShadowValue = "none";

  if (validBoxShadows.includes(shadow)) {
    boxShadowValue = boxShadows.colored[shadow];
  } else if (coloredShadow) {
    boxShadowValue = boxShadows.colored[coloredShadow] ? boxShadows.colored[coloredShadow] : "none";
  }

  return {
    opacity,
    background: backgroundValue,
    color: color || "white",
    borderRadius: borderRadius || "12px", // Adjust for rounded corners
    boxShadow: shadow || `0 4px 20px 0 rgba(0, 0, 0, 0.1)`, // Adjust shadow
  };
});
