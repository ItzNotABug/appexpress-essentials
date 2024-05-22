# AppExpress Compressions

This directory contains a collection of web compression utilities
for [AppExpress](https://github.com/itznotabug/appexpress).

## Need for custom compression

Content compression helps reduce the amount of data that is transferred from the server to the client. This is not just
beneficial; it’s often necessary to ensure efficient web performance and quick data transmission.

You can utilize or build custom compression techniques if your client can properly decompress the compressed data. This
is especially useful for API data transfers. Smaller chunks of data mean faster transport, which is crucial for
performance-sensitive applications.

Consider, for example, an Appwrite Function that hosts some API endpoints. You could always use the standard `JSON`, but
you might also consider implementing formats like `FlatBuffers`, `ProtoBuf`, or even something entirely custom-developed
in-house. The key requirement is that your client must be able to handle that specific response format effectively.

---

**Note**: `AppExpress`, by default supports `brotli`, `gzip` and `deflate` if it receives a valid `accept-encoding`
value. 