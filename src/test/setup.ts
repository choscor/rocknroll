import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

afterEach(() => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
})
