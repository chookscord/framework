import { uid } from 'uid'

function genId(): string {
  return uid(16)
}

export default genId
