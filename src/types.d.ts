interface Mission {
  type: 0 | 1 | 2 | 3
  state: 0 | 1 | 2
}

interface Message {
  key: string
  name: string
  avatar: string
  text: string
  img?: string
  notice?: boolean
  emoticon?: string
  loading?: boolean
  mission?: Mission
  option?: [boolean]
}

interface MessageListItem {
  time: number
  id: number
  title?: string
  list: Message[]
}

interface Character {
  name: string
  avatar: string
  card: string
  info?: string
}

type OtherCharacter = Omit<Character, 'card'> & { gold?: boolean }

type CustomCharacter = Omit<Character, 'card'> & { custom: true }

interface Emoticon {
  title: string
  url: string
}

interface UserAvatar {
  avatar: string
  card?: string
}
