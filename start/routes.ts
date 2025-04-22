/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'

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

// Device routes
router
  .get('/devices/:id', '#controllers/smart_devices_controller.show')
  .use(middleware.auth({ guards: ['api'] }))
