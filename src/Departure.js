import { useState, useEffect } from "react";

const Departure = () => {
  const [departure, setDeparture] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    fetch("https://www.isavia.is/fids/departures.aspx")
      .then((response) => response.json())
      .then((data) => {
        setDeparture(data.Items);
      })
      .catch((error) => {
        console.error("Wystąpił błąd:", error);
      });
  }

  const Departures = () => {
    return (
      <div className="departures">
        Departure
        <div className="departures-item">
          <div>Flight</div>
          <div>Destination</div>
          <div>STD</div>
          <div>ETD</div>
          <div>Status</div>
          <div>Stand</div>
          <div>Gate</div>
        </div>
        {departure.map((item) => {
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
            return <DepartureItem key={item.Id} data={item} />;
          }
          return null;
        })}
      </div>
    );
  };

  const DepartureItem = (props) => {
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
      <div className="departures-item">
        <div className="No">{data.No}</div>
        <div className="OriginDest">{data.OriginDest}</div>
        <div className="Scheduled">{STA}</div>
        <div className="Estimated">{ETA}</div>
        <div className="Status">{data.Status}</div>
        <div className="Stand">{data.Stand}</div>
        <div className="Gate">{data.Gate}</div>
      </div>
    );
  };

  return <Departures />;
};

export default Departure;
