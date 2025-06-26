import type { HttpContext } from '@adonisjs/core/http'

/**
 * Service pour générer des réponses d'erreur conformes au standard RFC 7807
 * Service to generate RFC 7807 compliant error responses
 */
export default class ErrorResponseService {
  private static readonly BASE_URL = '/problems'

  /**
   * Génère une réponse d'erreur conforme au RFC 7807
   * Generate an RFC 7807 compliant error response
   */
  static createProblemResponse(
    ctx: HttpContext,
    status: number,
    title: string,
    detail: string,
    type?: string,
    instance?: string,
    additionalFields?: Record<string, any>
  ) {
    const problem = {
      type: type || `${this.BASE_URL}/generic-error`,
      title,
      status,
      detail,
      instance: instance || ctx.request.url(),
      timestamp: new Date().toISOString(),
      ...additionalFields,
    }

    return ctx.response.status(status).json(problem)
  }

  /**
   * Erreur de validation des paramètres
   * Parameter validation error
   */
  static validationError(ctx: HttpContext, detail: string, field?: string, value?: any) {
    const additionalFields: Record<string, any> = {}

    if (field) {
      additionalFields.field = field
    }

    if (value !== undefined) {
      additionalFields.value = value
    }

    return this.createProblemResponse(
      ctx,
      400,
      'Validation Error',
      detail,
      `${this.BASE_URL}/validation-error`,
      ctx.request.url(),
      additionalFields
    )
  }

  /**
   * Erreur d'authentification
   * Authentication error
   */
  static authenticationError(ctx: HttpContext, detail: string) {
    return this.createProblemResponse(
      ctx,
      401,
      'Authentication Error',
      detail,
      `${this.BASE_URL}/authentication-error`,
      ctx.request.url()
    )
  }

  /**
   * Erreur d'autorisation
   * Authorization error
   */
  static authorizationError(ctx: HttpContext, detail: string) {
    return this.createProblemResponse(
      ctx,
      403,
      'Authorization Error',
      detail,
      `${this.BASE_URL}/authorization-error`,
      ctx.request.url()
    )
  }

  /**
   * Ressource non trouvée
   * Resource not found
   */
  static notFoundError(ctx: HttpContext, detail: string, resourceType?: string) {
    const additionalFields: Record<string, any> = {}

    if (resourceType) {
      additionalFields.resourceType = resourceType
    }

    return this.createProblemResponse(
      ctx,
      404,
      'Resource Not Found',
      detail,
      `${this.BASE_URL}/not-found-error`,
      ctx.request.url(),
      additionalFields
    )
  }

  /**
   * Erreur de conflit (ressource déjà existante)
   * Conflict error (resource already exists)
   */
  static conflictError(ctx: HttpContext, detail: string, resourceType?: string) {
    const additionalFields: Record<string, any> = {}

    if (resourceType) {
      additionalFields.resourceType = resourceType
    }

    return this.createProblemResponse(
      ctx,
      409,
      'Resource Conflict',
      detail,
      `${this.BASE_URL}/conflict-error`,
      ctx.request.url(),
      additionalFields
    )
  }

  /**
   * Erreur de device IoT
   * IoT device error
   */
  static deviceError(ctx: HttpContext, detail: string, deviceAddress?: string) {
    const additionalFields: Record<string, any> = {}

    if (deviceAddress) {
      additionalFields.deviceAddress = deviceAddress
    }

    return this.createProblemResponse(
      ctx,
      400,
      'Device Error',
      detail,
      `${this.BASE_URL}/device-error`,
      ctx.request.url(),
      additionalFields
    )
  }

  /**
   * Erreur interne du serveur
   * Internal server error
   */
  static internalServerError(ctx: HttpContext, detail: string, errorId?: string) {
    const additionalFields: Record<string, any> = {}

    if (errorId) {
      additionalFields.errorId = errorId
    }

    return this.createProblemResponse(
      ctx,
      500,
      'Internal Server Error',
      detail,
      `${this.BASE_URL}/internal-server-error`,
      ctx.request.url(),
      additionalFields
    )
  }

  /**
   * Erreur de base de données
   * Database error
   */
  static databaseError(ctx: HttpContext, detail: string, operation?: string) {
    const additionalFields: Record<string, any> = {}

    if (operation) {
      additionalFields.operation = operation
    }

    return this.createProblemResponse(
      ctx,
      500,
      'Database Error',
      detail,
      `${this.BASE_URL}/database-error`,
      ctx.request.url(),
      additionalFields
    )
  }
}
