import * as core from '@actions/core'
import * as cowsay from 'cowsay'

// The patterns to set the random quotes
const START_QUOTE: string = '<!-- START_QUOTE -->'
const END_QUOTE: string = '<!-- END_QUOTE -->'

/** Update files with comment blocks inside */
async function updateFile(filePath: string, result: string) {
  try {
    const contents = await Bun.file(filePath).text()
    const regex = new RegExp(`(${START_QUOTE})[\\s\\S]*?(${END_QUOTE})`, '')

    // Check if patterns exist to insert the quotes
    if (!regex.test(contents)) {
      core.info(`Please add comment blocks in ${filePath} to update and try again ⚠️`)
    }

    const newContents = contents.replace(regex, `$1${result}$2`)
    await Bun.write(filePath, newContents)
    core.info(`Updated ${filePath} with random quotes ✅ 💖`)
  } catch (error: any) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/** Get random quotes */
export async function randomQuotes() {
  core.info('Updating with random quotes... 📁')
  try {
    // Get random quotes from https://github.com/lukePeavey/quotable
    const response = await fetch('https://api.quotable.io/quotes/random')
    const quotes = await response.json()
    const quote = quotes[0]

    // Wrap the content with length=42
    const wrap = quote.content.replace(/(?![^\n]{1,42}$)([^\n]{1,42})\s/g, '$1\n')
    const text = `“${wrap}”\n\n -- ${quote.author}`
    // Display the quote with cowsay ASCII art
    const ascii = cowsay.say({ text, r: true })
    const result = String.raw`${'\n```\n'}${ascii}${'\n```\n'}`

    await updateFile('./README.md', result)
  } catch (error: any) {
    console.error(error)
  }
}
