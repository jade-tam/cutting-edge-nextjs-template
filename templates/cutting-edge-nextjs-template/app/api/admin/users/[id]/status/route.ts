import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession, toErrorResponse } from "@/app/api/admin/users/_helpers";

const schema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (id === auth.session.userId && parsed.data.isActive === false) {
    return NextResponse.json({ error: "cannot_deactivate_self" }, { status: 400 });
  }

  try {
    const updated = await auth.provider.updateUserStatus({
      userId: id,
      isActive: parsed.data.isActive,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
