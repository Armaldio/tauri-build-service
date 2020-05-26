const os = require('os')
const path = require('path')
const express = require('express')
const router = express.Router()
const { nanoid } = require('nanoid')
const fs = require('fs-extra')
const execa = require('execa')

router.get('/', async (_req, res) => {
  try {
    const temp = nanoid()
    const tempRoot = os.tmpdir()
    const newTempPath = path.join(tempRoot, temp)

    console.log('newTempPath', newTempPath)

    fs.ensureDir(newTempPath)
    const { stdout, stderr } = await execa('npm', ['init', '-y'])
    console.log('stdout', stdout)
    console.log('stderr', stderr)

    res.json({
      status: 'OK'
    })
  } catch (e) {
    res.json({
      status: 'error',
      error: e
    })
  }
})

module.exports = router
