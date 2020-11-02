/* eslint-env mocha */

import path from 'path'
import glob from 'glob'
import fs from 'fs'
import assert from 'assert'
import {
  transformFileSync
} from '@babel/core'

import plugin from '../src'

const moduleDir = '/actual/'
const babelOptions = {
  presets: [
    ['@babel/env', {
      modules: false
    }],
    ['@babel/react']
  ],
  plugins: [
    [plugin, {
      moduleDir,
      ignore: /index.js$/
    }]
  ],
  sourceType: 'unambiguous',
  babelrc: false
}

describe('Re-exports given cjs pkg', () => {
  const pkgDir = path.join(__dirname, 'fixtures', moduleDir, 'cjs')
  const expDir = path.join(__dirname, 'fixtures', 'expected', 'cjs')

  glob
    .sync('*/*', {
      cwd: pkgDir
    })
    .filter(d => !d.startsWith('.'))
    .forEach((file) => {
      it(`should re-export ${file}`, () => {
        const actualPath = path.join(pkgDir, file)
        const expectedPath = path.join(expDir, path.dirname(file), 'expected.js')

        const actual = transformFileSync(actualPath, babelOptions).code
        const expected = fs.readFileSync(expectedPath, 'utf8')

        assert.strictEqual(actual.trim(), expected.trim())
      })
    })
})

describe('Re-exports given es pkg', () => {
  const pkgDir = path.join(__dirname, 'fixtures', moduleDir, 'esm')
  const expDir = path.join(__dirname, 'fixtures', 'expected', 'esm')

  glob
    .sync('*/*', {
      cwd: pkgDir
    })
    .filter(d => !d.startsWith('.'))
    .forEach((file) => {
      it(`should re-export ${file}`, () => {
        const actualPath = path.join(pkgDir, file)
        const expectedPath = path.join(expDir, path.dirname(file), 'expected.js')

        const actual = transformFileSync(actualPath, babelOptions).code
        const expected = fs.readFileSync(expectedPath, 'utf8')
        console.log('test actions')
        assert.strictEqual(actual.trim(), expected.trim())
      })
    })
})
