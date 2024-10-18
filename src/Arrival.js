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
      const url1 = "https://www.innanlandsflugvellir.is/fids/arrivals.aspx";
      const url2 =
        "https://corsproxy.io/?https%3A%2F%2Fwww.innanlandsflugvellir.is%2Ffids%2Farrivals.aspx";

      const fetchFromUrl = (url) => {
        return fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Data from ${url}`);
            if (isETA) {
              data.Items.sort((a, b) => {
                const aValue = a.Estimated !== null ? a.Estimated : a.Scheduled;
                const bValue = b.Estimated !== null ? b.Estimated : b.Scheduled;
                return new Date(aValue) - new Date(bValue);
              });
            }
            setArrival(data.Items);
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
              {compactArrival ? null : (
                <th onClick={handleGateAC} className="GateAC">
                  {isGateArr ? "Gate" : "A/C Reg"} 🗘
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
                  !(compactArrival && item.Status === "Cancelled") &&
                  (!inputLetters ||
                    windowWidth > 1200 ||
                    matchesSearch(item.No) ||
                    matchesSearch(item.OriginDestIATA) ||
                    matchesSearch(item.OriginDest))
                ) {
                  return <ArrivalItem key={item.Id} data={item} />;
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
    const dateSTA = new Date(data.Scheduled);
    const STAHour = dateSTA.getUTCHours().toString().padStart(2, "0");
    const STAMinutes = dateSTA.getUTCMinutes().toString().padStart(2, "0");
    const STA = `${STAHour}:${STAMinutes}`;

    const dateETA = new Date(data.Estimated);
    let ETA = "";
    if (data.Estimated !== null) {
      const ETAHour = dateETA.getUTCHours().toString().padStart(2, "0");
      const ETAMinutes = dateETA.getUTCMinutes().toString().padStart(2, "0");
      ETA = `${ETAHour}:${ETAMinutes}`;
    }

    return (
      <tr className="arrivals-item">
        <th className="No">{data.No}</th>
        <th className="OriginDest">{`${
          data.OriginDest === "" ? data.OriginDestIATA : data.OriginDest
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
            {data.Additional ? data.Additional : data.Status}
          </th>
        )}
        <th className="Stand">{data.Stand}</th>
        <th className="BaggageClaim">{data.BaggageClaim}</th>
        {compactArrival ? null : (
          <th className="Gate">{isGateArr ? data.Gate : data.Aircraft}</th>
        )}
      </tr>
    );
  };

  return <Arrivals />;
};

export default Arrival;
