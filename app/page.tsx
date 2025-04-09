export default async function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center gap-16">
        NextJS Global Hackathon
      </h1>
      <main className="flex-1 flex flex-col gap-2 px-4">
        <h2 className="font-medium text-xl">Next steps</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Check the README for local development instructions.
        </p>
      </main>
    </>
  );
}
