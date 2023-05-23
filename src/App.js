import "./App.css";
import AppProvider from "./AppContext";
import Header from "./Header";
import Main from "./Main";

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <Main />
      </div>
    </AppProvider>
  );
}

export default App;
