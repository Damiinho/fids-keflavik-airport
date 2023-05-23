import { useContext } from "react";
import { AppContext } from "./AppContext";

const Header = () => {
  const { isDeparture, setIsDeparture, windowWidth } = useContext(AppContext);

  const handleSwitch = () => {
    setIsDeparture((prevState) => !prevState);
  };

  return (
    <>
      {windowWidth > 1200 ? (
        ""
      ) : (
        <div className="btn-container">
          <label className="switch">
            <input
              type="checkbox"
              checked={isDeparture}
              onChange={handleSwitch}
            />
            <span className="slider round"></span>
          </label>
        </div>
      )}
    </>
  );
};

export default Header;
