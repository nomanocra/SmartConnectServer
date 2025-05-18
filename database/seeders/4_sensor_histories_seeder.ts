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
      { sensor_id: 'sen_door_hang1', minValue: 0, maxValue: 1, variation: 1 }, // État de la porte (0/1)
      { sensor_id: 'sen_smoke_hang1', minValue: 0, maxValue: 1, variation: 0 }, // Détecteur de fumée (0/1)
      { sensor_id: 'sen_fan_hang1', minValue: 0, maxValue: 1, variation: 1 }, // État du ventilateur (0/1)
      { sensor_id: 'sen_hum_hang2', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_temp_hang2', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_co2_hang2', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensor_id: 'sen_pres_hang2', minValue: 1000, maxValue: 1020, variation: 2 }, // Pression (hPa)
      { sensor_id: 'sen_part_hang2', minValue: 5, maxValue: 25, variation: 2 }, // Particules (µg/m³)
      { sensor_id: 'sen_door_hang2', minValue: 0, maxValue: 1, variation: 1 }, // État de la porte (0/1)
      { sensor_id: 'sen_occ_hang2', minValue: 0, maxValue: 20, variation: 2 }, // Nombre de personnes
      { sensor_id: 'sen_smoke_hang2', minValue: 0, maxValue: 1, variation: 0 }, // Détecteur de fumée (0/1)
      { sensor_id: 'sen_fan_hang2', minValue: 0, maxValue: 1, variation: 1 }, // État du ventilateur (0/1)
      { sensor_id: 'sen_noise_hang2', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_temp_hang3', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_hum_hang3', minValue: 40, maxValue: 70, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_pres_hang3', minValue: 1000, maxValue: 1020, variation: 2 }, // Pression (hPa)
      { sensor_id: 'sen_co2_hang3', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensor_id: 'sen_part_hang3', minValue: 5, maxValue: 25, variation: 2 }, // Particules (µg/m³)
      { sensor_id: 'sen_door_hang3', minValue: 0, maxValue: 1, variation: 1 }, // État de la porte (0/1)
      { sensor_id: 'sen_occ_hang3', minValue: 0, maxValue: 20, variation: 2 }, // Nombre de personnes
      { sensor_id: 'sen_smoke_hang3', minValue: 0, maxValue: 1, variation: 0 }, // Détecteur de fumée (0/1)
      { sensor_id: 'sen_fan_hang3', minValue: 0, maxValue: 1, variation: 1 }, // État du ventilateur (0/1)
      { sensor_id: 'sen_noise_hang3', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_temp_bld2', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_hum_bld2', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_co2_bld2', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensor_id: 'sen_stock_bld2', minValue: 0, maxValue: 100, variation: 5 }, // Niveau de stock (%)
      { sensor_id: 'sen_motion_bld2', minValue: 0, maxValue: 1, variation: 1 }, // Détection de mouvement (0/1)
      { sensor_id: 'sen_light_bld2', minValue: 0, maxValue: 1000, variation: 50 }, // Niveau de luminosité (lux)
      { sensor_id: 'sen_vib_bld2', minValue: 0, maxValue: 1, variation: 0.1 }, // Vibration (g)
      { sensor_id: 'sen_air_bld2', minValue: 0, maxValue: 1, variation: 0 }, // Qualité de l'air (0/1)
      { sensor_id: 'sen_water_bld2', minValue: 0, maxValue: 5, variation: 0.2 }, // Niveau d'eau (m)
      { sensor_id: 'sen_wind_bld2', minValue: 0, maxValue: 50, variation: 5 }, // Vitesse du vent (km/h)
      { sensor_id: 'sen_vis_bld2', minValue: 0, maxValue: 10000, variation: 500 }, // Visibilité (m)
      { sensor_id: 'sen_noise_bld2', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_wave_bld2', minValue: 0, maxValue: 3, variation: 0.2 }, // Hauteur des vagues (m)
      { sensor_id: 'sen_temp_bld1', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_hum_bld1', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_water_bld1', minValue: 0, maxValue: 5, variation: 0.2 }, // Niveau d'eau (m)
      { sensor_id: 'sen_wind_bld1', minValue: 0, maxValue: 50, variation: 5 }, // Vitesse du vent (km/h)
      { sensor_id: 'sen_vis_bld1', minValue: 0, maxValue: 10000, variation: 500 }, // Visibilité (m)
      { sensor_id: 'sen_noise_bld1', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_wave_bld1', minValue: 0, maxValue: 3, variation: 0.2 }, // Hauteur des vagues (m)
      { sensor_id: 'sen_door_bld1', minValue: 0, maxValue: 1, variation: 1 }, // État de la porte (0/1)
      { sensor_id: 'sen_temp_bld3', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensor_id: 'sen_hum_bld3', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensor_id: 'sen_occ_bld3', minValue: 0, maxValue: 20, variation: 2 }, // Nombre de personnes
      { sensor_id: 'sen_water_bld3', minValue: 0, maxValue: 5, variation: 0.2 }, // Niveau d'eau (m)
      { sensor_id: 'sen_wind_bld3', minValue: 0, maxValue: 50, variation: 5 }, // Vitesse du vent (km/h)
      { sensor_id: 'sen_vis_bld3', minValue: 0, maxValue: 10000, variation: 500 }, // Visibilité (m)
      { sensor_id: 'sen_noise_bld3', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensor_id: 'sen_wave_bld3', minValue: 0, maxValue: 3, variation: 0.2 }, // Hauteur des vagues (m)
      { sensor_id: 'sen_temp_lab', minValue: 20, maxValue: 24, variation: 0.5 }, // Température (°C)
      { sensor_id: 'sen_hum_lab', minValue: 40, maxValue: 50, variation: 1 }, // Humidité (%)
      { sensor_id: 'sen_co2_lab', minValue: 400, maxValue: 800, variation: 20 }, // CO2 (ppm)
      { sensor_id: 'sen_air_lab', minValue: 0, maxValue: 1, variation: 0 }, // Qualité de l'air (0/1)
      { sensor_id: 'sen_pres_lab', minValue: 1010, maxValue: 1020, variation: 0.5 }, // Pression (hPa)
      { sensor_id: 'sen_rad_lab', minValue: 0, maxValue: 0.5, variation: 0.01 }, // Niveau de radiation (µSv/h)
      { sensor_id: 'sen_noise_lab', minValue: 30, maxValue: 50, variation: 2 }, // Niveau sonore (dB)
      { sensor_id: 'sen_part25_lab', minValue: 0, maxValue: 15, variation: 1 }, // Particules 2.5 (µg/m³)
      { sensor_id: 'sen_part10_lab', minValue: 0, maxValue: 25, variation: 2 }, // Particules 10 (µg/m³)
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
