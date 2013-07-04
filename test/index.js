var test = require("tap").test
var concat = require("concat-stream")

var spigot

var DEFAULT_CONTENT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"

// Stats
test("load", function (t) {
  t.plan(1)

  spigot = require("../")
  t.ok(spigot, "loaded module")
})

test("simple", function (t) {
  t.plan(1)

  function match(d) {
    t.equals(d.toString(), DEFAULT_CONTENT)
  }

  var s = spigot().pipe(concat(match))
})

test("provided string", function (t) {
  t.plan(1)

  var provided = "Sup, world?"

  function match(d) {
    t.equals(d.toString(), provided)
  }

  var s = spigot({content: provided}).pipe(concat(match))
})

test("simple chunked", function (t) {
  t.plan(7)

  var chunks = 0
  var chunkSize = 10

  var s = spigot({chunkSize: chunkSize})
  s.on("progress", function (size) {
    chunks++
    t.ok(size <= chunkSize, "Chunks are at most the desired size")
  })

  function match(d) {
    t.equals(d.toString(), DEFAULT_CONTENT)
    t.equals(chunks, Math.ceil(DEFAULT_CONTENT.length / chunkSize))
  }

  s.pipe(concat(match))
})

test("object", function (t) {
  t.plan(1)

  var input = {cats: "meow", dogs: "woof"}

  function match(d) {
    t.equals(d.toString(), JSON.stringify(input))
  }

  var s = spigot({content: input}).pipe(concat(match))
})

test("object chunked", function (t) {
  t.plan(5)

  var chunks = 0
  var chunkSize = 10

  var input = {cats: "meow", dogs: "woof"}

  var s = spigot({chunkSize: chunkSize, content: input})
  s.on("progress", function (size) {
    chunks++
    t.ok(size <= chunkSize, "Chunks are at most the desired size")
  })

  function match(d) {
    var s = JSON.stringify(input)
    t.equals(d.toString(), s)
    t.equals(chunks, Math.ceil(s.length / chunkSize))
  }

  s.pipe(concat(match))
})

test("wrap with maxSize", function (t) {
  t.plan(102)

  var chunks = 0
  var chunkSize = 10
  var maxSize = 1000

  var s = spigot({
    chunkSize: chunkSize,
    maxSize: maxSize,
    wrap: true
  })
  s.on("progress", function (size) {
    chunks++
    t.ok(size <= chunkSize, "Chunks are at most the desired size")
  })

  function match(d) {
    t.equals(d.toString().length, maxSize)
    t.equals(chunks, Math.ceil(maxSize / chunkSize))
  }

  s.pipe(concat(match))
})

test("very large", function (t) {
  t.plan(2)

  var chunks = 0
  var maxSize = 20000

  var s = spigot({
    maxSize: maxSize,
    wrap: true
  })
  s.on("progress", function (size) {
    chunks++
  })

  function match(d) {
    t.equals(d.toString().length, maxSize)
    // This will be 2 because the default high water mark is 16 * 1024
    t.equals(chunks, 2)
  }

  s.pipe(concat(match))
})

test("read with size", function (t) {
  t.plan(2)

  var s = spigot()

  var out = s.read(11)
  s.once("readable", function () {
    out = s.read(11)
    t.equals(out.toString(), "ABCDEFGHIJK")
    t.equals(out.toString(), DEFAULT_CONTENT.substring(0, 11))
  })
})

test("read with ignored size", function (t) {
  t.plan(3)

  var chunks = 0
  var chunkSize = 10

  var s = spigot({chunkSize: chunkSize})
  s.on("progress", function (size) {
    chunks++
  })

  function tryReading(chunkSize, cb) {
    var out = s.read(chunkSize)
    if (out != null) {
      cb(out)
    }
    else {
      s.once("readable", function () {
        tryReading(chunkSize, cb)
      })
    }
  }

  tryReading(11, function (out) {
    t.equals(out.toString(), "ABCDEFGHIJK")
    t.equals(out.toString(), DEFAULT_CONTENT.substring(0, 11))
    // Third read is because tryReading trigger a third frame even though it doesn't need it
    t.equals(chunks, 3)
  })
})
