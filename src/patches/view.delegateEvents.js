/**
 * Older versions of backbone called delegate events once after
 * calling initialize.  This just restores that behavior.
 * Without it, certain views didn't have events bound correctly.
 * Becomes an issue when updating from 1.1.2 to later versions.
 */
const patchViewDelegateEvents = Backbone => {
  if (Backbone.Marionette !== undefined) {
    throw "This code must run before Backbone Marionette is brought in, otherwise we can't patch things appropriately.";
  }
  const oldConstructor = Backbone.View.prototype.constructor;
  Backbone.View = Backbone.View.extend({
    constructor: function(options) {
      oldConstructor.call(this, options);
      this.delegateEvents();
    }
  });
};
export default patchViewDelegateEvents;
