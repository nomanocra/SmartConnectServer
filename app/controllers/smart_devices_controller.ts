import { HttpContext } from '@adonisjs/core/http'
import SmartDevice from '../models/smart_device.js'
import Sensor from '../models/sensor.js'
import SensorHistory from '../models/sensor_history.js'
import axios from 'axios'
import db from '@adonisjs/lucid/services/db'
import AutoPullService from '../services/auto_pull_service.js'
import CSVProcessingService from '../services/csv_processing_service.js'
import ErrorResponseService from '../services/error_response_service.js'
import DeviceHistoryService from '../services/device_history_service.js'

/**
 * SmartDevicesController - IoT Smart Device Management
 *
 * This controller handles all operations related to SmartDevices:
 * - Device retrieval and display
 * - CSV data processing from IoT devices
 * - Auto-pull data management
 * - Complete device deletion with associated data
 * - Device configuration updates
 *
 * All methods use RFC 7807 error handling via ErrorResponseService
 * and require user authentication.
 */
export default class SmartDevicesController {
  /**
   * Normalizes device addresses by removing protocols, www prefix, and trailing slashes
   *
   * @param address - The device address to normalize
   * @returns The normalized address
   *
   * @example
   * normalizeDeviceAddress('http://www.90.21.54.142/') // returns '90.21.54.142'
   * normalizeDeviceAddress('https://192.168.1.100') // returns '192.168.1.100'
   * normalizeDeviceAddress('www.example.com') // returns 'example.com'
   */
  private normalizeDeviceAddress(address: string): string {
    let normalized = address
    // Supprimer le protocole
    if (normalized.startsWith('http://')) {
      normalized = normalized.replace('http://', '')
    } else if (normalized.startsWith('https://')) {
      normalized = normalized.replace('https://', '')
    }
    // Supprimer www. au début
    if (normalized.startsWith('www.')) {
      normalized = normalized.replace('www.', '')
    }
    // Supprimer les slashes finaux
    normalized = normalized.replace(/\/+$/, '')
    return normalized
  }

