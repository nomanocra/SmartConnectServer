import { DateTime } from 'luxon'
import Sensor from '#models/sensor'
import SensorHistory from '#models/sensor_history'

export default class CSVProcessingService {
  /**
   * Traiter les données CSV et mettre à jour la base de données
   * @param csvData - Les données CSV brutes
   * @param smartDeviceId - L'ID du smart device
   * @returns Statistiques de traitement
   */
  public static async processCSVData(csvData: string, smartDeviceId: string) {
    console.log(`[CSVProcessingService] Starting CSV processing for device ${smartDeviceId}`)
    console.log(`[CSVProcessingService] CSV data length: ${csvData.length} characters`)

    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    let sensorsCreated = 0

    console.log(`[CSVProcessingService] Headers found: ${headers.join(', ')}`)
    console.log(`[CSVProcessingService] Processing ${lines.length - 1} data lines`)

    // Map pour stocker la valeur la plus récente de chaque capteur
    const sensorLatestData: Map<string, { value: string; timestamp: DateTime }> = new Map()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',')
      if (values.length < headers.length) {
        console.warn(
          `[CSVProcessingService] Line ${i + 1} has insufficient columns: ${values.length} vs ${headers.length}`
        )
        continue
      }

      const rowData: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || ''
        rowData[header.trim()] =
          value.startsWith('"') && value.endsWith('"')
            ? value.substring(1, value.length - 1)
            : value
      })

      const deviceName = rowData['Device_Name']
      const value = rowData['Value']
      const unit = rowData['Unit']
      const timestamp = rowData['Timestamp'] || rowData['Date'] || rowData['Time']

      if (!deviceName || !value) {
        console.warn(`[CSVProcessingService] Line ${i + 1}: Missing Device_Name or Value`)
        continue
      }

      let recordedAt: DateTime
      try {
        // Le timestamp du CSV est au format "2025-06-21 22:00:00"
        // On doit le convertir en format ISO "2025-06-21T22:00:00"
        let isoTimestamp = timestamp
        if (timestamp && timestamp.includes(' ') && !timestamp.includes('T')) {
          isoTimestamp = timestamp.replace(' ', 'T')
        }

        recordedAt = DateTime.fromISO(isoTimestamp)
        if (!recordedAt.isValid) {
          console.warn(
            `[CSVProcessingService] Invalid timestamp format: ${timestamp}, using current time`
          )
          recordedAt = DateTime.now()
        }
      } catch (error) {
        console.warn(
          `[CSVProcessingService] Error parsing timestamp: ${timestamp}, using current time. Error:`,
          error
        )
        recordedAt = DateTime.now()
      }

      console.log(
        `[CSVProcessingService] Processing sensor: ${deviceName}, value: ${value}, timestamp: ${recordedAt.toISO()}`
      )

      // Stocker la valeur la plus récente pour ce capteur
      const existingData = sensorLatestData.get(deviceName)
      if (!existingData || recordedAt > existingData.timestamp) {
        sensorLatestData.set(deviceName, { value, timestamp: recordedAt })
        console.log(
          `[CSVProcessingService] Updated latest data for ${deviceName}: ${value} at ${recordedAt.toISO()}`
        )
      }

      let sensor = await Sensor.query()
        .where('type', deviceName)
        .where('smartDeviceId', smartDeviceId)
        .first()

      if (!sensor) {
        console.log(`[CSVProcessingService] Creating new sensor: ${deviceName}`)
        // Création du capteur avec sensor_id temporaire
        sensor = await Sensor.create({
          smartDeviceId: smartDeviceId,
          name: deviceName,
          nom: deviceName,
          type: deviceName, // Le type contient le nom du capteur (Device_Name)
          sensor_id: 'temp', // Temporaire, sera mis à jour après
          value: '',
          unit: unit || null,
          isAlert: false,
          lastUpdate: null,
        })

        // Après création, update sensor_id avec le format name_id
        sensor.sensor_id = `${deviceName}_${sensor.id}`
        await sensor.save()
        sensorsCreated++
        console.log(`[CSVProcessingService] Created sensor with ID: ${sensor.id}`)
      } else {
        console.log(`[CSVProcessingService] Found existing sensor: ${sensor.id} (${deviceName})`)
        if (unit && sensor.unit !== unit) {
          sensor.unit = unit
          await sensor.save()
          console.log(`[CSVProcessingService] Updated unit for sensor ${sensor.id}: ${unit}`)
        }
      }

      await SensorHistory.create({ sensorId: sensor.id, value: value, recordedAt: recordedAt })
    }

    console.log(`[CSVProcessingService] Updating sensors with latest data...`)
    console.log(`[CSVProcessingService] Sensors to update: ${sensorLatestData.size}`)

    // Mettre à jour les capteurs avec leurs valeurs les plus récentes
    for (const [deviceName, latestData] of sensorLatestData) {
      const sensor = await Sensor.query()
        .where('type', deviceName)
        .where('smartDeviceId', smartDeviceId)
        .first()

      if (sensor) {
        const oldLastUpdate = sensor.lastUpdate?.toISO() || 'null'
        sensor.value = latestData.value
        sensor.lastUpdate = latestData.timestamp
        await sensor.save()

        console.log(`[CSVProcessingService] Updated sensor ${sensor.id} (${deviceName}):`)
        console.log(`  - Value: ${sensor.value}`)
        console.log(`  - LastUpdate: ${oldLastUpdate} -> ${sensor.lastUpdate?.toISO()}`)
      } else {
        console.warn(`[CSVProcessingService] Could not find sensor for device name: ${deviceName}`)
      }
    }

    const result = { processedLines: lines.length - 1, sensorsCreated }
    console.log(`[CSVProcessingService] Processing completed:`, result)
    return result
  }
}
