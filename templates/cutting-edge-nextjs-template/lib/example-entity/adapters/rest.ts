import { z } from "zod";

import type { ExampleEntityProvider } from "../contracts";
import { ExampleEntityError } from "../errors";
import type { ExampleEntity } from "../types";
import { serverEnv } from "../../env/server";

const exampleEntitySchema = z.object({
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

const exampleEntityListSchema = z.array(exampleEntitySchema);

async function parseEntityResponse(response: Response): Promise<ExampleEntity> {
  const json = await response.json();
  const parsed = exampleEntitySchema.safeParse(json);

  if (!parsed.success) {
    throw new ExampleEntityError("contract_error");
  }

  return parsed.data;
}

async function parseEntityListResponse(response: Response): Promise<ExampleEntity[]> {
  const json = await response.json();
  const parsed = exampleEntityListSchema.safeParse(json);

  if (!parsed.success) {
    throw new ExampleEntityError("contract_error");
  }

  return parsed.data;
}

function throwForFailedList(response: Response): never {
  if (response.status >= 500) {
    throw new ExampleEntityError("upstream_error");
  }

  throw new ExampleEntityError("client_error");
}

function throwForFailedGet(response: Response): never {
  if (response.status === 404) {
    throw new ExampleEntityError("not_found");
  }

  if (response.status >= 500) {
    throw new ExampleEntityError("upstream_error");
  }

  throw new ExampleEntityError("client_error");
}

function throwForFailedCreate(response: Response): never {
  if (response.status >= 500) {
    throw new ExampleEntityError("upstream_error");
  }

  throw new ExampleEntityError("client_error");
}

function throwForFailedUpdate(response: Response): never {
  if (response.status === 404) {
    throw new ExampleEntityError("not_found");
  }

  if (response.status >= 500) {
    throw new ExampleEntityError("upstream_error");
  }

  throw new ExampleEntityError("client_error");
}

function throwForFailedDelete(response: Response): never {
  if (response.status === 404) {
    throw new ExampleEntityError("not_found");
  }

  if (response.status >= 500) {
    throw new ExampleEntityError("upstream_error");
  }

  throw new ExampleEntityError("client_error");
}

export function createRestExampleEntityProvider(): ExampleEntityProvider {
  const baseUrl = serverEnv.REST_API_BASE_URL;

  return {
    kind: "rest",
    async list() {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/example-entities`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        throw new ExampleEntityError("network_error");
      }

      if (!response.ok) {
        throwForFailedList(response);
      }

      return parseEntityListResponse(response);
    },
    async get(id) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/example-entities/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        throw new ExampleEntityError("network_error");
      }

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throwForFailedGet(response);
      }

      return parseEntityResponse(response);
    },
    async create(input) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/example-entities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw new ExampleEntityError("network_error");
      }

      if (!response.ok) {
        throwForFailedCreate(response);
      }

      return parseEntityResponse(response);
    },
    async update(id, input) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/example-entities/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw new ExampleEntityError("network_error");
      }

      if (!response.ok) {
        throwForFailedUpdate(response);
      }

      return parseEntityResponse(response);
    },
    async remove(id) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/example-entities/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        throw new ExampleEntityError("network_error");
      }

      if (!response.ok) {
        throwForFailedDelete(response);
      }

      return { ok: true } as const;
    },
  };
}
