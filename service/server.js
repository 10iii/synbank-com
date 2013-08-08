var listener = require ("./listener.js")
var calculator = require ("./calculator.js")
var cleaner = require ("./cleaner.js")
listener.mtgox();
calculator.usd();
cleaner.run();

