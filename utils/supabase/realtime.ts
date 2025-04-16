import { createClient } from "./client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Channel names for different realtime subscriptions
export const REALTIME_CHANNELS = {
  LOBBY: "lobby_updates",
};

// Initialize the realtime subscription to a specific lobby
export const subscribeLobbyChanges = (
  lobbyId: string,
  callback: (payload: any) => void,
) => {
  const supabase = createClient();

  const channel = supabase
    .channel(`${REALTIME_CHANNELS.LOBBY}:${lobbyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lobby_members",
        filter: `lobby_id=eq.${lobbyId}`,
      },
      (payload) => {
        callback(payload);
      },
    )
    .subscribe();

  return channel;
};

// Initialize the realtime subscription to track lobbies that are starting games
export const subscribeGameStartChanges = (callback: (payload: any) => void) => {
  const supabase = createClient();

  const channel = supabase
    .channel(`${REALTIME_CHANNELS.LOBBY}:game_start`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "lobbies",
        filter: "is_game_started=eq.true",
      },
      (payload) => {
        callback(payload);
      },
    )
    .subscribe();

  return channel;
};

// Unsubscribe from a channel
export const unsubscribeChannel = (channel: RealtimeChannel) => {
  if (channel) {
    channel.unsubscribe();
  }
};
