import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'smart_devices'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('device_serial').notNullable().unique()
      table.string('name').notNullable()
      table.boolean('is_connected').notNullable().defaultTo(false)

      // Champs pour l'auto-pull
      table.boolean('auto_pull').notNullable().defaultTo(false)
      table.integer('update_stamp').notNullable().defaultTo(10)
      table.string('auto_pull_username').nullable()
      table.string('auto_pull_password').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
