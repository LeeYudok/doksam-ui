import { compositeOver, parseOklch, srgbContrastRatio, oklchToSrgb } from "../../lib/color-contrast.ts";
import { THEME_PRESETS } from "../../themes/index.ts";

const MODES = ["light", "dark"];
const STEPS = 5;

for (const percentsTry of [[8, 28, 48, 68, 88], [10, 30, 50, 70, 90], [6, 24, 42, 62, 86], [12, 32, 52, 72, 92]]) {
  console.log("=== percents", percentsTry);
  let ok = true;
  for (const mode of MODES) {
    for (const preset of THEME_PRESETS) {
      const backdrop = preset[mode]["card"];
      const primary = preset[mode]["primary"];
      const fg = preset[mode]["foreground"];
      const primaryFg = preset[mode]["primary-foreground"];
      for (let i = 0; i < STEPS; i++) {
        const pct = percentsTry[i] / 100;
        const cellRgb = compositeOver(primary, pct, backdrop);
        const ratioFg = srgbContrastRatio(cellRgb, oklchToSrgb(parseOklch(fg)));
        const ratioPrimaryFg = srgbContrastRatio(cellRgb, oklchToSrgb(parseOklch(primaryFg)));
        const best = Math.max(ratioFg, ratioPrimaryFg);
        if (best < 4.5) {
          console.log(`FAIL ${mode} ${preset.name} step${i} pct=${percentsTry[i]} fg=${ratioFg.toFixed(2)} pfg=${ratioPrimaryFg.toFixed(2)}`);
          ok = false;
        }
      }
    }
  }
  console.log(ok ? "ALL PASS with best-of-two" : "some fail");
}
