import hash from '@adonisjs/core/services/hash'

async function main() {
  const hashedPassword = await hash.make('demo1234')
  console.log('Hashed password:', hashedPassword)
}

main()
