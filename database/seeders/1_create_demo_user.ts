import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class CreateDemoUserSeeder extends BaseSeeder {
  async run() {
    // Supprimer l'utilisateur existant s'il existe
    await User.query().where('email', 'demo@smartconnectiot.com').delete()

    // Créer un nouvel utilisateur
    await User.create({
      email: 'demo@smartconnectiot.com',
      password: 'demo1234',
      fullName: 'Demo User',
      role: 'admin',
      organisationName: 'SmartConnect IoT',
    })

    console.log('Demo user created successfully')
  }
}
