import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_mappings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
