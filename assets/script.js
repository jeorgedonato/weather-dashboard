$.when($.ready).then(() => {
  const apiKey = `6bdb742a424575111aa23affb7af492e`;
  const timeNow = moment().unix();
  const hourNow = moment.unix(timeNow).format("HH");
  const loader = $(".loader");
  // const dateNow = moment().format("YYMMDDHHmmss");
  const alertArea = $(".alert-area");
  let searchInput = $(".search-input");
  const weatherArea = $(".weather-area");
  let searchGroup = $(".search-group");
  let initWeather = true;
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
    loader.css("display", "block");
    weatherArea.empty();
    $.ajax({
      url: queryUrl,
      method: "GET"
    }).done((data, textStatus, jqXHR) => {
      storeCities(dataId, upperValue, data.sys.country);
      // console.log(data);
      parseWeatherBar(data)
    }).fail((jqXHR, textStatus, errorThrown) => {
      stateAlert("Please enter a valid city", "danger");
      loader.css("display", "none");
    })
  };

  let initWeatherBar = () => {

  };

  let parseWeatherBar = (weatherResult) => {
    let oneCallQuery = `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherResult.coord.lat}&lon=${weatherResult.coord.lon}&
exclude=minutely,hourly&appid=${apiKey}`;

    console.log(`${weatherResult.coord.lat} - ${weatherResult.coord.lon}`)

    const iconUrl = `http://openweathermap.org/img/w/${weatherResult.weather[0].icon}.png`;
    // console.log(weatherResult);
    const weatherDiv = $(`<div></div>`).addClass("weather-bar bg-light")
      .append(
        $(`<p></p>`).append($(`<h4></h4>`).html(`${weatherResult.name}, ${weatherResult.sys.country} (${moment.unix(weatherResult.dt).format("MM/DD/YYYY")}) <img src="${iconUrl}" alt="${weatherResult.name} weather"/>`)),
        $(`<p></p>`).html(`Temperature: <strong>${((weatherResult.main.temp - 273.15) * 1.80 + 32).toFixed(1)} °F</strong>`),
        $(`<p></p>`).html(`Humidity: <strong>${weatherResult.main.humidity}%</strong>`),
        $(`<p></p>`).html(`Wind Speed: <strong>${weatherResult.wind.speed} MPH</strong>`)
      );

    $.ajax({
      url: oneCallQuery,
      method: "GET"
    }).done((response) => {
      weatherDiv.append(
        $(`<p></p>`).html(`UV Index: <span class="${uvColor(parseInt(response.current.uvi))}">${response.current.uvi}</span>`),
        $(`<p></p>`).html(`<h5>5-Day Forecast</h5>`)
      );
      let daily = response.daily;
      let rowDiv = $(`<div></div>`).addClass("row");
      daily.slice(1, 6).map((d) => {
        const iconUrl = `http://openweathermap.org/img/w/${d.weather[0].icon}.png`;
        // console.log(d)
        rowDiv.append(
          $(`<div></div>`)
            .addClass("card weather-card text-white bg-primary col-xl-2 col-lg-3 col-md-12 col-sm-12 col-xs-12 mt-2")
            .append(
              $(`<div></div>`).addClass("card-header").html(`<strong>${moment.unix(d.dt).format("MM/DD/YYYY")}</strong>`),
              $(`<div></div>`).addClass("card-body weather-card-body").append(
                $(`<img />`).attr({ src: iconUrl, alt: d.weather[0].description }),
                $(`<p></p>`).addClass("card-text").html(`Temperature: <strong>${((d.temp.max - 273.15) * 1.80 + 32).toFixed(1)} °F</strong>`),
                $(`<p></p>`).html(`Humidity: <strong>${d.humidity}%</strong>`)
              )
            )
        )
      });
      weatherDiv.append(rowDiv)
    })


    weatherArea.html(weatherDiv);

    // weatherDiv.ready(() => {
    loader.css("display", "none");
    // });
  };

  let uvColor = (uvIndex) => {
    if (uvIndex < 2) {
      return "uvspan-low";
    } else if (uvIndex >= 3 && uvIndex <= 5) {
      return "uvspan-moderate";
    } else if (uvIndex >= 6 && uvIndex <= 7) {
      return "uvspan-high";
    } else if (uvIndex >= 8 && uvIndex <= 10) {
      return "uvspan-very";
    } else {
      return "uvspan-extreme";
    }
  };

  //Show Alert
  let stateAlert = (content, type) => {
    alertArea.html(`<div class="alert alert-${type} alert-banner" id="alert-clip" role="alert">${content}</div>`);
    setTimeout(() => { $("#alert-clip").hide(); }, 600);
  };
  //Show Alert

  let storeCities = (dataId, city, country) => {
    let storedWeather = JSON.parse(localStorage.getItem("weatherDashboard"));
    // parseInt(dataId)
    const weatherObjInit = {
      dataId: dataId,
      city: city,
      country: country
    };
    if (storedWeather === null) {
      //Init the scores as array then push
      storedWeather = [{ cities: [] }, { lastSearch: "" }];
      storedWeather[0].cities.push(weatherObjInit);
      storedWeather[1].lastSearch = city;
      // stateAlert("Success your plan was stored!", "success");
    } else {
      let weatherObj = storedWeather[0].cities.find(element => element.city === city);
      if (weatherObj) {
        // console.log(weatherObj)
        weatherObj.dataId = dataId;
        storedWeather[1].lastSearch = city;
        // stateAlert("Success your plan was edited!", "success");
      } else {
        storedWeather[0].cities.push(weatherObjInit);
        storedWeather[1].lastSearch = city;
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
      storedWeather[0].cities.reverse();
      //Note on using slice: slice should be used on the array while in use
      for (let weather of storedWeather[0].cities.slice(0, 10)) {
        // console.log(weather)
        let dataId = weather.dataId;
        searchGroup.append($(`<li></li>`).text(`${weather.city}, ${weather.country}`).attr({ "data-id": dataId, "data-city": weather.city }).addClass("list-group-item search-city-list"));
      }

      // For the initialize Weather bar
      if (storedWeather[1].lastSearch && initWeather) {
        querySearch(timeNow, storedWeather[1].lastSearch);
        initWeather = false
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

