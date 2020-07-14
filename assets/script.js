$.when($.ready).then(() => {
  const apiKey = `6bdb742a424575111aa23affb7af492e`;
  const timeNow = moment().unix();
  const hourNow = moment.unix(timeNow).format("HH");
  const alertArea = $(".alert-area");
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

  $(".search-btn").on("click", (e) => {
    e.preventDefault();
    let searchValue = $(".search-input").val();
    // console.log(searchValue)
    if (searchValue) {

    } else {
      stateAlert("Please enter a city!", "danger")
    }
  });

  //Show Alert
  let stateAlert = (content, type) => {
    alertArea.html(`<div class="alert alert-${type} alert-banner" id="alert-clip" role="alert">${content}</div>`)
    setTimeout(() => { $("#alert-clip").hide(); }, 600);
  };
  //Show Alert

  bgChecker();
});