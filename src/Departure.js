import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";

const Departure = () => {
  const {
    departure,
    setDeparture,
    setUpdateTime,
    allFlights,
    inputLetters,
    windowWidth,
  } = useContext(AppContext);

  const [isETD, setIsETD] = useState(false);

  const handleETD = () => {
    setIsETD(true);
  };
  const handleSTD = () => {
    setIsETD(false);
  };

  useEffect(() => {
    const fetchData = () => {
      fetch("https://www.isavia.is/fids/departures.aspx")
        .then((response) => response.json())
        .then((data) => {
          if (isETD) {
            data.Items.sort((a, b) => {
              const aValue = a.Estimated !== null ? a.Estimated : a.Scheduled;
              const bValue = b.Estimated !== null ? b.Estimated : b.Scheduled;
              return new Date(aValue) - new Date(bValue);
            });
          }
          setDeparture(data.Items);
        })
        .catch((error) => {
          console.error("Wystąpił błąd:", error);
        });

      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      if (hours < 10) {
        hours = `0${hours}`;
      }
      if (minutes < 10) {
        minutes = `0${minutes}`;
      }
      setUpdateTime(`${hours}:${minutes}`);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [setDeparture, setUpdateTime, isETD]);

  const Departures = () => {
    return (
      <div className="departures">
        <div className="title-text">Departure</div>
        <table>
          <thead className="departures-item">
            <tr>
              <th>Flight</th>
              <th>Destination</th>
              <th className="Scheduled" onClick={handleSTD}>
                STD {isETD ? "" : " ●"}
              </th>
              <th className="Estimated" onClick={handleETD}>
                ETD {isETD ? " ●" : ""}
              </th>
              <th>Status</th>
              <th>Stand</th>
              <th>Gate</th>
            </tr>{" "}
          </thead>
          <tbody>
            {departure.map((item) => {
              const matchesAirlineIATA = [
                "FI", //Icelandair
                "UA", //United
                "AY", //Finnair
                "DY", //Norwegian
                "RC", //Atlantic
                "WK", //Edelweiss
                "LH", //Lufthansa
                "SK", //SAS
                "GL", //AirGreenland
                "E4", //EnterAir
                "ENT", //EnterAir
                "CAT", //Copenhagen Air
                "QS", //SmartWings
                "C3", //Trade Air
                "OS", // Austrian
              ].includes(item.AirlineIATA);

              const matchesSearch = (str) =>
                str.toLowerCase().includes(inputLetters.toLowerCase());

              if (!allFlights) {
                if (
                  matchesAirlineIATA &&
                  (!inputLetters ||
                    windowWidth > 1200 ||
                    matchesSearch(item.No) ||
                    matchesSearch(item.OriginDestIATA) ||
                    matchesSearch(item.OriginDest))
                ) {
                  return <DepartureItem key={item.Id} data={item} />;
                }
                return null;
              } else {
                if (
                  !inputLetters ||
                  windowWidth > 1200 ||
                  matchesSearch(item.No) ||
                  matchesSearch(item.OriginDestIATA) ||
                  matchesSearch(item.OriginDest)
                ) {
                  return <DepartureItem key={item.Id} data={item} />;
                }
                return null;
              }
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const DepartureItem = (props) => {
    const { data } = props;
    const dateSTD = new Date(data.Scheduled);
    const STDHour = dateSTD.getUTCHours().toString().padStart(2, "0");
    const STDMinutes = dateSTD.getUTCMinutes().toString().padStart(2, "0");
    const STD = `${STDHour}:${STDMinutes}`;

    const dateETD = new Date(data.Estimated);
    let ETD = "";
    if (data.Estimated !== null) {
      const ETDHour = dateETD.getUTCHours().toString().padStart(2, "0");
      const ETDMinutes = dateETD.getUTCMinutes().toString().padStart(2, "0");
      ETD = `${ETDHour}:${ETDMinutes}`;
    }

    return (
      <tr className="departures-item">
        <th className="No">{data.No}</th>
        <th className="OriginDest">{data.OriginDest}</th>
        <th className="Scheduled" onClick={handleSTD}>
          {STD}
        </th>
        <th className="Estimated" onClick={handleETD}>
          {ETD}
        </th>
        <th className="Status">
          {data.Additional ? data.Additional : data.Status}
        </th>
        <th className="Stand">{data.Stand}</th>
        <th className="Gate">{data.Gate}</th>
      </tr>
    );
  };

  return <Departures />;
};

export default Departure;
