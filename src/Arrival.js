import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";
import Loading from "./Loading";

const Arrival = () => {
  const {
    arrival,
    setArrival,
    setUpdateTime,
    allFlights,
    compactArrival,
    inputLetters,
    windowWidth,
    isGateArr,
    setIsGateArr,
    originIataSwitch,
    setOriginIataSwitch,
  } = useContext(AppContext);
  const [isETA, setIsETA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleETA = () => {
    setIsETA(true);
  };
  const handleSTA = () => {
    setIsETA(false);
  };
  const handleGateAC = () => {
    setIsGateArr(!isGateArr);
  };
  const handleOriginSwitch = () => {
    setOriginIataSwitch(!originIataSwitch);
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
              (item) => item.DepartureArrivalType === "A"
            );
          })
          .then((data) => {
            if (isETA) {
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
            setArrival(data);
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
  }, [setArrival, setUpdateTime, isETA]);

  const Arrivals = () => {
    if (isLoading) {
      return <Loading />; // Komunikat podczas ładowania
    }

    if (arrival.length === 0) {
      return <p>No data</p>; // Gdy nie ma danych
    }
    return (
      <div className="arrivals">
        <table>
          <thead className="arrivals-item">
            <tr>
              <th className="No">Flight</th>
              <th className="OriginDest" onClick={handleOriginSwitch}>
                <span style={{ color: originIataSwitch ? "" : "lightgray" }}>
                  Origin
                </span>{" "}
                <span style={{ color: originIataSwitch ? "lightgray" : "" }}>
                  IATA
                </span>
              </th>
              {compactArrival ? null : (
                <th className="Scheduled" onClick={handleSTA}>
                  STA {isETA ? "" : " ●"}
                </th>
              )}

              <th className="Estimated" onClick={handleETA}>
                ETA {isETA ? " ●" : ""}
              </th>
              {compactArrival ? null : <th className="Status">Status</th>}

              <th className="Stand">Stand</th>
              <th className="BaggageClaim">Belt</th>
              {compactArrival ? null : windowWidth > 1200 ? (
                <>
                  <th className="Gate">Gate</th>
                  <th className="A/C Reg">A/C Reg</th>
                </>
              ) : (
                <th className="Gate GateAC" onClick={handleGateAC}>
                  <span style={{ color: isGateArr ? "" : "lightgray" }}>
                    Gate
                  </span>
                  <span style={{ color: isGateArr ? "lightgray" : "" }}>
                    A/C Reg
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {arrival.map((item) => {
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
                "TK", //Turkish Airlines
                "4Y", //Discover
                "ZT", //Titan Airways
              ].includes(item.AirlineIATA);

              const matchesSearch = (str) =>
                str.toLowerCase().includes(inputLetters.toLowerCase());

              if (!allFlights) {
                if (
                  matchesAirlineIATA &&
                  !(compactArrival && item.FlightStatusDesc === "Cancelled") &&
                  (!inputLetters ||
                    matchesSearch(item.AirlineIATA + item.FlightNumber) ||
                    matchesSearch(item.OriginDestAirportIATA) ||
                    matchesSearch(item.OriginDestAirportDesc))
                ) {
                  return <ArrivalItem key={item.Id} data={item} />;
                }
                return null;
              } else {
                if (
                  !inputLetters ||
                  matchesSearch(item.AirlineIATA + item.FlightNumber) ||
                  matchesSearch(item.OriginDestAirportIATA) ||
                  matchesSearch(item.OriginDestAirportDesc)
                ) {
                  return <ArrivalItem key={item.Id} data={item} />;
                }
                return null;
              }
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const ArrivalItem = (props) => {
    const { data } = props;
    const dateSTA = new Date(data.ScheduledDateTime);
    const STAHour = dateSTA.getUTCHours().toString().padStart(2, "0");
    const STAMinutes = dateSTA.getUTCMinutes().toString().padStart(2, "0");
    const STA = `${STAHour}:${STAMinutes}`;

    const dateETA = new Date(data.EstimatedDateTime);
    let ETA = "";
    if (data.EstimatedDateTime !== null) {
      const ETAHour = dateETA.getUTCHours().toString().padStart(2, "0");
      const ETAMinutes = dateETA.getUTCMinutes().toString().padStart(2, "0");
      ETA = `${ETAHour}:${ETAMinutes}`;
    }

    return (
      <tr className="arrivals-item">
        <th className="No">{data.AirlineIATA + data.FlightNumber}</th>
        <th className="OriginDest" onClick={handleOriginSwitch}>
          {originIataSwitch
            ? `${
                data.OriginDestAirportDesc === ""
                  ? data.OriginDestAirportIATA
                  : data.OriginDestAirportDesc
              }`
            : data.OriginDestAirportIATA}
        </th>
        {compactArrival ? null : (
          <th className="Scheduled" onClick={handleSTA}>
            {STA}
          </th>
        )}
        <th className="Estimated" onClick={handleETA}>
          {ETA}
        </th>
        {compactArrival ? null : (
          <th className="Status">
            {data.LandsideMessage1
              ? data.LandsideMessage1 === "DYNAMIC MESSAGING"
                ? "Estimated"
                : data.LandsideMessage1
              : data.FlightStatusDesc}
          </th>
        )}
        <th className="Stand">{data.StandCode}</th>
        <th className="BaggageClaim">{data.BaggageClaimUnit}</th>
        {compactArrival ? null : windowWidth > 1200 ? (
          <>
            <th className="Gate">{data.GateCode}</th>{" "}
            <th className="A/C Reg">{data.Registration}</th>
          </>
        ) : (
          <th className="Gate" onClick={handleGateAC}>
            {isGateArr ? data.GateCode : data.Registration}
          </th>
        )}
      </tr>
    );
  };

  return <Arrivals />;
};

export default Arrival;
