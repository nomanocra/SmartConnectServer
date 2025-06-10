import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await auth.use('api').createToken(user)

      if (!token.value) {
        throw new Error('Token creation failed')
      }

      return response.ok({
        type: 'bearer',
        token: token.value.release(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          organisationName: user.organisationName,
        },
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Invalid credentials or authentication error',
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    return response.ok({
      message: 'Logged out successfully',
    })
  }

  async me({ auth, response }: HttpContext) {
    const user = await auth.use('api').getUserOrFail()
    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organisationName: user.organisationName,
      },
    })
  }
}
