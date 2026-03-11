import { AppProvider } from "./AppContext";
import Home from "./Home";

function App() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
}

export default App;
