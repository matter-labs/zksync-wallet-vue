function getUserTheme(): "dark" | "light" {
  if (localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    return "dark";
  } else {
    return "light";
  }
}

function setTheme(theme: "dark" | "light") {
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.remove("light");
  document.documentElement.classList.add(theme);
}

function toggleTheme() {
  let newTheme: "dark" | "light" = "dark";
  if (getUserTheme() === "dark") {
    setTheme("light");
    newTheme = "light";
  } else {
    setTheme("dark");
    newTheme = "dark";
  }
  saveUserTheme(newTheme);
  return newTheme;
}

function saveUserTheme(theme: "dark" | "light") {
  localStorage.setItem("theme", theme);
}

export default {
  getUserTheme,
  setTheme,
  toggleTheme,
  saveUserTheme,
};
