/* Functionality */
const APIKEY = "2hjb29unur";
const searchButton = document.querySelector("#search-button");
const fromStation = document.querySelector("#source-station");
const toStation = document.querySelector("#destination-station");
const date = document.querySelector("#date");

searchButton.addEventListener("click", initializeSearch);

function initializeSearch(e) {
  e.preventDefault();

  // code are being fed as input here
  let s = fromStation.value.split('(')[1];
  let sourceStationCodeName = s.slice(0,s.length-1);
  s = toStation.value.split('(')[1];
  let destinationStationCodeName = s.slice(0,s.length-1);
  let inputDate = new Date(document.querySelector("#date").value);
  let date = `${inputDate.getDate()}-${inputDate.getMonth() +
    1}-${inputDate.getFullYear()}`;
  // console.log(sourceStationCode, destinationStationCode, date);

  const SearchTrainsBetweenTwoStationsURL = `https://api.railwayapi.com/v2/between/source/${sourceStationCodeName}/dest/${destinationStationCodeName}/date/${date}/apikey/${APIKEY}/`;
  console.log(SearchTrainsBetweenTwoStationsURL);

  fetch(SearchTrainsBetweenTwoStationsURL, {
    "Content-Type": "application/json"
  })
    .then(res => res.json())
    .then(data => data.trains)
    .then(res => {
      displayResults(res);
      console.log(res);
    })
    .catch(err => console.log(err));
}

function displayResults(trainSearchResults) {
  // create a div of
  const div = document.querySelector("#search-results");
  console.log(trainSearchResults);

  for (let t in trainSearchResults) {
    let train = trainSearchResults[t];

    let trainNumber = train.number;
    let sourceStation = train.from_station.code;
    let destinationStation = train.to_station.code;
    let journeyClass = "SL";
    let journeyDate = document.querySelector("#date").value;
    let quota = "GN";

    const CheckForSeatsAvailability = `https://www.railyatri.in/seat-availability/${trainNumber}-${sourceStation}-${destinationStation}?journey_class=${journeyClass}&journey_date=${journeyDate}&quota=${quota}`;

    const d = document.createElement("div");
    let seatArray = [];

    fetch(CheckForSeatsAvailability)
      .then(response => response.text())
      .then(data => (d.innerHTML = data))
      .then(r => {
        let arr = Array.from(d.children);
        const innerd = document.createElement("div");
        innerd.innerHTML = arr[63].innerHTML;
        const seatAvailability = innerd.querySelector(
          ".leftpane .left-side-top #result #one"
        ).children;
        let details = innerd
          .querySelector(
            ".leftpane .left-side-top #result .train-schedule .name h1"
          )
          .innerText.split("-");
        seatArray.push(details);
        for (let i = 0; i < seatAvailability.length; i++) {
          seatArray.push(
            [seatAvailability[i].querySelector(
              ".status_one .seat_aval_result_left"
            ).innerText, seatAvailability[i].querySelector(".seat_availability_details .seat_aval_result_left").innerText]
          );
        }
        console.log(seatArray);
        const story = document.createElement("div");
        story.innerHTML = `
        <div class="card">
        <div class="card-content">
          <p>${train.number} - ${train.name}</p>
          <p>${train.from_station.name}</span>
          <span class="departure-time">${train.src_departure_time}</span>
          &#10230
          <span class="destination">${train.to_station.name}</span>
          <span class="arrival-time">${train.dest_arrival_time}</span></p>
        </div>
        <div class="card-tabs">
          <ul class="tabs tabs-fixed-width">
            <li class="tab">${seatArray[1][1]} <strong>${seatArray[1][0]}</strong></li>
            <li class="tab">${seatArray[2][1]} <strong>${seatArray[2][0]}</strong></li>
            <li class="tab">${seatArray[3][1]} <strong>${seatArray[3][0]}</strong></li>
            <li class="tab">${seatArray[4][1]} <strong>${seatArray[4][0]}</strong></li>
          </ul>
        </div>
      </div>
      `;
      console.log(story)
        div.appendChild(story);
      })
      .catch(err => console.log(err));
  }
}

/* AUTOCOMPLETE */
const matchList = document.getElementById("match-list");
const matchList1 = document.getElementById("match-list1");

const searchStations = async searchText => {
  const res = await fetch("../data/stations.json");
  const stations = await res.json();

  let matches = stations.filter(station => {
    const regex = new RegExp(`^${searchText}`, "gi");
    return station.name.match(regex) || station.code.match(regex);
  });
  matches = matches.slice(0, 5);

  if (searchText.length == 0) {
    matches = [];
    matchList.innerHTML = "";
  }

  outputHtml(matches);
};

const searchStations1 = async searchText1 => {
  const res = await fetch("../data/stations.json");
  const stations1 = await res.json();

  let matches1 = stations1.filter(station1 => {
    const regex = new RegExp(`^${searchText1}`, "gi");
    return station1.name.match(regex) || station1.code.match(regex);
  });
  matches1 = matches1.slice(0, 5);

  if (searchText1.length == 0) {
    matches1 = [];
    matchList1.innerHTML = "";
  }

  outputHtml1(matches1);
};

var funcfrom = function(value, object) {
  console.log(value);
  document.getElementById("source-station").value = value;
  matchList.innerHTML = "";
};
var funcfrom1 = function(value1, object) {
  console.log(value1);
  document.getElementById("destination-station").value = value1;
  matchList1.innerHTML = "";
};
const outputHtml = matches => {
  if (matches.length > 0) {
    const html = matches
      .map(
        match => `
            <div onClick="funcfrom('${match.name} (${match.code})',this)">
            <p>${match.name} ${"("}${match.code}${")"}</span></p>
            </div>
            `
      )
      .join("");
    matchList.innerHTML = html;
  }
};
const outputHtml1 = matches1 => {
  if (matches1.length > 0) {
    const html1 = matches1
      .map(
        match => `
            <div onClick="funcfrom1('${match.name} (${match.code})',this)" 
            <p>${match.name} ${"("}${match.code}${")"}</span></p>
            </div>
            `
      )
      .join("");
    matchList1.innerHTML = html1;
  }
};

fromStation.addEventListener("input", () => searchStations(fromStation.value));
toStation.addEventListener("input", () => searchStations1(toStation.value));
