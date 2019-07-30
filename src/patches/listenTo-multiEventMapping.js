/**
 * Patch for upgrading from 1.1.2 to later versions
 * So in addition to the changes in the internalOn we've seen, they also
 * accidentally removed multi event mapping syntax (change reset add in a single
 * call).  However, they added it back.  Unfortunately for us, not in a way
 * that backbone associations can reach.  Here is the simplist way to get that
 * functionality back.
 */
const eventSplitter = /\s+/;

const patchMultiEventMapping = Backbone => {
  const listenTo = Backbone.View.prototype.listenTo;

  Backbone.View.prototype.listenTo = function(obj, name, callback) {
    if (typeof name !== "object" && eventSplitter.test(name)) {
      var i = 0,
        names;
      // Handle space separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        listenTo.call(this, obj, names[i], callback);
      }
    } else {
      listenTo.call(this, obj, name, callback);
    }
    return this;
  };
};

export default patchMultiEventMapping;
