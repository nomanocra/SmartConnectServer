import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UpdatePasswordSeeder extends BaseSeeder {
  async run() {
    const user = await User.findBy('email', 'demo@smartconnectiot.com')
    if (user) {
      user.password = await hash.make('demo1234')
      await user.save()
      console.log('Password updated successfully')
    } else {
      console.log('User not found')
    }
  }
}
