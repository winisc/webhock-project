import { useState } from "react";
import Page from "../../components/Page";
import { useNavigate } from "react-router-dom";
import { socketService } from "../../../service/socket";
import type { World } from "../../../types/pages";
import darkImg from "../../assets/dark.png";
import lightImg from "../../assets/light.png";

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
      <div className="flex flex-col gap-4 justify-center items-center">
        <p className="text-white text-lg">New room</p>

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
          className="rounded-full bg-[#383838] sm:w-100 w-80 py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] pl-4 focus:outline-none focus:ring-2 focus:ring-white"
        />

        <div className="flex flex-col w-full justify-start gap-2">
          <p className="text-white text-lg">Select world:</p>

          <div className="flex gap-3">
            {(["dark", "light"] as World[]).map((world) => (
              <div className="flex flex-col gap-2">
                <button
                  key={world}
                  onClick={() => setSelectedWorld(world)}
                  className={`
                    cursor-pointer h-28 w-24 rounded-xs flex justify-center items-center
                    shadow-lg transition-all duration-200
                    ${
                      selectedWorld === world
                        ? "bg-[#0a0a0a] border-2 border-white scale-105"
                        : "bg-[#0a0a0a] border border-[#4D4D4D] opacity-60 hover:opacity-100"
                    }
                  `}
                >
                  <img
                    src={worldImages[world]}
                    alt={`${world} world`}
                    className={`transition-all duration-200 rounded-md pixelated
                    ${selectedWorld === world ? "h-24 w-24" : "h-20 w-20 opacity-60 hover:opacity-100"}
                    
                  `}
                  />
                </button>
                <p
                  className={`
                    capitalize shadow-lg text-sm text-center
                    ${
                      selectedWorld === world
                        ? " text-white scale-105"
                        : "opacity-0"
                    }
                  `}
                >
                  {selectedWorld}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6 flex items-center justify-center">
          <p
            className={`text-red-400 text-sm transition-opacity duration-200 ${
              error ? "opacity-100" : "opacity-0"
            }`}
          >
            {error || ""}
          </p>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={loading || !name.trim()}
          className="rounded-full bg-[#383838] sm:w-100 w-80 py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create room"}
        </button>

        <button
          onClick={() => navigate("/")}
          disabled={loading}
          className="rounded-full bg-[#383838] sm:w-100 w-80 py-1.5 text-lg text-[#F1F1F1] shadow-lg hover:bg-[#4D4D4D] cursor-pointer disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </Page>
  );
}
