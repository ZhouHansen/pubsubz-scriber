(function() {
  var data = pubsubz.addObserver({})
  var template = _.template(
    $("script.spinner").html()
  )

  $(".crud").on("click", function() {
    var $this = $(this)
      , $that = $($this.siblings().get(0))

    $this.blur()
    $this.append(template())

    $that.attr("disabled", true)
    $this.attr("disabled", true)

  })

  $("#fetch").on("click", function() {
    pubsubz.publish('fetchFromlocal')
  })

  $("#save").on("click", function() {
    pubsubz.publish("save")
  })

  $(".draw").on("click", "button", function(e) {

    pubsubz.publish("c->v changeStatus", e.target.id)
  })

  $(".canvaswrap").on("mousedown", function(e) {

    if (pubsubz.preventEvent) {
      e.preventDefault()
      pubsubz.preventEvent = false
      return
    }

    $(this).on("mousemove", function(e) {

      var x = e.pageX - $(this).offset().left
        , y = e.pageY - $(this).offset().top

      if (pubsubz.statusobj.line || pubsubz.statusobj.ctrlline) {
        pubsubz.publish("c->v drag", {
          x: x
          , y: y
        })
      }

    })

    $(this).on("mouseup", function(e) {
      pubsubz.dragging = false
      $(this).off("mousemove")
    })

    var x = e.pageX - $(this).offset().left
      , y = e.pageY - $(this).offset().top

    pubsubz.publish("c->v mousedowncanvas", {
      x: x
      , y: y
    })
  })

  data.subscribe("saveTolocal", function(topic, data) {
    localStorage.setItem("sketch_data", JSON.stringify(data))
    dataFinish()
  })

  data.subscribe("fetchFromlocal", function(topic) {
    var data = JSON.parse(localStorage.getItem("sketch_data"))

    pubsubz.publish("fetch", data)
    dataFinish()
  })

  function dataFinish() {
    $(".crud").attr("disabled", false)
    $('div.spinner').remove()
    $('button .sk-circle').remove()
  }
})()
