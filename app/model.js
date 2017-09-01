(function(m) {
  var collection = pubsubz.addObserver({
    m: m({
      container:{
        x: 0,
        y: 0
      },
      models:[],
    }),

    add: function(topic, obj) {
      delete obj.model.uniqueId
      delete obj.model.topics
      delete obj.model.token

      obj.model.uniqueId = _.uniqueId()

      var model = m(obj.model)

      model.on('iscurrent', function(iscurrent){
        pubsubz.publish('change:iscurrent', this)
      })

      model.on('ctrlline', function(ctrlline, oldctrlline){
        if (oldctrlline == void 0){
          pubsubz.publish('create:ctrlline', this)
        } else {
          pubsubz.publish('change:ctrlline', this)
        }
      })

      if (!obj.fetch&& this.m.models.length > 0) {
        var currentmodel = _.findWhere(this.m.models, {'iscurrent': true})

        currentmodel.iscurrent = false
        model.iscurrent = true
      }

      this.m.models = this.m.models.concat(model)
    },

    remove: function(topic, model) {
      this.m.models = _.without(this.m.models, model)
    },

    fetch: function(topic, models) {
      collection.m.models = []

      collection.m.container = models.container ? models.container : {x:0,y:0}

      _.each(models.data, function(record) {
        delete record._id

        record.ctrlline = record.ctrllines

        delete record.ctrllines

        collection.add(topic, {
          model: record
          , fetch: true
        })
      })
    },

    save: function(topic) {
      var models = {}

      models.data = []

      models.data = _.clone(this.m.models)

      models.data = _.map(models.data, function(model){
        if (typeof model.ctrlline === 'object'){

          model.ctrllines = {}

          for (var i in model.ctrlline){
            model.ctrllines[i] = model.ctrlline[i]
          }

          delete model.ctrlline
        }
        return model
      })

      models.container = this.m.container

      models = JSON.parse(JSON.stringify(models))

      pubsubz.publish("saveTolocal", models)
    },

    basicctrl: function(topic, obj){
      var model = _.findWhere(this.m.models, {uniqueId: obj.model.uniqueId})
      model.ctrlline = obj.ctrlline

      this.hidectrl()
    },

    mirrorctrl: function(topic, obj){
      var model = _.findWhere(this.m.models, {
          iscurrent: true
        })
        , ctrlline = {
          x: obj.x
          , y: obj.y
          , isMirror: true
          , hide: false
        }

      model.ctrlline = ctrlline
      this.hidectrl()
    },

    hidectrl: function(topic, obj){
      var model = _.filter(this.m.models, function(model) {
        if (model.ctrlline) {
          return model.iscurrent === false && model.ctrlline.hide === false
        } else {
          return false
        }
      })[0]

      if (model !== void 0) {

        var ctrlline = model.ctrlline

        ctrlline.hide = true

        model.ctrlline = ctrlline
      }
    },

    changeCurrent: function(topic, obj){
      var currentmodel = _.findWhere(this.m.models, {'iscurrent': true})

      currentmodel.iscurrent = false
      obj.model.iscurrent = true
    },

    moveContainer: function(topic, obj){
      collection.m.container = {x:obj.u,y:obj.v}
    }
  })

  collection.subscribe("v->m mousedowncanvas", collection.add)
  collection.subscribe("fetch", collection.fetch)
  collection.subscribe("v->m dragobj", collection.basicctrl)
  collection.subscribe("v->m remove", collection.remove)
  collection.subscribe("save", collection.save)
  collection.subscribe("v->m drag", collection.mirrorctrl)
  collection.subscribe("v->m mousedownobj", collection.basicctrl)
  collection.subscribe("v->m removeCtrl", collection.basicctrl)
  collection.subscribe("v->m changeIscurrent", collection.changeCurrent)
  collection.subscribe("v->m move", collection.moveContainer)

  collection.m.on('container', function(container){
    pubsubz.publish("change:container", container)
  })

  collection.m.on('models', function(models, oldmodels){

    if (models.length === 0 && oldmodels.length !== 1){
      pubsubz.publish("m->v stageClear")
    } else if (models.length > oldmodels.length){
      pubsubz.publish("m->v addview", models[models.length - 1])
    } else if (models.length < oldmodels.length){
      var model = _.difference(oldmodels, models)[0]

      model = model ? model : oldmodels[0]

      var index = _.indexOf(oldmodels, model)

      pubsubz.publish("m->v remove", model)

      if (index !== 0 && index !== oldmodels.length - 1) {
        pubsubz.publish("m->v suppleline", {
          l: model.sibling(oldmodels)
          , n: model.sibling(oldmodels, true)
        })
      }

      if (model.iscurrent) {

        if (index === oldmodels.length - 1) {
          var model = model.sibling(oldmodels)
        } else {
          var model = oldmodels[oldmodels.length - 1]
        }

        if (model) {
          var ctrlline = model.ctrlline

          if (ctrlline !== void 0 && !_.isEmpty(ctrlline)) {
            ctrlline.hide = false
            model.ctrlline = ctrlline
          }

          model.iscurrent = true
        }
      }
    }
  })

  m.method("sibling", function(models, front) {
    var models = typeof models === 'object' ? models : collection.m.models
    var index = _.indexOf(models, this)

    return front == true ? models[index + 1] : models[index - 1]
  })
})(Model)
