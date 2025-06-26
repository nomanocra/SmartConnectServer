import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '../models/smart_device.js'
import Sensor from '../models/sensor.js'
import SensorHistory from '../models/sensor_history.js'
import axios from 'axios'
import db from '@adonisjs/lucid/services/db'
import AutoPullService from '../services/auto_pull_service.js'
import CSVProcessingService from '../services/csv_processing_service.js'

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
      autoPull = false,
      updateStamp = 10,
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
      'autoPull',
      'updateStamp',
    ])

    // Validation des paramètres requis
    if (
      !deviceAddress ||
      !username ||
      !password ||
      !deviceName ||
      startYear === undefined ||
      startMonth === undefined ||
      startDay === undefined ||
      startHour === undefined ||
      startMin === undefined ||
      startSec === undefined
    ) {
      return response.status(400).json({ status: 'error', message: 'All parameters are required' })
    }

    // Validation des paramètres de date avec conversion en nombres
    const year = Number(startYear)
    const month = Number(startMonth)
    const day = Number(startDay)
    const hour = Number(startHour)
    const minute = Number(startMin)
    const second = Number(startSec)

    // Validation des plages de valeurs
    if (year < 1900 || year > 2100) {
      return response.status(400).json({
        status: 'error',
        message: 'Year must be between 1900 and 2100',
      })
    }

    if (month < 1 || month > 12) {
      return response.status(400).json({
        status: 'error',
        message: 'Month must be between 1 and 12',
      })
    }

    if (day < 1 || day > 31) {
      return response.status(400).json({
        status: 'error',
        message: 'Day must be between 1 and 31',
      })
    }

    if (hour < 0 || hour > 23) {
      return response.status(400).json({
        status: 'error',
        message: 'Hour must be between 0 and 23',
      })
    }

    if (minute < 0 || minute > 59) {
      return response.status(400).json({
        status: 'error',
        message: 'Minute must be between 0 and 59',
      })
    }

    if (second < 0 || second > 59) {
      return response.status(400).json({
        status: 'error',
        message: 'Second must be between 0 and 59',
      })
    }

    // Validation de la date (vérifier si la date existe réellement)
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid date: the specified date does not exist',
      })
    }

    // Validation des paramètres auto-pull
    if (autoPull && (updateStamp < 5 || updateStamp > 240)) {
      return response.status(400).json({
        status: 'error',
        message: 'updateStamp must be between 5 and 240 minutes',
      })
    }

    try {
      const user = await auth.authenticate()

      // Formatage des paramètres pour l'URL (avec zéro de tête si nécessaire)
      const formattedMonth = month.toString().padStart(2, '0')
      const formattedDay = day.toString().padStart(2, '0')
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      const formattedSecond = second.toString().padStart(2, '0')

      const deviceUrl = `${deviceAddress}/query.php?username=${username}&password=${password}&logtype=DATA&format=CSV&start_year=${year}&start_month=${formattedMonth}&start_day=${formattedDay}&start_hour=${formattedHour}&start_min=${formattedMinute}&start_sec=${formattedSecond}`

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
          autoPull: autoPull,
          updateStamp: updateStamp,
          autoPullUsername: autoPull ? username : null,
          autoPullPassword: autoPull ? password : null,
        })
      } else if (device) {
        device.name = deviceName
        device.isConnected = true
        device.autoPull = autoPull
        device.updateStamp = updateStamp
        device.autoPullUsername = autoPull ? username : null
        device.autoPullPassword = autoPull ? password : null
        await device.save()
      }

      if (device) {
        await device.related('users').attach([user.id])
        const processingStats = await CSVProcessingService.processCSVData(
          deviceData,
          device.id.toString()
        )

        // Gestion de l'auto-pull
        const autoPullService = AutoPullService.getInstance()
        let autoPullStarted = false

        if (autoPull) {
          autoPullStarted = await autoPullService.startAutoPull(device.id)
        } else {
          // Arrêter l'auto-pull si il était actif
          autoPullService.stopAutoPull(device.id)
        }

        return response.json({
          status: 'success',
          message: `Device successfully ${isNewDevice ? 'created' : 'updated'} and data processed`,
          deviceInfo: {
            id: device.id,
            name: device.name,
            deviceSerial: device.deviceSerial,
            action: isNewDevice ? 'created' : 'updated',
            autoPull: {
              enabled: autoPull,
              interval: updateStamp,
              started: autoPullStarted,
            },
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

      // Arrêter les tâches d'auto-pull avant la suppression
      const autoPullService = AutoPullService.getInstance()
      autoPullService.stopAutoPull(device.id)

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

  /**
   * Obtenir le statut de l'auto-pull pour un device
   */
  async getAutoPullStatus({ auth, params, response }: HttpContext) {
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

      const autoPullService = AutoPullService.getInstance()
      const isActive = autoPullService.isTaskActive(device.id)
      const taskStatus = autoPullService
        .getTasksStatus()
        .find((task) => task.deviceId === device.id)

      return response.json({
        status: 'success',
        data: {
          deviceId: device.id,
          deviceName: device.name,
          autoPull: {
            enabled: device.autoPull,
            interval: device.updateStamp,
            isActive: isActive,
            lastRun: taskStatus?.lastRun || null,
            nextRun: taskStatus?.nextRun || null,
          },
        },
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du statut auto-pull:', error)
      return response
        .status(500)
        .json({ status: 'error', message: 'An error occurred while getting auto-pull status' })
    }
  }

  /**
   * Obtenir le statut de tous les auto-pulls pour l'utilisateur
   */
  async getAllAutoPullStatus({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const devices = await SmartDevice.query()
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .where('auto_pull', true)

      const autoPullService = AutoPullService.getInstance()
      const tasksStatus = autoPullService.getTasksStatus()

      const devicesWithStatus = devices.map((device) => {
        const taskStatus = tasksStatus.find((task) => task.deviceId === device.id)
        return {
          deviceId: device.id,
          deviceName: device.name,
          deviceSerial: device.deviceSerial,
          autoPull: {
            enabled: device.autoPull,
            interval: device.updateStamp,
            isActive: autoPullService.isTaskActive(device.id),
            lastRun: taskStatus?.lastRun || null,
            nextRun: taskStatus?.nextRun || null,
          },
        }
      })

      return response.json({
        status: 'success',
        data: devicesWithStatus,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts auto-pull:', error)
      return response
        .status(500)
        .json({ status: 'error', message: 'An error occurred while getting auto-pull statuses' })
    }
  }

  /**
   * Mettre à jour un device (nom, autoPull, updateStamp)
   */
  async update({ auth, params, request, response }: HttpContext) {
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

      const { deviceName, autoPull, updateStamp } = request.only([
        'deviceName',
        'autoPull',
        'updateStamp',
      ])
      let changed = false

      if (deviceName !== undefined) {
        device.name = deviceName
        changed = true
      }
      if (autoPull !== undefined) {
        device.autoPull = autoPull
        changed = true
      }
      if (updateStamp !== undefined) {
        if (typeof updateStamp !== 'number' || updateStamp < 5 || updateStamp > 240) {
          return response
            .status(400)
            .json({ status: 'error', message: 'updateStamp must be between 5 and 240 minutes' })
        }
        device.updateStamp = updateStamp
        changed = true
      }
      if (!changed) {
        return response.status(400).json({ status: 'error', message: 'No valid fields to update' })
      }
      await device.save()

      // Gestion de l'auto-pull
      const autoPullService = AutoPullService.getInstance()
      if (device.autoPull) {
        await autoPullService.startAutoPull(device.id)
      } else {
        autoPullService.stopAutoPull(device.id)
      }

      return response.json({
        status: 'success',
        message: 'Device updated successfully',
        device: {
          id: device.id,
          name: device.name,
          autoPull: device.autoPull,
          updateStamp: device.updateStamp,
        },
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du device:', error)
      return response
        .status(500)
        .json({ status: 'error', message: 'An error occurred while updating the device' })
    }
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
