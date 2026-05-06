import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession, toErrorResponse } from "@/app/api/admin/users/_helpers";

const schema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  role: z.enum(["admin", "manager", "user"]),
});

export async function PATCH(request: Request) {
  const auth = await requireAdminSession();

  if (auth.response) {
    return auth.response;
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

  const filteredUserIds = parsed.data.userIds.filter((id) => id !== auth.session.userId);

  try {
    const result = await auth.provider.bulkUpdateUserRole({
      userIds: filteredUserIds,
      role: parsed.data.role,
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
