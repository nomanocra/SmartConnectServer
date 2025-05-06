import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SmartDevice from '#models/smart_device'

interface DeviceData {
  deviceSerial: string
  isConnected: boolean
}

export default class extends BaseSeeder {
  async run() {
    const devices: DeviceData[] = [
      {
        deviceSerial: 'fct_1a2b3c4d',
        isConnected: true,
      },
      {
        deviceSerial: 'fct_5e6f7g8h',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_5e4d3c2b',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_dock456',
        isConnected: true,
      },
      {
        deviceSerial: 'fct_9i8h7g6f',
        isConnected: false,
      },
      {
        deviceSerial: 'bld_9a8b7c6',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_1a2b3c4d',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_dock123',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_dock789',
        isConnected: true,
      },
    ]

    await SmartDevice.createMany(devices)
    console.log('Smart devices created successfully')
  }
}
