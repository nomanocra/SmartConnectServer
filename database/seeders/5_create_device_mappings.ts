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
        id: 'cty_7f8e9d0c',
        name: 'Toulouse',
        children: [
          {
            id: 'ste_aero123',
            name: 'Site Aero',
            children: [
              {
                id: 'fct_1a2b3c4d',
                name: 'Hangar A',
                deviceSerial: 'ZFR52036JI',
              },
              {
                id: 'fct_5e6f7g8h',
                name: 'Hangar B',
                deviceSerial: 'ZFR52037JI',
              },
              {
                id: 'fct_9i8h7g6f',
                name: 'Hangar C',
                deviceSerial: 'ZFR52042JI',
              },
            ],
          },
          {
            id: 'ste_log789',
            name: 'Centre Logistique',
            children: [
              {
                id: 'bld_9a8b7c6',
                name: 'Entrepôt Principal',
                deviceSerial: 'ZFR52038JI',
              },
            ],
          },
        ],
      },
    ])

    // Mapping pour l'utilisateur test (mapping simplifié)
    const testMapping = JSON.stringify([
      {
        id: 'cty_9i8h7g6f',
        name: 'Bordeaux',
        children: [
          {
            id: 'ste_port123',
            name: 'Zone Portuaire',
            children: [
              {
                id: 'bld_5e4d3c2b',
                name: 'Terminal 1',
                deviceSerial: 'ZFR52034JI',
              },
              {
                id: 'bld_1a2b3c4d',
                name: 'Terminal 2',
                deviceSerial: 'ZFR52035JI',
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
