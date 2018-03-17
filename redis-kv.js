/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'


const Redis    = require('redis')
const Optioner = require('optioner')

const Joi = Optioner.Joi

const optioner = Optioner({
  redis: Joi.object().default(null),
})


module.exports = function redis_kv(options) {
  var seneca = this
  
  seneca
    .add('role:kv,cmd:set', cmd_set)
    .add('role:kv,cmd:get', cmd_get)
    .add('role:kv,cmd:del', cmd_del)

  const opts = optioner.check(options)
  const utils = this.export('kv').make_utils(opts)

  var client = null
  
  init(function(done) {
    intern.connect(opts, function(err, redis_client) {
      if(err) return done(err)
      client = redis_client
      done()
    })
  })

  
  function cmd_set(msg, reply) {
    var key = ''+msg.key
    var val = utils.encode(msg.val)
    client.set(key, val)
    reply()
  }

  function cmd_get(msg, reply) {
    var key = ''+msg.key
    client.get(key, function(err, val) {
      if(err) return reply(err)
      val = null != val ? utils.decode(val) : null
      reply({key:key, val:val})
    })
  }

  function cmd_del(msg, reply) {
    var key = ''+msg.key
    client.del(key, function(err) {
      if(err) return reply(err)
      reply()
    })
  }


  // TODO: seneca should provide this!
  // https://github.com/senecajs/seneca/issues/695
  function init(initact) {
    seneca.add('init:redis_kv', function(msg, done) {
      initact(done)
    })
  }
}


const intern = module.exports.intern = {
  connect: function(opts, done) {
    opts.redis = opts.redis || {}
    opts.redis.host = opts.redis.host || opts.host
    opts.redis.port = opts.redis.port || opts.port

    var client = Redis.createClient(opts.redis)
    client.on('ready', function() {done(null, client)})
    client.on('error', done)
  }
}

