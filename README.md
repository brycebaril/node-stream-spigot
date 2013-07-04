Stream Spigot
=============

A generator for (streams2) Readable streams, useful for testing.

```
npm install stream-spigot
```

Examples:

```javascript
var spigot = require("stream-spigot")

spigot().pipe(process.stdout)
// ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz

spigot({content: "lalala"}).pipe(process.stdout)
// lalala

spigot({wrap: true}).pipe(process.stdout)
/*
ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz ... (and so on until you CTRL^C)
*/


spigot({wrap: true, maxSize: 200}).pipe(process.stdout)
/*
ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN
*/

var petSounds = {cat: "Meow", dog: "Woof", bird: "tweet", fish: "..."}
spigot({content: petSounds, chunkSize: 10}).pipe(process.stdout)
// {"cat":"Meow","dog":"Woof","bird":"tweet","fish":"..."}

```

Usage
=====

```javascript
var spigot = require("stream-spigot")

var stream = spigot(options)
```

Options
=======

content
-------

Content to stream. If not a string, it will call JSON.stringify(content) and stream that.

chunkSize
---------

Default chunk size to split the stream into. No default value, if you don't specify one, it will be chunked in the Readable streams (current) default high water mark of 16 * 1024

wrap
----

To make longer streams, this will wrap `content` and cycle through the content forever or until `maxSize`.

maxSize
-------

The maximum size (in bytes) to output. Useful with wrap. Does not respect passed content and can thus be used to simulate truncated output.
