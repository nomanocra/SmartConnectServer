import { BaseCommand } from '@adonisjs/core/ace'
import Sensor from '#models/sensor'
import SmartDevice from '#models/smart_device'
import CSVProcessingService from '#services/csv_processing_service'

export default class FixSensors extends BaseCommand {
  static commandName = 'fix:sensors'
  static description = 'Fix sensor data and test lastUpdate functionality'

  async run() {
    this.logger.info('Starting sensor fix and lastUpdate test...')

    try {
      // Récupérer tous les devices
      const devices = await SmartDevice.all()
      this.logger.info(`Found ${devices.length} devices`)

      for (const device of devices) {
        this.logger.info(`Processing device: ${device.name} (ID: ${device.id})`)

        // Récupérer les sensors du device
        const sensors = await Sensor.query().where('smartDeviceId', device.id.toString())
        this.logger.info(`Found ${sensors.length} sensors for device ${device.name}`)

        // Afficher l'état actuel des sensors
        for (const sensor of sensors) {
          this.logger.info(`Sensor ${sensor.id} (${sensor.name}):`)
          this.logger.info(`  - Value: ${sensor.value}`)
          this.logger.info(`  - LastUpdate: ${sensor.lastUpdate?.toISO() || 'null'}`)
          this.logger.info(`  - Unit: ${sensor.unit || 'null'}`)
        }

        // Test de mise à jour du lastUpdate avec des données CSV simulées
        this.logger.info(`Testing lastUpdate functionality for device ${device.name}...`)

        const testCSVData = `Device_Name,Value,Unit,Timestamp
Temperature,${Math.floor(Math.random() * 30) + 10},°C,2025-01-15 14:30:00
Humidity,${Math.floor(Math.random() * 40) + 30},%,2025-01-15 14:30:00
Pressure,${Math.floor(Math.random() * 50) + 1000},hPa,2025-01-15 14:30:00`

        this.logger.info('Processing test CSV data...')
        const processingStats = await CSVProcessingService.processCSVData(
          testCSVData,
          device.id.toString()
        )
        this.logger.info(
          `CSV processing completed: processedLines=${processingStats.processedLines}, sensorsCreated=${processingStats.sensorsCreated}`
        )

        // Vérifier les sensors après traitement
        const updatedSensors = await Sensor.query().where('smartDeviceId', device.id.toString())
        this.logger.info(`Sensors after processing:`)

        for (const sensor of updatedSensors) {
          this.logger.info(`Sensor ${sensor.id} (${sensor.name}):`)
          this.logger.info(`  - Value: ${sensor.value}`)
          this.logger.info(`  - LastUpdate: ${sensor.lastUpdate?.toISO() || 'null'}`)
          this.logger.info(`  - Unit: ${sensor.unit || 'null'}`)
        }

        this.logger.info('---')
      }

      this.logger.info('Sensor fix and lastUpdate test completed successfully!')
    } catch (error) {
      this.logger.error('Error during sensor fix:', error)
      throw error
    }
  }
}
