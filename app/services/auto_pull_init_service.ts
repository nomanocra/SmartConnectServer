import SmartDevice from '#models/smart_device'
import AutoPullService from './auto_pull_service.js'

export default class AutoPullInitService {
  /**
   * Initialiser toutes les tâches d'auto-pull au démarrage du serveur
   */
  public static async initializeAutoPulls(): Promise<void> {
    try {
      console.log('🚀 [AutoPullInitService] Starting auto-pull initialization...')

      // Récupérer tous les devices avec auto-pull activé
      const devicesWithAutoPull = await SmartDevice.query()
        .where('auto_pull', true)
        .whereNotNull('auto_pull_username')
        .whereNotNull('auto_pull_password')

      console.log(
        `📊 [AutoPullInitService] Found ${devicesWithAutoPull.length} devices with auto-pull enabled`
      )

      if (devicesWithAutoPull.length === 0) {
        console.log('ℹ️  [AutoPullInitService] No devices with auto-pull enabled found')
        return
      }

      const autoPullService = AutoPullService.getInstance()
      let startedCount = 0
      let failedCount = 0

      for (const device of devicesWithAutoPull) {
        try {
          console.log(
            `🔄 [AutoPullInitService] Attempting to start auto-pull for device ${device.id} (${device.name})`
          )

          const started = await autoPullService.startAutoPull(device.id)
          if (started) {
            startedCount++
            console.log(
              `✅ [AutoPullInitService] Auto-pull started successfully for device ${device.id} (${device.name}) - interval: ${device.updateStamp} minutes`
            )
          } else {
            failedCount++
            console.warn(
              `❌ [AutoPullInitService] Failed to start auto-pull for device ${device.id} (${device.name})`
            )
          }
        } catch (error) {
          failedCount++
          console.error(
            `💥 [AutoPullInitService] Error starting auto-pull for device ${device.id} (${device.name}):`,
            error
          )
        }
      }

      console.log(
        `🎯 [AutoPullInitService] Auto-pull initialization completed: ${startedCount} started, ${failedCount} failed, ${devicesWithAutoPull.length} total`
      )

      if (startedCount > 0) {
        console.log(
          `✅ [AutoPullInitService] Successfully restored ${startedCount} auto-pull tasks`
        )
      }

      if (failedCount > 0) {
        console.warn(`⚠️  [AutoPullInitService] ${failedCount} auto-pull tasks failed to start`)
      }
    } catch (error) {
      console.error(
        '💥 [AutoPullInitService] Critical error during auto-pull initialization:',
        error
      )
    }
  }

  /**
   * Arrêter toutes les tâches d'auto-pull (pour l'arrêt propre du serveur)
   */
  public static stopAllAutoPulls(): void {
    try {
      console.log('🛑 [AutoPullInitService] Stopping all auto-pull tasks...')
      const autoPullService = AutoPullService.getInstance()
      const activeTasks = autoPullService.getTasksStatus()

      console.log(`📊 [AutoPullInitService] Found ${activeTasks.length} active auto-pull tasks`)

      autoPullService.stopAllAutoPulls()
      console.log('✅ [AutoPullInitService] All auto-pull tasks stopped successfully')
    } catch (error) {
      console.error('💥 [AutoPullInitService] Error stopping auto-pull tasks:', error)
    }
  }

  /**
   * Obtenir le statut de l'initialisation des auto-pulls
   */
  public static async getInitializationStatus(): Promise<{
    totalDevices: number
    activeTasks: number
    status: 'initialized' | 'not_initialized' | 'error'
  }> {
    try {
      const devicesWithAutoPull = await SmartDevice.query()
        .where('auto_pull', true)
        .whereNotNull('auto_pull_username')
        .whereNotNull('auto_pull_password')

      const autoPullService = AutoPullService.getInstance()
      const activeTasks = autoPullService.getTasksStatus()

      return {
        totalDevices: devicesWithAutoPull.length,
        activeTasks: activeTasks.length,
        status: activeTasks.length > 0 ? 'initialized' : 'not_initialized',
      }
    } catch (error) {
      console.error('Error getting initialization status:', error)
      return {
        totalDevices: 0,
        activeTasks: 0,
        status: 'error',
      }
    }
  }
}
