pubsubz.remove = (function(stage, container) {

  return {
    removable: function(target, stage, isCtrl) {

      target.on("mousedown", function() {
        pubsubz.preventEvent = true

        if (pubsubz.statusobj.remove) {

          if (isCtrl) {
            pubsubz.publish("v->m removeCtrl", {
              model: target.model
              , ctrlline: void 0
            })
          } else {
            pubsubz.publish("v->m remove", target.model)
          }
        }
      })
    }
    , simpleremove: function(topic, model) {
      if (this.uniqueId === model.uniqueId || _.contains(this.uniqueIds, model.uniqueId)) {

        container.removeChild(this)
        stage.update()
      }
    }
  }

})(pubsubz.line.stage, pubsubz.line.container)
