import { useEffect, useState } from "react";
import AppRouter from "./routes";
import { socketService } from "./service/socket";
import Page from "./app/components/Page";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    socketService.connect();

    const connectHandler = () => setConnected(true);
    const disconnectHandler = () => setConnected(false);

    socketService.on("connect", connectHandler);
    socketService.on("disconnect", disconnectHandler);

    // Timeout para detectar falha de conexão
    const timer = setTimeout(() => {
      if (!connected) setFailed(true);
    }, 7000);

    return () => {
      socketService.off("connect");
      socketService.off("disconnect");
      clearTimeout(timer);
      socketService.disconnect();
    };
  }, [connected]);

  if (failed) {
    return (
      <Page title="Not connected">
        <div className="flex min-h-screen items-center justify-center text-red-400">
          Could not connect to server. Please try again later.
        </div>
      </Page>
    );
  }

  if (!connected) {
    return (
      <Page title="Connecting to server...">
        <div className="flex min-h-screen items-center justify-center text-white">
          Connecting to server...
        </div>
      </Page>
    );
  }

  return <AppRouter />;
}
