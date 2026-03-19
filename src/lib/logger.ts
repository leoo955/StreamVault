import { NextRequest } from "next/server";
import { addActivityLog, getAuthUser } from "./db";

/**
 * Log a user activity with automatic IP and user detection
 */
export async function logActivity(
  request: NextRequest,
  action: string,
  details: string
) {
  try {
    const user = await getAuthUser(request);
    
    const forward = request.headers.get("x-forwarded-for");
    const ip = forward ? forward.split(",")[0] : "127.0.0.1";

    await addActivityLog({
      userId: user?.id,
      username: user?.username || "Invité",
      action,
      details,
      ip,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
