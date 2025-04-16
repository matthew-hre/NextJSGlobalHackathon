import { getLobbyDetails, leaveLobby, startGame } from "@/app/actions/lobby";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function LobbyPage({ params }: PageProps) {
  const { id } = await params;

  console.log("Lobby ID:", id);

  const { lobby, error } = (await getLobbyDetails(id)) as {
    lobby?: any;
    error?: string;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !lobby) {
    notFound();
  }

  // Redirect to game page if the game has started
  if (lobby.isGameStarted) {
    redirect(`/protected/lobbies/${id}/game`);
  }

  const isHost = user?.id === lobby.hostId;
  const isFull = lobby.members.length >= lobby.maxPlayers;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">{lobby.name}</h1>
        <div className="flex items-center mt-2">
          <Badge variant="outline" className="mr-2">
            {lobby.members.length}/{lobby.maxPlayers} players
          </Badge>
          <Badge variant={isHost ? "default" : "secondary"}>
            {isHost ? "You are host" : `Host: ${lobby.host.name}`}
          </Badge>
        </div>
      </div>

      {/* Lobby details and controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>
                {isFull
                  ? "Lobby is full"
                  : `Waiting for more players (${lobby.members.length}/${lobby.maxPlayers})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {lobby.members.map((member: any) => (
                  <li
                    key={member.id}
                    className="flex items-center p-3 rounded-md bg-secondary/30"
                  >
                    <div className="flex items-center flex-1">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mr-3">
                          <span className="text-lg font-bold">
                            {member.name[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{member.name}</span>
                    </div>
                    {member.userId === lobby.hostId && <Badge>Host</Badge>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Lobby Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHost ? (
                <form
                  action={async () => {
                    "use server";
                    await startGame(id);
                  }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={lobby.members.length < 1}
                  >
                    Start Game
                  </Button>
                  {lobby.members.length < 1 && (
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      Need at least 1 player to start
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Waiting for host to start the game...
                </p>
              )}

              <form
                action={async () => {
                  "use server";
                  await leaveLobby(id);
                  redirect("/protected/lobbies");
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  Leave Lobby
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
