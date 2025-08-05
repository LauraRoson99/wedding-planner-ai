export type Guest = {
  name: string
  group: string
  color: string
}

export type Group = {
  id: number
  name: string
  guestsCount: number
}

export type Table = {
  id: number
  name: string
  guests: Guest[]
}
