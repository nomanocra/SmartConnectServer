import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ErrorResponseService from '../services/error_response_service.js'

export default class UsersController {
  async store({ request, response }: HttpContext) {
    const { email, password, fullName, role, organisationName } = request.only([
      'email',
      'password',
      'fullName',
      'role',
      'organisationName',
    ])

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return ErrorResponseService.conflictError(
          { request, response } as HttpContext,
          'User already exists',
          'User'
        )
      }

      // Créer le nouvel utilisateur
      const user = await User.create({
        email,
        password,
        fullName,
        role,
        organisationName,
      })

      return response.created({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            organisationName: user.organisationName,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error creating user:', error)
      return ErrorResponseService.databaseError(
        { request, response } as HttpContext,
        'Error creating user',
        'create'
      )
    }
  }

  async update({ request, response, auth }: HttpContext) {
    try {
      const { fullName, avatar } = request.only(['fullName', 'avatar'])

      // Récupérer l'utilisateur connecté
      const user = await auth.use('api').getUserOrFail()

      // Mettre à jour le nom et l'avatar si fourni
      user.fullName = fullName
      if (avatar !== undefined) {
        user.avatar = avatar
      }
      await user.save()

      return response.ok({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            organisationName: user.organisationName,
            avatar: user.avatar,
          },
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating user:', error)
      return ErrorResponseService.databaseError(
        { request, response, auth } as HttpContext,
        'Error updating user',
        'update'
      )
    }
  }
}
