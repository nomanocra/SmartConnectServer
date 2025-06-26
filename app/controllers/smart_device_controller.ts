import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '#models/smart_device'
import ErrorResponseService from '../services/error_response_service.js'

export default class SmartDevicesController {
  /**
   * Display a list of all smart devices
   */
  async index({ response }: HttpContext) {
    try {
      const devices = await SmartDevice.query().preload('sensors')
      return response.json({
        status: 'success',
        message: 'Smart devices retrieved successfully',
        data: devices,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error retrieving smart devices:', error)
      return ErrorResponseService.internalServerError(
        { response } as HttpContext,
        'Error retrieving smart devices'
      )
    }
  }

  /**
   * Display a single smart device with its sensors
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').getUserOrFail()

      const device = await SmartDevice.query()
        .where('id', params.id)
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .preload('sensors')
        .firstOrFail()

      return response.ok({
        status: 'success',
        message: 'Smart device retrieved successfully',
        data: {
          id: device.id,
          deviceSerial: device.deviceSerial,
          isConnected: device.isConnected,
          sensors: device.sensors,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return ErrorResponseService.notFoundError(
        { params, response, auth } as HttpContext,
        'Device not found or access denied',
        'SmartDevice'
      )
    }
  }

  /**
   * Create a new smart device
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['deviceSerial', 'isConnected'])
      const device = await SmartDevice.create(data)

      return response.created({
        status: 'success',
        message: 'Smart device created successfully',
        data: device,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error creating smart device:', error)
      return ErrorResponseService.databaseError(
        { request, response } as HttpContext,
        'Error creating smart device',
        'create'
      )
    }
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
        status: 'success',
        message: 'Device updated successfully',
        data: {
          device: {
            id: device.id,
            deviceSerial: device.deviceSerial,
            isConnected: device.isConnected,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating smart device:', error)
      return ErrorResponseService.databaseError(
        { params, request, response } as HttpContext,
        'Error updating device',
        'update'
      )
    }
  }

  /**
   * Delete a smart device
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const device = await SmartDevice.findOrFail(params.id)
      await device.delete()

      return response.noContent()
    } catch (error) {
      console.error('Error deleting smart device:', error)
      return ErrorResponseService.databaseError(
        { params, response } as HttpContext,
        'Error deleting smart device',
        'delete'
      )
    }
  }
}
