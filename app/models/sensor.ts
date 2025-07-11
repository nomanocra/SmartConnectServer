import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SmartDevice from './smart_device.js'
import SensorHistory from './sensor_history.js'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensor_id: string

  @column()
  declare smartDeviceId: string

  @column()
  declare name: string

  @column()
  declare nom: string

  @column()
  declare type: string

  @column()
  declare value: string

  @column()
  declare unit: string | null

  @column()
  declare isAlert: boolean

  @column.dateTime({ autoCreate: false, autoUpdate: false })
  declare lastUpdate: DateTime | null

  @belongsTo(() => SmartDevice)
  declare smartDevice: BelongsTo<typeof SmartDevice>

  @hasMany(() => SensorHistory)
  declare history: HasMany<typeof SensorHistory>

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
