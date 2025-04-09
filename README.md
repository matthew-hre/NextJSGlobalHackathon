# Rough Idea

> Competitive Tailwind UI Battles

1. Users can sign up with Github and create a simple profile (name, photo, etc)
2. Users can create / enter a lobby with X number (4 max) of other players / participants
    2.1. Invite via Link / Code / Discovery page
3. Lobbies contain an editor, a reference photo, and a workspace / output.
4. Players have 3 minutes to recreate the reference photo using Tailwind
5. The first player to complete the reference and submit drops the timer to 15 seconds for everyone else
    5.1. If no-one submits on time, it evaluates everyone based on their last autosave
6. Judging is done via pixel-matching / AI / whatever (no idea yet)
7. Everyone starts with 100hp, you take damage based on your score diff between the winner
    7.1. (ex. Player A scores 85% accuracy, Player B scores 70%, Player B takes -15hp)
8. Repeat steps 4-7 until one person remains
9. Show the all-time winners on a leaderboard

## the *future* (not necessarily listed in order of importance)
a) Difficulty levels (a single button -> entire shadcn blocks)
b) Users are showcased on a global leaderboard (weekly, daily, all-time)
c) Real-time view of what other people are making (Tetris 99)
d) Friends -> invite to Lobby
e) Subscription plan for higher lobby limits
f) Stake pools (5$ entry fees, 10% goes to us, winner takes all)
g) AI / V0 opponent (singleplayer?)
h) Blitz Mode (do as many as you can, average score against everyone else)
i) Classical (Full site)
j) Status Tracker / heatmap / logins / social page / KD Ratio
k) Freeform Mode (Text prompt, build whatever) (Minecraft Build-Wars style) (One person sits out and judges every round)
l) Rank (ranked #27th worldwide) (Bronze III) (rank-amber-500)
m) Talent Acquisition (Who's the best, can I hire them) (LinkedIn / Github on the profile)
n) (maybe off track) Jobs Portal

## Tech Stack

- NextJS
- Tailwind
- Github OAuth - BetterAuth
- Supabase + Drizzle
- Nix <3 + Mise
- Husky + ESLint
- Vercel AI SDK + Command A? GPT? Whatever

