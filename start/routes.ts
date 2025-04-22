/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'Welcome to SmartConnectServer API',
  }
})

// Auth routes
router.post('/auth/login', '#controllers/auth_controller.login')
router
  .post('/auth/logout', '#controllers/auth_controller.logout')
  .use(middleware.auth({ guards: ['api'] }))
router.get('/auth/me', '#controllers/auth_controller.me').use(middleware.auth({ guards: ['api'] }))

// User routes
router.post('/users', '#controllers/users_controller.store')
router
  .put('/users/update', '#controllers/users_controller.update')
  .use(middleware.auth({ guards: ['api'] }))
