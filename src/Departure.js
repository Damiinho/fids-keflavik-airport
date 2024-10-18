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
    isGateDep,
    setIsGateDep,
  } = useContext(AppContext);

  const [isETD, setIsETD] = useState(false);

  const handleETD = () => {
    setIsETD(true);
  };
  const handleSTD = () => {
    setIsETD(false);
  };
  const handleGateAC = () => {
    setIsGateDep(!isGateDep);
  };

  useEffect(() => {
    const fetchData = () => {
      const url1 = "https://www.innanlandsflugvellir.is/fids/departures.aspx";
      const url2 =
        "https://corsproxy.io/?https%3A%2F%2Fwww.innanlandsflugvellir.is%2Ffids%2Fdepartures.aspx";

      const fetchFromUrl = (url) => {
        return fetch(url)
          .then((response) => response.json())
          .then((data) => {
            // console.log(`Data from ${url}`);
            if (isETD) {
              data.Items.sort((a, b) => {
                const aValue = a.Estimated !== null ? a.Estimated : a.Scheduled;
                const bValue = b.Estimated !== null ? b.Estimated : b.Scheduled;
                return new Date(aValue) - new Date(bValue);
              });
            }
            setDeparture(data.Items);
          });
      };

      fetchFromUrl(url1).catch(() => {
        fetchFromUrl(url2).catch((error) => {
          console.error("Error", error);
        });
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
              {windowWidth > 1200 ? (
                <>
                  <th className="Gate">Gate</th>
                  <th className="A/C Reg">A/C Reg</th>
                </>
              ) : (
                <th className="Gate GateAC" onClick={handleGateAC}>
                  <span style={{ color: isGateDep ? "" : "lightgray" }}>
                    Gate
                  </span>
                  <span style={{ color: isGateDep ? "lightgray" : "" }}>
                    A/C Reg
                  </span>
                </th>
              )}
            </tr>
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
                "OS", //Austrian
                "TK", //Turkish Airlines
              ].includes(item.AirlineIATA);

              const matchesSearch = (str) =>
                str.toLowerCase().includes(inputLetters.toLowerCase());

              if (!allFlights) {
                if (
                  matchesAirlineIATA &&
                  (!inputLetters ||
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
        <th className="OriginDest">{`${
          data.OriginDest === "" ? data.OriginDestIATA : data.OriginDest
        }`}</th>
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
        {windowWidth > 1200 ? (
          <>
            <th className="Gate">{data.Gate}</th>
            <th className="A/C Reg">{data.Aircraft}</th>
          </>
        ) : (
          <th className="Gate" onClick={handleGateAC}>
            {isGateDep ? data.Gate : data.Aircraft}
          </th>
        )}
      </tr>
    );
  };

  return <Departures />;
};

export default Departure;
