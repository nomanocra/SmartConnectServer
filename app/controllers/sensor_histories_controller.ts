import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Sensor from '#models/sensor'
import ErrorResponseService from '../services/error_response_service.js'

export default class SensorHistoriesController {
  async index({ request, response }: HttpContext) {
    const sensorIds = request.input('sensor_ids')
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return ErrorResponseService.validationError(
        { request, response } as HttpContext,
        'sensor_ids array is required',
        'sensor_ids',
        sensorIds
      )
    }

    try {
      const sensors = await Sensor.query().whereIn('sensor_id', sensorIds)

      if (sensors.length === 0) {
        return ErrorResponseService.notFoundError(
          { request, response } as HttpContext,
          'No sensors found',
          'Sensor'
        )
      }

      const results = await Promise.all(
        sensors.map(async (sensor) => {
          const query = sensor.related('history').query().orderBy('recordedAt', 'desc')

          if (startDate) {
            const startDateTime = DateTime.fromISO(startDate as string)
            if (startDateTime.isValid) {
              query.where('recordedAt', '>=', startDateTime.toSQL())
            }
          }

          if (endDate) {
            const endDateTime = DateTime.fromISO(endDate as string)
            if (endDateTime.isValid) {
              query.where('recordedAt', '<=', endDateTime.toSQL())
            }
          }

          const history = await query.exec()

          return {
            sensor_id: sensor.sensor_id,
            id: sensor.id,
            history: history.map((record) => ({
              value: record.value,
              timestamp: record.recordedAt.toISO(),
            })),
          }
        })
      )

      return response.ok({
        status: 'success',
        message: 'Sensor histories retrieved successfully',
        data: results,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error fetching sensor histories:', error)
      return ErrorResponseService.internalServerError(
        { request, response } as HttpContext,
        'Error fetching sensor histories'
      )
    }
  }
}
