/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const bl = require('bl')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.catReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    const smallFile = {
      cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
    }

    const bigFile = {
      cid: 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq',
      data: loadFixture('js/test/fixtures/15mb.random', 'interface-ipfs-core')
    }

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    before((done) => ipfs.files.add(bigFile.data, done))

    after((done) => common.teardown(done))

    it('should return a Readable Stream for a CID', (done) => {
      const stream = ipfs.files.catReadableStream(bigFile.cid)

      stream.pipe(bl((err, data) => {
        expect(err).to.not.exist()
        expect(data).to.eql(bigFile.data)
        done()
      }))
    })

    it('should export a chunk of a file in a Readable Stream', (done) => {
      const offset = 1
      const length = 3

      const stream = ipfs.files.catReadableStream(smallFile.cid, {
        offset,
        length
      })

      stream.pipe(bl((err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.equal('lz ')
        done()
      }))
    })
  })
}