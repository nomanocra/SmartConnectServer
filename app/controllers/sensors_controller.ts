import { HttpContext } from '@adonisjs/core/http'
import Sensor from '#models/sensor'

export default class SensorsController {
  /**
   * Display a list of all sensors
   */
  async index({ response }: HttpContext) {
    const sensors = await Sensor.query().preload('smartDevice')
    return response.json(sensors)
  }

  /**
   * Display a single sensor
   */
  async show({ params, response }: HttpContext) {
    const sensor = await Sensor.query().where('id', params.id).preload('smartDevice').firstOrFail()
    return response.json(sensor)
  }

  /**
   * Create a new sensor
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'smartDeviceId',
      'name',
      'nom',
      'type',
      'value',
      'unit',
      'isAlert',
      'lastUpdate',
    ])
    const sensor = await Sensor.create(data)
    return response.created(sensor)
  }

  /**
   * Update a sensor
   */
  async update({ params, request, response }: HttpContext) {
    const sensor = await Sensor.findOrFail(params.id)
    const data = request.only([
      'smartDeviceId',
      'name',
      'nom',
      'type',
      'value',
      'unit',
      'isAlert',
      'lastUpdate',
    ])
    sensor.merge(data)
    await sensor.save()
    return response.json(sensor)
  }

  /**
   * Delete a sensor
   */
  async destroy({ params, response }: HttpContext) {
    const sensor = await Sensor.findOrFail(params.id)
    await sensor.delete()
    return response.noContent()
  }
}
