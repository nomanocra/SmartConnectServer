import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.create({
      email: 'test@example.com',
      password: await hash.make('password123'),
      fullName: 'Test User',
      role: 'admin',
      organisationName: 'Test Organisation',
    })
  }
}
