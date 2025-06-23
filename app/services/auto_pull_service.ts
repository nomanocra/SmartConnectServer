import { DateTime } from 'luxon'
import axios from 'axios'
import SmartDevice from '#models/smart_device'
import Sensor from '#models/sensor'
import SensorHistory from '#models/sensor_history'
import CSVProcessingService from './csv_processing_service.js'

interface AutoPullTask {
  deviceId: number
  intervalId: NodeJS.Timeout
  isRunning: boolean
  lastRun: DateTime | null
  nextRun: DateTime | null
}

export default class AutoPullService {
  private static instance: AutoPullService
  private tasks: Map<number, AutoPullTask> = new Map()

  private constructor() {}

  public static getInstance(): AutoPullService {
    if (!AutoPullService.instance) {
      AutoPullService.instance = new AutoPullService()
    }
    return AutoPullService.instance
  }

  /**
   * Démarrer l'auto-pull pour un device
   */
  public async startAutoPull(deviceId: number): Promise<boolean> {
    try {
      const device = await SmartDevice.findOrFail(deviceId)

      if (!device.autoPull || !device.autoPullUsername || !device.autoPullPassword) {
        console.log(`Auto-pull not configured for device ${deviceId}`)
        return false
      }

      // Arrêter la tâche existante si elle existe
      this.stopAutoPull(deviceId)

      // Créer la nouvelle tâche
      const intervalMs = device.updateStamp * 60 * 1000 // Convertir minutes en millisecondes

      const task: AutoPullTask = {
        deviceId,
        intervalId: setInterval(async () => {
          await this.executePull(deviceId)
        }, intervalMs),
        isRunning: true,
        lastRun: null,
        nextRun: DateTime.now().plus({ minutes: device.updateStamp }),
      }

      this.tasks.set(deviceId, task)

      // Exécuter immédiatement la première fois
      await this.executePull(deviceId)

      console.log(
        `Auto-pull started for device ${deviceId} (${device.name}) - interval: ${device.updateStamp} minutes`
      )
      return true
    } catch (error) {
      console.error(`Error starting auto-pull for device ${deviceId}:`, error)
      return false
    }
  }

  /**
   * Arrêter l'auto-pull pour un device
   */
  public stopAutoPull(deviceId: number): boolean {
    const task = this.tasks.get(deviceId)
    if (task) {
      clearInterval(task.intervalId)
      task.isRunning = false
      this.tasks.delete(deviceId)
      console.log(`Auto-pull stopped for device ${deviceId}`)
      return true
    }
    return false
  }

  /**
   * Arrêter toutes les tâches d'auto-pull
   */
  public stopAllAutoPulls(): void {
    for (const [deviceId, task] of this.tasks) {
      clearInterval(task.intervalId)
      task.isRunning = false
    }
    this.tasks.clear()
    console.log('All auto-pull tasks stopped')
  }

  /**
   * Exécuter le pull de données pour un device
   */
  private async executePull(deviceId: number): Promise<void> {
    const task = this.tasks.get(deviceId)
    if (!task || !task.isRunning) return

    try {
      console.log(`[AutoPullService] Starting data pull for device ${deviceId}`)
      const device = await SmartDevice.findOrFail(deviceId)

      if (!device.autoPull || !device.autoPullUsername || !device.autoPullPassword) {
        console.log(
          `[AutoPullService] Auto-pull not configured for device ${deviceId}, stopping task`
        )
        this.stopAutoPull(deviceId)
        return
      }

      // Calculer la date de début (il y a X minutes)
      const startTime = DateTime.now().minus({ minutes: device.updateStamp })
      console.log(`[AutoPullService] Pulling data from ${startTime.toISO()} to now`)

      const deviceUrl = `${device.deviceSerial}/query.php?username=${device.autoPullUsername}&password=${device.autoPullPassword}&logtype=DATA&format=CSV&start_year=${startTime.year}&start_month=${startTime.month}&start_day=${startTime.day}&start_hour=${startTime.hour}&start_min=${startTime.minute}&start_sec=${startTime.second}`

      console.log(`[AutoPullService] Requesting data from: ${deviceUrl}`)
      const deviceResponse = await axios.get(deviceUrl, { timeout: 30000 })
      const deviceData = deviceResponse.data

      console.log(`[AutoPullService] Received ${deviceData.length} characters of CSV data`)
      console.log(`[AutoPullService] Starting CSV processing...`)

      // Traiter les données CSV
      const processingStats = await CSVProcessingService.processCSVData(
        deviceData,
        deviceId.toString()
      )

      console.log(`[AutoPullService] CSV processing completed:`, processingStats)

      // Mettre à jour les timestamps de la tâche
      task.lastRun = DateTime.now()
      task.nextRun = DateTime.now().plus({ minutes: device.updateStamp })

      console.log(
        `[AutoPullService] Auto-pull executed successfully for device ${deviceId} (${device.name})`
      )
      console.log(`[AutoPullService] Next run scheduled for: ${task.nextRun.toISO()}`)
    } catch (error) {
      console.error(`[AutoPullService] Error executing auto-pull for device ${deviceId}:`, error)

      // Mettre à jour les timestamps même en cas d'erreur
      if (task) {
        task.lastRun = DateTime.now()
        task.nextRun = DateTime.now().plus({ minutes: 10 }) // Retry dans 10 minutes en cas d'erreur
        console.log(`[AutoPullService] Retry scheduled for: ${task.nextRun.toISO()}`)
      }
    }
  }

  /**
   * Obtenir le statut des tâches d'auto-pull
   */
  public getTasksStatus(): Array<{
    deviceId: number
    isRunning: boolean
    lastRun: string | null
    nextRun: string | null
  }> {
    return Array.from(this.tasks.entries()).map(([deviceId, task]) => ({
      deviceId,
      isRunning: task.isRunning,
      lastRun: task.lastRun?.toISO() || null,
      nextRun: task.nextRun?.toISO() || null,
    }))
  }

  /**
   * Vérifier si une tâche est active pour un device
   */
  public isTaskActive(deviceId: number): boolean {
    const task = this.tasks.get(deviceId)
    return task ? task.isRunning : false
  }
}
