import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Sensor from './sensor.js'
import User from './user.js'

export default class SmartDevice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare deviceSerial: string

  @column()
  declare name: string

  @column()
  declare isConnected: boolean

  @column()
  declare autoPull: boolean

  @column()
  declare updateStamp: number

  @column()
  declare autoPullUsername: string | null

  @column()
  declare autoPullPassword: string | null

  @hasMany(() => Sensor)
  declare sensors: HasMany<typeof Sensor>

  @manyToMany(() => User, {
    pivotTable: 'user_devices',
    pivotForeignKey: 'smart_device_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
