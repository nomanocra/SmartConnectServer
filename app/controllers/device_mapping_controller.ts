import { HttpContext } from '@adonisjs/core/http'

export default class DeviceMappingController {
  async store({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      // Vérifier si l'utilisateur est admin
      if (user.role !== 'admin') {
        return response.unauthorized({
          message: 'Unauthorized',
        })
      }

      // Associer le device à l'utilisateur

      return response.created({
        message: 'Device mapped to user successfully',
      })
    } catch (error) {
      console.error('Error mapping device to user:', error)
      return response.badRequest({
        message: 'Error mapping device to user',
        error: error.message,
      })
    }
  }
}
