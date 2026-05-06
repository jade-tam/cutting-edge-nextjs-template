import { NextResponse } from "next/server";

import { exampleEntitySchema } from "@/features/example-entity/schemas/entity-schema";
import { getHttpStatusForError, isExampleEntityError } from "@/lib/example-entity/errors";
import { createExampleEntityProvider } from "@/lib/example-entity/factory";

const requestSchema = exampleEntitySchema.partial();

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isInvalidId(id: string): boolean {
  return id.trim().length === 0;
}

function mapProviderErrorResponse(error: unknown): NextResponse {
  if (isExampleEntityError(error)) {
    return NextResponse.json(
      { error: error.code },
      { status: getHttpStatusForError(error) },
    );
  }

  return NextResponse.json({ error: "example_entity_request_failed" }, { status: 502 });
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;

  if (isInvalidId(id)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const provider = createExampleEntityProvider();
    const entity = await provider.get(id);

    if (!entity) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(entity);
  } catch (error) {
    return mapProviderErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (isInvalidId(id)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const payload = requestSchema.safeParse(parsedBody);

  if (!payload.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const provider = createExampleEntityProvider();
    const entity = await provider.update(id, payload.data);

    return NextResponse.json(entity);
  } catch (error) {
    return mapProviderErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  if (isInvalidId(id)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const provider = createExampleEntityProvider();
    await provider.remove(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapProviderErrorResponse(error);
  }
}
