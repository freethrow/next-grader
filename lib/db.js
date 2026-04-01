import { getClientPromise } from './mongodb'

export async function getDb() {
  const client = await getClientPromise()
  return client.db(process.env.MONGODB_DB_NAME)
}

export async function getCollections() {
  const db = await getDb()
  return {
    users: db.collection('users'),
    students: db.collection('students'),
    essays: db.collection('essays'),
  }
}
