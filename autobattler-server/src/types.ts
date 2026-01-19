export type World = "dark" | "light";

export interface NewRoom {
  userName: string;
  world: World;
}

export interface JoinRoom {
  userName: string;
  roomId: World;
}

export interface GetRoom {
  roomId: string;
  socketId: string | null;
}

export interface Room {
  id: string;
  inGame: boolean;
  name: string;
  world: string;
  ownerId: string;
  createdAt: number;
  expiresAt: number;
  members: Member[];
  maxMembers: number;
  isLocked: boolean;
}

export interface Member {
  userId: string;
  online: boolean;
  socketIdOld: string | null;
  socketIdNow: string;
  name: string;
  joinedAt: number;
  isOwner: boolean;
}

export interface SafeRoom {
  id: string;
  name: string;
  world: string;
  createdAt: number;
  members: SafeMember[];
  maxMembers: number;
  isLocked: boolean;
}

export interface SafeMember {
  userId: string;
  online: boolean;
  name: string;
  joinedAt: number;
  isOwner: boolean;
}
