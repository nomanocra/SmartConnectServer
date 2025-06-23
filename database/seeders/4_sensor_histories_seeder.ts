import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Sensor from '../../app/models/sensor.js'
import SensorHistory from '../../app/models/sensor_history.js'
import { DateTime } from 'luxon'

interface SensorConfig {
  sensorType: string
  minValue: number
  maxValue: number
  variation: number
}

export default class extends BaseSeeder {
  async run() {
    // Configuration des capteurs avec leurs plages de valeurs
    const sensorConfigs: SensorConfig[] = [
      { sensorType: 'Humidity', minValue: 40, maxValue: 60, variation: 2 }, // Humidité (%)
      { sensorType: 'Temperature', minValue: 18, maxValue: 28, variation: 1 }, // Température (°C)
      { sensorType: 'Pressure', minValue: 1000, maxValue: 1020, variation: 2 }, // Pression (hPa)
      { sensorType: 'Carbon dioxide', minValue: 400, maxValue: 1200, variation: 50 }, // CO2 (ppm)
      { sensorType: 'Particulate 2.5', minValue: 5, maxValue: 25, variation: 2 }, // Particules (µg/m³)
      { sensorType: 'People Count', minValue: 0, maxValue: 20, variation: 2 }, // Nombre de personnes
      { sensorType: 'Noise Level', minValue: 40, maxValue: 90, variation: 5 }, // Niveau sonore (dB)
      { sensorType: 'Main Door', minValue: 0, maxValue: 1, variation: 1 }, // État de la porte (0/1)
      { sensorType: 'Smoke Detector', minValue: 0, maxValue: 1, variation: 0 }, // Détecteur de fumée (0/1)
      { sensorType: 'Ventilation Fan', minValue: 0, maxValue: 1, variation: 1 }, // État du ventilateur (0/1)
      { sensorType: 'Water Level', minValue: 0, maxValue: 5, variation: 0.2 }, // Niveau d'eau (m)
      { sensorType: 'Wind Speed', minValue: 0, maxValue: 50, variation: 5 }, // Vitesse du vent (km/h)
      { sensorType: 'Visibility', minValue: 0, maxValue: 10000, variation: 500 }, // Visibilité (m)
      { sensorType: 'Wave Height', minValue: 0, maxValue: 3, variation: 0.2 }, // Hauteur des vagues (m)
      { sensorType: 'Stock Level', minValue: 0, maxValue: 100, variation: 5 }, // Niveau de stock (%)
      { sensorType: 'Motion Detection', minValue: 0, maxValue: 1, variation: 1 }, // Détection de mouvement (0/1)
      { sensorType: 'Light Level', minValue: 0, maxValue: 1000, variation: 50 }, // Niveau de luminosité (lux)
      { sensorType: 'Vibration', minValue: 0, maxValue: 1, variation: 0.1 }, // Vibration (g)
      { sensorType: 'Air Quality', minValue: 0, maxValue: 1, variation: 0 }, // Qualité de l'air (0/1)
      { sensorType: 'Radiation Level', minValue: 0, maxValue: 0.5, variation: 0.01 }, // Niveau de radiation (µSv/h)
      { sensorType: 'Particulate 10', minValue: 0, maxValue: 25, variation: 2 }, // Particules 10 (µg/m³)
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
      const sensors = await Sensor.query().where('type', config.sensorType)

      if (sensors.length === 0) {
        console.log(`No sensors found for type: ${config.sensorType}`)
        continue
      }

      for (const sensor of sensors) {
        // Clear existing history for this sensor
        await SensorHistory.query().where('sensorId', sensor.id).delete()

        // Générer des valeurs avec progression logique
        let currentValue =
          Math.floor(Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue
        const histories = timestamps.map((timestamp) => {
          // Ajouter une variation aléatoire
          const variation =
            Math.floor(Math.random() * (config.variation * 2 + 1)) - config.variation
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
        console.log(`History generated for sensor ${sensor.id} (${config.sensorType})`)
      }
    }
  }
}
