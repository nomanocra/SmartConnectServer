import type { HttpContext } from '@adonisjs/core/http'

/**
 * Contrôleur pour la documentation des problèmes d'erreur
 * Controller for error problems documentation
 */
export default class ProblemsController {
  /**
   * Affiche la documentation complète des types d'erreur
   * Display complete documentation of error types
   */
  async index({ response }: HttpContext) {
    const problems = {
      title: 'SmartConnect IoT API - Error Problems Documentation',
      description: "Documentation complète des types d'erreur retournés par l'API SmartConnect IoT",
      version: '1.0.0',
      baseUrl: '/problems',
      problems: {
        'generic-error': {
          title: 'Generic Error',
          description: 'Erreur générique non spécifiée',
          status: '400-599',
          detail: "Une erreur générique s'est produite",
          example: {
            type: '/problems/generic-error',
            title: 'Generic Error',
            status: 500,
            detail: "Une erreur inattendue s'est produite",
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'validation-error': {
          title: 'Validation Error',
          description: 'Erreur de validation des paramètres de la requête',
          status: '400',
          detail: 'Les données fournies ne respectent pas les règles de validation',
          fields: ['field', 'value'],
          example: {
            type: '/problems/validation-error',
            title: 'Validation Error',
            status: 400,
            detail: 'Le champ "email" doit être une adresse email valide',
            field: 'email',
            value: 'invalid-email',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'authentication-error': {
          title: 'Authentication Error',
          description: "Erreur d'authentification - token manquant ou invalide",
          status: '401',
          detail: 'Authentification requise ou échouée',
          example: {
            type: '/problems/authentication-error',
            title: 'Authentication Error',
            status: 401,
            detail: "Token d'accès manquant ou expiré",
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'authorization-error': {
          title: 'Authorization Error',
          description: "Erreur d'autorisation - permissions insuffisantes",
          status: '403',
          detail: "L'utilisateur n'a pas les permissions nécessaires",
          example: {
            type: '/problems/authorization-error',
            title: 'Authorization Error',
            status: 403,
            detail: 'Accès refusé à cette ressource',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'not-found-error': {
          title: 'Resource Not Found',
          description: 'Ressource demandée non trouvée',
          status: '404',
          detail: "La ressource spécifiée n'existe pas",
          fields: ['resourceType'],
          example: {
            type: '/problems/not-found-error',
            title: 'Resource Not Found',
            status: 404,
            detail: "Device avec l'ID 123 non trouvé",
            resourceType: 'SmartDevice',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'conflict-error': {
          title: 'Resource Conflict',
          description: 'Conflit de ressource - ressource déjà existante',
          status: '409',
          detail: 'La ressource existe déjà ou est en conflit',
          fields: ['resourceType'],
          example: {
            type: '/problems/conflict-error',
            title: 'Resource Conflict',
            status: 409,
            detail: 'Un device avec cette adresse existe déjà',
            resourceType: 'SmartDevice',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'device-error': {
          title: 'Device Error',
          description: 'Erreur liée à un device IoT',
          status: '400',
          detail: 'Erreur de communication ou de configuration du device',
          fields: ['deviceAddress'],
          example: {
            type: '/problems/device-error',
            title: 'Device Error',
            status: 400,
            detail: 'Impossible de communiquer avec le device',
            deviceAddress: '192.168.1.100',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'internal-server-error': {
          title: 'Internal Server Error',
          description: 'Erreur interne du serveur',
          status: '500',
          detail: "Une erreur inattendue s'est produite côté serveur",
          fields: ['errorId'],
          example: {
            type: '/problems/internal-server-error',
            title: 'Internal Server Error',
            status: 500,
            detail: 'Erreur interne du serveur',
            errorId: 'ERR-2024-001',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        'database-error': {
          title: 'Database Error',
          description: 'Erreur de base de données',
          status: '500',
          detail: "Erreur lors d'une opération de base de données",
          fields: ['operation'],
          example: {
            type: '/problems/database-error',
            title: 'Database Error',
            status: 500,
            detail: 'Erreur lors de la sauvegarde des données',
            operation: 'INSERT',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    }

    return response.json(problems)
  }

  /**
   * Affiche la documentation d'un type d'erreur spécifique
   * Display documentation for a specific error type
   */
  async show({ params, response }: HttpContext) {
    const { type } = params

    const problemTypes = {
      'generic-error': {
        title: 'Generic Error',
        description: 'Erreur générique non spécifiée',
        status: '400-599',
        detail: "Une erreur générique s'est produite",
        example: {
          type: '/problems/generic-error',
          title: 'Generic Error',
          status: 500,
          detail: "Une erreur inattendue s'est produite",
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'validation-error': {
        title: 'Validation Error',
        description: 'Erreur de validation des paramètres de la requête',
        status: '400',
        detail: 'Les données fournies ne respectent pas les règles de validation',
        fields: ['field', 'value'],
        example: {
          type: '/problems/validation-error',
          title: 'Validation Error',
          status: 400,
          detail: 'Le champ "email" doit être une adresse email valide',
          field: 'email',
          value: 'invalid-email',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'authentication-error': {
        title: 'Authentication Error',
        description: "Erreur d'authentification - token manquant ou invalide",
        status: '401',
        detail: 'Authentification requise ou échouée',
        example: {
          type: '/problems/authentication-error',
          title: 'Authentication Error',
          status: 401,
          detail: "Token d'accès manquant ou expiré",
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'authorization-error': {
        title: 'Authorization Error',
        description: "Erreur d'autorisation - permissions insuffisantes",
        status: '403',
        detail: "L'utilisateur n'a pas les permissions nécessaires",
        example: {
          type: '/problems/authorization-error',
          title: 'Authorization Error',
          status: 403,
          detail: 'Accès refusé à cette ressource',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'not-found-error': {
        title: 'Resource Not Found',
        description: 'Ressource demandée non trouvée',
        status: '404',
        detail: "La ressource spécifiée n'existe pas",
        fields: ['resourceType'],
        example: {
          type: '/problems/not-found-error',
          title: 'Resource Not Found',
          status: 404,
          detail: "Device avec l'ID 123 non trouvé",
          resourceType: 'SmartDevice',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'conflict-error': {
        title: 'Resource Conflict',
        description: 'Conflit de ressource - ressource déjà existante',
        status: '409',
        detail: 'La ressource existe déjà ou est en conflit',
        fields: ['resourceType'],
        example: {
          type: '/problems/conflict-error',
          title: 'Resource Conflict',
          status: 409,
          detail: 'Un device avec cette adresse existe déjà',
          resourceType: 'SmartDevice',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'device-error': {
        title: 'Device Error',
        description: 'Erreur liée à un device IoT',
        status: '400',
        detail: 'Erreur de communication ou de configuration du device',
        fields: ['deviceAddress'],
        example: {
          type: '/problems/device-error',
          title: 'Device Error',
          status: 400,
          detail: 'Impossible de communiquer avec le device',
          deviceAddress: '192.168.1.100',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'internal-server-error': {
        title: 'Internal Server Error',
        description: 'Erreur interne du serveur',
        status: '500',
        detail: "Une erreur inattendue s'est produite côté serveur",
        fields: ['errorId'],
        example: {
          type: '/problems/internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Erreur interne du serveur',
          errorId: 'ERR-2024-001',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
      'database-error': {
        title: 'Database Error',
        description: 'Erreur de base de données',
        status: '500',
        detail: "Erreur lors d'une opération de base de données",
        fields: ['operation'],
        example: {
          type: '/problems/database-error',
          title: 'Database Error',
          status: 500,
          detail: 'Erreur lors de la sauvegarde des données',
          operation: 'INSERT',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      },
    }

    const problemType = problemTypes[type as keyof typeof problemTypes]

    if (!problemType) {
      return response.status(404).json({
        type: '/problems/not-found-error',
        title: 'Problem Type Not Found',
        status: 404,
        detail: `Le type de problème "${type}" n'existe pas`,
        timestamp: new Date().toISOString(),
      })
    }

    return response.json(problemType)
  }
}
