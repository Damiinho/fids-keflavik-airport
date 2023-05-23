import { useState, useEffect } from "react";

const Arrival = () => {
  const [arrival, setArrival] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    fetch("https://www.isavia.is/fids/arrivals.aspx")
      .then((response) => response.json())
      .then((data) => {
        setArrival(data.Items);
      })
      .catch((error) => {
        console.error("Wystąpił błąd:", error);
      });
  }

  console.log(arrival);

  const Arrivals = () => {
    return (
      <div className="arrivals">
        <div>Flight</div>
        <div>Origin</div>
        <div>STA</div>
        <div>ETA</div>
        <div>Status</div>
        <div>Stand</div>
        <div>Belt</div>
        <div>Gate</div>
        {arrival.map((item) => {
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
      <>
        <div className="No">
          {data.No}, {data.Airline}
        </div>
        <div className="OriginDest">{data.OriginDest}</div>
        <div className="Scheduled">{STA}</div>
        <div className="Estimated">{ETA}</div>
        <div className="Status">{data.Status}</div>
        <div className="Stand">{data.Stand}</div>
        <div className="BaggageClaim">{data.BaggageClaim}</div>
        <div className="Gate">{data.Gate}</div>
      </>
    );
  };

  return (
    <div>
      <Arrivals />
    </div>
  );
};

export default Arrival;
