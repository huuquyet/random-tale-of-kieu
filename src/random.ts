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
const START_POEM = '<!-- START_POEM -->'
const END_POEM = '<!-- END_POEM -->'

/** Get random 2 quotes from json file of Truyen Kieu */
function getRandomQuotes(): DoubleQuotes {
  const randomIndex = Math.floor(Math.random() * (truyenKieu.length / 2))
  // Init the result
  const result: DoubleQuotes = {
    line: 0,
    firstNom: '',
    secondNom: '',
    firstQuocNgu: '',
    secondQuocNgu: '',
  }

  // Get 2 random elements from json file
  result.line = 2 * randomIndex + 1
  result.firstNom = truyenKieu[2 * randomIndex].nom
  result.secondNom = truyenKieu[2 * randomIndex + 1].nom
  result.firstQuocNgu = truyenKieu[2 * randomIndex].quocngu
  result.secondQuocNgu = truyenKieu[2 * randomIndex + 1].quocngu
  return result
}

async function updateFile(filePath: string, result: string) {
  try {
    const fileName = resolve(filePath)
    const contents = await readFile(fileName, { encoding: 'utf8' })
    const regex = new RegExp(`(${START_POEM})[\\s\\S]*?(${END_POEM})`, 'gm')

    if (!regex.test(contents)) {
      core.info(`Please add comment blocks in ${filePath} to update and try again ⚠️`)
    }

    const newContents = contents.replace(regex, `$1${result}$2`)
    await writeFile(fileName, newContents)
    core.info(`Updated ${filePath} with random quotes from The Tale of Kieu ✅💖`)
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export async function run() {
  core.info('Updating with random quotes from The Tale of Kieu... 📁')

  const poem: DoubleQuotes = getRandomQuotes()
  const result = String.raw`
      <p class="nom">“${poem.firstNom}</p>
      <p class="nom">${poem.secondNom}”</p>
      <p class="quocngu">${poem.firstQuocNgu}</p>
      <p class="quocngu">${poem.secondQuocNgu}</p>
      <p class="author"><i>(Dòng ${poem.line}-${poem.line + 1}) Truyện Kiều</i> -- Nguyễn Du</p>
`

  await updateFile('./README.md', result)
  await updateFile('./assets/random-quotes.svg', result)
}
