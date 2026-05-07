import { NextResponse } from "next/server";

import { requireAdminSession, toErrorResponse } from "@/app/api/admin/users/_helpers";

export async function GET() {
  const auth = await requireAdminSession();

  if (auth.response) {
    return auth.response;
  }

  try {
    const data = await auth.provider.listUsers();
    return NextResponse.json({
      users: data.users.map((user) => ({
        id: user.userId,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        username: user.username,
        isSelf: user.userId === auth.session.userId,
      })),
      total: data.total,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
