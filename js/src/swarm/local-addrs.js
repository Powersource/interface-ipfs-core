/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { spawnNodes } = require('../utils/spawn')
const { getDescribe, getIt } = require('../utils/mocha')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodes(2, factory, (err, nodes) => {
          expect(err).to.not.exist()
          ipfs = nodes[0]
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should list local addresses the node is listening on', (done) => {
      ipfs.swarm.localAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })

    it('should list local addresses the node is listening on (promised)', () => {
      return ipfs.swarm.localAddrs().then((multiaddrs) => {
        expect(multiaddrs).to.have.length.above(0)
      })
    })
  })
}