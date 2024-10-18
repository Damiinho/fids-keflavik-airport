import { createContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDeparture, setIsDeparture] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [arrival, setArrival] = useState([]);
  const [departure, setDeparture] = useState([]);
  const [updateTime, setUpdateTime] = useState("");
  const [allFlights, setAllFlights] = useState(false);
  const [compactArrival, setCompactArrival] = useState(false);
  const [inputLetters, setInputLetters] = useState("");
  const [isGateArr, setIsGateArr] = useState(true);
  const [isGateDep, setIsGateDep] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth <= 1200 && compactArrival === false) {
      setCompactArrival(true);
    } else if (windowWidth > 1200 && compactArrival === true) {
      setCompactArrival(false);
    }
  }, [compactArrival, windowWidth]);

  const providerValue = {
    isDeparture,
    setIsDeparture,
    windowWidth,
    arrival,
    setArrival,
    departure,
    setDeparture,
    updateTime,
    setUpdateTime,
    allFlights,
    setAllFlights,
    compactArrival,
    setCompactArrival,
    inputLetters,
    setInputLetters,
    isGateArr,
    isGateDep,
    setIsGateArr,
    setIsGateDep,
  };

  return (
    <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
