import { DiagramWorkspace } from "@/features/diagramWorkspace";
import { useSetupMenu } from "./useSetupMenu";
import "./index.css";
import { ErrorBoundary } from "./errorBoundary";

function App() {
  useSetupMenu();
  return (
    <ErrorBoundary>
      <DiagramWorkspace />
    </ErrorBoundary>
  );
}

export default App;
