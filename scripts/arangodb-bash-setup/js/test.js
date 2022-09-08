#!/usr/bin/arangosh --javascript.execute
require("internal").print("hello world")
db._query("FOR x IN test RETURN x").toArray()