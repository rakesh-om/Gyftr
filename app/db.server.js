import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

export const db = mysql.createPool({
  host: process.env.DB_HOST,        // e.g. localhost
  user: process.env.DB_USER,        // phpmyadminuser
  password: process.env.DB_PASSWORD, // Sam@**
  database: process.env.DB_NAME,     // gyftrpay
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };
