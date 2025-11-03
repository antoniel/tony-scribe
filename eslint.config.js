//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    extends: ['plugin:eslint-plugin-ts/recommended'],
    rules: {
      'import/order': 'off'
    }
  }
]
