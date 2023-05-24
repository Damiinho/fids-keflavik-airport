import { useEffect, useContext } from "react";
import { AppContext } from "./AppContext";

const Arrival = () => {
  const { arrival, setArrival, setUpdateTime, allFlights } =
    useContext(AppContext);

  useEffect(() => {
    const fetchData = () => {
      fetch("https://www.isavia.is/fids/arrivals.aspx")
        .then((response) => response.json())
        .then((data) => {
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
  }, [setArrival, setUpdateTime]);

  const Arrivals = () => {
    return (
      <div className="arrivals">
        <div className="title">Arrival</div>
        <div className="arrivals-item">
          <div className="No">Flight</div>
          <div className="OriginDest">Origin</div>
          <div className="Scheduled">STA</div>
          <div className="Estimated">ETA</div>
          <div className="Status">Status</div>
          <div className="Stand">Stand</div>
          <div className="BaggageClaim">Belt</div>
          <div className="Gate">Gate</div>
        </div>
        {arrival.map((item) => {
          if (!allFlights) {
            if (
              item.AirlineIATA === "FI" || //Icelandair
              item.AirlineIATA === "UA" || //United
              item.AirlineIATA === "AY" || //Finnair
              item.AirlineIATA === "DY" || //Norwegian
              item.AirlineIATA === "RC" || //Atlantic
              item.AirlineIATA === "WK" || //Edelweiss
              item.AirlineIATA === "LH" || //Lufthansa
              item.AirlineIATA === "SK" || //SAS
              item.AirlineIATA === "GL" || //AirGreenland
              item.AirlineIATA === "E4" || //Enter Air
              item.AirlineIATA === "OS" //Austrian
            ) {
              return <ArrivalItem key={item.Id} data={item} />;
            }
            return null;
          } else {
            return <ArrivalItem key={item.Id} data={item} />;
          }
        })}
      </div>
    );
  };

  const ArrivalItem = (props) => {
    const { data } = props;
    const dateSTA = new Date(data.Scheduled);
    const STA = dateSTA.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateETA = new Date(data.Estimated);
    const ETA = dateETA.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="arrivals-item">
        <div className="No">{data.No}</div>
        <div className="OriginDest">{data.OriginDest}</div>
        <div className="Scheduled">{STA}</div>
        <div className="Estimated">{ETA}</div>
        <div className="Status">
          {data.Additional ? data.Additional : data.Status}
        </div>
        <div className="Stand">{data.Stand}</div>
        <div className="BaggageClaim">{data.BaggageClaim}</div>
        <div className="Gate">{data.Gate}</div>
      </div>
    );
  };

  return <Arrivals />;
};

export default Arrival;
