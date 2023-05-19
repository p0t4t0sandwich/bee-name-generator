import { Db, MongoClient } from "mongodb";

const connectionString: string = <string>process.env.MONGODB_URI;
const databaseName: string = <string>process.env.MONGODB_DB;

const client = new MongoClient(connectionString);

const conn: MongoClient = await client.connect();
export const mongo: Db = conn.db(databaseName);
