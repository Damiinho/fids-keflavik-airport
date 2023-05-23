import { useContext } from "react";
import { AppContext } from "./AppContext";

const Header = () => {
  const { isDeparture, setIsDeparture } = useContext(AppContext);

  const handleClick = () => setIsDeparture(!isDeparture);

  return (
    <div onClick={handleClick}>{isDeparture ? "Departure" : "Arrival"}</div>
  );
};

export default Header;
