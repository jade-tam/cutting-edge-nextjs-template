import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession, toErrorResponse } from "@/app/api/admin/users/_helpers";

const schema = z.object({
  role: z.enum(["admin", "manager", "user"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminSession();

  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;

  if (id === auth.session.userId) {
    return NextResponse.json({ error: "cannot_update_self_role" }, { status: 400 });
  }

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

  try {
    const updated = await auth.provider.updateUserRole({
      userId: id,
      role: parsed.data.role,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
