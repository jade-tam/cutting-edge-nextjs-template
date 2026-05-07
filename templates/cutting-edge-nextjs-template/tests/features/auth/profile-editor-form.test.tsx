import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProfileEditorForm from "@/features/auth/components/profile/ProfileEditorForm";
import type { UserProfile } from "@/lib/auth/types";

function getFallbackProfile(): UserProfile {
  return {
    userId: "",
    email: "",
    role: "user",
    fullName: "",
    displayName: null,
    username: null,
    avatarUrl: null,
    pronouns: null,
    bio: null,
    lastLoginAt: null,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    metadata: null,
  };
}

function TestProfilePageInline() {
  const profile = mockProfileData?.profile ?? getFallbackProfile();

  return (
    <ProfileEditorForm
      initialProfile={profile}
      onPreviewChange={vi.fn()}
      previewCard={<div data-testid="profile-preview-card-text">{profile.fullName}</div>}
    />
  );
}


import * as optimizeImageModule from "@/lib/storage/optimize-image";

const { mockMutateAsync, toastSuccess, toastError, mockDeleteImageByPath, mockFetch } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockDeleteImageByPath: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/storage/delete-image", () => ({
  extractStoragePathFromUrl: (url: string) => {
    if (url.includes("/o/")) {
      return decodeURIComponent(url).split("/o/")[1]?.split("?")[0] ?? null;
    }

    if (url.endsWith("old.webp")) {
      return "uploads/avatars/u1/old.webp";
    }

    return null;
  },
  deleteImageByPath: mockDeleteImageByPath,
}));

let mockProfileData: { profile: UserProfile } | undefined;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "pages.profile.title": "Profile",
      "profile.description": "Manage your public profile information.",
      "profile.fields.fullName.label": "Full name",
      "profile.fields.fullName.placeholder": "John Doe",
      "profile.fields.displayName.label": "Display name",
      "profile.fields.displayName.placeholder": "John",
      "profile.fields.username.label": "Username",
      "profile.fields.username.placeholder": "john_doe",
      "profile.fields.pronouns.label": "Pronouns",
      "profile.fields.pronouns.placeholder": "she/her",
      "profile.fields.bio.label": "Bio",
      "profile.fields.bio.placeholder": "Product engineer who loves design systems.",
      "profile.actions.reset": "Reset",
      "profile.actions.save": "Save changes",
      "profile.actions.saving": "Saving...",
      "profile.avatar.label": "Avatar",
      "profile.avatar.help": "Provide a direct image URL.",
      "profile.avatar.current": "Current avatar",
      "profile.avatar.alt": "Profile avatar",
      "profile.avatar.uploadButton": "Upload image",
      "profile.avatar.uploading": "Uploading...",
      "profile.avatar.uploadHint": "PNG, JPG, or WEBP up to 10MB.",
      "profile.avatar.uploadSuccess": "Avatar image is ready for preview.",
      "profile.avatar.errors.invalidType": "Please choose a PNG, JPG, or WEBP image.",
      "profile.avatar.errors.fileTooLarge": "Image must be 10MB or smaller.",
      "profile.avatar.errors.uploadFailed": "Unable to process the selected image.",
      "validation.avatarUrl.invalidUrl": "Avatar URL must be a valid URL",
      "toast.auth.profileUpdated": "Profile updated successfully.",
      "toast.auth.profileUpdateFailed": "Unable to update profile.",
      "apiErrors.auth.user_profile_update_failed": "Unable to update profile.",
    };

    return translations[key] ?? key;
  },
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    span: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  },
}));

vi.mock("@/lib/auth/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    data: mockProfileData,
  }),
}));

