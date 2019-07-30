// https://github.com/marionettejs/backbone.marionette/issues/3077
// monkey-patch Marionette for compatibility with jquery 3+.
// jquery removed the .selector method, which was used by the original
// implementation here.

const patchMarionetteRegionReset = Marionette => {
  Marionette.Region.prototype.reset = function() {
    this.empty();
    this.el = this.options.el;
    delete this.$el;
    return this;
  };
};

export default patchMarionetteRegionReset;
