import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";

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
  } = useContext(AppContext);
  const [isETA, setIsETA] = useState(false);

  const handleETA = () => {
    setIsETA(true);
  };
  const handleSTA = () => {
    setIsETA(false);
  };
  const handleGateAC = () => {
    setIsGateArr(!isGateArr);
  };

  useEffect(() => {
    const fetchData = () => {
      const url1 =
        "https://www.kefairport.is/api/sourceData?from=2024-12-01T03:17:31.181Z&to=2024-12-03T03:17:31.181Z";
      const url2 =
        "https://www.kefairport.is/api/sourceData?from=2024-12-01T03:17:31.181Z&to=2024-12-03T03:17:31.181Z";

      const fetchFromUrl = (url) => {
        return fetch(url)
          .then((response) => response.json())
          .then((data) =>
            data.value.filter((item) => item.DepartureArrivalType === "A")
          )
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
  }, [setArrival, setUpdateTime, isETA]);

  const Arrivals = () => {
    return (
      <div className="arrivals">
        <table>
          <thead className="arrivals-item">
            <tr>
              <th className="No">Flight</th>
              <th className="OriginDest">Origin</th>
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
        <th className="OriginDest">{`${
          data.OriginDestAirportDesc === ""
            ? data.OriginDestAirportIATA
            : data.OriginDestAirportDesc
        }`}</th>
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
            {data.LandsodeMessage1
              ? data.LandsodeMessage1
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
