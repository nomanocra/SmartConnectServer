import { BaseCommand } from '@adonisjs/core/ace'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class FixSensors extends BaseCommand {
  static commandName = 'fix:sensors'
  static description = 'Fix existing sensors structure'

  async run() {
    try {
      this.logger.info('🔧 Début de la correction des capteurs existants...')

      // Récupérer tous les capteurs
      const sensors = await db.from('sensors').select('*')
      this.logger.info(`📊 ${sensors.length} capteurs trouvés`)

      let updatedCount = 0

      for (const sensor of sensors) {
        // Vérifier si le capteur a l'ancienne structure
        if (sensor.sensor_id && sensor.sensor_id !== sensor.id.toString() && !sensor.type) {
          this.logger.info(
            `🔄 Correction du capteur ${sensor.id}: sensor_id="${sensor.sensor_id}" -> type="${sensor.sensor_id}", sensor_id="${sensor.id}"`
          )

          await db.from('sensors').where('id', sensor.id).update({
            type: sensor.sensor_id,
            sensor_id: sensor.id.toString(),
          })

          updatedCount++
        }
        // Si sensor_id est déjà correct mais type est vide
        else if (sensor.sensor_id === sensor.id.toString() && !sensor.type) {
          this.logger.info(`🔄 Correction du capteur ${sensor.id}: type="${sensor.name}"`)

          await db.from('sensors').where('id', sensor.id).update({
            type: sensor.name,
          })

          updatedCount++
        }
      }

      this.logger.success(`✅ ${updatedCount} capteurs corrigés avec succès`)
    } catch (error) {
      this.logger.error('❌ Erreur lors de la correction:', error)
    }
  }
}
