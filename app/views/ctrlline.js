pubsubz.ctrlline = (function(stage, container) {
  var view = {}
    , stage = stage
    , ismirror = false
    , drawSquare = function(x, y, uniqueId, model, isMirror) {

      var square = new createjs.Shape()

      square.graphics.setStrokeStyle(1).beginStroke("#f46c51").beginFill("#f46c51").drawRect(-2, -2, 4, 4)

      if (!isMirror) {
        square.x = x
        square.y = y
      } else {
        square.x = 2 * model.p.x - x
        square.y = 2 * model.p.y - y
      }

      square.uniqueId = uniqueId
      square.model = model

      square.isMirror = isMirror

      if (model.ctrlline.hide){
        square.graphics.clear()
      }

      square = pubsubz.addObserver(square)

      square.subscribe("change:ctrlline", function(topic, model) {

        var time = isMirror ? 1 : 0

        if (square.uniqueId === model.uniqueId) {

          if (_.isEmpty(model.ctrlline)) {
            container.removeChild(square)
          } else if (model.ctrlline.hide === false) {

            if (!pubsubz.dragging) {

              square.graphics.setStrokeStyle(1).beginStroke("#f46c51").beginFill("#f46c51").drawRect(-2, -2, 4, 4)

              if (time > -1) {
                time--
                if (time == 0) {
                  pubsubz.dragging = true
                }
              }
            }

            if (!square.isMirror) {

              square.x = model.ctrlline.x
              square.y = model.ctrlline.y
            } else {
              square.x = 2 * model.p.x - model.ctrlline.x
              square.y = 2 * model.p.y - model.ctrlline.y
            }

          } else {
            square.graphics.clear()
          }

          stage.update()
        }
      })

      square.subscribe("m->v remove", pubsubz.remove.simpleremove)

      pubsubz.cursor(square, {
        remove: true
      })
      pubsubz.remove.removable(square, stage, true)

      container.addChild(square)

      stage.update()

      return square
    }
    , drawLine = function(x1, y1, x2, y2, uniqueId, model, isMirror) {
      var line = new createjs.Shape()

      line.graphics.setStrokeStyle(1)
      line.graphics.beginStroke("#f46c51")

      if (!isMirror) {
        line.graphics.moveTo(x1, y1)
        line.graphics.lineTo(x2, y2)
      } else {
        line.graphics.moveTo(x1, y1)
        line.graphics.lineTo(2 * x1 - x2, 2 * y1 - y2)
      }

      line.uniqueId = uniqueId
      line.model = model
      line.time = 0
      line.isMirror = isMirror

      if (model.ctrlline.hide){
        line.graphics.clear()
      }

      line = pubsubz.addObserver(line)

      line.subscribe("change:ctrlline", function(topic, model) {

        if (line.uniqueId === model.uniqueId) {
          if (_.isEmpty(model.ctrlline)) {
            container.removeChild(line)
          } else if (model.ctrlline.hide === false) {
            if (line.time == 0) {
              line.graphics.clear()
              line.time++
            }

            line.time--
              line.graphics.setStrokeStyle(1)
            line.graphics.beginStroke("#f46c51")

            if (!line.isMirror) {
              line.graphics.moveTo(model.p.x, model.p.y)
              line.graphics.lineTo(model.ctrlline.x, model.ctrlline.y)
            } else {
              line.graphics.moveTo(model.p.x, model.p.y)
              line.graphics.lineTo(2 * model.p.x - model.ctrlline.x, 2 * model.p.y - model.ctrlline.y)
            }
          } else {
            line.graphics.clear()
          }

          stage.update()
        }
      })

      line.subscribe("m->v remove", pubsubz.remove.simpleremove)

      container.addChildAt(line, 0)
      stage.update()

      return line
    }

  view = pubsubz.addObserver(view)

  view.subscribe("c->v mousedowncanvas", function(topic, e) {
    if (!pubsubz.statusobj.ctrlline) return

  }, "main")

  view.subscribe("create:ctrlline", function(topic, model) {

    drawSquare(model.ctrlline.x, model.ctrlline.y, model.uniqueId, model, false)
    drawLine(model.p.x, model.p.y, model.ctrlline.x, model.ctrlline.y, model.uniqueId, model, false)

    if (model.ctrlline.isMirror) {

      drawSquare(model.ctrlline.x, model.ctrlline.y, model.uniqueId, model, true)
      drawLine(model.p.x, model.p.y, model.ctrlline.x, model.ctrlline.y, model.uniqueId, model, true)
    }

  }, "main")

  return {
    draggable: function(target, stage) {

      target.on("mousedown", function(evt) {

        pubsubz.preventEvent = true


        if (target.model.iscurrent && pubsubz.statusobj.line) {

          pubsubz.publish("v->m mousedownobj", {
            "model": target.model
            , "ctrlline": {
              x: evt.stageX - container.x
              , y: evt.stageY - container.y
              , isMirror: false
              , hide: false
            }
          })
        }
      })

      target.on("pressmove", function(evt) {

        pubsubz.preventEvent = true

        if (target.model.iscurrent && pubsubz.statusobj.line && !ismirror) {
          pubsubz.publish("v->m dragobj", {
            "model": target.model
            , "ctrlline": {
              x: evt.stageX - container.x
              , y: evt.stageY - container.y
              , isMirror: false
              , hide: false
            }
          })
        }
      })

      target.on("pressup", function() {
        pubsubz.preventEvent = false
        pubsubz.dragging = false
      })
    }
    , ctrlable: function(target, stage) {

      target.on("click", function() {

        pubsubz.preventEvent = true

        if (!target.model.iscurrent && pubsubz.statusobj.ctrlline) {
          pubsubz.publish("v->m changeIscurrent", {
            "model": target.model
            , "iscurrent": true
          })
        }
      })

      target.on("pressmove", function(evt) {

        pubsubz.preventEvent = true

        if (target.model.iscurrent && pubsubz.statusobj.ctrlline) {
          ismirror = true
          pubsubz.publish("v->m drag", {
            x: evt.stageX - container.x
            , y: evt.stageY - container.y
          })
        }
      })

      target.on("pressup", function() {
        ismirror = false
        pubsubz.dragging = false
      })
    }

  }
})(pubsubz.line.stage, pubsubz.line.container)
