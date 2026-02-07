import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase/server";

/**
 * Get the current authenticated user's database record.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getCurrentUser() {
  const authUser = await getAuthUser();

  if (!authUser) {
    return null;
  }

  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
  });

  // If user exists in Supabase Auth but not yet in our DB, create them
  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || null,
          role: "candidate",
        },
      });
    } catch (error) {
      // Handle race condition - user might have been created by another request
      dbUser = await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
      });
    }
  }

  return dbUser;
}

/**
 * Require the user to be authenticated. Throws if not.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require the user to have a specific role. Throws if not.
 */
export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
