(function() {

  pubsubz.cursor = function(target, obj) {

    target.on("mouseover", function() {

      if (pubsubz.statusobj.ctrlline && !target.model.iscurrent && obj.ctrlline) {
        $("#canvas").addClass("ctrlline")
      }

      if (pubsubz.statusobj.line && !target.model.iscurrent && obj.line) {
        $("#canvas").addClass("unable")
      }

      if (pubsubz.statusobj.remove && obj.remove) {
        $("#canvas").addClass("remove")
      }

      if (pubsubz.statusobj.move && obj.move) {
        $("#canvas").addClass("move")
      }

    })

    target.on("mouseout", function() {
      $("#canvas").removeClass("remove unable ctrlline move")
    })
  }
})()