import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '#models/smart_device'

export default class SmartDevicesController {
  /**
   * Display a list of all smart devices
   */
  async index({ response }: HttpContext) {
    const devices = await SmartDevice.query().preload('sensors')
    return response.json(devices)
  }

  /**
   * Display a single smart device with its sensors
   */
  async show({ params, response }: HttpContext) {
    try {
      const device = await SmartDevice.findOrFail(params.id)
      return response.ok({
        id: device.id,
        deviceSerial: device.deviceSerial,
        isConnected: device.isConnected,
      })
    } catch (error) {
      return response.notFound({
        message: 'Device not found',
      })
    }
  }

  /**
   * Create a new smart device
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['deviceSerial', 'isConnected'])
    const device = await SmartDevice.create(data)
    return response.created(device)
  }

  /**
   * Update a smart device
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const device = await SmartDevice.findOrFail(params.id)
      const data = request.only(['deviceSerial', 'isConnected'])
      device.merge(data)
      await device.save()

      return response.ok({
        message: 'Device updated successfully',
        device: {
          id: device.id,
          deviceSerial: device.deviceSerial,
          isConnected: device.isConnected,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error updating device',
        error: error.message,
      })
    }
  }

  /**
   * Delete a smart device
   */
  async destroy({ params, response }: HttpContext) {
    const device = await SmartDevice.findOrFail(params.id)
    await device.delete()
    return response.noContent()
  }
}
