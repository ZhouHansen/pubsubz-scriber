(function() {

  pubsubz.statusobj = {
    line: false
    , ctrlline: false
    , remove: false
    , move: false
  }

  var statusarr = ["line", "ctrlline", "remove", "move"]

  function changeStatus(topic, status) {

    for (var i = 0; i < statusarr.length; i++) {
      pubsubz.statusobj[statusarr[i]] = false
    }

    pubsubz.statusobj[status] = true
  }

  function lighten(topic, status) {

    $("#canvas").removeClass("remove unable ctrlline")
    $(".draw button").blur()

    $("#" + status).focus()
    $("#canvas").addClass(status)
  }

  pubsubz.statusobj = pubsubz.addObserver(pubsubz.statusobj)

  pubsubz.statusobj.subscribe("c->v changeStatus", changeStatus)
  pubsubz.statusobj.subscribe("v->v changeStatus", changeStatus)
  pubsubz.statusobj.subscribe("v->v changeStatus", lighten)
})()