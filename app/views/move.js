pubsubz.move = (function(stage) {
  var preventx = stage.getChildAt(0).x
    , preventy = stage.getChildAt(0).y

  return {
    movable: function(target) {

      target.on("pressmove", function(evt) {

        if (pubsubz.statusobj.move) {

          var u = evt.stageX - target.model.p.x
            , v = evt.stageY - target.model.p.y

          pubsubz.publish("v->m move", {
            u: u
            , v: v
          })
        }
      })
    }
  }
})(pubsubz.line.stage)
