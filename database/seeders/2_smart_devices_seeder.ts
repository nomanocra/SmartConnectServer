import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SmartDevice from '../../app/models/smart_device.js'

interface DeviceData {
  deviceId: string
  isConnected: boolean
}

export default class extends BaseSeeder {
  async run() {
    const devices: DeviceData[] = [
      {
        deviceId: 'fct_1a2b3c4d',
        isConnected: true,
      },
      {
        deviceId: 'fct_5e6f7g8h',
        isConnected: true,
      },
      {
        deviceId: 'bld_5e4d3c2b',
        isConnected: true,
      },
      {
        deviceId: 'bld_dock456',
        isConnected: true,
      },
      {
        deviceId: 'fct_9i8h7g6f',
        isConnected: false,
      },
      {
        deviceId: 'bld_9a8b7c6',
        isConnected: true,
      },
      {
        deviceId: 'bld_1a2b3c4d',
        isConnected: true,
      },
      {
        deviceId: 'bld_dock123',
        isConnected: true,
      },
      {
        deviceId: 'bld_lab123',
        isConnected: true,
      },
      {
        deviceId: 'bld_white123',
        isConnected: true,
      },
    ]

    await Promise.all(devices.map((device) => SmartDevice.create(device)))
  }
}
