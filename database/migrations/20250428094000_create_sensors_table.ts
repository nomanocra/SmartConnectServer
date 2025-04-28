import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('sensor_id').notNullable().unique()
      table
        .integer('smart_device_id')
        .unsigned()
        .references('id')
        .inTable('smart_devices')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('nom').notNullable()
      table.string('type').notNullable()
      table.string('value').notNullable()
      table.string('unit')
      table.boolean('is_alert').defaultTo(false)
      table.timestamp('last_update')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
