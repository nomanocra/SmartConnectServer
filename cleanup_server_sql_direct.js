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

async function cleanupServerSQLDirect() {
  const client = new Client(dbConfig)
  try {
    await client.connect()
    console.log('🔌 Connecté à la base de données PostgreSQL de production')

    console.log('🧹 Début du nettoyage avec requêtes SQL directes...')

    // 1. Compter les doublons
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

    // 2. Supprimer les doublons avec une requête SQL directe
    console.log('\n🗑️  Suppression des doublons avec requête SQL directe...')
    
    const deleteResult = await client.query(`
      DELETE FROM sensor_histories 
      WHERE id NOT IN (
        SELECT DISTINCT ON (sensor_id, recorded_at) id
        FROM sensor_histories
        ORDER BY sensor_id, recorded_at, created_at DESC
      )
    `)

    const totalDeleted = deleteResult.rowCount
    console.log(`✅ ${totalDeleted} enregistrements supprimés`)

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

cleanupServerSQLDirect()
