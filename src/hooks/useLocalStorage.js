import { useState } from 'react'
import { storage } from '../utils/localStorage'

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => storage.get(key, initialValue))

  const updateValue = (nextValue) => {
    const resolvedValue = nextValue instanceof Function ? nextValue(value) : nextValue
    setValue(resolvedValue)
    storage.set(key, resolvedValue)
  }

  return [value, updateValue]
}
