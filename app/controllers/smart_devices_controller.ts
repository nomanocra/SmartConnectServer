import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '../models/smart_device.js'

export default class DeviceController {
  async index({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const devices = await SmartDevice.query()
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .preload('sensors')

      return response.json({
        status: 'success',
        data: devices,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue lors de la récupération des devices',
      })
    }
  }
}
