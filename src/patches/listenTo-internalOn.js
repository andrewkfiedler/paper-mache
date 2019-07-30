/**
 * Here be dragons
 * Okay.  Here's the low down.  Backbone associations monkeypatches the Backbone.Events.on function.  That worked great until
 * Backbone 1.2 when they decided to add a new argument and so as to hide that argument from the world started using internalOn.
 * It partially works out of the box because Event.on is still called sometimes, but listenTo instead of delegating to Events.on
 * now called the internalOn directly (because arguments were different, both in length and order unfortunately).
 * Now you could think to yourself, let's just patch Backbone.AssociatedModel.prototype.on and call it a day.  You'd be mistaken to think that's
 * possible.  It relies on a non exposed variable called endPoints to track everything.
 * Thinking with that constraint in mind, that means you have to make sure whatever solution you come up with is merely delegating to that
 * original function of Backbone.AssociatedModel.prototype.on.
 * The basic idea is to monkeypatch Backbone.View.prototype.listenTo to make it delegate to the public Backbone.Events.on again.
 * As a result, Backbone.AssociatedModel.prototype.on would be called as normal, just like we want it to (since Backbone associations monkeypatches that function).
 * But as I mentioned above, they stopped delegating for a reason.  Argument lengths are different and ordering is different.
 * This is where you want to hang your head and cry a bit.
 * So we have to monkey path Backbone.Events.on to handle two different sets of arguments.  Easy enough.  If we get 5 call internalOn with 5,
 * if we get 3 call internalOn with 3.
 * Now it gets interesting.  We're forced to delegate to Backbone.AssociatedModel.prototype.on and Backbone.AssociatedModel.prototype.on has
 * no concept of these argument issues.  Luckily, it passes through all arguments straight to Backbone.Events.on.  If it hadn't, we'd be
 * out of luck.
 * But it's still not fun.  We have to swap the ordering of arguments when calling Backbone.AssociatedModel.prototype.on, and then unswap
 * them in the Backbone.Events.on.
 * Yuck, but also, it works.  I'm sorry, you're welcome.
 * In the end though, a lot of this is copy paste from the backbone source.
 * The only updates are in:
 * Backbone.Events.on
 * Backbone.View.prototype.listenTo
 * Backbone.AssociatedModel.prototype.on
 */
const eventSplitter = /\s+/;

const patchBackboneListenToInternalOnForAssociations = Backbone => {
  if (Backbone.AssociatedModel === undefined) {
    throw "This code must run after Backbone Associations is brought in, otherwise we can't patch things appropriately.";
  }

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context,
        ctx = options.ctx,
        listening = options.listening;
      if (listening) listening.count++;

      handlers.push({
        callback: callback,
        context: context,
        ctx: context || ctx,
        listening: listening
      });
    }
    return events;
  };

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`), reducing them by manipulating `memo`.
  // Passes a normalized single event name and callback, as well as the `context`,
  // `ctx`, and `listening` arguments to `iteratee`.
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0,
      names;
    if (name && typeof name === "object") {
      // Handle event maps.
      if (callback !== void 0 && "context" in opts && opts.context === void 0)
        opts.context = callback;
      for (names = _.keys(name); i < names.length; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Backbone.Events.on = function(name, callback, context) {
    if (arguments.length === 5) {
      // got to rearrange what happened below, sorry
      return internalOn(
        arguments[3],
        arguments[0],
        arguments[1],
        arguments[2],
        arguments[4]
      );
    } else {
      return internalOn(this, name, callback, context);
    }
  };

  // An internal use `on` function, used to guard the `listening` argument from
  // the public API.
  var internalOn = function(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
      context: context,
      ctx: obj,
      listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to.
  Backbone.View.prototype.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId("l"));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId("l"));
      listening = listeningTo[id] = {
        obj: obj,
        objId: id,
        id: thisId,
        listeningTo: listeningTo,
        count: 0
      };
    }
    // Bind callbacks on obj, and keep track of them on listening.
    Backbone.AssociatedModel.prototype.on(obj, name, callback, this, listening);
    return this;
  };

  const oldAssociatedModelOn = Backbone.AssociatedModel.prototype.on;

  Backbone.AssociatedModel.prototype.on = function(name, callback, context) {
    if (arguments.length === 5) {
      // rearrange here, rearrange again up there
      const nameArg = arguments[1];
      const callbackArg = arguments[2];
      const contextArg = arguments[3];
      return oldAssociatedModelOn.call(
        this,
        nameArg,
        callbackArg,
        contextArg,
        arguments[0],
        arguments[4]
      );
    } else {
      return oldAssociatedModelOn.call(this, name, callback, context);
    }
  };
};

export default patchBackboneListenToInternalOnForAssociations;
