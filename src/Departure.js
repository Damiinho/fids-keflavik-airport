import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";
import Loading from "./Loading";

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
    destinationIataSwitch,
    setDestinationIataSwitch,
  } = useContext(AppContext);

  const [isETD, setIsETD] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleETD = () => {
    setIsETD(true);
  };
  const handleSTD = () => {
    setIsETD(false);
  };
  const handleGateAC = () => {
    setIsGateDep(!isGateDep);
  };
  const handleDestinationSwitch = () => {
    setDestinationIataSwitch(!destinationIataSwitch);
  };

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();

      const threeHoursBack = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const oneDayForward = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const from = threeHoursBack.toISOString();
      const to = oneDayForward.toISOString();

      if (hours < 10) {
        hours = `0${hours}`;
      }
      if (minutes < 10) {
        minutes = `0${minutes}`;
      }

      setUpdateTime(`${hours}:${minutes}`);

      const url1 = `https://www.kefairport.is/api/sourceData?from=${from}&to=${to}`;
      const url2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        url1
      )}`;
      const url3 = `https://corsproxy.io/?url=${encodeURIComponent(url1)}`;
      const url4 = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(
        url1
      )}`;
      const url5 = `http://www.whateverorigin.org/get?url=${encodeURIComponent(
        url1
      )}`; // tutaj jest contents

      const urls = [url1, url5, url4, url3, url2];

      const fetchFromUrl = (url, isLast = false) => {
        return fetch(url)
          .then((response) => response.json())
          .then((data) => {
            // Obsługa URL5, gdzie dane są w `contents`
            const actualData = url === url5 ? JSON.parse(data.contents) : data;
            return actualData.value.filter(
              (item) => item.DepartureArrivalType === "D"
            );
          })
          .then((data) => {
            if (isETD) {
              data.sort((a, b) => {
                const aValue =
                  a.EstimatedDateTime !== null
                    ? a.EstimatedDateTime
                    : a.ScheduledDateTime;
                const bValue =
                  b.EstimatedDateTime !== null
                    ? b.EstimatedDateTime
                    : b.ScheduledDateTime;
                return new Date(aValue) - new Date(bValue);
              });
            }
            setDeparture(data);
          });
      };

      // Wywołanie URL-ów po kolei
      const tryFetchSequentially = async (urls) => {
        for (let i = 0; i < urls.length; i++) {
          try {
            await fetchFromUrl(urls[i], i === urls.length - 1);
            break; // Zatrzymaj, jeśli się uda
          } catch (error) {
            console.error(`Error fetching from URL${i + 1}:`, error);
            if (i === urls.length - 1) {
              console.error("All URLs failed.");
            }
          }
        }
      };

      tryFetchSequentially(urls).finally(() => setIsLoading(false)); // Koniec ładowania
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [setDeparture, setUpdateTime, isETD]);

  const Departures = () => {
    if (isLoading) {
      return <Loading />; // Komunikat podczas ładowania
    }

    if (departure.length === 0) {
      return <p>No data</p>; // Gdy nie ma danych
    }
    return (
      <div className="departures">
        <table>
          <thead className="departures-item">
            <tr>
              <th>Flight</th>{" "}
              <th className="OriginDest" onClick={handleDestinationSwitch}>
                <span
                  style={{ color: destinationIataSwitch ? "" : "lightgray" }}
                >
                  Destination
                </span>{" "}
                <span
                  style={{ color: destinationIataSwitch ? "lightgray" : "" }}
                >
                  IATA
                </span>
              </th>
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
                "4Y", //Discover
                "ZT", //Titan Airways
              ].includes(item.AirlineIATA);

              const matchesSearch = (str) =>
                str.toLowerCase().includes(inputLetters.toLowerCase());

              if (!allFlights) {
                if (
                  matchesAirlineIATA &&
                  (!inputLetters ||
                    matchesSearch(item.AirlineIATA + item.FlightNumber) ||
                    matchesSearch(item.OriginDestAirportIATA) ||
                    matchesSearch(item.OriginDestAirportDesc))
                ) {
                  return <DepartureItem key={item.Id} data={item} />;
                }
                return null;
              } else {
                if (
                  matchesSearch(item.AirlineIATA + item.FlightNumber) ||
                  matchesSearch(item.OriginDestAirportIATA) ||
                  matchesSearch(item.OriginDestAirportDesc)
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
    const dateSTD = new Date(data.ScheduledDateTime);
    const STDHour = dateSTD.getUTCHours().toString().padStart(2, "0");
    const STDMinutes = dateSTD.getUTCMinutes().toString().padStart(2, "0");
    const STD = `${STDHour}:${STDMinutes}`;

    const dateETD = new Date(data.EstimatedDateTime);
    let ETD = "";
    if (data.EstimatedDateTime !== null) {
      const ETDHour = dateETD.getUTCHours().toString().padStart(2, "0");
      const ETDMinutes = dateETD.getUTCMinutes().toString().padStart(2, "0");
      ETD = `${ETDHour}:${ETDMinutes}`;
    }
    return (
      <tr className="departures-item">
        <th className="No">{data.AirlineIATA + data.FlightNumber}</th>
        <th className="OriginDest" onClick={handleDestinationSwitch}>
          {destinationIataSwitch
            ? `${
                data.OriginDestAirportDesc === ""
                  ? data.OriginDestAirportIATA
                  : data.OriginDestAirportDesc
              }`
            : data.OriginDestAirportIATA}
        </th>
        <th className="Scheduled" onClick={handleSTD}>
          {STD}
        </th>
        <th className="Estimated" onClick={handleETD}>
          {ETD}
        </th>
        <th className="Status">
          {data.LandsideMessage1
            ? data.LandsideMessage1 === "DYNAMIC MESSAGING"
              ? "Estimated"
              : data.LandsideMessage1
            : data.FlightStatusDesc}
        </th>
        <th className="Stand">{data.StandCode}</th>
        {windowWidth > 1200 ? (
          <>
            <th className="Gate">{data.GateCode}</th>
            <th className="A/C Reg">{data.Registration}</th>
          </>
        ) : (
          <th className="Gate" onClick={handleGateAC}>
            {isGateDep ? data.GateCode : data.Registration}
          </th>
        )}
      </tr>
    );
  };

  return <Departures />;
};

export default Departure;
