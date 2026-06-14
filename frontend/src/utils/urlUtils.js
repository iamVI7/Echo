/**
 * Resolves a relative backend asset path (e.g. "/uploads/voice/abc.webm")
 * to a full URL pointing at the backend server.
 *
 * In development, the Vite proxy forwards /uploads to the local backend,
 * so relative paths work as-is. In production, VITE_API_URL points at the
 * deployed backend's /api base — we strip the trailing /api to get the
 * server's origin and prefix asset paths with it.
 */
export const resolveAssetUrl = (path) => {
  if (!path) return path;

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return path; // dev: relative path works via Vite proxy

  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
};