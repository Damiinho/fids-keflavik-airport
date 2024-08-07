import { useContext } from "react";
import { AppContext } from "./AppContext";

const Header = () => {
  const {
    isDeparture,
    setIsDeparture,
    windowWidth,
    updateTime,
    allFlights,
    setAllFlights,
    setCompactArrival,
    compactArrival,
    inputLetters,
    setInputLetters,
  } = useContext(AppContext);

  const handleSwitch = () => {
    setIsDeparture((prevState) => !prevState);
  };

  const handleCheckboxChange = () => {
    setAllFlights((prevState) => !prevState);
  };

  const handleChange = () => {
    setCompactArrival((prevState) => !prevState);
  };

  return (
    <>
      <div className="last-updated">Last updated: {updateTime}</div>
      {windowWidth > 1200 ? (
        <div className="print-button">
          <label className="form-compact">
            🖨️
            <input
              type="checkbox"
              name="checkbox"
              checked={compactArrival}
              onChange={handleChange}
            />
          </label>
        </div>
      ) : null}
      <div className={`form-container ${windowWidth > 1200 ? "" : "small"}`}>
        <label className="form-control">
          <input
            type="checkbox"
            name="checkbox"
            checked={allFlights}
            onChange={handleCheckboxChange}
          />
          {windowWidth > 1200 ? "Show " : ""} all flights
        </label>
      </div>
      {windowWidth > 1200 ? (
        ""
      ) : (
        <>
          <div className="btn-container">
            <label htmlFor="search">
              <input
                value={inputLetters}
                placeholder="number, origin or IATA"
                id="search"
                onChange={(e) => setInputLetters(e.target.value)}
              ></input>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDeparture}
                onChange={handleSwitch}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
