import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import ErrorResponseService from '../services/error_response_service.js'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Gestion des erreurs HTTP standard
    if (error instanceof Error) {
      // Erreur de validation AdonisJS
      if (error.name === 'E_VALIDATION_ERROR') {
        return ErrorResponseService.validationError(
          ctx,
          'One or more validation rules failed',
          undefined,
          undefined
        )
      }

      // Erreur d'authentification AdonisJS
      if (error.name === 'E_UNAUTHORIZED_ACCESS') {
        return ErrorResponseService.authenticationError(
          ctx,
          'Authentication required to access this resource'
        )
      }

      // Erreur de ressource non trouvée AdonisJS
      if (error.name === 'E_ROW_NOT_FOUND') {
        return ErrorResponseService.notFoundError(ctx, 'The requested resource was not found')
      }

      // Erreur de base de données
      if (error.name === 'E_DATABASE_ERROR') {
        return ErrorResponseService.databaseError(
          ctx,
          'A database error occurred while processing your request'
        )
      }
    }

    // Pour les autres erreurs, utiliser le gestionnaire par défaut
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
