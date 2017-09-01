pubsubz.line = (function() {
  var view = {}
    , stage = new createjs.Stage("canvas")
    , container = new createjs.Container()
    , drawCircle = function(x, y, uniqueId, model, iscurrent) {
      var circle = new createjs.Shape()

      circle.graphics.setStrokeStyle(1).beginStroke("#000000")

      if (iscurrent) {
        circle.graphics.beginFill("#000")
      } else {
        circle.graphics.beginFill("#fff")
      }

      circle.graphics.drawCircle(0, 0, 3)

      circle.x = x
      circle.y = y
      circle.uniqueId = uniqueId
      circle.model = model

      circle = pubsubz.addObserver(circle)

      circle.subscribe("change:iscurrent", function(topic, model) {

        if (circle.uniqueId === model.uniqueId) {

          var color = model.iscurrent ? "#000" : "#fff"

          this.graphics.beginFill(color).drawCircle(0, 0, 3)

          stage.update()
        }

      }, "main")

      circle.subscribe("m->v remove", pubsubz.remove.simpleremove)

      pubsubz.cursor(circle, {
        remove: true
        , line: true
        , ctrlline: true
        , move: true
      })
      pubsubz.ctrlline.draggable(circle, stage)
      pubsubz.ctrlline.ctrlable(circle, stage)
      pubsubz.remove.removable(circle, stage)
      pubsubz.move.movable(circle, stage)

      container.addChild(circle)

      stage.update()

      return circle
    }

  , drawLine = function(x1, y1, x2, y2, models, uniqueIds) {
    var line = new createjs.Shape()

    line.graphics.setStrokeStyle(1)
    line.graphics.beginStroke("#000")
    line.graphics.moveTo(x1, y1)

    drawcurve(line.graphics, x2, y2, models[0], models[1])

    line.uniqueIds = uniqueIds
    line.models = models
    line.time = 0
    line = pubsubz.addObserver(line)

    line.subscribe("change:ctrlline", function(topic, model) {

      if (_.contains(line.uniqueIds, model.uniqueId)) {

        var x1 = line.models[0].p.x
          , y1 = line.models[0].p.y
          , x2 = line.models[1].p.x
          , y2 = line.models[1].p.y

        if (line.time === 0) {

          line.graphics.clear()
          line.time++
        }

        line.time--
          line.graphics.setStrokeStyle(1)
        line.graphics.beginStroke("#000")
        line.graphics.moveTo(x1, y1)

        if (model.uniqueId === line.models[0].uniqueId) {
          drawcurve(line.graphics, x2, y2, model, line.models[1])
        } else {
          drawcurve(line.graphics, x2, y2, line.models[0], model)
        }

        stage.update()
      }
    })

    line.subscribe("m->v remove", pubsubz.remove.simpleremove)

    container.addChildAt(line, 0)
    stage.update()

    return line
  }

  stage.enableMouseOver()

  stage.addChild(container)

  stage.update()

  view = pubsubz.addObserver(view)

  // model to view

  view.subscribe("change:container", function(topic, obj) {
    container.set(obj)
    stage.update()
  })

  view.subscribe("m->v addview", function(topic, model) {
    drawCircle(model.p.x, model.p.y, model.uniqueId, model, model.iscurrent)

    if (model.sibling() !== void 0) {

      var lastmodel = model.sibling()

      drawLine(lastmodel.p.x, lastmodel.p.y, model.p.x, model.p.y, [lastmodel, model], [lastmodel.uniqueId, model.uniqueId])
    }

    if (model.ctrlline) {
      pubsubz.publish("create:ctrlline", model)
    }
  })

  view.subscribe("m->v stageClear", function() {
    container.removeAllChildren()
  })

  view.subscribe("m->v movecontainer", function(topic, obj) {
    container.set({
      x: obj.u
      , y: obj.v
    })

    stage.update()
  })

  view.subscribe("m->v suppleline", function(topic, obj) {
    var lastmodel = obj.l
      , nextmodel = obj.n
      , lx = lastmodel.p.x
      , ly = lastmodel.p.y
      , luniqueId = lastmodel.uniqueId
      , nx = nextmodel.p.x
      , ny = nextmodel.p.y
      , nuniqueId = nextmodel.uniqueId

    drawLine(lx, ly, nx, ny, [lastmodel, nextmodel], [luniqueId, nuniqueId])
  })


  ///  controller to view

  view.subscribe("c->v mousedowncanvas", function(topic, obj) {
    if (!pubsubz.statusobj.line) return

    pubsubz.publish("v->m mousedowncanvas", {
      model: {
        iscurrent: true
        , p: {
          x: obj.x - container.x
          , y: obj.y - container.y
        }
      }
      , fetch: false
    })
  })

  view.subscribe("c->v drag", function(topic, obj) {
    pubsubz.dragging = true
    pubsubz.publish("v->m drag", {
      x: obj.x - container.x
      , y: obj.y - container.y
    })
  })

  function drawcurve(g, x2, y2, lastmodel, model) {
    if (lastmodel.ctrlline && (!model.ctrlline || (model.ctrlline && !model.ctrlline.isMirror))) {
      g.quadraticCurveTo(lastmodel.ctrlline.x, lastmodel.ctrlline.y, x2, y2)
    } else if (!lastmodel.ctrlline && model.ctrlline && model.ctrlline.isMirror) {
      g.quadraticCurveTo(model.ctrlline.x, model.ctrlline.y, x2, y2)
    } else if (lastmodel.ctrlline && model.ctrlline && model.ctrlline.isMirror) {
      g.bezierCurveTo(lastmodel.ctrlline.x, lastmodel.ctrlline.y, model.ctrlline.x, model.ctrlline.y, x2, y2);
    } else {
      g.lineTo(x2, y2)
    }
  }

  return {
    stage: stage
    , container: container
  }

})()
