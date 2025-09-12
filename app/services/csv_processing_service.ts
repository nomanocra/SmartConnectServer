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
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    let sensorsCreated = 0

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

      // Stocker la valeur la plus récente pour ce capteur
      const existingData = sensorLatestData.get(deviceName)
      if (!existingData || recordedAt > existingData.timestamp) {
        sensorLatestData.set(deviceName, { value, timestamp: recordedAt })
      }

      let sensor = await Sensor.query()
        .where('type', deviceName)
        .where('smartDeviceId', smartDeviceId)
        .first()

      if (!sensor) {
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
      } else {
        if (unit && sensor.unit !== unit) {
          sensor.unit = unit
          await sensor.save()
        }
      }

      // Vérifier si l'enregistrement existe déjà pour éviter les doublons
      const existingRecord = await SensorHistory.query()
        .where('sensorId', sensor.id)
        .where('recordedAt', recordedAt.toSQL())
        .first()

      if (!existingRecord) {
        await SensorHistory.create({ sensorId: sensor.id, value: value, recordedAt: recordedAt })
      } else {
        console.log(`[CSVProcessingService] Record already exists for sensor ${sensor.id} at ${recordedAt.toSQL()}, skipping insertion`)
      }
    }

    // Mettre à jour les capteurs avec leurs valeurs les plus récentes
    for (const [deviceName, latestData] of sensorLatestData) {
      const sensor = await Sensor.query()
        .where('type', deviceName)
        .where('smartDeviceId', smartDeviceId)
        .first()

      if (sensor) {
        sensor.value = latestData.value
        sensor.lastUpdate = latestData.timestamp
        await sensor.save()
      } else {
        console.warn(`[CSVProcessingService] Could not find sensor for device name: ${deviceName}`)
      }
    }

    const result = { processedLines: lines.length - 1, sensorsCreated }
    return result
  }
}
