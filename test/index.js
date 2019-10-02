/* eslint-env mocha */

import path from 'path'
import fs from 'fs'
import assert from 'assert'
import { transformFileSync } from '@babel/core'

import plugin from '../src'

const moduleDir = '/actual/'
const babelOptions = {
  presets: [
    ['@babel/env', { modules: false }],
    ['@babel/react']
  ],
  plugins: [
    [plugin, { moduleDir }]
  ],
  babelrc: false
}

describe('Re-exports given module', () => {
  const pkgDir = path.join(__dirname, 'fixtures', moduleDir, 'dummy-pkg')
  const expDir = path.join(__dirname, 'fixtures', 'expected', 'dummy-pkg')

  fs.readdirSync(pkgDir)
    .filter(d => !d.startsWith('.'))
    .map((dirName) => {
      it(`should re-export ${dirName}`, () => {
        const actualPath = path.join(pkgDir, dirName, 'actual.js')
        const expectedPath = path.join(expDir, dirName, 'expected.js')

        const actual = transformFileSync(actualPath, babelOptions).code
        const expected = fs.readFileSync(expectedPath, 'utf8')

        assert.strictEqual(actual.trim(), expected.trim())
      })
    })
})
