import { getLobbyDetails } from "@/app/actions/lobby";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function GamePage({ params }: PageProps) {
  const { id } = params;
  const { lobby, error } = (await getLobbyDetails(id)) as {
    lobby?: any;
    error?: string;
  };

  if (error || !lobby) {
    notFound();
  }

  // Redirect back to lobby if game hasn't started yet
  if (!lobby.isGameStarted) {
    redirect(`/protected/lobbies/${id}`);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Game Started!</h1>
        <p className="text-xl">Lobby: {lobby.name}</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Players in the Game</CardTitle>
          <CardDescription className="text-center">
            Total Players: {lobby.members.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lobby.members.map((member: any) => (
              <Card
                key={member.id}
                className="overflow-hidden border-2 border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {member.profileImage ? (
                      <Image
                        src={member.profileImage}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {member.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      {member.userId === lobby.hostId && (
                        <p className="text-sm text-primary">Host</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/protected/lobbies">
              <Button variant="outline">Back to Lobbies</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
