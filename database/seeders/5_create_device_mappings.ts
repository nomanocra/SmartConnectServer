import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import UserDeviceMapping from '#models/user_device_mapping'

export default class extends BaseSeeder {
  async run() {
    // Récupérer les utilisateurs pour obtenir leurs organisations
    const demoUser = await User.findByOrFail('email', 'demo@smartconnectiot.com')
    const testUser = await User.findByOrFail('email', 'test@test.com')

    if (!demoUser.organisationName || !testUser.organisationName) {
      console.log('Users must have an organisation name')
      return
    }

    // Mapping pour l'organisation SmartConnect (mapping complet)
    const smartConnectMapping = JSON.stringify([
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
        name: 'Toulouse',
        children: [
          {
            deviceSerial: 'lab_research_tls001',
            name: 'Laboratoire de recherche de Toulouse - Salle Blanche',
          },
        ],
      },
    ])

    // Créer les mappings
    await UserDeviceMapping.createMany([
      {
        organisationName: demoUser.organisationName,
        mapping: smartConnectMapping,
      },
    ])

    console.log('Device mappings created successfully')
  }
}
