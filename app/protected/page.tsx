import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { postsTable } from "@/db/schema";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const posts = await db.select().from(postsTable).limit(10);

  console.log("Fetched posts:", posts);

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
        <h2 className="font-bold text-2xl">
          Posts from Database (via Drizzle)
        </h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts found in the database.
          </p>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-md">
                <h3 className="font-bold">{post.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {post.content}
                </p>
                <p className="text-xs mt-2">
                  Created: {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
