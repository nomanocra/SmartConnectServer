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

async function cleanupServerDuplicatesOptimized() {
  const client = new Client(dbConfig)
  try {
    await client.connect()
    console.log('🔌 Connecté à la base de données PostgreSQL de production')

    console.log('🧹 Début du nettoyage optimisé des doublons de timestamp...')

    // 1. Compter d'abord le nombre total de doublons
    console.log('\n🔍 Comptage des doublons...')
    const countResult = await client.query(`
      SELECT COUNT(*) as total_groups
      FROM (
        SELECT sensor_id, recorded_at
        FROM sensor_histories
        GROUP BY sensor_id, recorded_at
        HAVING COUNT(*) > 1
      ) as duplicates
    `)

    const totalGroups = parseInt(countResult.rows[0].total_groups)
    console.log(`📊 ${totalGroups} groupes de doublons trouvés`)

    if (totalGroups === 0) {
      console.log('✅ Aucun doublon trouvé !')
      return
    }

    // 2. Traiter les doublons par lots de 100
    const batchSize = 100
    let totalDeleted = 0
    let processedGroups = 0

    console.log(`\n🗑️  Suppression des doublons par lots de ${batchSize}...`)

    while (processedGroups < totalGroups) {
      // Récupérer un lot de doublons
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
        LIMIT $1 OFFSET $2
      `, [batchSize, processedGroups])

      if (duplicatesResult.rows.length === 0) {
        break
      }

      console.log(`\n📦 Traitement du lot ${Math.floor(processedGroups / batchSize) + 1} (${duplicatesResult.rows.length} groupes)...`)

      // Supprimer les doublons de ce lot
      for (const duplicate of duplicatesResult.rows) {
        const ids = duplicate.ids
        // Garder le premier ID (le plus récent) et supprimer les autres
        const idsToDelete = ids.slice(1)

        if (idsToDelete.length > 0) {
          const deleteResult = await client.query('DELETE FROM sensor_histories WHERE id = ANY($1)', [
            idsToDelete,
          ])

          totalDeleted += deleteResult.rowCount
        }
      }

      processedGroups += duplicatesResult.rows.length
      console.log(`   ✅ Lot traité: ${duplicatesResult.rows.length} groupes, ${totalDeleted} enregistrements supprimés au total`)

      // Petite pause pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n🎯 Nettoyage terminé ! ${totalDeleted} enregistrements supprimés`)

    // 3. Vérification finale
    console.log('\n🔍 Vérification finale...')
    const remainingResult = await client.query(`
      SELECT COUNT(*) as remaining_groups
      FROM (
        SELECT sensor_id, recorded_at
        FROM sensor_histories
        GROUP BY sensor_id, recorded_at
        HAVING COUNT(*) > 1
      ) as duplicates
    `)

    const remainingGroups = parseInt(remainingResult.rows[0].remaining_groups)
    if (remainingGroups === 0) {
      console.log('✅ Aucun doublon restant !')
    } else {
      console.log(`⚠️  ${remainingGroups} groupes de doublons restants`)
    }

    // 4. Statistiques finales
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

cleanupServerDuplicatesOptimized()
