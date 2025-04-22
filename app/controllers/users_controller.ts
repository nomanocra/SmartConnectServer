import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

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
        return response.badRequest({
          message: 'User already exists',
        })
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
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          organisationName: user.organisationName,
        },
      })
    } catch (error) {
      console.error('Error creating user:', error)
      return response.badRequest({
        message: 'Error creating user',
        error: error.message,
      })
    }
  }

  async update({ request, response, auth }: HttpContext) {
    try {
      const { fullName } = request.only(['fullName'])

      // Récupérer l'utilisateur connecté
      const user = await auth.use('api').getUserOrFail()

      // Mettre à jour le nom
      user.fullName = fullName
      await user.save()

      return response.ok({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          organisationName: user.organisationName,
        },
      })
    } catch (error) {
      console.error('Error updating user:', error)
      return response.badRequest({
        message: 'Error updating user',
        error: error.message,
      })
    }
  }
}
