import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as core from '@actions/core'
import { default as truyenKieu } from '../assets/truyen-kieu-1871.json'

interface DoubleQuotes {
  line: number
  firstNom: string
  secondNom: string
  firstQuocNgu: string
  secondQuocNgu: string
}

// The patterns to set the random quotes from The Tale of Kieu
const START_KIEU = '<!-- START_KIEU -->'
const END_KIEU = '<!-- END_KIEU -->'

/** Get 2 random lines from json file of Truyen Kieu */
function getRandomQuotes(): DoubleQuotes {
  const randomIndex = Math.floor(Math.random() * (truyenKieu.length / 2))

  // Get 2 random lines from json file of Truyen Kieu
  const line = 2 * randomIndex + 1
  const firstNom = truyenKieu[2 * randomIndex].nom
  const secondNom = truyenKieu[2 * randomIndex + 1].nom
  const firstQuocNgu = truyenKieu[2 * randomIndex].quocngu
  const secondQuocNgu = truyenKieu[2 * randomIndex + 1].quocngu

  const result: DoubleQuotes = {
    line,
    firstNom,
    secondNom,
    firstQuocNgu,
    secondQuocNgu,
  }
  return result
}

/** Update files with comment blocks inside */
async function updateFile(fileName: string, result: string) {
  try {
    const filePath = resolve(fileName)
    const contents = await readFile(filePath, { encoding: 'utf8' })
    const regex = new RegExp(`(${START_KIEU})[\\s\\S]*?(${END_KIEU})`, '')

    // Check if patterns exist to insert the quotes
    if (!regex.test(contents)) {
      core.info(`Please add comment blocks in ${fileName} to update and try again ⚠️`)
    }

    const newContents = contents.replace(regex, `$1${result}\n$2`)
    await writeFile(filePath, newContents)
    core.info(`Updated ${fileName} with random quotes from The Tale of Kieu ✅ 💖`)
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/** Get random quotes from The Tale of Kieu (nom version) */
export async function run() {
  core.info('Updating with random quotes from The Tale of Kieu... 📁')

  const poem: DoubleQuotes = getRandomQuotes()
  const result = String.raw`
      <p class="nom">“${poem.firstNom}</p>
      <p class="nom">${poem.secondNom}”</p>
      <p class="quocngu">${poem.firstQuocNgu}</p>
      <p class="quocngu">${poem.secondQuocNgu}</p>
      <p class="author"><i>(Dòng ${poem.line}-${poem.line + 1}) Truyện Kiều</i> -- Nguyễn Du</p>`

  await updateFile('./README.md', result)
  await updateFile('./assets/random-kieu.svg', result)
}
