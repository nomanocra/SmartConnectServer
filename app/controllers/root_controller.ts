import { HttpContext } from '@adonisjs/core/http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default class RootController {
  public async index({ response }: HttpContext) {
    try {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
      return response.json({
        status: 'success',
        message: 'API information retrieved successfully',
        data: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description || '',
          updated: packageJson.updated || '',
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error reading package.json:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error retrieving API information',
        timestamp: new Date().toISOString(),
      })
    }
  }
}
