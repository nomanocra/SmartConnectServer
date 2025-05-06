import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_mappings'

  async up() {
    // Supprimer l'ancienne table si elle existe
    await this.schema.dropTableIfExists(this.tableName)

    // Créer la nouvelle table
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('organisation_name').notNullable()
      table.text('mapping').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
