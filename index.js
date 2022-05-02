const rootPath = require('app-root-path')
const { writeFile, promises } = require('fs')
const { resolve } = require('path')
const { renderFile } = require('pug')

const { changePathExtension } = require('./utils')

const writeHtml = (pugPath, pugLocals = {}) => {
  const newHtmlPath = changePathExtension(pugPath, 'html')
  const newHtmlStr = renderFile(pugPath, pugLocals)

  const callback = (err) => {
    if (err) console.log(err)
    else console.log(`Wrote ${newHtmlPath}\n`)
  }

  writeFile(newHtmlPath, newHtmlStr, callback)
}

const invalidDirs = [
  'node_modules',
  '.git'
]

const isDirAndValid = (dirent) =>
  dirent.isDirectory() && !invalidDirs.includes(dirent.name)

const getFiles = async (dir) => {
  const dirents = await promises.readdir(dir, { withFileTypes: true })

  const files = await Promise.all(dirents.map(dirent => {
    const res = resolve(dir, dirent.name)
    return isDirAndValid(dirent) ? getFiles(res) : res
  }))

  return files.flat()
}

const renderTargetPredicate = (file) => {
  const fileName = file.split('/').at(-1)
  const fileExts = fileName.split('.')

  const isPug = fileExts.at(-1) === 'pug'
  const isNotMix = fileExts.length < 3 && fileExts.at(-2) !== 'mix'

  return isPug && isNotMix
}

const getRenderTargets = async (dir) => {
  const allFiles = await getFiles(dir)
  return allFiles.filter(renderTargetPredicate)
}

const createHtmlsFromPugs = async () => {
  const renderTargets = await getRenderTargets(rootPath.toString())
  renderTargets.forEach(path => writeHtml(path))
}

createHtmlsFromPugs()
