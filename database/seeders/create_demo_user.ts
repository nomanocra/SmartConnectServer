import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class CreateDemoUserSeeder extends BaseSeeder {
  async run() {
    // Supprimer l'utilisateur existant s'il existe
    await User.query().where('email', 'demo@smartconnectiot.com').delete()

    // Créer un nouvel utilisateur avec le mot de passe hashé
    await User.create({
      email: 'demo@smartconnectiot.com',
      password: await hash.make('demo1234'),
      fullName: 'Demo User',
      role: 'admin',
      organisationName: 'SmartConnect IoT',
    })

    console.log('Demo user created successfully')
  }
}
