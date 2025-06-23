import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  public async up() {
    // Récupérer tous les capteurs existants
    const sensors = await db.from('sensors').select('*')

    for (const sensor of sensors) {
      // Si sensor_id contient un nom de capteur (comme "Humidity") et type est vide
      if (sensor.sensor_id && sensor.sensor_id !== sensor.id.toString() && !sensor.type) {
        // Déplacer le contenu de sensor_id vers type
        await db.from('sensors').where('id', sensor.id).update({
          type: sensor.sensor_id,
          sensor_id: sensor.id.toString(),
        })
      }
      // Si sensor_id est déjà correct (égal à l'id) mais type est vide
      else if (sensor.sensor_id === sensor.id.toString() && !sensor.type) {
        // Utiliser le nom comme type
        await db.from('sensors').where('id', sensor.id).update({
          type: sensor.name,
        })
      }
    }
  }

  public async down() {
    // Cette migration ne peut pas être annulée de manière sûre
    // car elle modifie la structure des données
    console.log('This migration cannot be safely reverted')
  }
}
