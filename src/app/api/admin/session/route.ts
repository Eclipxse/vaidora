import { login, logout, sameOrigin } from "@/lib/auth";
import { errorResponse } from "@/lib/validation";
import { z } from "zod";
export async function POST(r: Request) {
  try {
    sameOrigin(r);
    const v = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await r.json());
    await login(v.email, v.password);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(r: Request) {
  try {
    sameOrigin(r);
    await logout();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
