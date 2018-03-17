# seneca-redis-kv
Seneca plugin providing messages for a redis key-value store.
Depends on the [`seneca-kv`](https://github.com/voxgig/seneca-kv) plugin.



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
