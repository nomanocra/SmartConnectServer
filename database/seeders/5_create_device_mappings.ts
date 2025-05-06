import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import UserDeviceMapping from '#models/user_device_mapping'

export default class extends BaseSeeder {
  async run() {
    // Récupérer les utilisateurs
    const demoUser = await User.findByOrFail('email', 'demo@smartconnectiot.com')
    const testUser = await User.findByOrFail('email', 'test@test.com')

    // Mapping pour l'utilisateur demo (mapping complet)
    const demoMapping = JSON.stringify([
      {
        name: 'Toulouse',
        children: [
          {
            name: 'Site Aero',
            children: [
              {
                deviceSerial: 'fct_1a2b3c4d',
                name: 'Hangar A',
              },
              {
                deviceSerial: 'fct_5e6f7g8h',
                name: 'Hangar B',
              },
              {
                deviceSerial: 'fct_9i8h7g6f',
                name: 'Hangar C',
              },
            ],
          },
          {
            name: 'Centre Logistique',
            children: [
              {
                deviceSerial: 'bld_9a8b7c6',
                name: 'Entrepôt Principal',
              },
            ],
          },
        ],
      },
      {
        name: 'Bordeaux',
        children: [
          {
            name: 'Zone Portuaire',
            children: [
              {
                deviceSerial: 'bld_5e4d3c2b',
                name: 'Terminal 1',
              },
              {
                deviceSerial: 'bld_1a2b3c4d',
                name: 'Terminal 2',
              },
            ],
          },
        ],
      },
      {
        name: 'Marseille',
        children: [
          {
            deviceSerial: 'bld_dock123',
            name: 'Dock A',
          },
          {
            deviceSerial: 'bld_dock456',
            name: 'Dock B',
          },
          {
            deviceSerial: 'bld_dock789',
            name: 'Dock C',
          },
        ],
      },
    ])
    // Mapping pour l'utilisateur test (mapping simplifié)
    const testMapping = JSON.stringify([
      {
        name: 'Bordeaux',
        children: [
          {
            name: 'Zone Portuaire',
            children: [
              {
                deviceSerial: 'bld_5e4d3c2b',
                name: 'Terminal 1',
              },
              {
                deviceSerial: 'bld_1a2b3c4d',
                name: 'Terminal 2',
              },
            ],
          },
        ],
      },
    ])

    // Créer ou mettre à jour les mappings
    await UserDeviceMapping.updateOrCreate({ userId: demoUser.id }, { mapping: demoMapping })

    await UserDeviceMapping.updateOrCreate({ userId: testUser.id }, { mapping: testMapping })

    console.log('Device mappings created successfully')
  }
}
