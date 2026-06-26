const DEFAULT_API_URL = "https://test.62344037.xyz/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

export const withTrailingSlash = (url?: string) => {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  const [path, suffix = ""] = url.split(/(?=[?#])/);
  return `${path.replace(/\/+$/, "")}/${suffix}`;
};
