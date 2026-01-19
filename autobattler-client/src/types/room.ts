import type { World } from "./pages";

export interface NewRoom {
  userName: string;
  world: World;
}

export interface JoinRoom {
  userName: string;
  roomId: string;
}

export interface GetRoom {
  roomId: string;
  socketId: string | null;
}

// types/room.ts
export interface Room {
  id: string;
  name: string;
  createdAt: number;
  members: Member[];
  maxMembers?: number;
  isLocked?: boolean;
  world: World;
}

export interface Member {
  userId: string;
  name: string;
  online: boolean;
  joinedAt: number;
  isOwner: boolean;
}
