import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const isHidden = false
    expect(cn('a', isHidden && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('merges conflicting tailwind classes, keeping the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
