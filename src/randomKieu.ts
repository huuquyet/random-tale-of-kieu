import * as core from '@actions/core'
import { encode } from 'html-entities'
import sharp from 'sharp'
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
  const firstNom = encode(truyenKieu[2 * randomIndex].nom, {
    mode: 'nonAsciiPrintable',
    level: 'xml',
  })
  const secondNom = encode(truyenKieu[2 * randomIndex + 1].nom, {
    mode: 'nonAsciiPrintable',
    level: 'xml',
  })
  const firstQuocNgu = encode(truyenKieu[2 * randomIndex].quocngu, {
    mode: 'nonAsciiPrintable',
    level: 'xml',
  })
  const secondQuocNgu = encode(truyenKieu[2 * randomIndex + 1].quocngu, {
    mode: 'nonAsciiPrintable',
    level: 'xml',
  })

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
async function updateFile(filePath: string, result: string) {
  try {
    const contents = await Bun.file(filePath).text()
    const regex = new RegExp(`(${START_KIEU})[\\s\\S]*?(${END_KIEU})`, '')

    // Check if patterns exist to insert the quotes
    if (!regex.test(contents)) {
      core.info(`Please add comment blocks in ${filePath} to update and try again ⚠️`)
    }

    const newContents = contents.replace(regex, `$1${result}\n$2`)
    await Bun.write(filePath, newContents)
    core.info(`Updated ${filePath} with random quotes from The Tale of Kieu ✅ 💖`)
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/** Get random quotes from The Tale of Kieu (nom version) */
export async function randomKieu() {
  core.info('Updating with random quotes from The Tale of Kieu... 📁')

  const poem: DoubleQuotes = getRandomQuotes()
  const result = String.raw`
      <p class="nom">&#8220;${poem.firstNom}</p>
      <p class="nom">${poem.secondNom}&#8221;</p>
      <p class="quocngu">${poem.firstQuocNgu}</p>
      <p class="quocngu">${poem.secondQuocNgu}</p>
      <p class="author"><i>(D&#242;ng ${poem.line}-${
        poem.line + 1
      }) Truy&#7879;n Ki&#7873;u</i> -- Nguy&#7877;n Du</p>`

  await updateFile('./README.md', result)
  await updateFile('./assets/random-kieu.svg', result)

  // convert svg to webp
  await sharp('./assets/random-kieu.svg')
    .toFormat('jpeg', { mozjpeg: true })
    .toFile('./assets/random-kieu.jpg')
    .then((info: any) => core.info(info))
    .catch((err: any) => console.error(err))
}
