import { HttpContext } from '@adonisjs/core/http'
import UserDeviceHistory from '#models/user_device_history'
import ErrorResponseService from '#services/error_response_service'

export default class UserDeviceHistoryController {
  /**
   * Get device history for the authenticated user
   * Récupère l'historique des devices pour l'utilisateur authentifié
   */
  async index(ctx: HttpContext) {
    try {
      const user = ctx.auth.user!

      const deviceHistory = await UserDeviceHistory.query()
        .where('userId', user.id)
        .select('deviceAddress')
        .orderBy('updatedAt', 'desc')

      // Extract just the device addresses for autosuggestion
      const deviceAddresses = deviceHistory.map((history) => history.deviceAddress)

      return ctx.response.json({
        success: true,
        data: deviceAddresses,
      })
    } catch (error) {
      return ErrorResponseService.internalServerError(ctx, error)
    }
  }
}
