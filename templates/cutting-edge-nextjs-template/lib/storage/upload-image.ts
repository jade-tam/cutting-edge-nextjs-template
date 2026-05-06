import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { getFirebaseStorageServer } from "@/lib/firebase/server";

type UploadImageInput = {
  file: Blob;
  category: string;
  entityId: string;
  extension: "png" | "webp" | "jpg";
};
export async function uploadImage(input: UploadImageInput) {
  const storage = getFirebaseStorageServer();
  const id = crypto.randomUUID().slice(0, 8);
  const path = `uploads/${input.category}/${input.entityId}/${Date.now()}-${id}.${input.extension}`;
  const storageRef = ref(storage, path);

  const contentTypeByExtension: Record<UploadImageInput["extension"], string> = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
  };

  await uploadBytes(storageRef, input.file, {
    contentType: contentTypeByExtension[input.extension],
    cacheControl: "public,max-age=31536000,immutable",
  });

  const url = await getDownloadURL(storageRef);

  return { url, path };
}
