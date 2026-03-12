import { useContext } from "react";
import { ColorModeContext } from "@/context/ColorModeContext";

/**
 * Returns the current color mode and a setter.
 *
 * @returns {{ mode: "light"|"dark"|"dim"|"system", resolved: "light"|"dark"|"dim", setMode: (m: string) => void }}
 *
 * @example
 * const { mode, setMode } = useColorMode();
 * <button onClick={() => setMode("dark")}>Dark</button>
 */
export function useColorMode() {
  return useContext(ColorModeContext);
}
