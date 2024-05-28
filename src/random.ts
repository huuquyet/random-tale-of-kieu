import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as core from '@actions/core'
import { default as kieu } from '../assets/truyen-kieu-1871.json'

interface doublePoem {
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

function getRandomDouble(): doublePoem {
  const randomIndex = Math.floor(Math.random() * (kieu.length / 2))
  // Init the result
  const result: doublePoem = {
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
    const poem: doublePoem = getRandomDouble()
    const filePath = resolve('./README.md')
    const contents = await readFile(filePath, { encoding: 'utf8' })
    const indexStart = contents.indexOf(START_POEM)
    const indexEnd = contents.indexOf(END_POEM)

    if (indexStart > 0 && indexEnd > indexStart) {
      const firstRemains = contents.substring(0, indexStart).concat(START_POEM)
      const lastRemains = contents.substring(indexEnd)
      const result = `${firstRemains}\n\n\> “${poem.firstNom}\n\>\n\> ${poem.secondNom}”\n\>\n\> ${
        poem.firstQuocNgu
      }\n\>\n\> ${poem.secondQuocNgu}\n\>\n\> \*(Dòng ${poem.line}-${
        poem.line + 1
      }) Truyện Kiều\* - Nguyễn Du\n\n${lastRemains}`
      await writeFile(filePath, result)
    } else {
      throw new Error('Please add comment blocks in Readme file to update')
    }
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
