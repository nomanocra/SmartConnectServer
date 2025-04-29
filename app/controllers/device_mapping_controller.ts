import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class DeviceMappingController {
  async getDeviceMapping({ response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').getUserOrFail()
      const deviceMapping = await user.related('deviceMapping').query().first()

      return response.ok({
        deviceMapping: deviceMapping?.mapping || null,
      })
    } catch (error) {
      console.error('Error getting device mapping:', error)
      return response.badRequest({
        message: 'Error getting device mapping',
        error: error.message,
      })
    }
  }

  async updateDeviceMapping({ request, response, auth }: HttpContext) {
    try {
      const { mapping } = request.only(['mapping'])
      const user = await auth.use('api').getUserOrFail()

      // Vérifier si le mapping est un JSON valide
      try {
        JSON.parse(mapping)
      } catch (e) {
        return response.badRequest({
          message: 'Invalid JSON format for device mapping',
        })
      }

      // Mettre à jour ou créer le device mapping
      const deviceMapping = await user.related('deviceMapping').query().first()
      if (deviceMapping) {
        deviceMapping.mapping = mapping
        await deviceMapping.save()
      } else {
        await user.related('deviceMapping').create({ mapping })
      }

      return response.ok({
        message: 'Device mapping updated successfully',
        deviceMapping: mapping,
      })
    } catch (error) {
      console.error('Error updating device mapping:', error)
      return response.badRequest({
        message: 'Error updating device mapping',
        error: error.message,
      })
    }
  }
}
