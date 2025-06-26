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

router.get('/', '#controllers/root_controller.index')

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

// Device mapping routes
router
  .get('/users/device-mapping', '#controllers/device_mapping_controller.getDeviceMapping')
  .use(middleware.auth({ guards: ['api'] }))

router
  .put('/users/device-mapping', '#controllers/device_mapping_controller.updateDeviceMapping')
  .use(middleware.auth({ guards: ['api'] }))

// Device routes
router
  .get('/devices/:id', '#controllers/smart_device_controller.show')
  .use(middleware.auth({ guards: ['api'] }))

router
  .get('/devices', '#controllers/smart_devices_controller.index')
  .use(middleware.auth({ guards: ['api'] }))

router
  .post('/device/pull-data', '#controllers/smart_devices_controller.pullData')
  .use(middleware.auth({ guards: ['api'] }))

router
  .delete('/devices/:id', '#controllers/smart_devices_controller.destroy')
  .use(middleware.auth({ guards: ['api'] }))

// Auto-pull routes
router
  .get('/devices/:id/auto-pull/status', '#controllers/smart_devices_controller.getAutoPullStatus')
  .use(middleware.auth({ guards: ['api'] }))

router
  .get('/devices/auto-pull/status', '#controllers/smart_devices_controller.getAllAutoPullStatus')
  .use(middleware.auth({ guards: ['api'] }))

router
  .get('/sensor-history', '#controllers/sensor_histories_controller.index')
  .use(middleware.auth({ guards: ['api'] }))

router
  .put('/devices/:id', '#controllers/smart_devices_controller.update')
  .use(middleware.auth({ guards: ['api'] }))

// Problems documentation routes
router.get('/problems', '#controllers/problems_controller.index')
router.get('/problems/:type', '#controllers/problems_controller.show')
