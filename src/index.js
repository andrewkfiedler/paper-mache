/**
 * Pass in your Backbone instance and this will
 * run a series of independent patches that allow
 * verison 1.3.3 of Backbone to run with Marionette 2.4.7
 * and Backbone Associations 0.6.2.
 *
 * There's also a Marionette patch to allow running jquery 3+
 * with Marionette 2.4.7.
 *
 *
 * Make sure to run these as close to the very start of your
 * application as possible.
 */
import {
  patchCollectionSet,
  patchListenToForDestroyed,
  patchListenToForInternalOn,
  patchListenToForMultiEventMapping,
  patchViewDelegateEvents,
  patchMarionetteRegionReset
} from "./patches";

export const patchBackbonePreMarionette = Backbone => {
  if (Backbone === undefined) {
    throw "Must pass in Backbone instance";
  }
  if (Backbone._paperMache && Backbone._paperMache.patchBackbonePreMarionette) {
    console.warn(
      `Already patched!  Check if you're calling this twice somehow.`
    );
    return;
  }
  patchViewDelegateEvents(Backbone);
  Backbone._paperMache = {
    ...Backbone._paperMache,
    patchBackbonePreMarionette: true
  };
};

export const patchMarionette = Marionette => {
  if (Marionette === undefined) {
    throw "Must pass in Marionette instance";
  }
  if (Marionette._paperMache && Marionette._paperMache.patchMarionette) {
    console.warn(
      `Already patched!  Check if you're calling this twice somehow.`
    );
    return;
  }
  patchMarionetteRegionReset(Marionette);
  Marionette._paperMache = {
    ...Marionette._paperMache,
    patchMarionette: true
  };
};

export const patchBackbonePostAssociations = Backbone => {
  if (Backbone === undefined) {
    throw "Must pass in Backbone instance";
  }
  if (
    Backbone._paperMache &&
    Backbone._paperMache.patchBackbonePostAssociations
  ) {
    console.warn(
      `Already patched!  Check if you're calling this twice somehow.`
    );
    return;
  }
  patchCollectionSet(Backbone);
  patchListenToForInternalOn(Backbone);
  patchListenToForDestroyed(Backbone);
  patchListenToForMultiEventMapping(Backbone);
  Backbone._paperMache = {
    ...Backbone._paperMache,
    patchBackbonePostAssociations: true
  };
};

export default {
  patchBackbonePostAssociations,
  patchBackbonePreMarionette,
  patchMarionette
};
