export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Runs in <head> before first paint so a dark-mode visitor never sees a white
// flash. It also follows OS changes while the preference is "system". It sets
// "light" as well as "dark" because the map reads either class and only falls
// back to the OS setting when neither is present.
export const themeInitScript = `(function(){
var k=${JSON.stringify(THEME_STORAGE_KEY)},m=matchMedia("(prefers-color-scheme: dark)");
function a(){var p;try{p=localStorage.getItem(k)}catch(e){}
var d=p==="dark"||(p!=="light"&&m.matches),c=document.documentElement.classList;
c.toggle("dark",d);c.toggle("light",!d);document.documentElement.style.colorScheme=d?"dark":"light"}
a();m.addEventListener("change",a);window.addEventListener("storage",function(e){if(e.key===k)a()});
})()`;

const CHANGE_EVENT = "themechange";

// Keeps every mounted toggle in step, including across tabs via "storage".
export function subscribeThemePreference(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "system";
}

export function setThemePreference(pref: ThemePreference) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {}
  const dark =
    pref === "dark" ||
    (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.style.colorScheme = dark ? "dark" : "light";
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
