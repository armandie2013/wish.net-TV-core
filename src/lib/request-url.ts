export function buildUrlFromRequest(request: Request, path: string) {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";

  if (!host) {
    return new URL(path, request.url);
  }

  return new URL(path, `${proto}://${host}`);
}