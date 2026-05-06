function getNormalizedRequestHost(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    const normalizedForwardedHost = forwardedHost.split(",")[0]?.trim();

    if (normalizedForwardedHost) {
      return normalizedForwardedHost.toLowerCase();
    }
  }

  const host = request.headers.get("host")?.trim();
  return host ? host.toLowerCase() : null;
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  const requestHost = getNormalizedRequestHost(request);

  if (!origin || !requestHost) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host.toLowerCase() === requestHost;
  } catch {
    return false;
  }
}
