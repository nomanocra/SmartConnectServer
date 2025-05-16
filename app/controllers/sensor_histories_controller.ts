import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Sensor from '#models/sensor'

export default class SensorHistoriesController {
  async index({ request, response }: HttpContext) {
    const sensorIds = request.input('sensor_ids')
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return response.badRequest({ error: 'sensor_ids array is required' })
    }

    try {
      const sensors = await Sensor.query().whereIn('sensor_id', sensorIds)

      if (sensors.length === 0) {
        return response.notFound({ error: 'No sensors found' })
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

      return response.ok(results)
    } catch (error) {
      return response.badRequest({ error: 'Error fetching sensor histories' })
    }
  }
}
