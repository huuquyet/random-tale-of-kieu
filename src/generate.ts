import * as core from '@actions/core'
import { randomKieu } from './randomKieu'

/** Get random quotes from The Tale of Kieu (nom version) */
export async function run() {
  await randomKieu()
}