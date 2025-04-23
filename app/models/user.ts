import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { ManyToMany, HasOne } from '@adonisjs/lucid/types/relations'
import SmartDevice from './smart_device.js'
import UserDeviceMapping from './user_device_mapping.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: string

  @column()
  declare organisationName: string | null

  @manyToMany(() => SmartDevice, {
    pivotTable: 'user_devices',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'smart_device_id',
  })
  declare devices: ManyToMany<typeof SmartDevice>

  @hasOne(() => UserDeviceMapping)
  declare deviceMapping: HasOne<typeof UserDeviceMapping> | null

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
