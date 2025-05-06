import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserDeviceMapping extends BaseModel {
  static table = 'device_mappings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organisationName: string

  @column()
  declare mapping: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
