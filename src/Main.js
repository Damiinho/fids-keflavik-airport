import { useContext } from "react";
import { AppContext } from "./AppContext";
import Arrival from "./Arrival";
import Departure from "./Departure";

const Main = () => {
  const { isDeparture } = useContext(AppContext);

  return (
    <div className="main">{isDeparture ? <Departure /> : <Arrival />}</div>
  );
};

export default Main;
