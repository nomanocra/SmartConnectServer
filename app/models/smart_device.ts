import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Sensor from './sensor.js'

export default class SmartDevice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare deviceId: string

  @column()
  declare isConnected: boolean

  @hasMany(() => Sensor)
  declare sensors: HasMany<typeof Sensor>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
