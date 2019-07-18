#!/usr/bin/env node
const got = require('got')
const crypto = require('crypto')

const args = process.argv.slice(2)

const anvNum = args[0]
const commit = args[1]

const sha256 = (data) => crypto.createHash('sha256').update(data, 'utf8').digest('hex')

const agpUrl = (num) =>
  `https://github.com/aragon/AGPs/raw/${commit}/AGPs/AGP-${num}.md`

const fillMessage = (anvNum, agpNum, agpHash) =>
  `Should AGP-${agpNum} be approved for the final ballot of ANV-${anvNum}? ${agpUrl(agpNum)} (${agpHash})?`

const createVoteMessageForAGP = async (num) => {
  const file = await got(agpUrl(num))
  const hash = sha256(file.body)
  console.log(fillMessage(anvNum, num, hash))
}

args.splice(0, 2)
args.map((num) => createVoteMessageForAGP(num))

