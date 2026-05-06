import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { z } from "zod";

import { getFirebaseFirestoreServer } from "@/lib/firebase/server";

import type { ExampleEntityProvider } from "../contracts";
import { ExampleEntityError } from "../errors";
import type { ExampleEntity } from "../types";

const firebaseExampleEntitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["draft", "in_review", "published", "archived"]),
  category: z.enum(["product", "engineering", "marketing", "operations"]),
  tags: z.array(z.string()),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  ownerName: z.string().min(1),
  dueDate: z.string().nullable(),
  isFeatured: z.boolean(),
  publishedAt: z.string().nullable(),
  estimatedHours: z.number().nullable(),
  progressPercent: z.number().int().min(0).max(100),
  attachmentsUrl: z.array(z.string().url()),
  externalLink: z.string().nullable(),
  notes: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

function normalizeEntity(raw: unknown): ExampleEntity {
  const parsed = firebaseExampleEntitySchema.safeParse(raw);

  if (!parsed.success) {
    throw new ExampleEntityError("contract_error");
  }

  return parsed.data;
}

function mapFirebaseErrorToExampleEntityCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "upstream_error" as const;
  }

  const code = (error as { code?: string }).code;

  if (!code) {
    return "upstream_error" as const;
  }

  if (code.includes("not-found")) {
    return "not_found" as const;
  }

  if (code.includes("permission-denied")) {
    return "permission_denied" as const;
  }

  if (
    code.includes("network") ||
    code.includes("unavailable") ||
    code.includes("deadline-exceeded") ||
    code.includes("cancelled") ||
    code.includes("aborted")
  ) {
    return "network_error" as const;
  }

  return "upstream_error" as const;
}

function toExampleEntityError(error: unknown) {
  if (error instanceof ExampleEntityError) {
    return error;
  }

  return new ExampleEntityError(mapFirebaseErrorToExampleEntityCode(error));
}

export function createFirebaseExampleEntityProvider(): ExampleEntityProvider {
  const firestore = getFirebaseFirestoreServer();
  const collectionRef = collection(firestore, "example-entities");

  return {
    kind: "firebase",
    async list() {
      try {
        const snapshot = await getDocs(collectionRef);

        return snapshot.docs.map((item) =>
          normalizeEntity({
            id: item.id,
            ...item.data(),
          }),
        );
      } catch (error) {
        throw toExampleEntityError(error);
      }
    },
    async get(id) {
      try {
        const docRef = doc(firestore, "example-entities", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          return null;
        }

        return normalizeEntity({
          id: snapshot.id,
          ...snapshot.data(),
        });
      } catch (error) {
        throw toExampleEntityError(error);
      }
    },
    async create(input) {
      try {
        const now = new Date().toISOString();
        const created = await addDoc(collectionRef, {
          ...input,
          createdAt: now,
          updatedAt: now,
        });

        return normalizeEntity({
          id: created.id,
          ...input,
          createdAt: now,
          updatedAt: now,
        });
      } catch (error) {
        throw toExampleEntityError(error);
      }
    },
    async update(id, input) {
      try {
        const docRef = doc(firestore, "example-entities", id);
        const current = await getDoc(docRef);

        if (!current.exists()) {
          throw new ExampleEntityError("not_found");
        }

        const updatedAt = new Date().toISOString();

        await updateDoc(docRef, {
          ...input,
          updatedAt,
        });

        return normalizeEntity({
          id,
          ...input,
          createdAt: current.data().createdAt,
          updatedAt,
        });
      } catch (error) {
        throw toExampleEntityError(error);
      }
    },
    async remove(id) {
      try {
        const docRef = doc(firestore, "example-entities", id);
        const current = await getDoc(docRef);

        if (!current.exists()) {
          throw new ExampleEntityError("not_found");
        }

        await deleteDoc(docRef);

        return { ok: true } as const;
      } catch (error) {
        throw toExampleEntityError(error);
      }
    },
  };
}
