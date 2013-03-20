var fs = require('fs'),
    sys = require('sys');
file = 'server.js';
fs.watchFile(file, function(curr, prev) {
    sys.puts("File was modified.");
});

console.log('serving file %s', file)