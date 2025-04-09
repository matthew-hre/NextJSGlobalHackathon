{
  mkShell,
  alejandra,
  bash,
  nodejs_23,
  pnpm,
}:
mkShell rec {
  name = "nextjs-global-hackathon";

  packages = [
    bash
    nodejs_23
    pnpm

    # Required for CI for format checking.
    alejandra
  ];
}
