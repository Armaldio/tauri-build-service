const os = require('os')
const path = require('path')
const { exec } = require('child_process')
const { nanoid } = require('nanoid')
const fs = require('fs-extra')

const run = (cmd, cwd, socket) => {
  return new Promise((resolve) => {
    const command = exec(cmd, {
      cwd
    })

    command.stdout.setEncoding('utf-8')
    command.stderr.setEncoding('utf-8')

    command.stdout.on('data', (data) => {
      let text = data.toString().trim()
      text = text.replace(cwd, '[cwd]')

      socket.emit('log', text)
    })
    command.stderr.on('data', (data) => {
      let text = data.toString().trim()
      text = text.replace(cwd, '[cwd]')

      socket.emit('log', text)
    })

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

const start = async function (socket, url) {
  try {
    console.log('Requested URL', url)

    const temp = nanoid()
    const tempRoot = os.tmpdir()
    const newTempPath = path.join(tempRoot, temp)

    console.log('newTempPath', newTempPath)

    if (fs.existsSync(newTempPath)) {
      // await fs.emptyDir(newTempPath)
    } else {
      await fs.ensureDir(newTempPath)
    }

    socket.emit('log', 'Installing dependencies (this may take a while)')
    const init = await run('npm init -y --loglevel notice', newTempPath, socket)
    console.log('init', init)

    const install = await run('npm install tauri --loglevel notice', newTempPath, socket)
    console.log('install', install)
    socket.emit('log', 'Dependencies installed')

    socket.emit('log', 'Initializing')
    const tauriInit = await run('npx tauri init', newTempPath, socket)
    console.log('tauriInit', tauriInit)

    const tauriInfos = await run('npx tauri info', newTempPath, socket)
    console.log('tauriInfos', tauriInfos)

    await fs.ensureDir(path.join(newTempPath, 'dist'))

    // upload file to /dist
    await fs.writeFile(path.join(newTempPath, 'dist', 'index.html'), `<meta http-equiv="refresh" content="0; url=${url}" />`)

    socket.emit('log', 'Building (really, take a coffee)')
    const tauriBuild = await run('npx tauri build', newTempPath, socket)
    console.log('tauriBuild', tauriBuild)

    const distPath = path.join(newTempPath, 'src-tauri', 'target', 'release')

    const testPaths = [
      { path: 'app.exe', name: 'Windows Executable' },
      { path: 'app.x64.msi', name: 'Windows Installer' },
      { path: path.join('bundle', 'appimage', 'app.AppImage'), name: 'AppImage file' },
      { path: path.join('bundle', 'deb', 'app_0.1.0_amd64.deb'), name: 'Deb file' }
    ]

    const directories = []

    for (const key in testPaths) {
      const myPath = testPaths[key]
      console.log('testing ', myPath)
      if (fs.existsSync(path.join(distPath, myPath.path))) {
        myPath.id = temp
        directories.push(myPath)
      }
    }

    socket.emit('done', directories)
  } catch (e) {
    socket.emit('error', e)
  }
}

module.exports = function (socket) {
  socket.on('start', (url) => {
    start(socket, url)
  })
}
