var glob = require('glob');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var duplexer = require('duplexer');

module.exports = function (b, opts) {
    if (!opts) opts = {};
    var out = opts.output || opts.o;
    var queue = [];

    var output = reset();
    b.on('reset', function () { output = reset() });

    if (!output) {
        return b.emit('error', new Error(
            'glob-css output must be a string filename or a stream'
        ));
    }

    b.on('package', function (pkg) {
        if (pkg.style) {
            pending ++;
            glob(pkg.style, { cwd: pkg.__dirname }, function (err, files) {
                pending --;
                queue.push.apply(queue, files.map(function (p) {
                    return fs.createReadStream(path.resolve(pkg.__dirname, p));
                }));
                enqueue();
            });
        }
    });

    b.pipeline.on('end', function () { finished = true });

    var queueing = false;
    var pending = 1;

    function enqueue () {
        if (queueing) return;
        if (queue.length === 0 && pending === 0) {
            return output.end();
        }
        if (queue.length === 0) return;
        queueing = true;
        var q = queue.shift();
        q.pipe(output, { end: false });
        q.once('end', function () {
            queueing = false;
            enqueue();
        });
    }

    function reset () {
        queue = [];
        queueing = false;
        if (typeof out === 'string') return fs.createWriteStream(out);
        if (typeof out === 'function') return out();
        if (typeof out === 'object' && out.pipe) return out;
    }
};
