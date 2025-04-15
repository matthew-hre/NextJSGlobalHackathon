import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const userData = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id));

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* Display posts from Drizzle to verify connection */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-2xl">User Data from DB (Drizzle)</h2>
        {userData.length === 0 ? (
          <p className="text-muted-foreground">Something broke.</p>
        ) : (
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(userData[0], null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
