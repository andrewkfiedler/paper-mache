/**
 * An opinionated patch of listenTo to make
 * it behave how I would expect it to based on documentation.
 *
 * With this, it will not fire callbacks after
 * views are destroyed.  The use of call is preferred because
 * according to the Backbone docs it's performance is must faster than apply.
 */

const patchListenTo = Backbone => {
  const listenTo = Backbone.View.prototype.listenTo;
  Backbone.View.prototype.listenTo = function(obj, name, callback) {
    const view = this;
    return listenTo.call(view, obj, name, function() {
      if (callback === undefined) {
        console.warn(`Found no callback for listener in ${view.tagName}`);
        return;
      }
      if (view.isDestroyed !== true) {
        const a1 = arguments[0],
          a2 = arguments[1],
          a3 = arguments[2];
        switch (arguments.length) {
          case 0:
            callback.call(view);
            return;
          case 1:
            callback.call(view, a1);
            return;
          case 2:
            callback.call(view, a1, a2);
            return;
          case 3:
            callback.call(view, a1, a2, a3);
            return;
          default:
            callback.apply(view, arguments);
            return;
        }
      }
    });
  };
};

export default patchListenTo;
