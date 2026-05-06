"use client";

import { type ChangeEvent, useRef, useState } from "react";

import UserAvatar from "@/components/avatar/UserAvatar";
import { optimizeImageForAvatar } from "@/lib/storage/optimize-image";


type UploadAvatarResponse = {
  url: string;
  path: string;
};


type UploadAvatarApiError = {
  error?: string;
};

type AvatarEditorProps = {
  value: string | null;
  fallbackInitial: string;
  label: string;
  helpText: string;
  hintText: string;
  uploadButtonLabel: string;
  uploadingLabel: string;
  altText: string;
  invalidTypeMessage: string;
  fileTooLargeMessage: string;
  uploadFailedMessage: string;
  uploadSuccessMessage: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

const AVATAR_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_AVATAR_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function createOptimizedAvatarFile(sourceFile: File, blob: Blob, extension: "webp" | "jpg") {
  const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "avatar";
  const fileName = `${baseName}.${extension}`;
  const mimeType = extension === "webp" ? "image/webp" : "image/jpeg";

  return new File([blob], fileName, { type: mimeType });
}

function mapAvatarUploadErrorCodeToMessage(
  code: string,
  messages: Pick<AvatarEditorProps, "invalidTypeMessage" | "fileTooLargeMessage" | "uploadFailedMessage">,
) {
  switch (code) {
    case "avatar_invalid_type":
    case "invalid_file_type":
      return messages.invalidTypeMessage;
    case "avatar_file_too_large":
    case "file_too_large":
      return messages.fileTooLargeMessage;
    case "unauthorized":
      return messages.uploadFailedMessage;
    default:
      return messages.uploadFailedMessage;
  }
}

export default function AvatarEditor({
  value,
  fallbackInitial,
  label,
  helpText,
  hintText,
  uploadButtonLabel,
  uploadingLabel,
  altText,
  invalidTypeMessage,
  fileTooLargeMessage,
  uploadFailedMessage,
  uploadSuccessMessage,
  disabled = false,
  onChange,
  onError,
  onSuccess,
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isDisabled = disabled || isUploading;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_AVATAR_FILE_TYPES.includes(file.type)) {
      onError?.(invalidTypeMessage);
      event.target.value = "";
      return;
    }

    if (file.size > AVATAR_MAX_FILE_SIZE_BYTES) {
      onError?.(fileTooLargeMessage);
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      let uploadFile: File = file;
      try {
        const optimized = await optimizeImageForAvatar(file);
        uploadFile = createOptimizedAvatarFile(file, optimized.blob, optimized.extension);
      } catch {
        uploadFile = file;
      }

      formData.append("file", uploadFile);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as UploadAvatarApiError | null;
        throw new Error(body?.error ?? "upload_failed");
      }

      const { url } = (await response.json()) as UploadAvatarResponse;
      onChange(url);
      onSuccess?.(uploadSuccessMessage);
    } catch (error) {
      const code = error instanceof Error ? error.message : "upload_failed";
      onError?.(
        mapAvatarUploadErrorCodeToMessage(code, {
          invalidTypeMessage,
          fileTooLargeMessage,
          uploadFailedMessage,
        }),
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="">
      <div className="flex items-center gap-4">
        <div className="relative">
          {isUploading ? (
            <div className="avatar">
              <div className="w-20 rounded-full border bg-base-200">
                <div className="flex h-full w-full items-center justify-center" aria-label={uploadingLabel}>
                  <span className="loading loading-spinner loading-sm" />
                  <span className="sr-only">{uploadingLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <UserAvatar
              src={value}
              fallbackText={fallbackInitial}
              alt={altText}
              size="md"
            />
          )}

          <button
            type="button"
            className="btn btn-circle btn-sm absolute -bottom-1 -right-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            aria-label={uploadButtonLabel}
          >
            <span className="icon-[fluent--camera-24-regular] text-lg" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-base-content/70 text-xs">{helpText}</span>
          <span className="text-base-content/70 text-xs">{hintText}</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AVATAR_FILE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
        disabled={isDisabled}
        aria-label={uploadButtonLabel}
      />
    </section>
  );
}
