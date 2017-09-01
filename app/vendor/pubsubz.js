(function(factory){

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
            (typeof global == 'object' && global.global == global && global);

  // Set up pubsubz appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global pubsubz.
      root.pubsubz = factory(root, exports);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

  // Finally, as a browser global.
  } else {
    root.pubsubz = factory(root, {});
  }

}(function(root, pubsubz){
  var subOid = -1
    , observers = []
    , super_subscribe = {
      subscribe: function(topic, func, funcName, delaytime){
        if (!this.topics[topic]){
          this.topics[topic] = []
        }

        if (delaytime === void 0) {
          var delaytime = 0
        }
        
        this.topics[topic].push({
          funcName: funcName
          , func: func
          , delaytime: delaytime
        })

        return funcName
      },

      unsubscribe: function(funcName){
        for (var m in this.topics) {
          if (this.topics[m]) {
            for (var i = 0, j = this.topics[m].length; i < j; i++) {
              if (this.topics[m][i].funcName === funcName) {
                this.topics[m].splice(i, 1);
                return funcName;
              }
            }
          }
        }
        return false;        
      },

      off: function(topic){
        var token = this.token

        if (topic){

          for (var m in this.topics) {

            if (topic === m){
              delete this.topics[topic]
              return topic
            }
          }

          return false
        }

        for (var i = 0, j = observers.length; i < j; i++){
          if (observers[i]["token"] === token){
            observers.splice(i, 1)
            return token
          }
        }
        return false
      }
    }


  pubsubz.addObserver = function(obj){
    var token = (++subOid).toString()

    if (obj.token){
      return false
    }

    obj.token = token
    obj.topics = {}

    var preobj = obj    

    obj = Object.create(super_subscribe)

    _.extend(obj,preobj)

    observers.push(obj)

    return obj
  }

  var timerfunc = function(inneri,innert,subscribers,observer,topic,args){
    
    var timer = setInterval(function(){

      subscribers[inneri].func.apply(observer, [topic, args]);

      clearInterval(timer)

    },innert) 
  }

  pubsubz.publish = function(topic, args){
    var hastopic = false

    _.each(observers, function(observer){

      if (observer.topics[topic]){
        hastopic = true

      } else {
        return
      }

      setTimeout(function(){

        var subscribers = observer.topics[topic]
          , len = subscribers ? subscribers.length : 0
          , t = 0
        
        for (var i=0;i<len;i++){
          t += subscribers[i].delaytime

          timerfunc(i,t,subscribers,observer,topic,args)
        }        

      },0)

    })

    return hastopic
  }
  
  pubsubz.preventEvent = false
  
  return pubsubz

}))