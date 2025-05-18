import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SmartDevice from '#models/smart_device'

interface DeviceData {
  deviceSerial: string
  name: string
  isConnected: boolean
}

export default class extends BaseSeeder {
  async run() {
    // Clear existing devices
    await SmartDevice.query().delete()

    const devices: DeviceData[] = [
      {
        deviceSerial: 'fct_1a2b3c4d',
        name: 'Hangar A',
        isConnected: true,
      },
      {
        deviceSerial: 'fct_5e6f7g8h',
        name: 'Hangar B',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_5e4d3c2b',
        name: 'Terminal 1',
        isConnected: true,
      },
      {
        deviceSerial: 'fct_9i8h7g6f',
        name: 'Hangar C',
        isConnected: false,
      },
      {
        deviceSerial: 'bld_9a8b7c6',
        name: 'Entrepôt Principal',
        isConnected: true,
      },
      {
        deviceSerial: 'bld_1a2b3c4d',
        name: 'Terminal 2',
        isConnected: true,
      },
      {
        deviceSerial: 'lab_research_tls001',
        name: 'Laboratoire de recherche de Toulouse - Salle Blanche',
        isConnected: true,
      },
    ]

    await SmartDevice.createMany(devices)
    console.log('Smart devices created successfully')
  }
}
