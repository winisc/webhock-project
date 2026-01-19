export type Page = "home" | "create" | "join" | "room";
export type World = "dark" | "light";

export interface RoomData {
  roomId: string;
  name: string;
  world?: World;
}
