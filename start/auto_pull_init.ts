/*
|--------------------------------------------------------------------------
| Auto-pull initialization
|--------------------------------------------------------------------------
|
| This file is used to initialize auto-pull tasks when the server starts.
|
*/

import AutoPullInitService from '#services/auto_pull_init_service'

// Initialiser les tâches d'auto-pull au démarrage
AutoPullInitService.initializeAutoPulls()

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping auto-pull tasks...')
  AutoPullInitService.stopAllAutoPulls()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping auto-pull tasks...')
  AutoPullInitService.stopAllAutoPulls()
  process.exit(0)
})
