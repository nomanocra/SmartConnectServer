import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Sensor from '#models/sensor'
import ErrorResponseService from '../services/error_response_service.js'

// Constantes pour la gestion des limites
const MAX_SENSOR_HISTORY_LIMIT = 500
const DEFAULT_SENSOR_HISTORY_LIMIT = 50

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

  /**
   * Récupère les N dernières valeurs enregistrées pour les capteurs spécifiés
   * Get the N latest recorded values for specified sensors
   *
   * @param ctx - HTTP context with request parameters
   * @returns JSON with latest sensor values
   *
   * @example
   * GET /sensor-history/latest?sensor_ids[]=141&sensor_ids[]=142&limit=50
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Latest sensor values retrieved successfully",
   *   "data": [
   *     {
   *       "sensor_id": "141",
   *       "id": 141,
   *       "latest_values": [
   *         {
   *           "value": "45.2",
   *           "timestamp": "2024-01-15T10:30:00.000Z"
   *         },
   *         {
   *           "value": "45.5",
   *           "timestamp": "2024-01-15T10:29:00.000Z"
   *         }
   *       ]
   *     }
   *   ],
   *   "timestamp": "2024-01-15T10:30:00.000Z"
   * }
   */
  async latest({ request, response }: HttpContext) {
    const sensorIds = request.input('sensor_ids')
    const limit = request.input('limit', DEFAULT_SENSOR_HISTORY_LIMIT)

    // Validation des paramètres requis
    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return ErrorResponseService.validationError(
        { request, response } as HttpContext,
        'sensor_ids array is required',
        'sensor_ids',
        sensorIds
      )
    }

    // Validation de la limite
    const limitNumber = Number.parseInt(limit as string)
    if (Number.isNaN(limitNumber) || limitNumber < 1) {
      return ErrorResponseService.validationError(
        { request, response } as HttpContext,
        'limit must be a positive number',
        'limit',
        limit
      )
    }

    if (limitNumber > MAX_SENSOR_HISTORY_LIMIT) {
      return ErrorResponseService.validationError(
        { request, response } as HttpContext,
        `limit cannot exceed ${MAX_SENSOR_HISTORY_LIMIT} to prevent server overload`,
        'limit',
        limit
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
          // Récupère les N dernières valeurs triées par timestamp décroissant
          const history = await sensor
            .related('history')
            .query()
            .orderBy('recordedAt', 'desc')
            .limit(limitNumber)
            .exec()

          return {
            sensor_id: sensor.sensor_id,
            id: sensor.id,
            latest_values: history.map((record) => ({
              value: record.value,
              timestamp: record.recordedAt.toISO(),
            })),
            total_retrieved: history.length,
            requested_limit: limitNumber,
          }
        })
      )

      return response.ok({
        status: 'success',
        message: 'Latest sensor values retrieved successfully',
        data: results,
        metadata: {
          requested_limit: limitNumber,
          total_sensors: results.length,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Error fetching latest sensor values:', error)
      return ErrorResponseService.internalServerError(
        { request, response } as HttpContext,
        'Error fetching latest sensor values'
      )
    }
  }
}
