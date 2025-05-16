import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sensor from './sensor.js'

export default class SensorHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sensorId: number

  @column()
  declare value: string

  @column.dateTime()
  declare recordedAt: DateTime

  @belongsTo(() => Sensor)
  declare sensor: BelongsTo<typeof Sensor>

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
