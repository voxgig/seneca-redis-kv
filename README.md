# seneca-redis-kv
Seneca plugin providing messages for a redis key-value store.
Depends on the [`seneca-kv`](https://github.com/voxgig/seneca-kv) plugin.

[![Npm][BadgeNpm]][Npm]
[![Travis][BadgeTravis]][Travis]
[![Coveralls][BadgeCoveralls]][Coveralls]

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Quick Example

```
Seneca()
  .use('kv')
  .use('redis-kv', {host: 'localhost', port: 6379}) // these are the defaults
  .act('role:kv,cmd:set,key:foo,val:bar', function() {
    this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
      console.log(out.val) // prints 'bar'
    })
  })
```


## Inbound Messages

* `role:kv,cmd:set`; params: `key`: string, `val`: object
* `role:kv,cmd:get`; params: `key`: string
* `role:kv,cmd:del`; params: `key`: string




[BadgeCoveralls]: https://coveralls.io/repos/voxgig/seneca-redis-kv/badge.svg?branch=master&service=github
[BadgeNpm]: https://badge.fury.io/js/seneca-redis-kv.svg
[BadgeTravis]: https://travis-ci.org/voxgig/seneca-redis-kv.svg?branch=master
[Coveralls]: https://coveralls.io/github/voxgig/seneca-redis-kv?branch=master
[Npm]: https://www.npmjs.com/package/seneca-redis-kv
[Travis]: https://travis-ci.org/voxgig/seneca-redis-kv?branch=master
