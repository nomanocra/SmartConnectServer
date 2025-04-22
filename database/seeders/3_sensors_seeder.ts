import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Sensor from '../../app/models/sensor.js'
import SmartDevice from '../../app/models/smart_device.js'
import { DateTime } from 'luxon'

interface SensorData {
  sensor_id: string
  name: string
  nom: string
  type: string
  value: string
  unit: string | null
  isAlert: boolean
  lastUpdate: DateTime
}

interface SensorsData {
  [key: string]: SensorData[]
}

export default class extends BaseSeeder {
  async run() {
    // Get all devices to link sensors with retry
    let devices = await SmartDevice.all()
    let retries = 0
    const maxRetries = 3

    while (devices.length === 0 && retries < maxRetries) {
      console.log('No devices found, waiting 1 second...')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      devices = await SmartDevice.all()
      retries++
    }

    if (devices.length === 0) {
      console.log('No devices found after retries, skipping sensors creation')
      return
    }

    console.log(
      'Found devices:',
      devices.map((d) => d.deviceId)
    )
    const deviceMap = new Map(devices.map((device) => [device.deviceId, device]))
    console.log('Device map keys:', Array.from(deviceMap.keys()))

    const sensorsData: SensorsData = {
      fct_1a2b3c4d: [
        {
          sensor_id: 'sen_hum_hang1',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '45',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_temp_hang1',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '22',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_pres_hang1',
          name: 'Pressure valve 3',
          nom: 'Pression soupape 3',
          type: 'pressure',
          value: '1013',
          unit: 'hPa',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_co2_hang1',
          name: 'Carbon dioxide',
          nom: 'Dioxyde de carbone',
          type: 'co2',
          value: '800',
          unit: 'ppm',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_part_hang1',
          name: 'Particulate 2.5',
          nom: 'Particules 2.5',
          type: 'particulate',
          value: '12',
          unit: 'µg/m³',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_door_hang1',
          name: 'Main Door',
          nom: 'Porte principale',
          type: 'door',
          value: 'Closed',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_occ_hang1',
          name: 'People Count',
          nom: 'Nombre de personnes',
          type: 'occupancy',
          value: '12',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_smoke_hang1',
          name: 'Smoke Detector',
          nom: 'Détecteur de fumée',
          type: 'smoke',
          value: 'Normal',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_fan_hang1',
          name: 'Ventilation Fan',
          nom: 'Aération',
          type: 'fan',
          value: 'ON',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_noise_hang1',
          name: 'Noise Level',
          nom: 'Niveau sonore',
          type: 'noise',
          value: '75',
          unit: 'dB',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
      ],
      fct_5e6f7g8h: [
        {
          sensor_id: 'sen_hum_hang2',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '50',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_temp_hang2',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '23',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_pres_hang2',
          name: 'Pressure valve 1',
          nom: 'Pression soupape 1',
          type: 'pressure',
          value: '1015',
          unit: 'hPa',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_co2_hang2',
          name: 'Carbon dioxide',
          nom: 'Dioxyde de carbone',
          type: 'co2',
          value: '1200',
          unit: 'ppm',
          isAlert: true,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
        {
          sensor_id: 'sen_door_hang2',
          name: 'Main Door',
          nom: 'Porte principale',
          type: 'door',
          value: 'Open',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:40:00Z'),
        },
      ],
      bld_5e4d3c2b: [
        {
          sensor_id: 'sen_temp_bld1',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '21',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:30:00Z'),
        },
        {
          sensor_id: 'sen_hum_bld1',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '55',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:30:00Z'),
        },
        {
          sensor_id: 'sen_door_bld1',
          name: 'Main Entrance',
          nom: 'Entrée principale',
          type: 'door',
          value: 'Closed',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:30:00Z'),
        },
      ],
      bld_dock456: [
        {
          sensor_id: 'sen_temp_dock1',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '19',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:52:00Z'),
        },
        {
          sensor_id: 'sen_hum_dock1',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '60',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:52:00Z'),
        },
        {
          sensor_id: 'sen_door_dock1',
          name: 'Dock Door',
          nom: 'Porte du dock',
          type: 'door',
          value: 'Open',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T14:52:00Z'),
        },
      ],
      fct_9i8h7g6f: [
        {
          sensor_id: 'sen_temp_hang3',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '20',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T12:30:00Z'),
        },
        {
          sensor_id: 'sen_hum_hang3',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '65',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T12:30:00Z'),
        },
      ],
      bld_9a8b7c6: [
        {
          sensor_id: 'sen_temp_bld2',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '22',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:10:00Z'),
        },
        {
          sensor_id: 'sen_hum_bld2',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '50',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:10:00Z'),
        },
        {
          sensor_id: 'sen_co2_bld2',
          name: 'Carbon dioxide',
          nom: 'Dioxyde de carbone',
          type: 'co2',
          value: '600',
          unit: 'ppm',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:10:00Z'),
        },
      ],
      bld_1a2b3c4d: [
        {
          sensor_id: 'sen_temp_bld3',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '23',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:05:00Z'),
        },
        {
          sensor_id: 'sen_hum_bld3',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '45',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:05:00Z'),
        },
        {
          sensor_id: 'sen_occ_bld3',
          name: 'People Count',
          nom: 'Nombre de personnes',
          type: 'occupancy',
          value: '8',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:05:00Z'),
        },
      ],
      bld_dock123: [
        {
          sensor_id: 'sen_temp_dock2',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '18',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:12:00Z'),
        },
        {
          sensor_id: 'sen_hum_dock2',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '55',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:12:00Z'),
        },
        {
          sensor_id: 'sen_door_dock2',
          name: 'Dock Door',
          nom: 'Porte du dock',
          type: 'door',
          value: 'Closed',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:12:00Z'),
        },
      ],
      bld_lab123: [
        {
          sensor_id: 'sen_temp_lab1',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '28',
          unit: '°C',
          isAlert: true,
          lastUpdate: DateTime.fromISO('2024-03-20T15:15:00Z'),
        },
        {
          sensor_id: 'sen_hum_lab1',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '40',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:15:00Z'),
        },
        {
          sensor_id: 'sen_co2_lab1',
          name: 'Carbon dioxide',
          nom: 'Dioxyde de carbone',
          type: 'co2',
          value: '500',
          unit: 'ppm',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:15:00Z'),
        },
      ],
      bld_white123: [
        {
          sensor_id: 'sen_temp_white1',
          name: 'Temperature',
          nom: 'Température',
          type: 'temperature',
          value: '24',
          unit: '°C',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:18:00Z'),
        },
        {
          sensor_id: 'sen_hum_white1',
          name: 'Humidity',
          nom: 'Humidité',
          type: 'humidity',
          value: '50',
          unit: '%',
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:18:00Z'),
        },
        {
          sensor_id: 'sen_occ_white1',
          name: 'People Count',
          nom: 'Nombre de personnes',
          type: 'occupancy',
          value: '15',
          unit: null,
          isAlert: false,
          lastUpdate: DateTime.fromISO('2024-03-20T15:18:00Z'),
        },
      ],
    }

    // Create sensors for each device
    for (const [deviceId, sensors] of Object.entries(sensorsData)) {
      const device = deviceMap.get(deviceId)
      if (device) {
        await Promise.all(
          sensors.map((sensor) =>
            Sensor.create({
              ...sensor,
              smartDeviceId: device.id.toString(),
            })
          )
        )
      }
    }
  }
}
