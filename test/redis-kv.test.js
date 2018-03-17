/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

// NEEDS:
// $ docker run -p 6379:6379 -d redis:alpine

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')


lab.test('validate', PluginValidator(Plugin, module))

lab.test('happy', fin => {
  Seneca()
    .test(fin)
    .use('kv')
    .use('..')
    .act('role:kv,cmd:set,key:foo,val:bar', function() {
      this.act('role:kv,cmd:get,key:foo', function(ignore, out) {
        expect(out.val).equal('bar')
        fin()
      })
    })
})

lab.test('basic', fin => {
  Seneca()
    .test(fin)
    .use('kv')
    .use('..')
    .ready(function() {
      this.export('kv').basic_test(this, fin)
    })
})


lab.test('connect', fin => {
  Seneca()
    .test(fin)
    .use('kv')
    .use('..', {port: 6379})
    .use('..', {host: 'localhost'})
    .use('..', {port: 6379, host: 'localhost'})
    .use('..', {redis: {port: 6379, host: 'localhost'}})
    .ready(fin)
})


lab.test('bad-connect', fin => {
  Seneca({log:'silent',debug:{undead:true}})
    .test(function(err){
      expect(err.errno).equal('ECONNREFUSED')
      fin()
    })
    .use('kv')
    .use('..', {port: 9999})
})



lab.test('bad-del', {parallel: false}, fin => {
  var baddel = Plugin
  var origconnect = baddel.intern.connect
  baddel.intern.connect = function(opts, done) {
    origconnect.call(this, opts, function(ignore, client) {
      client.del = function (key, reply) {
        reply(new Error('del-fail'))
      }
      done(null, client)
    })
  }

  Seneca({log:'silent'})
    .use('kv')
    .use(baddel)
    .act('role:kv,cmd:del,key:foo', function(err) {
      expect(err.message).equal('seneca: Action cmd:del,role:kv failed: del-fail.')
      baddel.intern.connect = origconnect
      fin()
    })
})


lab.test('bad-set', {parallel: false}, fin => {
  var badset = Plugin
  var origconnect = badset.intern.connect
  badset.intern.connect = function(opts, done) {
    origconnect.call(this, opts, function(ignore, client) {
      client.set = function () {
        throw new Error('set-fail')
      }
      done(null, client)
    })
  }

  Seneca({log:'silent'})
    .use('kv')
    .use(badset)
    .act('role:kv,cmd:set,key:foo,val:bar', function(err) {
      expect(err.message).equal('seneca: Action cmd:set,role:kv failed: set-fail.')
      badset.intern.connect = origconnect
      fin()
    })
})


lab.test('bad-get', {parallel: false}, fin => {
  var badget = Plugin
  var origconnect = badget.intern.connect
  badget.intern.connect = function(opts, done) {
    origconnect.call(this, opts, function(ignore, client) {
      client.get = function (ignore, reply) {
        reply(new Error('get-fail'))
      }
      done(null, client)
    })
  }

  Seneca({log:'silent'})
    .use('kv')
    .use(badget)
    .act('role:kv,cmd:set,key:foo,val:bar', function() {
      this.act('role:kv,cmd:get,key:foo', function(err, out) {
        expect(err.message).equal('seneca: Action cmd:get,role:kv failed: get-fail.')
        badget.intern.connect = origconnect
        fin()
      })
    })
})