vi.mock("@/features/auth/hooks/use-update-user-profile", () => ({
  useUpdateUserProfile: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

const baseProfile: UserProfile = {
  userId: "u1",
  email: "manager@example.com",
  role: "manager",
  fullName: "John Doe",
  displayName: "John",
  username: "john_doe",
  avatarUrl: "https://images.example.com/john.jpg",
  pronouns: "he/him",
  bio: "Profile bio",
  lastLoginAt: null,
  isActive: true,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-02",
  metadata: null,
};

describe("ProfileEditorForm", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    mockMutateAsync.mockReset();    toastSuccess.mockReset();
    toastError.mockReset();
    mockFetch.mockReset();
    mockDeleteImageByPath.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        url: "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Favatar.webp?alt=media",
        path: "uploads/avatars/u1/avatar.webp",
      }),
    } as Response);
    mockProfileData = { profile: baseProfile };
  });

  it("rehydrates form values when async profile data arrives", async () => {
    const user = userEvent.setup();

    mockProfileData = undefined;
    const { rerender } = render(<TestProfilePageInline />);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    expect(fullNameInput).toHaveValue("");

    await user.type(fullNameInput, "Temp Name");
    expect(fullNameInput).toHaveValue("Temp Name");

    mockProfileData = {
      profile: {
        ...baseProfile,
        fullName: "Jane Async",
      },
    };

    rerender(<TestProfilePageInline />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("Jane Async");
    });
  });

  it("shows camera upload button", () => {
    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Upload image" })).toBeInTheDocument();
  });

  it("renders avatar preview without online indicator in editor context", () => {
    const { container } = render(
      <ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />,
    );

    expect(screen.getByAltText("Profile avatar")).toBeInTheDocument();
    expect(container.querySelector(".avatar-online")).toBeNull();
  });

  it("updates live preview when form values change", async () => {
    const user = userEvent.setup();
    const onPreviewChange = vi.fn();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={onPreviewChange} />);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Jane Preview");

    await waitFor(() => {
      expect(onPreviewChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          fullName: "Jane Preview",
        }),
      );
    });
  });

  it("updates full name field from profile page harness", async () => {
    const user = userEvent.setup();

    render(<TestProfilePageInline />);

    const displayNameInput = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(displayNameInput);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Jane Profile Preview");

    expect(fullNameInput).toHaveValue("Jane Profile Preview");
  });

  it("uploads avatar and sets storage URL in form", async () => {
    const user = userEvent.setup();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const avatarFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, avatarFile);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload-avatar",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
      const avatar = screen.getByAltText("Profile avatar");
      expect(avatar).toHaveAttribute("src", expect.stringContaining("/_next/image?url="));
      expect(decodeURIComponent(avatar.getAttribute("src") ?? "")).toContain(
        "https://firebasestorage.googleapis.com/",
      );
      expect(avatar).not.toHaveAttribute("src", expect.stringContaining("data:image"));
      expect(toastSuccess).toHaveBeenCalledWith("Avatar image is ready for preview.");
    });
  });

  it("uploads optimized avatar file when optimization succeeds", async () => {
    const user = userEvent.setup();
    const optimizeSpy = vi.spyOn(optimizeImageModule, "optimizeImageForAvatar").mockResolvedValueOnce({
      blob: new Blob(["optimized"], { type: "image/webp" }),
      extension: "webp",
    });

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const avatarFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, avatarFile);

    await waitFor(() => {
      expect(optimizeSpy).toHaveBeenCalledWith(avatarFile);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload-avatar",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    const uploadCall = mockFetch.mock.calls.find(([url]) => url === "/api/upload-avatar");
    const fetchArgs = uploadCall?.[1] as { body: FormData };
    const uploadedFile = fetchArgs.body.get("file") as File;
    expect(uploadedFile.type).toBe("image/webp");    expect(uploadedFile.name).toMatch(/\.(webp)$/);
  });

  it("uploads original avatar file when optimization fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(optimizeImageModule, "optimizeImageForAvatar").mockRejectedValueOnce(
      new Error("avatar_image_optimize_failed"),
    );

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const avatarFile = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(uploadInput, avatarFile);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload-avatar",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    const uploadCall = mockFetch.mock.calls.find(([url]) => url === "/api/upload-avatar");
    const fetchArgs = uploadCall?.[1] as { body: FormData };
    const uploadedFile = fetchArgs.body.get("file") as File;
    expect(uploadedFile.name).toBe("avatar.png");
    expect(uploadedFile.type).toBe("image/png");
  });

  it("shows error toast for invalid avatar mime type", async () => {
    const user = userEvent.setup({ applyAccept: false });

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const invalidAvatar = new File(["avatar"], "avatar.gif", { type: "image/gif" });
    await user.upload(uploadInput, invalidAvatar);

    expect(toastError).toHaveBeenCalledWith("Please choose a PNG, JPG, or WEBP image.");
  });

  it("shows error toast for oversized avatar files", async () => {
    const user = userEvent.setup();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const oversizedAvatar = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "avatar.png", {
      type: "image/png",
    });
    await user.upload(uploadInput, oversizedAvatar);

    expect(toastError).toHaveBeenCalledWith("Image must be 10MB or smaller.");
  });

  it("maps avatar_invalid_type upload rejection to invalid type error message", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "invalid_file_type" }),
    } as Response);

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const validAvatar = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(uploadInput, validAvatar);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Please choose a PNG, JPG, or WEBP image.");
    });
  });

  it("maps avatar_file_too_large upload rejection to file too large error message", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "file_too_large" }),
    } as Response);

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const validAvatar = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(uploadInput, validAvatar);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Image must be 10MB or smaller.");
    });
  });

  it("maps unknown upload rejection to generic upload failed message", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "upload_failed" }),
    } as Response);

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const validAvatar = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(uploadInput, validAvatar);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Unable to process the selected image.");
    });
  });

  it("deletes previous avatar only after successful save", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue(undefined);

    render(
      <ProfileEditorForm
        initialProfile={{
          ...baseProfile,
          avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fold.webp?alt=media",
        }}
        onPreviewChange={vi.fn()}
      />,
    );

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const avatarFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, avatarFile);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload-avatar",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
      expect(mockDeleteImageByPath).not.toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockDeleteImageByPath).toHaveBeenCalledTimes(1);
      expect(mockDeleteImageByPath).toHaveBeenCalledWith("uploads/avatars/u1/old.webp");
    });
  });

  it("does not delete previous avatar when save fails after uploading a new avatar", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("user_profile_update_failed"));

    render(
      <ProfileEditorForm
        initialProfile={{
          ...baseProfile,
          avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fold.webp?alt=media",
        }}
        onPreviewChange={vi.fn()}
      />,
    );

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });
    const avatarFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, avatarFile);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/upload-avatar",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Unable to update profile.");
      expect(mockDeleteImageByPath).not.toHaveBeenCalled();
    });
  });

  it("deletes the immediate previous persisted avatar across multiple successful saves", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue(undefined);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fnew-1.webp?alt=media",
          path: "uploads/avatars/u1/new-1.webp",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fnew-2.webp?alt=media",
          path: "uploads/avatars/u1/new-2.webp",
        }),
      } as Response);

    render(
      <ProfileEditorForm
        initialProfile={{
          ...baseProfile,
          avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Favatars%2Fu1%2Fold.webp?alt=media",
        }}
        onPreviewChange={vi.fn()}
      />,
    );

    const uploadInput = screen.getByLabelText("Upload image", { selector: 'input[type="file"]' });

    const firstAvatarFile = new File(["avatar-1"], "avatar-1.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, firstAvatarFile);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockDeleteImageByPath).toHaveBeenCalledTimes(1);
      expect(mockDeleteImageByPath).toHaveBeenNthCalledWith(1, "uploads/avatars/u1/old.webp");
    });

    const secondAvatarFile = new File(["avatar-2"], "avatar-2.jpg", { type: "image/jpeg" });
    await user.upload(uploadInput, secondAvatarFile);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockDeleteImageByPath).toHaveBeenCalledTimes(2);
      expect(mockDeleteImageByPath).toHaveBeenNthCalledWith(2, "uploads/avatars/u1/new-1.webp");
    });
  });

  it("allows spaces while typing display name and pronouns", async () => {
    const user = userEvent.setup();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const displayNameInput = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(displayNameInput);
    await user.type(displayNameInput, "  Jane   Doe ");
    expect(displayNameInput).toHaveValue("  Jane   Doe ");

    const pronounsInput = screen.getByRole("textbox", { name: "Pronouns" });
    await user.clear(pronounsInput);
    await user.type(pronounsInput, "she / her ");
    expect(pronounsInput).toHaveValue("she / her ");
  });

  it("allows newline while typing bio", async () => {
    const user = userEvent.setup();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const bioInput = screen.getByRole("textbox", { name: "Bio" });
    await user.clear(bioInput);
    await user.type(bioInput, "Line 1{enter}Line 2");

    expect(bioInput).toHaveValue("Line 1\nLine 2");
  });

  it("normalizes nullable text fields only at submit time", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce(undefined);

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const displayNameInput = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(displayNameInput);
    await user.type(displayNameInput, "  Jane Doe  ");

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    await user.clear(usernameInput);
    await user.type(usernameInput, "  jane_doe  ");

    const pronounsInput = screen.getByRole("textbox", { name: "Pronouns" });
    await user.clear(pronounsInput);
    await user.type(pronounsInput, "   ");

    const bioInput = screen.getByRole("textbox", { name: "Bio" });
    await user.clear(bioInput);
    await user.type(bioInput, "  Line 1{enter}Line 2  ");

    expect(displayNameInput).toHaveValue("  Jane Doe  ");
    expect(usernameInput).toHaveValue("  jane_doe  ");
    expect(pronounsInput).toHaveValue("   ");
    expect(bioInput).toHaveValue("  Line 1\nLine 2  ");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: "Jane Doe",
          username: "jane_doe",
          pronouns: null,
          bio: "Line 1\nLine 2",
        }),
      );
    });
  });

  it("submits successfully and shows success toast", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    await user.type(fullNameInput, " ");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        fullName: "John Doe ",
        displayName: "John",
        username: "john_doe",
        pronouns: "he/him",
        bio: "Profile bio",
        avatarUrl: "https://images.example.com/john.jpg",
      });
      expect(toastSuccess).toHaveBeenCalledWith("Profile updated successfully.");
    });
  });

  it("shows error toast when submit fails", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("user_profile_update_failed"));

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    await user.type(fullNameInput, " ");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Unable to update profile.");
    });
  });

  it("resets dirty values back to current profile defaults", async () => {
    const user = userEvent.setup();

    render(<ProfileEditorForm initialProfile={baseProfile} onPreviewChange={vi.fn()} />);

    const fullNameInput = screen.getByRole("textbox", { name: "Full name" });
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Changed Name");
    expect(fullNameInput).toHaveValue("Changed Name");

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("John Doe");
  });
});
