import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const rootDir = process.cwd()
const assetsDir = join(rootDir, 'dist', 'assets')

const formatKb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`

const files = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js') || name.endsWith('.css'))
  .map((name) => {
    const absolutePath = join(assetsDir, name)
    const size = statSync(absolutePath).size
    return { name, size }
  })
  .sort((a, b) => b.size - a.size)

const total = files.reduce((sum, file) => sum + file.size, 0)

console.log('Bundle report (dist/assets)')
console.log('===========================')

for (const [index, file] of files.entries()) {
  console.log(`${String(index + 1).padStart(2, '0')}. ${file.name.padEnd(36, ' ')} ${formatKb(file.size)}`)
}

console.log('---------------------------')
console.log(`Total (${files.length} files): ${formatKb(total)}`)
