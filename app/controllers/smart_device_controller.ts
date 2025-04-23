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
    const device = await SmartDevice.query().where('id', params.id).preload('sensors').firstOrFail()

    return response.json({
      id: device.id,
      deviceId: device.deviceId,
      isConnected: device.isConnected,
      sensors: device.sensors.map((sensor) => ({
        id: sensor.id,
        name: sensor.name,
        nom: sensor.nom,
        type: sensor.type,
        value: sensor.value,
        unit: sensor.unit,
        isAlert: sensor.isAlert,
        lastUpdate: sensor.lastUpdate,
      })),
    })
  }

  /**
   * Create a new smart device
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['deviceId', 'isConnected'])
    const device = await SmartDevice.create(data)
    return response.created(device)
  }

  /**
   * Update a smart device
   */
  async update({ params, request, response }: HttpContext) {
    const device = await SmartDevice.findOrFail(params.id)
    const data = request.only(['deviceId', 'isConnected'])
    device.merge(data)
    await device.save()
    return response.json(device)
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
