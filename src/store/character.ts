import { gameCharacter, otherCharacter, user } from '@/assets/data/characterData'
import { setLoadingType } from '@/assets/scripts/setup'
import { computed, nextTick, reactive, toRaw, watch } from 'vue'
import { setting } from './setting'

const character = reactive<{
  game: { [name: string]: Character }
  other: { [name: string]: OtherCharacter }
  custom: { [name: string]: CustomCharacter }
  avatar: { [name: string]: UserAvatar }
  customAvatar: string[]
}>({
  game: gameCharacter,
  other: otherCharacter,
  custom: {},
  avatar: user,
  customAvatar: []
})

const userData = computed(() => {
  const key = setting.avatar
  if (typeof key === 'string' && character.avatar[key]) {
    return {
      avatar: character.avatar[key].avatar,
      card: character.avatar[key].card
    }
  }
  if (typeof key === 'number' && character.customAvatar[key]) {
    return {
      avatar: character.customAvatar[key]
    }
  }
  return {
    avatar: character.avatar[DEFAULT_AVATAR].avatar,
    card: character.avatar[DEFAULT_AVATAR].card
  }
})

const setCustomWatch = () => {
  setLoadingType('character')
  watch(character.custom, () => {
    nextTick(() => {
      updateDB(0, toRaw(character.custom))
    })
  })
}

const setAvatarWatch = () => {
  setLoadingType('avatar')
  watch(character.customAvatar, () => {
    nextTick(() => {
      updateDB(1, toRaw(character.customAvatar))
    })
  })
}

let hasDB = true
let db: IDBDatabase

interface UpdateDB {
  (id: 0, data: { [name: string]: CustomCharacter }): void
  (id: 1, data: string[]): void
}

export const updateDB: UpdateDB = (id, data) => {
  db.transaction('data', 'readwrite').objectStore('data').put({
    id,
    data
  })
}

export const getDB = () => {
  console.log('GET - SR Custom indexDB...')
  const _db = window.indexedDB.open('sr-custom')
  _db.onsuccess = (event) => {
    db = (event.target as IDBOpenDBRequest).result
    if (hasDB) {
      db.transaction('data', 'readonly').objectStore('data').get(0).onsuccess = (e) => {
        try {
          const data = (e.target as IDBRequest).result?.data
          if (typeof data === 'string') {
            character.custom = JSON.parse(data)
          } else {
            character.custom = data || {}
          }
        } finally {
          setCustomWatch()
        }
      }

      db.transaction('data', 'readonly').objectStore('data').get(1).onsuccess = (e) => {
        try {
          const data = (e.target as IDBRequest).result?.data
          character.customAvatar = data || []
        } finally {
          setAvatarWatch()
        }
      }
    } else {
      updateDB(0, toRaw(character.custom))
      updateDB(1, toRaw(character.customAvatar))
      setCustomWatch()
      setAvatarWatch()
    }
  }

  _db.onupgradeneeded = (event) => {
    db = (event.target as IDBOpenDBRequest).result
    if (!db.objectStoreNames.contains('data')) {
      hasDB = false
      db.createObjectStore('data', { keyPath: 'id' })
    }
  }
}

try {
  getDB()
} catch (err) {
  console.error(err)
  setLoadingType('character', true)
  setLoadingType('avatar', true)
}

export { character, userData }
