"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { lobbiesTable, lobbyMembersTable, usersTable } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createLobby = async (
  formData: FormData,
): Promise<{ error?: string; success?: boolean; lobbyId?: string }> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a lobby" };
  }

  const lobbyName = formData.get("lobbyName")?.toString();

  if (!lobbyName || lobbyName.trim() === "") {
    return { error: "Lobby name is required" };
  }

  try {
    // Create the lobby
    const [lobby] = await db
      .insert(lobbiesTable)
      .values({
        name: lobbyName.trim(),
        hostId: user.id,
        updatedAt: new Date(),
      })
      .returning();

    // Add the host as a member
    await db.insert(lobbyMembersTable).values({
      lobbyId: lobby.id,
      userId: user.id,
    });

    revalidatePath("/lobbies");
    return { success: true, lobbyId: lobby.id };
  } catch (error) {
    console.error("Error creating lobby:", error);
    return { error: "Failed to create lobby" };
  }
};

// Join an existing lobby
export const joinLobby = async (lobbyId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to join a lobby" };
  }

  try {
    // Check if the lobby exists and is active
    const lobby = await db.query.lobbiesTable.findFirst({
      where: and(
        eq(lobbiesTable.id, lobbyId),
        eq(lobbiesTable.isActive, true),
        eq(lobbiesTable.isGameStarted, false),
      ),
    });

    if (!lobby) {
      return { error: "Lobby not found or game already started" };
    }

    // Check if the user is already in the lobby
    const existingMembership = await db.query.lobbyMembersTable.findFirst({
      where: and(
        eq(lobbyMembersTable.lobbyId, lobbyId),
        eq(lobbyMembersTable.userId, user.id),
      ),
    });

    if (existingMembership) {
      return {
        success: true,
        lobbyId,
        shouldRedirect: true, // Flag to indicate client should redirect
      };
    }

    // Check if lobby is full
    const memberCount = await db
      .select({ count: count() })
      .from(lobbyMembersTable)
      .where(eq(lobbyMembersTable.lobbyId, lobbyId));

    if (memberCount[0].count >= lobby.maxPlayers) {
      return { error: "Lobby is full" };
    }

    // Join the lobby
    await db.insert(lobbyMembersTable).values({
      lobbyId,
      userId: user.id,
    });

    revalidatePath(`/lobbies/${lobbyId}`);
    revalidatePath("/lobbies");

    return { success: true, lobbyId };
  } catch (error) {
    console.error("Error joining lobby:", error);
    return { error: "Failed to join lobby" };
  }
};

// Leave a lobby
export const leaveLobby = async (lobbyId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  try {
    // Check if user is in the lobby
    const membership = await db.query.lobbyMembersTable.findFirst({
      where: and(
        eq(lobbyMembersTable.lobbyId, lobbyId),
        eq(lobbyMembersTable.userId, user.id),
      ),
    });

    if (!membership) {
      return { error: "You are not in this lobby" };
    }

    // Remove the user from the lobby
    await db
      .delete(lobbyMembersTable)
      .where(
        and(
          eq(lobbyMembersTable.lobbyId, lobbyId),
          eq(lobbyMembersTable.userId, user.id),
        ),
      );

    // Check if user was the host
    const lobby = await db.query.lobbiesTable.findFirst({
      where: and(
        eq(lobbiesTable.id, lobbyId),
        eq(lobbiesTable.hostId, user.id),
      ),
    });

    // If user was the host, assign a new host or close the lobby
    if (lobby) {
      // Find another member to make host
      const anotherMember = await db.query.lobbyMembersTable.findFirst({
        where: eq(lobbyMembersTable.lobbyId, lobbyId),
      });

      if (anotherMember) {
        // Assign new host
        await db
          .update(lobbiesTable)
          .set({ hostId: anotherMember.userId, updatedAt: new Date() })
          .where(eq(lobbiesTable.id, lobbyId));
      } else {
        // No members left, mark lobby as inactive
        await db
          .update(lobbiesTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(lobbiesTable.id, lobbyId));
      }
    }

    revalidatePath(`/lobbies/${lobbyId}`);
    revalidatePath("/lobbies");

    return { success: true };
  } catch (error) {
    console.error("Error leaving lobby:", error);
    return { error: "Failed to leave lobby" };
  }
};

