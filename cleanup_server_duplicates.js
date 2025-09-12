import pg from 'pg'

const { Client } = pg

// Configuration de la base de données de production
const dbConfig = {
  host: '127.0.0.1',
  port: 5432,
  user: 'loma6179_root',
  password: 'smartconnectserver_password0',
  database: 'loma6179_scDataBase',
}

async function cleanupServerDuplicates() {
  const client = new Client(dbConfig)
  try {
    await client.connect()
    console.log('🔌 Connecté à la base de données PostgreSQL de production')

    console.log('🧹 Début du nettoyage de TOUS les doublons de timestamp...')

    // 1. Identifier TOUS les doublons de timestamp (même sensor_id + recorded_at, peu importe la valeur)
    console.log('\n🔍 Recherche de TOUS les doublons de timestamp...')
    const duplicatesResult = await client.query(`
      SELECT
        sensor_id,
        recorded_at,
        COUNT(*) as count,
        array_agg(id ORDER BY created_at DESC) as ids
      FROM sensor_histories
      GROUP BY sensor_id, recorded_at
      HAVING COUNT(*) > 1
      ORDER BY sensor_id, recorded_at
    `)

    console.log(`📊 ${duplicatesResult.rows.length} groupes de doublons trouvés`)

    if (duplicatesResult.rows.length === 0) {
      console.log('✅ Aucun doublon trouvé !')
      return
    }

    // 2. Afficher les doublons trouvés
    console.log('\n📋 Détails des doublons:')
    for (const duplicate of duplicatesResult.rows) {
      console.log(
        `   Sensor ${duplicate.sensor_id} | ${duplicate.recorded_at} | ${duplicate.count} occurrences`
      )
    }

    // 3. Supprimer les doublons (garder le plus récent)
    console.log('\n🗑️  Suppression des doublons...')
    let totalDeleted = 0

    for (const duplicate of duplicatesResult.rows) {
      const ids = duplicate.ids
      // Garder le premier ID (le plus récent) et supprimer les autres
      const idsToDelete = ids.slice(1)

      if (idsToDelete.length > 0) {
        const deleteResult = await client.query('DELETE FROM sensor_histories WHERE id = ANY($1)', [
          idsToDelete,
        ])

        totalDeleted += deleteResult.rowCount
        console.log(
          `   ✅ Supprimé ${deleteResult.rowCount} doublons pour sensor ${duplicate.sensor_id} à ${duplicate.recorded_at}`
        )
      }
    }

    console.log(`\n🎯 Nettoyage terminé ! ${totalDeleted} enregistrements supprimés`)

    // 4. Vérification finale
    console.log('\n🔍 Vérification finale...')
    const remainingResult = await client.query(`
      SELECT
        sensor_id,
        recorded_at,
        COUNT(*) as count
      FROM sensor_histories
      GROUP BY sensor_id, recorded_at
      HAVING COUNT(*) > 1
    `)

    if (remainingResult.rows.length === 0) {
      console.log('✅ Aucun doublon restant !')
    } else {
      console.log(`⚠️  ${remainingResult.rows.length} groupes de doublons restants`)
    }

    // 5. Statistiques finales
    const totalResult = await client.query('SELECT COUNT(*) as total FROM sensor_histories')
    console.log(`\n📊 Total d'enregistrements en base: ${totalResult.rows[0].total}`)
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message)
    console.error(error.stack)
  } finally {
    await client.end()
    console.log('🔌 Déconnecté de la base de données')
  }
}

cleanupServerDuplicates()
