This provides snippets that allow interoperability between otherwise incompatible versions of software libraries.

Namely, it allows using Backbone 1.3.3 with Backbone Associations 0.6.2 and Marionette 2.4.7.

It also allows using Marionette 2.4.7 with jquery 3+.

The patches aren't provided individually, namely because if the internalOn patch runs after the other two patches that two listenTo those two patches will end up being lost in the ether.

To use this, import the three patch functions.

Run the patchBackbonePreMarionette function before pulling in Marionette.

Run the patchBackbonePostAssociations function after pulling in Backbone Associations.

Run the patchMarionette function after pulling in Marionette.
