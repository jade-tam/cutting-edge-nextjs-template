type DeleteAvatarResponse = {
  ok?: boolean;
  error?: string;
};

function isDeleteAvatarResponse(value: unknown): value is DeleteAvatarResponse {
  return typeof value === "object" && value !== null;
}

export function extractStoragePathFromUrl(url: string): string | null {
  let decoded: string;

  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null;
  }

  const marker = "/o/";
  const markerIndex = decoded.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithQuery = decoded.slice(markerIndex + marker.length);
  const path = pathWithQuery.split("?")[0];

  return path || null;
}

export async function deleteImageByPath(path: string) {
  const response = await fetch("/api/delete-avatar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as unknown;

    if (isDeleteAvatarResponse(body) && body.error) {
      throw new Error(body.error);
    }

    throw new Error("request_failed");
  }
}
