import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import SmartDevice from '#models/smart_device'
import UserDevice from '#models/user_device'

export default class extends BaseSeeder {
  async run() {
    // Récupérer l'utilisateur demo
    const demoUser = await User.findByOrFail('email', 'demo@smartconnectiot.com')
    const testUser = await User.findByOrFail('email', 'test@test.com')

    // Récupérer tous les devices
    const devices = await SmartDevice.all()

    if (devices.length === 0) {
      console.log('No devices found to link to users')
      return
    }

    // Associer tous les devices à l'utilisateur demo
    await UserDevice.createMany(
      devices.map((device) => ({
        userId: demoUser.id,
        smartDeviceId: device.id,
      }))
    )

    // Associer les deux premiers devices à l'utilisateur test (si ils existent)
    if (devices.length >= 2) {
      await UserDevice.createMany([
        { userId: testUser.id, smartDeviceId: devices[0].id },
        { userId: testUser.id, smartDeviceId: devices[1].id },
      ])
    } else {
      console.log('Not enough devices to link to test user')
    }
  }
}
