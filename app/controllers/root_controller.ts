import { HttpContext } from '@adonisjs/core/http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default class RootController {
  public async index({ response }: HttpContext) {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
    return response.json({
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      updated: packageJson.updated || '',
    })
  }
}
