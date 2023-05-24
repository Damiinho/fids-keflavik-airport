import { useEffect, useContext, useState } from "react";
import { AppContext } from "./AppContext";

const Departure = () => {
  const { departure, setDeparture, setUpdateTime, allFlights } =
    useContext(AppContext);

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
              if (a.Estimated === null && b.Estimated === null) {
                return new Date(a.Scheluded) - new Date(b.Scheluded);
              } else if (a.Estimated !== null && b.Estimated === null) {
                return new Date(a.Estimated) - new Date(b.Scheluded);
              } else if (a.Estimated === null && b.Estimated !== null) {
                return new Date(a.Scheluded) - new Date(b.Estimated);
              } else {
                return new Date(a.Estimated) - new Date(b.Estimated);
              }
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
        <div className="title">Departure</div>
        <div className="departures-item">
          <div>Flight</div>
          <div>Destination</div>
          <div className="Scheduled" onClick={handleSTD}>
            STD {isETD ? "" : " ●"}
          </div>
          <div className="Estimated" onClick={handleETD}>
            ETD {isETD ? " ●" : ""}
          </div>
          <div>Status</div>
          <div>Stand</div>
          <div>Gate</div>
        </div>
        {departure.map((item) => {
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
              return <DepartureItem key={item.Id} data={item} />;
            }
            return null;
          } else {
            return <DepartureItem key={item.Id} data={item} />;
          }
        })}
      </div>
    );
  };

  const DepartureItem = (props) => {
    const { data } = props;
    const dateSTD = new Date(data.Scheduled);
    const STD = dateSTD.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateETD = new Date(data.Estimated);

    let ETD = "";
    if (data.Estimated !== null) {
      ETD = dateETD.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return (
      <div className="departures-item">
        <div className="No">{data.No}</div>
        <div className="OriginDest">{data.OriginDest}</div>
        <div className="Scheduled" onClick={handleSTD}>
          {STD}
        </div>
        <div className="Estimated" onClick={handleETD}>
          {ETD}
        </div>
        <div className="Status">
          {data.Additional ? data.Additional : data.Status}
        </div>
        <div className="Stand">{data.Stand}</div>
        <div className="Gate">{data.Gate}</div>
      </div>
    );
  };

  return <Departures />;
};

export default Departure;
