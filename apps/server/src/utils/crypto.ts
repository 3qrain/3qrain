import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken() {
  return randomBytes(32).toString('hex')
}