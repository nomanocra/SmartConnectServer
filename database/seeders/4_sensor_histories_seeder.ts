import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Sensor from '../../app/models/sensor.js'
import SensorHistory from '../../app/models/sensor_history.js'
import { DateTime } from 'luxon'

interface SensorConfig {
  sensor_id: string
  minValue: number
  maxValue: number
  variation: number
}

export default class extends BaseSeeder {
  async run() {
    // Configuration des capteurs avec leurs plages de valeurs
    const sensorConfigs: SensorConfig[] = [
      { sensor_id: 'sen_hum_hang1', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_temp_hang1', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_pres_hang1', minValue: 1000, maxValue: 1020, variation: 2 }, // Pression (hPa)
      { sensor_id: 'sen_co2_hang1', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensor_id: 'sen_part_hang1', minValue: 5, maxValue: 25, variation: 2 }, // Particules (µg/m³)
      { sensor_id: 'sen_occ_hang1', minValue: 0, maxValue: 20, variation: 2 }, // Nombre de personnes
      { sensor_id: 'sen_noise_hang1', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_hum_hang2', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_temp_hang2', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_co2_hang2', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensor_id: 'sen_temp_bld1', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
    ]

    // Générer les timestamps pour tous les capteurs
    const startDate = DateTime.fromISO('2025-01-01T08:00:00Z')
    const endDate = DateTime.fromISO('2025-04-30T22:00:00Z')
    const interval = { minutes: 20 }

    const timestamps: DateTime[] = []
    let currentDate = startDate
    while (currentDate <= endDate) {
      timestamps.push(currentDate)
      currentDate = currentDate.plus(interval)
    }

    // Générer l'historique pour chaque capteur
    for (const config of sensorConfigs) {
      const sensor = await Sensor.findByOrFail('sensor_id', config.sensor_id)

      // Clear existing history for this sensor
      await SensorHistory.query().where('sensorId', sensor.id).delete()

      // Générer des valeurs avec progression logique
      let currentValue =
        Math.floor(Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue
      const histories = timestamps.map((timestamp) => {
        // Ajouter une variation aléatoire
        const variation = Math.floor(Math.random() * (config.variation * 2 + 1)) - config.variation
        currentValue = Math.max(
          config.minValue,
          Math.min(config.maxValue, currentValue + variation)
        )

        return {
          sensorId: sensor.id,
          value: currentValue.toString(),
          recordedAt: timestamp,
        }
      })

      // Insérer les données d'historique
      await SensorHistory.createMany(histories)
      console.log(`History generated for sensor ${config.sensor_id}`)
    }
  }
}
