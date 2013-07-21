module.exports = Spigot

var Readable = require("stream").Readable

// v0.8.x compat
if (!Readable) Readable = require("readable-stream/readable")
if (!global.setImmediate) setImmediate = process.nextTick

var util = require("util")

/**
 * Create a spigot -- a Readable stream providing the data you specify.
 *
 * @param {Array or Function} source An Array of data to stream one-at-a-time, or a generating function that returns data when called.
 */
function Spigot(source, options) {
  if (!(this instanceof Spigot)) return new Spigot(source, options)
  Readable.call(this, options)

  if (Array.isArray(source)) {
    this.generator = function (next) {
      setImmediate(function () {
        return next(null, source.shift())
      })
    }
  }
  if (typeof source == "function") {
    if (source.length == 0) {
      this.generator = function (next) {
        setImmediate(function () {
          return next(null, source())
        })
      }
    }
    else if (source.length == 1) {
      this.generator = source
    }
    else {
      throw new Error("Source function should be of arity 0 (synchronous) or 1 (asynchronous)")
    }
  }
  if (!this.generator) throw new Error("Please provide a data source of an array or a function that returns data")
}
util.inherits(Spigot, Readable)

// Spigot.prototype._read = function (n) {
//   var self = this
//   setImmediate(function () {
//     var data = self.generator()
//     self.push(data)
//   })
// }

Spigot.prototype._read = function (n) {
  var self = this
  function next(err, data) {
    if (err) this.emit("error", err)
    self.push(data)
  }
  this.generator(next)
}
