import { createLobby, getPublicLobbies, joinLobby } from "@/app/actions/lobby";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { lobbies, error } = (await getPublicLobbies()) as {
    lobbies?: any[];
    error?: string;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Lobbies</h1>
        <p className="mt-2 text-lg">Join or create a lobby to start playing!</p>
      </div>

      {/* Create Lobby Form */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create New Lobby</CardTitle>
          <CardDescription>
            Host a new lobby with up to 4 players
          </CardDescription>
        </CardHeader>
        <form action={createLobby}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="lobbyName" className="text-sm font-medium">
                  Lobby Name
                </label>
                <Input
                  id="lobbyName"
                  name="lobbyName"
                  placeholder="Enter lobby name"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Create Lobby
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Public Lobbies List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Available Public Lobbies
        </h2>

        {error && <p className="text-center text-red-500">{error}</p>}

        {lobbies && lobbies.length === 0 && (
          <p className="text-center text-muted-foreground">
            No public lobbies available. Create one!
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lobbies &&
            lobbies.map((lobby) => (
              <Card key={lobby.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{lobby.name}</CardTitle>
                    <Badge variant="outline">
                      {lobby.memberCount}/{lobby.maxPlayers} players
                    </Badge>
                  </div>
                  <CardDescription>Hosted by {lobby.host.name}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-3">
                  <form
                    action={async () => {
                      "use server";
                      const result = await joinLobby(lobby.id);

                      if (result.success) {
                        // If shouldRedirect is true, the player is already in the lobby
                        if (result.shouldRedirect) {
                          // Redirect them to the lobby page they're already in
                          redirect(`/protected/lobbies/${lobby.id}`);
                        } else {
                          // Normal redirect after successful join
                          redirect(`/protected/lobbies/${lobby.id}`);
                        }
                      }
                    }}
                  >
                    <Button
                      type="submit"
                      disabled={lobby.memberCount >= lobby.maxPlayers}
                      variant={
                        lobby.memberCount >= lobby.maxPlayers
                          ? "outline"
                          : "default"
                      }
                      className="w-full"
                    >
                      {lobby.memberCount >= lobby.maxPlayers
                        ? "Full"
                        : "Join Lobby"}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
