import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import ErrorResponseService from '../services/error_response_service.js'

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
        status: 'success',
        message: 'Login successful',
        data: {
          type: 'bearer',
          token: token.value.release(),
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            organisationName: user.organisationName,
            avatar: user.avatar,
          },
        },
      })
    } catch (error) {
      return ErrorResponseService.authenticationError(
        { request, response, auth } as HttpContext,
        'Invalid credentials or authentication error'
      )
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    return response.ok({
      status: 'success',
      message: 'Logged out successfully',
    })
  }

  async me({ auth, response }: HttpContext) {
    const user = await auth.use('api').getUserOrFail()
    return response.ok({
      status: 'success',
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
    })
  }
}
