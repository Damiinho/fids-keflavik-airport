const Arrival = () => {
  function fetchData() {
    fetch("https://www.isavia.is/fids/arrivals.aspx")
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Wystąpił błąd:", error);
      });
  }

  fetchData();

  return <div>widok</div>;
};

export default Arrival;
