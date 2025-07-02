import { HttpContext } from '@adonisjs/core/http'
import Sensor from '#models/sensor'
import ErrorResponseService from '../services/error_response_service.js'

export default class SensorsController {
  /**
   * Display a list of all sensors
   */
  async index({ response }: HttpContext) {
    try {
      const sensors = await Sensor.query().preload('smartDevice')
      return response.json({
        status: 'success',
        message: 'Sensors retrieved successfully',
        data: sensors,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error retrieving sensors:', error)
      return ErrorResponseService.internalServerError(
        { response } as HttpContext,
        'Error retrieving sensors'
      )
    }
  }

  /**
   * Display a single sensor
   */
  async show({ params, response }: HttpContext) {
    try {
      const sensor = await Sensor.query()
        .where('id', params.id)
        .preload('smartDevice')
        .firstOrFail()
      return response.json({
        status: 'success',
        message: 'Sensor retrieved successfully',
        data: sensor,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return ErrorResponseService.notFoundError(
        { params, response } as HttpContext,
        'Sensor not found',
        'Sensor'
      )
    }
  }

  /**
   * Create a new sensor
   */
  async store({ request, response }: HttpContext) {
    try {
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

      return response.created({
        status: 'success',
        message: 'Sensor created successfully',
        data: sensor,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error creating sensor:', error)
      return ErrorResponseService.databaseError(
        { request, response } as HttpContext,
        'Error creating sensor',
        'create'
      )
    }
  }

  /**
   * Update a sensor
   */
  async update({ params, request, response }: HttpContext) {
    try {
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

      return response.json({
        status: 'success',
        message: 'Sensor updated successfully',
        data: sensor,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating sensor:', error)
      return ErrorResponseService.databaseError(
        { params, request, response } as HttpContext,
        'Error updating sensor',
        'update'
      )
    }
  }

  /**
   * Delete a sensor
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const sensor = await Sensor.findOrFail(params.id)
      await sensor.delete()

      return response.json({
        status: 'success',
        message: 'Sensor deleted successfully',
        data: {
          deletedSensor: {
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error deleting sensor:', error)
      return ErrorResponseService.databaseError(
        { params, response } as HttpContext,
        'Error deleting sensor',
        'delete'
      )
    }
  }
}
