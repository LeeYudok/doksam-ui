import { parseOklch, oklchToSrgb, srgbContrastRatio } from "../../lib/color-contrast.ts";
import { THEME_PRESETS } from "../../themes/index.ts";

const MODES = ["light", "dark"];
const STEPS = 5;

// L targets per step, per mode. Light mode: cells go from near-background (light) to dark.
// Dark mode: cells go from near-background (dark) to light (saturated primary already light in dark themes).
const L_TARGETS = {
  light: [0.94, 0.82, 0.68, 0.54, 0.38],
  dark: [0.24, 0.32, 0.42, 0.62, 0.76],
};
// which text token to use per step (index-aligned)
const TEXT_TOKEN = {
  light: ["foreground", "foreground", "foreground", "primary-foreground", "primary-foreground"],
  dark: ["foreground", "foreground", "foreground", "background", "background"],
};

function withL(oklchStr, newL) {
  const { c, h, alpha } = parseOklch(oklchStr);
  return `oklch(${newL} ${c} ${h}${alpha !== 1 ? ` / ${alpha}` : ""})`;
}

let ok = true;
for (const mode of MODES) {
  for (const preset of THEME_PRESETS) {
    const primary = preset[mode]["primary"];
    for (let i = 0; i < STEPS; i++) {
      const cell = withL(primary, L_TARGETS[mode][i]);
      const cellRgb = oklchToSrgb(parseOklch(cell));
      const textToken = TEXT_TOKEN[mode][i];
      const textColor = preset[mode][textToken];
      const textRgb = oklchToSrgb(parseOklch(textColor));
      const ratio = srgbContrastRatio(cellRgb, textRgb);
      if (ratio < 4.5) {
        console.log(`FAIL ${mode} ${preset.name} step${i} L=${L_TARGETS[mode][i]} text=${textToken} ratio=${ratio.toFixed(2)}`);
        ok = false;
      }
    }
  }
}
console.log(ok ? "ALL PASS" : "SOME FAIL");
