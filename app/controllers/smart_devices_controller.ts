import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '../models/smart_device.js'
import Sensor from '../models/sensor.js'
import SensorHistory from '../models/sensor_history.js'
import axios from 'axios'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class DeviceController {
  async index({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const devices = await SmartDevice.query()
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .preload('sensors')

      return response.json({
        status: 'success',
        data: devices,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while retrieving devices',
      })
    }
  }

  async pullData({ auth, request, response }: HttpContext) {
    const {
      deviceAddress,
      username,
      password,
      deviceName,
      startYear,
      startMonth,
      startDay,
      startHour,
      startMin,
      startSec,
    } = request.only([
      'deviceAddress',
      'username',
      'password',
      'deviceName',
      'startYear',
      'startMonth',
      'startDay',
      'startHour',
      'startMin',
      'startSec',
    ])

    if (
      !deviceAddress ||
      !username ||
      !password ||
      !deviceName ||
      !startYear ||
      !startMonth ||
      !startDay ||
      !startHour ||
      !startMin ||
      !startSec
    ) {
      return response.status(400).json({ status: 'error', message: 'All parameters are required' })
    }

    try {
      const user = await auth.authenticate()
      const deviceUrl = `${deviceAddress}/query.php?username=${username}&password=${password}&logtype=DATA&format=CSV&start_year=${startYear}&start_month=${startMonth}&start_day=${startDay}&start_hour=${startHour}&start_min=${startMin}&start_sec=${startSec}`

      const deviceResponse = await axios.get(deviceUrl, { timeout: 30000 })
      const deviceData = deviceResponse.data

      let device = await SmartDevice.query().where('deviceSerial', deviceAddress).first()
      const isAlreadyAssociated =
        device &&
        (await db
          .from('user_devices')
          .where('smart_device_id', device.id)
          .where('user_id', user.id)
          .first())

      if (isAlreadyAssociated && device) {
        return response.status(409).json({
          status: 'error',
          message: 'This device is already associated with your account.',
          deviceInfo: { id: device.id, name: device.name, deviceSerial: device.deviceSerial },
        })
      }

      const isNewDevice = !device
      if (isNewDevice) {
        device = await SmartDevice.create({
          deviceSerial: deviceAddress,
          name: deviceName,
          isConnected: true,
        })
      } else if (device) {
        device.name = deviceName
        device.isConnected = true
        await device.save()
      }

      if (device) {
        await device.related('users').attach([user.id])
        const processingStats = await this.processCSVData(deviceData, device.id.toString())

        return response.json({
          status: 'success',
          message: `Device successfully ${isNewDevice ? 'created' : 'updated'} and data processed`,
          deviceInfo: {
            id: device.id,
            name: device.name,
            deviceSerial: device.deviceSerial,
            action: isNewDevice ? 'created' : 'updated',
          },
          processingStats,
        })
      }
      // Fallback au cas où le device ne serait toujours pas défini
      return response
        .status(500)
        .json({ status: 'error', message: 'Could not create or update device.' })
    } catch (error: any) {
      if (error.code === 'ECONNRESET' || error.response?.status === 401) {
        return response.status(401).json({
          status: 'error',
          message: 'Invalid credentials or device unreachable. Please check the device details.',
        })
      }
      console.error('Erreur dans pullData:', error)
      return response
        .status(500)
        .json({ status: 'error', message: 'An error occurred while processing the request' })
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const device = await SmartDevice.query()
        .where('id', params.id)
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .first()

      if (!device) {
        return response
          .status(404)
          .json({ status: 'error', message: 'Device not found or access denied' })
      }

      await this._cleanupDeviceSensors(device.id.toString())
      await device.related('users').detach([user.id])
      await device.delete()

      return response.json({
        status: 'success',
        message: 'Device and all associated data deleted successfully',
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du device:', error)
      return response
        .status(500)
        .json({ status: 'error', message: 'An error occurred while deleting the device' })
    }
  }

  private async processCSVData(csvData: string, smartDeviceId: string) {
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    let sensorsCreated = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',')
      if (values.length < headers.length) continue

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

      if (!deviceName || !value) continue

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
          console.warn(`Invalid timestamp format: ${timestamp}, using current time`)
          recordedAt = DateTime.now()
        }
      } catch (error) {
        console.warn(`Error parsing timestamp: ${timestamp}, using current time. Error:`, error)
        recordedAt = DateTime.now()
      }

      await SensorHistory.create({ sensorId: sensor.id, value: value, recordedAt: recordedAt })
    }

    return { processedLines: lines.length - 1, sensorsCreated }
  }

  private async _cleanupDeviceSensors(deviceId: string) {
    const existingSensors = await Sensor.query().where('smartDeviceId', deviceId)
    if (existingSensors.length > 0) {
      const sensorIds = existingSensors.map((s) => s.id)
      await SensorHistory.query().whereIn('sensorId', sensorIds).delete()
      await Sensor.query().where('smartDeviceId', deviceId).delete()
    }
  }
}
