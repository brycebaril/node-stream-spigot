module.exports = Spigot

var Readable = require("stream").Readable
if (!Readable) {
  Readable = require("readable-stream/readable")
}

var util = require("util")

var DEFAULT_CONTENT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"

/**
 * A source stream to provide a stream of content. Useful for testing.
 * @constructor
 * @param {object} options Options
 *         options.content (default "A-Z0-9a-z") -- Content to stream. If not a string, will use JSON.stringify()
 *         options.wrap (default false) -- Keep wrapping the content until the desired stream size has been made
 *         options.maxSize (no default) -- An optional maximum size to emit, useful with options.wrap
 *         options.chunkSize (no default) -- How big of chunks to send at once. If none specified will respect the size requested.
 *         ... and node stream.Readable options (ymmv)
 */
function Spigot(options) {
  if (!(this instanceof Spigot)) return new Spigot(options)
  Readable.call(this, options)

  options = options || {}
  var content = options.content || DEFAULT_CONTENT

  if (typeof content != "string") {
    content = JSON.stringify(content)
  }

  this.wrap = options.wrap
  this.chunkSize = options.chunkSize
  this.maxSize = options.maxSize || Number.MAX_VALUE

  this.bytes = 0

  this.source = content.split("")
}
util.inherits(Spigot, Readable)

Spigot.prototype._read = function (n) {
  var next = this._next(this.chunkSize || n)
  var self = this
  setImmediate(function () {
    self.push(next)
  })
  if (next) this.emit("progress", next.length)
}

Spigot.prototype._next = function (n) {
  if (this.source.length == 0) return null
  var row = []
  for (var i = 0; i < n; i++) {
    if (this.bytes >= this.maxSize) break
    var c = this.source.shift()
    if (this.wrap) this.source.push(c)
    if (c != null) {
      row.push(c)
      this.bytes++
    }
  }
  if (row.length == 0) return null
  return new Buffer(row.join(""))
}
