/**
 * Shared Firebase Admin SDK bootstrap for ops scripts.
 *
 * Resolves credentials in this order:
 *   1. GOOGLE_APPLICATION_CREDENTIALS env var
 *   2. ./service-account.json at the repo root
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'

const SERVICE_ACCOUNT_PATH = resolve(process.cwd(), 'service-account.json')

export function buildAppOptions() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { credential: applicationDefault() }
  }
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    const json = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))
    return { credential: cert(json), projectId: json.project_id as string }
  }
  console.error(
    'Missing service account credentials.\n' +
      'Either set GOOGLE_APPLICATION_CREDENTIALS, or save the service\n' +
      'account JSON as ./service-account.json (gitignored).\n' +
      'Firebase Console → Project Settings → Service Accounts →\n' +
      '"Generate new private key" downloads the JSON for you.',
  )
  process.exit(2)
}

export function initAdminApp() {
  initializeApp(buildAppOptions())
}
