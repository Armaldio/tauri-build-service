const path = require('path')
const os = require('os')

module.exports = (req, res) => {
  const id = req.query.id
  const dirPath = req.query.path
  const tempRoot = os.tmpdir()
  const newTempPath = path.join(tempRoot, id)
  const distPath = path.join(newTempPath, 'src-tauri', 'target', 'release', dirPath)
  return res.download(distPath)
}
