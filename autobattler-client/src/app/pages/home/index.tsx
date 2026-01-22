import { useNavigate } from "react-router-dom";
import Page from "../../components/Page";
import Button from "../../components/Button";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Page title="Home">
      <div className="flex flex-col gap-8 w-full max-w-xs items-center justify-center">
        <Button
          onClick={() => navigate("/create")}
          className="w-full"
        >
          New room
        </Button>

        <Button
          onClick={() => navigate("/join")}
          className="w-full"
        >
          Enter existing room
        </Button>
      </div>
    </Page>
  );
}
