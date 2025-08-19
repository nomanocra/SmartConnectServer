import UserDeviceHistory from '#models/user_device_history'

export default class DeviceHistoryService {
  /**
   * Save or update device in user's history
   * Sauvegarde ou met à jour un device dans l'historique de l'utilisateur
   */
  public static async saveDeviceToHistory(
    userId: number,
    deviceAddress: string,
    deviceName: string
  ) {
    try {
      console.log('[DeviceHistoryService] Saving device to history:', {
        userId,
        deviceAddress,
        deviceName,
      })

      // Use upsert to create or update the device history
      const result = await UserDeviceHistory.updateOrCreate(
        {
          userId: userId,
          deviceAddress: deviceAddress,
        },
        {
          userId: userId,
          deviceAddress: deviceAddress,
          deviceName: deviceName,
        }
      )

      console.log('[DeviceHistoryService] Device saved to history successfully:', result)
    } catch (error) {
      console.error('[DeviceHistoryService] Error saving device to history:', error)
      // Don't throw error to avoid breaking the main flow
    }
  }
}