  /**
   * Retrieves all devices associated with the authenticated user
   *
   * @param ctx - HTTP context with authentication
   * @returns JSON with list of devices and their sensors
   *
   * @example
   * GET /devices
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Devices retrieved successfully",
   *   "data": [...],
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
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
        message: 'Devices retrieved successfully',
        data: devices,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(error)
      return ErrorResponseService.internalServerError(
        { auth, response } as HttpContext,
        'An error occurred while retrieving devices'
      )
    }
  }

  /**
   * Displays a specific smart device with its sensors
   *
   * @param ctx - HTTP context with authentication and parameters
   * @returns JSON with device details and sensors
   *
   * @example
   * GET /devices/123
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Smart device retrieved successfully",
   *   "data": {
   *     "id": 123,
   *     "deviceSerial": "192.168.1.100",
   *     "name": "Device Name",
   *     "isConnected": true,
   *     "autoPull": false,
   *     "updateStamp": 10,
   *     "sensors": [...],
   *     "createdAt": "2024-01-01T12:00:00.000Z",
   *     "updatedAt": "2024-01-01T12:00:00.000Z"
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
  async show({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const device = await SmartDevice.query()
        .where('id', params.id)
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .preload('sensors')
        .first()

      if (!device) {
        return ErrorResponseService.notFoundError(
          { params, response, auth } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
      }

      return response.json({
        status: 'success',
        message: 'Smart device retrieved successfully',
        data: {
          id: device.id,
          deviceSerial: device.deviceSerial,
          name: device.name,
          isConnected: device.isConnected,
          autoPull: device.autoPull,
          updateStamp: device.updateStamp,
          sensors: device.sensors,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error retrieving smart device:', error)
      return ErrorResponseService.internalServerError(
        { params, response, auth } as HttpContext,
        'An error occurred while retrieving the device'
      )
    }
  }

  /**
   * Processes CSV data from an IoT device and creates/updates the device
   *
   * This method performs the following operations:
   * 1. Validates all required parameters (address, credentials, date, etc.)
   * 2. Connects to the IoT device to retrieve CSV data
   * 3. Creates a new device or updates an existing one
   * 4. Processes CSV data to create sensors and history records
   * 5. Configures auto-pull if requested
   *
   * @param ctx - HTTP context with authentication and request data
   * @returns JSON with device information and processing statistics
   *
   * @example
   * POST /device/pull-data
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request Body:
   * {
   *   "deviceAddress": "192.168.1.100",
   *   "username": "admin",
   *   "password": "password",
   *   "deviceName": "IoT Device",
   *   "startYear": 2024,
   *   "startMonth": 1,
   *   "startDay": 1,
   *   "startHour": 0,
   *   "startMin": 0,
   *   "startSec": 0,
   *   "autoPull": false,
   *   "updateStamp": 10
   * }
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Device successfully created and data processed",
   *   "data": {
   *     "deviceInfo": {
   *       "id": 123,
   *       "name": "IoT Device",
   *       "deviceSerial": "192.168.1.100",
   *       "action": "created",
   *       "autoPull": {
   *         "enabled": false,
   *         "interval": 10,
   *         "started": false
   *       }
   *     },
   *     "processingStats": {
   *       "sensorsCreated": 5,
   *       "recordsProcessed": 1000,
   *       "processingTime": "2.5s"
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   *
   * @throws {Error} If device is already associated with user (409 Conflict)
   * @throws {Error} If device is unreachable (503 Service Unavailable)
   * @throws {Error} If credentials are invalid (401 Unauthorized)
   */
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
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'All parameters are required for device data retrieval'
      )
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
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Year must be between 1900 and 2100',
        'startYear',
        year
      )
    }

    if (month < 1 || month > 12) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Month must be between 1 and 12',
        'startMonth',
        month
      )
    }

    if (day < 1 || day > 31) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Day must be between 1 and 31',
        'startDay',
        day
      )
    }

    if (hour < 0 || hour > 23) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Hour must be between 0 and 23',
        'startHour',
        hour
      )
    }

    if (minute < 0 || minute > 59) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Minute must be between 0 and 59',
        'startMin',
        minute
      )
    }

    if (second < 0 || second > 59) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Second must be between 0 and 59',
        'startSec',
        second
      )
    }

    // Validation de la date (vérifier si la date existe réellement)
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'Invalid date: the specified date does not exist',
        'date',
        `${year}-${month}-${day}`
      )
    }

    // Validation des paramètres auto-pull
    if (autoPull && (updateStamp < 5 || updateStamp > 240)) {
      return ErrorResponseService.validationError(
        { auth, request, response } as HttpContext,
        'updateStamp must be between 5 and 240 minutes',
        'updateStamp',
        updateStamp
      )
    }

    try {
      const user = await auth.authenticate()

      // Formatage des paramètres pour l'URL (avec zéro de tête si nécessaire)
      const formattedMonth = month.toString().padStart(2, '0')
      const formattedDay = day.toString().padStart(2, '0')
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      const formattedSecond = second.toString().padStart(2, '0')

      // Normaliser l'adresse pour la base de données
      const normalizedDeviceAddress = this.normalizeDeviceAddress(deviceAddress)

      // VÉRIFIER D'ABORD SI LE DEVICE EXISTE DÉJÀ (pour éviter les requêtes HTTP inutiles)
      // Rechercher un device existant en normalisant les adresses en base
      const allDevices = await SmartDevice.query()
      let device = null

      for (const existingDevice of allDevices) {
        const normalizedExistingAddress = this.normalizeDeviceAddress(existingDevice.deviceSerial)
        if (normalizedExistingAddress === normalizedDeviceAddress) {
          device = existingDevice
          break
        }
      }

      const isAlreadyAssociated =
        device &&
        (await db
          .from('user_devices')
          .where('smart_device_id', device.id)
          .where('user_id', user.id)
          .first())

      if (isAlreadyAssociated && device) {
        return ErrorResponseService.createProblemResponse(
          { auth, request, response } as HttpContext,
          409,
          'Device Conflict',
          'This device is already associated with your account',
          '/problems/conflict-error',
          undefined,
          {
            resourceType: 'SmartDevice',
            deviceId: device.id,
          }
        )
      }

      // Tester la connexion selon le protocole spécifié par l'utilisateur
      // Utiliser l'adresse normalisée pour construire l'URL propre
      let cleanDeviceAddress = normalizedDeviceAddress
      if (!cleanDeviceAddress.startsWith('http://') && !cleanDeviceAddress.startsWith('https://')) {
        cleanDeviceAddress = `https://${cleanDeviceAddress}`
      }

      const buildUrl = (address: string) => {
        const cleanAddress = address.endsWith('/') ? address.slice(0, -1) : address
        return `${cleanAddress}/query.php?username=${username}&password=${password}&logtype=DATA&format=CSV&start_year=${year}&start_month=${formattedMonth}&start_day=${formattedDay}&start_hour=${formattedHour}&start_min=${formattedMinute}&start_sec=${formattedSecond}`
      }

      let deviceResponse
      try {
        // Utiliser le protocole spécifié par l'utilisateur
        deviceResponse = await axios.get(buildUrl(cleanDeviceAddress), { timeout: 10000 })
      } catch (firstError) {
        // Essayer l'autre protocole seulement si aucun protocole n'était spécifié
        if (!deviceAddress.startsWith('http://') && !deviceAddress.startsWith('https://')) {
          try {
            const alternativeAddress = cleanDeviceAddress.startsWith('https://')
              ? cleanDeviceAddress.replace('https://', 'http://')
              : cleanDeviceAddress.replace('http://', 'https://')
            deviceResponse = await axios.get(buildUrl(alternativeAddress), { timeout: 10000 })
          } catch (secondError) {
            // Les deux protocoles ont échoué, gérer les erreurs spécifiques
            const error = secondError as any
            if (error.code === 'ENOTFOUND') {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Device address not found. Please check the device address.',
                undefined,
                404
              )
            } else if (error.code === 'ECONNREFUSED') {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Connection refused by device. The device may be offline or the address is incorrect.',
                undefined,
                503
              )
            } else if (error.code === 'ETIMEDOUT') {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Connection timeout. The device is not responding.',
                undefined,
                504
              )
            } else if (error.code === 'EHOSTUNREACH') {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Host unreachable. Please check the device address.',
                undefined,
                503
              )
            } else if (error.code === 'ECONNABORTED') {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Connection timeout. The device is not responding within the expected time.',
                undefined,
                504
              )
            } else if (error.response?.status === 401) {
              return ErrorResponseService.deviceError(
                { auth, request, response } as HttpContext,
                'Invalid credentials. Please check username and password.',
                undefined,
                401
              )
            } else {
              throw secondError
            }
          }
        } else {
          // Gérer les erreurs pour le protocole spécifié par l'utilisateur
          const error = firstError as any
          if (error.code === 'ENOTFOUND') {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Device address not found. Please check the device address.',
              undefined,
              404
            )
          } else if (error.code === 'ECONNREFUSED') {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Connection refused by device. The device may be offline or the address is incorrect.',
              undefined,
              503
            )
          } else if (error.code === 'ETIMEDOUT') {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Connection timeout. The device is not responding.',
              undefined,
              504
            )
          } else if (error.code === 'EHOSTUNREACH') {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Host unreachable. Please check the device address.',
              undefined,
              503
            )
          } else if (error.code === 'ECONNABORTED') {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Connection timeout. The device is not responding within the expected time.',
              undefined,
              504
            )
          } else if (error.response?.status === 401) {
            return ErrorResponseService.deviceError(
              { auth, request, response } as HttpContext,
              'Invalid credentials. Please check username and password.',
              undefined,
              401
            )
          } else {
            throw firstError
          }
        }
      }

      // Vérifier si la réponse contient une erreur d'authentification
      const deviceData = deviceResponse.data
      if (typeof deviceData === 'string' && deviceData.includes('Authentication Error')) {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Invalid credentials. Please check username and password.',
          undefined,
          401
        )
      }

      // Vérifier si c'est bien un smartBoitier valide (doit retourner du CSV)
      if (typeof deviceData === 'string') {
        // Un smartBoitier valide doit retourner du CSV, pas du HTML
        if (
          deviceData.includes('<html') ||
          deviceData.includes('<!DOCTYPE') ||
          deviceData.includes('<head>')
        ) {
          return ErrorResponseService.deviceError(
            { auth, request, response } as HttpContext,
            'Device not recognized as a smartBoitier.',
            deviceAddress,
            400
          )
        }

        // Vérifier si la réponse contient des données CSV valides
        const csvLines = deviceData.split('\n').filter((line) => line.trim().length > 0)
        if (csvLines.length === 0 || !csvLines[0].includes(',')) {
          return ErrorResponseService.deviceError(
            { auth, request, response } as HttpContext,
            'Device not recognized as a smartBoitier.',
            deviceAddress,
            400
          )
        }
      }

      const isNewDevice = !device
      if (isNewDevice) {
        device = await SmartDevice.create({
          deviceSerial: normalizedDeviceAddress,
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

        // Save device to user's history for autosuggestion
        await DeviceHistoryService.saveDeviceToHistory(user.id, normalizedDeviceAddress, deviceName)

        const processingStats = await CSVProcessingService.processCSVData(
          deviceData,
          device.id.toString(),
          true // isInitialPull = true pour le pull initial
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
          data: {
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
          },
          timestamp: new Date().toISOString(),
        })
      }
      // Fallback au cas où le device ne serait toujours pas défini
      return ErrorResponseService.internalServerError(
        { auth, request, response } as HttpContext,
        'Could not create or update device'
      )
    } catch (error: any) {
      if (error.code === 'ECONNRESET') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Device unreachable. Please check the device address and network connectivity.',
          deviceAddress,
          503 // Service Unavailable
        )
      }

      if (error.code === 'ECONNABORTED') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Connection timeout. The device is not responding within the expected time.',
          deviceAddress,
          504 // Gateway Timeout
        )
      }

      if (error.code === 'ENOTFOUND') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Device address not found. Please check the device address.',
          deviceAddress,
          404
        )
      }

      if (error.code === 'ECONNREFUSED') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Connection refused by device. The device may be offline or the address is incorrect.',
          deviceAddress,
          503
        )
      }

      if (error.code === 'ETIMEDOUT') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Connection timeout. The device is not responding.',
          deviceAddress,
          504
        )
      }

      if (error.code === 'EHOSTUNREACH') {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Host unreachable. Please check the device address.',
          deviceAddress,
          503
        )
      }

      if (error.response?.status === 401) {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Invalid credentials for the IoT device. Please check username and password.',
          deviceAddress,
          401 // Unauthorized
        )
      }

      // Gestion des autres erreurs HTTP courantes (404, 500, etc.)
      if (error.response?.status) {
        return ErrorResponseService.deviceError(
          { auth, request, response } as HttpContext,
          'Device not recognized as a smartBoitier.',
          deviceAddress,
          400
        )
      }

      console.error('Erreur dans pullData:', error)
      return ErrorResponseService.internalServerError(
        { auth, request, response } as HttpContext,
        'An error occurred while processing the request'
      )
    }
  }

  /**
   * Completely deletes a device and all its associated data
   *
   * This method performs cascade deletion:
   * 1. Stops active auto-pull tasks
   * 2. Deletes all sensor history records
   * 3. Deletes all device sensors
   * 4. Detaches device from user
   * 5. Deletes the device itself
   *
   * @param ctx - HTTP context with authentication and parameters
   * @returns JSON confirming deletion with details
   *
   * @example
   * DELETE /devices/123
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Device and all associated data deleted successfully",
   *   "data": {
   *     "deletedDevice": {
   *       "id": 123,
   *       "name": "IoT Device",
   *       "deviceSerial": "192.168.1.100"
   *     },
   *     "deletedData": {
   *       "sensorsCount": 5,
   *       "sensorHistoriesCount": 1000
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
  async destroy({ auth, params, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const device = await SmartDevice.query()
        .where('id', params.id)
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .first()

      if (!device) {
        return ErrorResponseService.notFoundError(
          { auth, params, request, response } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
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
        data: {
          deletedDevice: {
            id: device.id,
            name: device.name,
            deviceSerial: device.deviceSerial,
          },
          deletedData: {
            sensorsCount: 0, // À calculer si nécessaire
            sensorHistoriesCount: 0, // À calculer si nécessaire
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du device:', error)
      return ErrorResponseService.internalServerError(
        { auth, params, request, response } as HttpContext,
        'An error occurred while deleting the device'
      )
    }
  }

  /**
   * Deletes a smart device and all associated data by device address
   *
   * @param ctx - HTTP context with authentication and request data
   * @returns JSON with deletion confirmation
   *
   * @example
   * DELETE /devices/delete
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request Body:
   * {
   *   "deviceAddress": "192.168.1.100"
   * }
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Device and all associated data deleted successfully",
   *   "data": {
   *     "deletedDevice": {
   *       "id": 123,
   *       "deviceAddress": "192.168.1.100",
   *       "name": "Device Name"
   *     },
   *     "cleanupStats": {
   *       "sensorsDeleted": 5,
   *       "historyRecordsDeleted": 150
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
  async destroyByAddress({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { deviceAddress } = request.only(['deviceAddress'])

      if (!deviceAddress) {
        return ErrorResponseService.validationError(
          { auth, request, response } as HttpContext,
          'deviceAddress is required',
          'deviceAddress',
          deviceAddress
        )
      }

      // Normaliser l'adresse pour la recherche
      const normalizedDeviceAddress = this.normalizeDeviceAddress(deviceAddress)

      // Rechercher un device existant en normalisant les adresses en base
      const allDevices = await SmartDevice.query().whereHas('users', (query) => {
        query.where('users.id', user.id)
      })

      let device = null
      for (const existingDevice of allDevices) {
        const normalizedExistingAddress = this.normalizeDeviceAddress(existingDevice.deviceSerial)
        if (normalizedExistingAddress === normalizedDeviceAddress) {
          device = existingDevice
          break
        }
      }

      if (!device) {
        return ErrorResponseService.notFoundError(
          { auth, request, response } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
      }

      // Arrêter l'auto-pull si actif
      const autoPullService = AutoPullService.getInstance()
      autoPullService.stopAutoPull(device.id)

      // Nettoyer les données associées
      await this._cleanupDeviceSensors(device.id.toString())

      // Supprimer l'association utilisateur-device
      await db.from('user_devices').where('smart_device_id', device.id).delete()

      // Supprimer le device
      await device.delete()

      return response.json({
        status: 'success',
        message: 'Device and all associated data deleted successfully',
        data: {
          deletedDevice: {
            id: device.id,
            deviceAddress: device.deviceSerial,
            name: device.name,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du device:', error)
      return ErrorResponseService.internalServerError(
        { auth, request, response } as HttpContext,
        'An error occurred while deleting the device'
      )
    }
  }

  /**
   * Gets auto-pull status for a specific device
   *
   * @param ctx - HTTP context with authentication and parameters
   * @returns JSON with detailed auto-pull status
   *
   * @example
   * GET /devices/123/auto-pull/status
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Auto-pull status retrieved successfully",
   *   "data": {
   *     "deviceId": 123,
   *     "deviceName": "IoT Device",
   *     "autoPull": {
   *       "enabled": true,
   *       "interval": 10,
   *       "isActive": true,
   *       "lastRun": "2024-01-01T12:00:00.000Z",
   *       "nextRun": "2024-01-01T12:10:00.000Z"
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
  async getAutoPullStatus({ auth, params, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const device = await SmartDevice.query()
        .where('id', params.id)
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .first()

      if (!device) {
        return ErrorResponseService.notFoundError(
          { auth, params, request, response } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
      }

      const autoPullService = AutoPullService.getInstance()
      const isActive = autoPullService.isTaskActive(device.id)
      const taskStatus = autoPullService
        .getTasksStatus()
        .find((task) => task.deviceId === device.id)

      return response.json({
        status: 'success',
        message: 'Auto-pull status retrieved successfully',
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
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du statut auto-pull:', error)
      return ErrorResponseService.internalServerError(
        { auth, params, response } as HttpContext,
        'An error occurred while getting auto-pull status'
      )
    }
  }

  /**
   * Gets auto-pull status for all user devices
   *
   * @param ctx - HTTP context with authentication
   * @returns JSON with status of all auto-pulls
   *
   * @example
   * GET /devices/auto-pull/status
   * Authorization: Bearer <token>
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "All auto-pull statuses retrieved successfully",
   *   "data": [
   *     {
   *       "deviceId": 123,
   *       "deviceName": "IoT Device 1",
   *       "deviceSerial": "192.168.1.100",
   *       "autoPull": {
   *         "enabled": true,
   *         "interval": 10,
   *         "isActive": true,
   *         "lastRun": "2024-01-01T12:00:00.000Z",
   *         "nextRun": "2024-01-01T12:10:00.000Z"
   *       }
   *     }
   *   ],
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
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
        message: 'All auto-pull statuses retrieved successfully',
        data: devicesWithStatus,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts auto-pull:', error)
      return ErrorResponseService.internalServerError(
        { auth, response } as HttpContext,
        'An error occurred while getting auto-pull statuses'
      )
    }
  }

  /**
   * Updates device configuration (name, auto-pull, interval)
   *
   * @param ctx - HTTP context with authentication, parameters and request data
   * @returns JSON confirming update with new values
   *
   * @example
   * PUT /devices/123
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request Body:
   * {
   *   "deviceName": "Updated Device Name",
   *   "autoPull": true,
   *   "updateStamp": 15
   * }
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Device updated successfully",
   *   "data": {
   *     "device": {
   *       "id": 123,
   *       "name": "Updated Device Name",
   *       "autoPull": true,
   *       "updateStamp": 15
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
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
        return ErrorResponseService.notFoundError(
          { auth, params, request, response } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
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
          return ErrorResponseService.validationError(
            { auth, params, request, response } as HttpContext,
            'updateStamp must be between 5 and 240 minutes',
            'updateStamp',
            updateStamp
          )
        }
        device.updateStamp = updateStamp
        changed = true
      }
      if (!changed) {
        return ErrorResponseService.validationError(
          { auth, params, request, response } as HttpContext,
          'No valid fields to update'
        )
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
        data: {
          device: {
            id: device.id,
            name: device.name,
            autoPull: device.autoPull,
            updateStamp: device.updateStamp,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du device:', error)
      return ErrorResponseService.internalServerError(
        { auth, params, request, response } as HttpContext,
        'An error occurred while updating the device'
      )
    }
  }

  /**
   * Updates a smart device configuration by device address
   *
   * @param ctx - HTTP context with authentication and request data
   * @returns JSON with updated device information
   *
   * @example
   * PUT /devices/update
   * Authorization: Bearer <token>
   * Content-Type: application/json
   *
   * Request Body:
   * {
   *   "deviceAddress": "192.168.1.100",
   *   "deviceName": "Updated Device Name",
   *   "autoPull": true,
   *   "updateStamp": 15
   * }
   *
   * Response:
   * {
   *   "status": "success",
   *   "message": "Device updated successfully",
   *   "data": {
   *     "device": {
   *       "id": 123,
   *       "deviceAddress": "192.168.1.100",
   *       "name": "Updated Device Name",
   *       "autoPull": true,
   *       "updateStamp": 15
   *     }
   *   },
   *   "timestamp": "2024-01-01T12:00:00.000Z"
   * }
   */
  async updateByAddress({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { deviceAddress, deviceName, autoPull, updateStamp } = request.only([
        'deviceAddress',
        'deviceName',
        'autoPull',
        'updateStamp',
      ])

      if (!deviceAddress) {
        return ErrorResponseService.validationError(
          { auth, request, response } as HttpContext,
          'deviceAddress is required',
          'deviceAddress',
          deviceAddress
        )
      }

      // Normaliser l'adresse pour la recherche
      const normalizedDeviceAddress = this.normalizeDeviceAddress(deviceAddress)

      // Rechercher un device existant en normalisant les adresses en base
      const allDevices = await SmartDevice.query().whereHas('users', (query) => {
        query.where('users.id', user.id)
      })

      let device = null
      for (const existingDevice of allDevices) {
        const normalizedExistingAddress = this.normalizeDeviceAddress(existingDevice.deviceSerial)
        if (normalizedExistingAddress === normalizedDeviceAddress) {
          device = existingDevice
          break
        }
      }

      if (!device) {
        return ErrorResponseService.notFoundError(
          { auth, request, response } as HttpContext,
          'Device not found or access denied',
          'SmartDevice'
        )
      }

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
          return ErrorResponseService.validationError(
            { auth, request, response } as HttpContext,
            'updateStamp must be between 5 and 240 minutes',
            'updateStamp',
            updateStamp
          )
        }
        device.updateStamp = updateStamp
        changed = true
      }
      if (!changed) {
        return ErrorResponseService.validationError(
          { auth, request, response } as HttpContext,
          'No valid fields to update'
        )
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
        data: {
          device: {
            id: device.id,
            deviceAddress: device.deviceSerial,
            name: device.name,
            autoPull: device.autoPull,
            updateStamp: device.updateStamp,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du device:', error)
      return ErrorResponseService.internalServerError(
        { auth, request, response } as HttpContext,
        'An error occurred while updating the device'
      )
    }
  }

  /**
   * Cleans up all data associated with a device (private method)
   *
   * This method performs cascade deletion:
   * 1. All sensor history records for the device
   * 2. All device sensors
   *
   * @param deviceId - ID of the device to clean up
   * @returns Promise<void>
   *
   * @private
   */
  private async _cleanupDeviceSensors(deviceId: string) {
    const existingSensors = await Sensor.query().where('smartDeviceId', deviceId)
    if (existingSensors.length > 0) {
      const sensorIds = existingSensors.map((s) => s.id)
      await SensorHistory.query().whereIn('sensorId', sensorIds).delete()
      await Sensor.query().where('smartDeviceId', deviceId).delete()
    }
  }
}
