import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { getUnitConversionFactor } from '../src/lib/satuan.ts'

describe('Satuan unit conversion logic', () => {
  test('converts identical units with factor 1', () => {
    assert.equal(getUnitConversionFactor('kg', 'kg'), 1)
    assert.equal(getUnitConversionFactor('gram', 'gram'), 1)
    assert.equal(getUnitConversionFactor('liter', 'liter'), 1)
  })

  test('converts mass units correctly (kg, gram, mg)', () => {
    // 1 kg = 1000 gram
    assert.equal(getUnitConversionFactor('kg', 'gram'), 1000)
    // 1 gram = 0.001 kg
    assert.equal(getUnitConversionFactor('gram', 'kg'), 0.001)
    // 1 gram = 1000 mg
    assert.equal(getUnitConversionFactor('gram', 'mg'), 1000)
  })

  test('converts volume units correctly (liter, ml)', () => {
    // 1 liter = 1000 ml
    assert.equal(getUnitConversionFactor('liter', 'ml'), 1000)
    // 1 ml = 0.001 liter
    assert.equal(getUnitConversionFactor('ml', 'liter'), 0.001)
  })

  test('returns 1 for incompatible or unknown units as fallback', () => {
    assert.equal(getUnitConversionFactor('pcs', 'kg'), 1)
    assert.equal(getUnitConversionFactor('butir', 'liter'), 1)
  })
})
