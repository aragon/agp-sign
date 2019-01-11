#!/usr/bin/env node
const fs = require('fs')
const got = require('got')
const crypto = require('crypto')
const execa = require('execa')

const args = process.argv.slice(2)

const voteDate = args[0]
const boardMember = args[1]
const approve = args[2] === 'approve' ? true : false

const sha256 = (data) => crypto.createHash('sha256').update(data, 'utf8').digest('hex')

const fillMessage = (approve, num, hash, date) =>
  `I hereby confirm that, as a Board Member of the Aragon Association, I ${approve ? '' : 'dis'}agree to proposing AGP-${num} (with SHA-256 hash ${hash}) to be voted under an Aragon Network vote starting ${date} at 00:00 UTC, and lasting for 48 hours`

const signAGP = async (num) => {
  const file = await got(`https://github.com/aragon/AGPs/raw/master/AGPs/AGP-${num}.md`)
  const hash = sha256(file.body)
  const message = fillMessage(approve, num, hash, voteDate)
  const { stdout } = await execa.shell(`keybase pgp sign -m "${message}" -c`)
  const agpDir = `${process.cwd()}/signatures/AGP-${num}`
  if (!fs.existsSync(agpDir))
    fs.mkdirSync(agpDir)
  fs.writeFileSync(`${agpDir}/${boardMember}_AGP-${num}_${approve ? 'approval' : 'rejection'}.sig`, stdout)
  console.log(`Wrote signature to ${approve ? 'approve' : 'reject'} AGP-${num}`)
}

args.splice(0, 3)
args.map((num) => signAGP(num))

