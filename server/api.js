const os = require('os')
const path = require('path')
const { exec } = require('child_process')
const express = require('express')
const router = express.Router()
const { nanoid } = require('nanoid')
const fs = require('fs-extra')

const run = (cmd, cwd) => {
  return new Promise((resolve) => {
    const command = exec(cmd, {
      cwd
    })

    // if (command && command.stderr && command.stdout) {
    //   command.stdout.on('data', (data) => {
    //     console.log(data.toString().trim())
    //   })

    //   command.stderr.on('data', (data) => {
    //     console.log(data.toString().trim())
    //   })
    // }
    command.stdout.pipe(process.stdout)
    command.stderr.pipe(process.stderr)

    command.on('exit', (code) => {
      if (code === 0) {
        console.log('Command executed without any error')
      } else {
        console.error(`There was an error executing the command "${cmd}": ${code}`)
      }
      resolve(true)
    })
  })
}

router.get('/download', (req, res) => {
  const id = req.query.id
  const tempRoot = os.tmpdir()
  const newTempPath = path.join(tempRoot, id)
  const distPath = path.join(newTempPath, 'src-tauri', 'target', 'release', 'app.exe')
  return res.download(distPath)
})

router.post('/', async (req, res) => {
  try {
    const url = req.body.url
    console.log('Requested URL', url)

    // const curl = await run('curl https://sh.rustup.rs -sSf | sh -s -- -y')
    // console.log('curl', curl)

    // const prefix = '$HOME/.cargo/bin/'

    // const isInstalled = await run(`${prefix}rustc --version`)
    // console.log('isInstalled', isInstalled)

    // const cargoInstall = await run(`${prefix}cargo install tauri-bundler --force`)
    // console.log('cargoInstall', cargoInstall)

    const temp = 'test'
    // const temp = nanoid()
    const tempRoot = os.tmpdir()
    const newTempPath = path.join(tempRoot, temp)

    console.log('newTempPath', newTempPath)

    if (fs.existsSync(newTempPath)) {
      // await fs.emptyDir(newTempPath)
    } else {
      await fs.ensureDir(newTempPath)
    }

    const init = await run('npm init -y', newTempPath)
    console.log('init', init)

    const install = await run('npm install tauri', newTempPath)
    console.log('install', install)

    const tauriInit = await run('npx tauri init', newTempPath)
    console.log('tauriInit', tauriInit)

    const tauriInfos = await run('npx tauri info', newTempPath)
    console.log('tauriInfos', tauriInfos)

    await fs.ensureDir(path.join(newTempPath, 'dist'))

    // upload file to /dist
    await fs.writeFile(path.join(newTempPath, 'dist', 'index.html'), `<meta http-equiv="refresh" content="0; url=${url}" />`)

    const tauriBuild = await run('npx tauri build', newTempPath)
    console.log('tauriBuild', tauriBuild)

    res.json({
      id: temp
    })
  } catch (e) {
    return res.json({
      status: 'error',
      error: e
    })
  }
})

module.exports = router
