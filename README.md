# kompilator

Parts of a javascript compiler tooling system.

## Project structure

All packages are built as independent libraries (with no dependency to each others: ie they use each other at built time only). However internal code may be shared between packages. This implies that changes to one internal component may break others components.
More specifically, this coupling is most of the time for "default values": for now we do not want to expose publicly (to keep public api simple) internal component factories while keeping them shared across the various packages.
In that sense, that coupling is "loose" and should not cause too much trouble.
It means however that before updating a component, the builds of every dependant component must pass too.

External API lifecycle remains subject to semantic versions.

example:

The lexical token registry is used by the syntactic token registry although both are considered "private"
However, in the future we may want the user to instantiate its own registry and use it in place of the default ECMAScript registry (so he/she can extend the lexical grammar without depending on the will of this project authors).
I believe this approach would be better than creating a "plugin system" which most of the time expose internal API anyway.