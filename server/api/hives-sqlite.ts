import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { defineEventHandler } from 'h3'
import path from 'path'

export default defineEventHandler(async () => {
  const dbPath = path.resolve(process.cwd(), 'beevibe-db/beevibe.db') 

  const db: Database = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  const hives = await db.all(`
    SELECT h.uuid, h.name, h.description,
           sr.temperature, sr.humidity, sr.weight, sr.reading_time
    FROM hives h
    LEFT JOIN (
      SELECT hive_uuid, temperature, humidity, weight, MAX(reading_time) as reading_time
      FROM sensor_readings
      GROUP BY hive_uuid
    ) sr ON sr.hive_uuid = h.uuid
  `)

  await db.close()
  return hives
})
