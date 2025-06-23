import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up() {
    // Remettre la contrainte NOT NULL sur sensor_id
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sensor_id').notNullable().unique().alter()
    })
  }

  public async down() {
    // Remettre la contrainte NOT NULL
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sensor_id').notNullable().unique().alter()
    })
  }
}
