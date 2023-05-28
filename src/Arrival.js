import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";

const Arrival = () => {
  const { arrival, setArrival, setUpdateTime, allFlights, compactArrival } =
    useContext(AppContext);
  const [isETA, setIsETA] = useState(false);

  const handleETA = () => {
    setIsETA(true);
  };
  const handleSTA = () => {
    setIsETA(false);
  };

  useEffect(() => {
    const fetchData = () => {
      fetch("https://www.isavia.is/fids/arrivals.aspx")
        .then((response) => response.json())
        .then((data) => {
          if (isETA) {
            data.Items.sort((a, b) => {
              const aValue = a.Estimated !== null ? a.Estimated : a.Scheduled;
              const bValue = b.Estimated !== null ? b.Estimated : b.Scheduled;
              return new Date(aValue) - new Date(bValue);
            });
          }

          setArrival(data.Items);
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
  }, [setArrival, setUpdateTime, isETA]);

  const Arrivals = () => {
    return (
      <div className="arrivals">
        <div className="title">
          <div className="title-text">Arrival</div>
        </div>
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
              {compactArrival ? null : <th className="Gate">Gate</th>}
            </tr>
          </thead>
          <tbody>
            {arrival.map((item) => {
              if (!allFlights) {
                if (
                  (item.AirlineIATA === "FI" || //Icelandair
                    item.AirlineIATA === "UA" || //United
                    item.AirlineIATA === "AY" || //Finnair
                    item.AirlineIATA === "DY" || //Norwegian
                    item.AirlineIATA === "RC" || //Atlantic
                    item.AirlineIATA === "WK" || //Edelweiss
                    item.AirlineIATA === "LH" || //Lufthansa
                    item.AirlineIATA === "SK" || //SAS
                    item.AirlineIATA === "GL" || //AirGreenland
                    item.AirlineIATA === "E4" || //Enter Air
                    item.AirlineIATA === "OS") && //Austrian
                  !(compactArrival && item.Status === "Cancelled")
                ) {
                  return <ArrivalItem key={item.Id} data={item} />;
                }
                return null;
              } else {
                return <ArrivalItem key={item.Id} data={item} />;
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
        <th className="OriginDest">{data.OriginDest}</th>
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
        {compactArrival ? null : <th className="Gate">{data.Gate}</th>}
      </tr>
    );
  };

  return <Arrivals />;
};

export default Arrival;
