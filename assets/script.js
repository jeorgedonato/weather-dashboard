$.when($.ready).then(() => {
  const apiKey = `6bdb742a424575111aa23affb7af492e`;
  const timeNow = moment().unix();
  const hourNow = moment.unix(timeNow).format("HH");
  // const dateNow = moment().format("YYMMDDHHmmss");
  const alertArea = $(".alert-area");
  let searchInput = $(".search-input");
  const weatherArea = $(".weather-area");
  let searchGroup = $(".search-group");
  // console.log(hourNow)
  let bgChecker = () => {
    let imageUrl;
    if (hourNow > 4 && hourNow < 12) {
      imageUrl = `url(assets/images/morning-bg.jpg)`;
    } else if (hourNow === 12) {
      imageUrl = `url(assets/images/noon-bg.jpg)`;
    } else if (hourNow > 12 && hourNow < 19) {
      imageUrl = `url(assets/images/afternoon-bg.jpg)`;
    } else {
      imageUrl = `url(assets/images/night-bg.jpg)`;
    }
    $("body").css("background-image", imageUrl);
  }

  //Search Click button
  $(".search-btn").on("click", (e) => {
    e.preventDefault();
    parseSearch();
  });

  //Input Enter Button
  searchInput.on('keypress', (e) => {
    if (e.which === 13) {
      parseSearch();
    }
  });

  let parseSearch = () => {
    let searchValue = searchInput.val();
    if (searchValue) {
      //Make every word in a string capitalize
      //Source : https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
      let upperValue = searchValue.trim().toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
      // let dataId = timeNow;
      querySearch(timeNow, upperValue);
      searchInput.val('');
    } else {
      stateAlert("Please enter a city!", "danger");
    }
  }

  let querySearch = (dataId, upperValue) => {
    let queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${upperValue}&appid=${apiKey}`;
    $.ajax({
      url: queryUrl,
      method: "GET"
    }).done((data, textStatus, jqXHR) => {
      storeCities(dataId, upperValue);
      // console.log(data);
      parseWeatherBar(data)
    }).fail((jqXHR, textStatus, errorThrown) => {
      stateAlert("Please enter a valid city", "danger");
    })
  };

  let parseWeatherBar = (weatherResult) => {
    const iconUrl = `http://openweathermap.org/img/w/${weatherResult.weather[0].icon}.png`;
    // console.log(weatherResult);
    const weatherDiv = $(`<div></div>`).addClass("weather-bar bg-light")
      .append(
        $(`<p></p>`).append($(`<h5></h5>`).html(`${weatherResult.name}, ${weatherResult.sys.country} (${moment.unix(weatherResult.dt).format("MM/DD/YYYY")}) <img src="${iconUrl}" alt="${weatherResult.name} weather"/>`)),
        $(`<p></p>`).html(`Temperature: <strong>${((weatherResult.main.temp - 273.15) * 1.80 + 32).toFixed(1)} °F</strong>`),
        $(`<p></p>`).html(`Humidity: <strong>${weatherResult.main.humidity}%</strong>`),
        $(`<p></p>`).html(`Wind Speed: <strong>${weatherResult.wind.speed} MPH</strong>`)
      );
    weatherArea.html(weatherDiv)
  };

  //Show Alert
  let stateAlert = (content, type) => {
    alertArea.html(`<div class="alert alert-${type} alert-banner" id="alert-clip" role="alert">${content}</div>`);
    setTimeout(() => { $("#alert-clip").hide(); }, 600);
  };
  //Show Alert

  let storeCities = (dataId, city) => {
    let storedWeather = JSON.parse(localStorage.getItem("weatherDashboard"));
    // parseInt(dataId)
    const weatherObjInit = {
      dataId: dataId,
      city: city,
      isPrev: false
    };
    if (storedWeather === null) {
      //Init the scores as array then push
      storedWeather = [];
      storedWeather.push(weatherObjInit);
      // stateAlert("Success your plan was stored!", "success");
    } else {
      let weatherObj = storedWeather.find(element => element.city === city);
      if (weatherObj) {
        // console.log(weatherObj)
        weatherObj.dataId = dataId;
        // stateAlert("Success your plan was edited!", "success");
      } else {
        storedWeather.push(weatherObjInit);
        // stateAlert("Success your plan was stored!", "success");
      }
    }
    localStorage.setItem("weatherDashboard", JSON.stringify(storedWeather));
    renderCities();
  };

  let renderCities = () => {
    let storedWeather = JSON.parse(localStorage.getItem("weatherDashboard"));
    // console.log(searchGroup)
    searchGroup.empty();
    if (storedWeather !== null) {
      storedWeather.reverse();
      //Note on using slice: slice should be used on the array while in use
      for (let weather of storedWeather.slice(0, 10)) {
        // console.log(weather)
        let dataId = weather.dataId;
        searchGroup.append($(`<li></li>`).text(weather.city).attr({ "data-id": dataId, "data-city": weather.city }).addClass("list-group-item search-city-list"));
      }
    }
    bgChecker();
  };

  searchGroup.on("click", (e) => {
    // e.preventDefault();
    let target = $(e.target);
    if (target.hasClass("search-city-list")) {
      const dataId = target.attr("data-id");
      const dataCity = target.attr("data-city");
      querySearch(dataId, dataCity);
    }
  });

  renderCities();
  // bgChecker();
});