# companion-module-avolites-titan-19

## Module for Avolites Titan software and desks

This module controls Avolites Titan software, running on computers or lighting desks.

The module works for Titan version 14.0 and onwards. It will probably also works for older versions but with reduced functionality.

**WARNING**  
This module does NOT work with the Titan One, T1 and Editor Keys.
The modules communicates with Titan using the WebAPI which is enabled with T2 dongles and beyond (T3, desks...).

## to develop further

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.
