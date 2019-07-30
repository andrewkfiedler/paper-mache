/**
 * This is a workaround for the update in https://github.com/jashkenas/backbone/pull/3663/
 * Basically, they decided not to use the native splice method for performance reasons.
 * Unfortunately, the native splice handles NaN and the new version does not.
 * The native splice pretends NaN is 0, so we'll patch it so we can get the same behavior.
 * (this crops up when upgrading to anything beyond 1.2.1, starting in 1.2.2)
 */
const patchCollectionSet = Backbone => {
  const originalSet = Backbone.Collection.prototype.set;
  Backbone.Collection.prototype.set = function(models, options) {
    if (options && options.at === Backbone.Collection.prototype.at) {
      return originalSet.call(this, models, {
        at: null
      });
    } else {
      return originalSet.call(this, models, options);
    }
  };
};

export default patchCollectionSet;
