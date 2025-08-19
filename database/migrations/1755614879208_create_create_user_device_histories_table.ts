import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_device_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('device_address').notNullable()
      table.string('device_name').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Ensure unique combination of user_id and device_address
      table.unique(['user_id', 'device_address'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
