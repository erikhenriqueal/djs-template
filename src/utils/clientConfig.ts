import fs from 'fs'
import path from 'path'

const cfgPath = path.resolve(process.cwd(), 'clientConfig.json')

function checkCfgPath() {
  if (!fs.existsSync(cfgPath)) throw new Error('Can\'t find \'clientConfig.json\' file')
}
function resolveCfg(callback: (cfgData: {[key: string]: any} | null) => any) {
  const raw = fs.readFileSync(cfgPath, { encoding: 'utf8' })
  let resolved = null
  try {
    resolved = JSON.parse(raw)
  } catch (e) {
    console.error(`[ Utils - clientConfig ] Failed to process 'clientConfig.json'.`)
  }

  return callback(resolved)
}

export function getClientConfig(key?: string): any {
  checkCfgPath()

  return resolveCfg(cfg => {
    if (!cfg) return null
    if (!key) return cfg
    else return cfg[key]
  })
}

export function updateClientConfig(data: {[key: string]: any}): boolean {
  checkCfgPath()

  return resolveCfg(cfg => {
    if (!cfg) return false
    if (Object.getPrototypeOf(cfg) !== Object.prototype) return false

    const newCfg = {
      ...cfg,
      ...data
    }

    try {
      fs.writeFileSync(cfgPath, JSON.stringify(newCfg, null, 2), { encoding: 'utf-8' })
      return true
    } catch (e) {
      return false
    }
  })
}