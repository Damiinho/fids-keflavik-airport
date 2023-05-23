import { useContext } from "react";
import { AppContext } from "./AppContext";
import Arrival from "./Arrival";
import Departure from "./Departure";

const Main = () => {
  const { isDeparture, windowWidth } = useContext(AppContext);

  return (
    <div className={`main ${windowWidth > 1200 ? "" : "small"}`}>
      {windowWidth > 1200 ? (
        <>
          <Arrival />
          <Departure />
        </>
      ) : isDeparture ? (
        <Departure />
      ) : (
        <Arrival />
      )}
    </div>
  );
};

export default Main;