// Get all active lobbies with member counts
export const getPublicLobbies = async () => {
  try {
    // Get all active lobbies that haven't started a game yet
    const lobbies = await db.query.lobbiesTable.findMany({
      where: and(
        eq(lobbiesTable.isActive, true),
        eq(lobbiesTable.isGameStarted, false),
      ),
      orderBy: (lobbies, { desc }) => [desc(lobbies.createdAt)],
    });

    // For each lobby, get the count of members and host information
    const lobbiesWithMemberCounts = await Promise.all(
      lobbies.map(async (lobby) => {
        const memberCount = await db
          .select({ count: count() })
          .from(lobbyMembersTable)
          .where(eq(lobbyMembersTable.lobbyId, lobby.id));

        // Get host information separately
        const host = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, lobby.hostId),
          columns: {
            name: true,
            profileImage: true,
          },
        });

        return {
          ...lobby,
          memberCount: memberCount[0].count,
          host: host || { name: "Unknown", profileImage: null },
        };
      }),
    );

    return { lobbies: lobbiesWithMemberCounts };
  } catch (error) {
    console.error("Error fetching lobbies:", error);
    return { error: "Failed to fetch lobbies" };
  }
};

// Get lobby details with all members
export const getLobbyDetails = async (lobbyId: string) => {
  try {
    // Get the lobby without trying to use an undefined relation
    const lobby = await db.query.lobbiesTable.findFirst({
      where: eq(lobbiesTable.id, lobbyId),
    });

    if (!lobby) {
      return { error: "Lobby not found" };
    }

    // Fetch host information separately
    const host = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, lobby.hostId),
      columns: {
        name: true,
        profileImage: true,
      },
    });

    // Get all members in the lobby with their user info
    const lobbyMembers = await db
      .select({
        id: lobbyMembersTable.id,
        userId: lobbyMembersTable.userId,
        joinedAt: lobbyMembersTable.joinedAt,
        name: usersTable.name,
        profileImage: usersTable.profileImage,
      })
      .from(lobbyMembersTable)
      .innerJoin(usersTable, eq(lobbyMembersTable.userId, usersTable.id))
      .where(eq(lobbyMembersTable.lobbyId, lobbyId));

    return {
      success: true,
      lobby: {
        ...lobby,
        host: host || { name: "Unknown", profileImage: null },
        members: lobbyMembers,
      },
    };
  } catch (error) {
    console.error("Error fetching lobby details:", error);
    return { error: "Failed to fetch lobby details" };
  }
};

// Start the game in a lobby
export const startGame = async (lobbyId: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to start the game" };
  }

  try {
    // Check if user is the host
    const lobby = await db.query.lobbiesTable.findFirst({
      where: and(
        eq(lobbiesTable.id, lobbyId),
        eq(lobbiesTable.hostId, user.id),
      ),
    });

    if (!lobby) {
      return { error: "You must be the host to start the game" };
    }

    // Check if there are enough players (at least 1 for testing, but can be changed to 2-4)
    const memberCount = await db
      .select({ count: count() })
      .from(lobbyMembersTable)
      .where(eq(lobbyMembersTable.lobbyId, lobbyId));

    if (memberCount[0].count < 1) {
      return { error: "Not enough players to start" };
    }

    // Update the lobby to mark game as started
    await db
      .update(lobbiesTable)
      .set({
        isGameStarted: true,
        updatedAt: new Date(),
      })
      .where(eq(lobbiesTable.id, lobbyId));

    revalidatePath(`/lobbies/${lobbyId}`);
    revalidatePath("/lobbies");

    return { success: true };
  } catch (error) {
    console.error("Error starting game:", error);
    return { error: "Failed to start the game" };
  }
};
