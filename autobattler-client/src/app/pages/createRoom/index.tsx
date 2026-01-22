import { useState } from "react";
import Page from "../../components/Page";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../../service/socket";
import type { World } from "../../../types/pages";
import darkImg from "../../assets/dark.png";
import lightImg from "../../assets/light.png";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedWorld, setSelectedWorld] = useState<World>("dark");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const worldImages: Record<World, string> = {
    dark: darkImg,
    light: lightImg,
  };

  async function handleCreateRoom() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    setLoading(true);

    const payload = { userName: name.trim(), world: selectedWorld };

    try {
      const { room, socketId } = await socketService.createRoom(payload);

      // Salva o socketId no localStorage para identificar o usuário
      localStorage.setItem("socketId", socketId);
      localStorage.setItem("idVis", room.members[0].userId);
      // Navega para a sala, passando informações via state
      navigate(`/room/${room.id}`);
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Create">
      <div className="flex flex-col gap-8 w-full max-w-xs items-center justify-center">
        <p className="text-white text-lg font-bold tracking-widest uppercase mb-4">New room</p>

        <Input
          placeholder="YOUR NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />

        <div className="flex flex-col w-full justify-start gap-4">
          <p className="text-white/60 text-xs tracking-widest uppercase">Select world</p>

          <div className="flex gap-4 justify-center">
            {(["dark", "light"] as World[]).map((world) => (
              <div key={world} className="flex flex-col gap-3 items-center">
                <button
                  onClick={() => setSelectedWorld(world)}
                  className={`
                    cursor-pointer h-24 w-24 flex justify-center items-center
                    transition-all duration-200 border
                    ${
                      selectedWorld === world
                        ? "border-white bg-white/10"
                        : "border-transparent opacity-40 hover:opacity-100 hover:border-white/30"
                    }
                  `}
                >
                  <img
                    src={worldImages[world]}
                    alt={`${world} world`}
                    className={`transition-all duration-200 pixelated
                    ${selectedWorld === world ? "h-20 w-20 grayscale-0" : "h-16 w-16 grayscale opacity-50"}
                  `}
                  />
                </button>
                <div
                  className={`
                    text-xs uppercase tracking-widest
                    ${
                      selectedWorld === world
                        ? "text-white"
                        : "text-transparent"
                    }
                  `}
                >
                  {selectedWorld}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6 flex items-center justify-center">
          <p
            className={`text-white border-b border-white text-xs tracking-widest uppercase transition-opacity duration-200 ${
              error ? "opacity-100" : "opacity-0"
            }`}
          >
            {error || ""}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={handleCreateRoom}
            disabled={loading || !name.trim()}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create room"}
          </Button>

          <Button
            onClick={() => navigate("/")}
            disabled={loading}
            className="w-full disabled:opacity-50"
          >
            Back
          </Button>
        </div>
      </div>
    </Page>
  );
}
