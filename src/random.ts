import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as core from '@actions/core'
import { default as kieu } from '../assets/truyen-kieu-1871.json'

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

/** Get random element of any array and type safe */
function getRandomElement<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomQuotes(): DoubleQuotes {
  const randomIndex = Math.floor(Math.random() * (kieu.length / 2))
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
  result.firstNom = kieu[2 * randomIndex].nom
  result.secondNom = kieu[2 * randomIndex + 1].nom
  result.firstQuocNgu = kieu[2 * randomIndex].quocngu
  result.secondQuocNgu = kieu[2 * randomIndex + 1].quocngu
  return result
}

export async function run() {
  try {
    core.info('Updating README.md with random quotes from The Tale of Kieu... 📁')

    const poem: DoubleQuotes = getRandomQuotes()
    const filePath = resolve('./README.md')
    const contents = await readFile(filePath, { encoding: 'utf8' })
    const regex = new RegExp(`(${START_POEM})[\\s\\S]*?(${END_POEM})`, 'gm')

    if (!regex.test(contents)) {
      throw new Error('Please add comment blocks in Readme file to update and try again ⚠️')
    }

    const result = `\n\n\> “${poem.firstNom}\n\>\n\> ${poem.secondNom}”\n\>\n\> ${
      poem.firstQuocNgu
    }\n\>\n\> ${poem.secondQuocNgu}\n\>\n\> \*(Dòng ${poem.line}-${
      poem.line + 1
    }) Truyện Kiều\* - Nguyễn Du\n\n`
    const newContents = contents.replace(regex, `$1${result}$2`)
    await writeFile(filePath, newContents)

    core.info('Updated with random quotes from The Tale of Kieu ✅💖')
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
