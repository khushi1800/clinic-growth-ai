/**
 * WHITE BOX UNIT TESTS: Mock Provider Extraction Functions
 * Tests: extractPhone, extractName, extractDatePreference, extractTimePreference, extractBranch
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  extractPhone,
  extractName,
  extractDatePreference,
  extractTimePreference,
  extractBranch,
} from '../../src/lib/ai/mock-provider.js'
import type { ClinicBranchContext } from '../../src/lib/ai/types.js'

// ═══════════════════════ extractPhone ═══════════════════════

test('extractPhone: extracts plain 10-digit Indian mobile (starts with 6-9)', () => {
  assert.equal(extractPhone('call me at 9876543210 please'), '9876543210')
})

test('extractPhone: extracts +91 prefixed number without spaces', () => {
  assert.equal(extractPhone('my number is +919876543210'), '+919876543210')
})

test('extractPhone: extracts +91 prefixed number with dash', () => {
  assert.equal(extractPhone('reach me on +91-9876543210'), '+919876543210')
})

test('extractPhone: extracts number with spaces between digits', () => {
  assert.equal(extractPhone('phone: 98765 43210'), '9876543210')
})

test('extractPhone: returns null for number starting with 1-5 (non-Indian mobile)', () => {
  assert.equal(extractPhone('my number is 1234567890'), null)
})

test('extractPhone: returns null for short number (less than 10 digits)', () => {
  assert.equal(extractPhone('call 98765'), null)
})

test('extractPhone: returns null when no number present', () => {
  assert.equal(extractPhone('I want to book an appointment'), null)
})

test('extractPhone: extracts first valid number when multiple present', () => {
  const result = extractPhone('home: 9876543210 or office: 8765432109')
  assert.equal(result, '9876543210')
})

// ═══════════════════════ extractName ═══════════════════════

test('extractName: "my name is Rahul Sharma"', () => {
  assert.equal(extractName('my name is Rahul Sharma'), 'Rahul Sharma')
})

test('extractName: "naam hai Priya"', () => {
  assert.equal(extractName('naam hai Priya'), 'Priya')
})

test('extractName: "mera naam Vikram Singh"', () => {
  assert.equal(extractName('mera naam Vikram Singh'), 'Vikram Singh')
})

test('extractName: "I am Khushbu Joshi"', () => {
  assert.equal(extractName('I am Khushbu Joshi'), 'Khushbu Joshi')
})

test('extractName: "call me Aarav"', () => {
  assert.equal(extractName('call me Aarav'), 'Aarav')
})

test('extractName: "this is Neha Kapoor"', () => {
  assert.equal(extractName('this is Neha Kapoor'), 'Neha Kapoor')
})

test('extractName: rejects reserved word "maya" (AI persona)', () => {
  assert.equal(extractName('my name is Maya'), null)
})

test('extractName: rejects reserved word "doctor"', () => {
  assert.equal(extractName('I am doctor'), null)
})

test('extractName: rejects reserved word "bot"', () => {
  assert.equal(extractName('I am bot'), null)
})

test('extractName: rejects reserved word "assistant"', () => {
  assert.equal(extractName('I am assistant'), null)
})

test('extractName: rejects reserved word "looking"', () => {
  assert.equal(extractName('I am looking for a dentist'), null)
})

test('extractName: returns null when no name pattern found', () => {
  assert.equal(extractName('what is the cost of RCT?'), null)
})

test('extractName: extracts name before phone number pattern "Khushbu Joshi, 8511125090"', () => {
  assert.equal(extractName('Khushbu Joshi, 8511125090'), 'Khushbu Joshi')
})

test('extractName: extracts clean 2-word name on its own line', () => {
  assert.equal(extractName('Amit Patel'), 'Amit Patel')
})

// ═══════════════════════ extractDatePreference ═══════════════════════

test('extractDatePreference: "today"', () => {
  assert.equal(extractDatePreference('I want to come today'), 'Today')
})

test('extractDatePreference: "aaj" (Hindi for today)', () => {
  assert.equal(extractDatePreference('aaj aa sakta hoon'), 'Today')
})

test('extractDatePreference: "tomorrow"', () => {
  assert.equal(extractDatePreference('can I come tomorrow?'), 'Tomorrow')
})

test('extractDatePreference: "kal" (Hindi for tomorrow)', () => {
  assert.equal(extractDatePreference('kal subah chalega'), 'Tomorrow')
})

test('extractDatePreference: "day after tomorrow" (BUG-003: "tomorrow" checked before "day after tomorrow")', { todo: 'BUG-003: extractDatePreference checks includes("tomorrow") before includes("day after tomorrow")' }, () => {
  assert.equal(extractDatePreference('day after tomorrow works for me'), 'Day After Tomorrow')
})

test('extractDatePreference: "parso" (Hindi for day after tomorrow)', () => {
  assert.equal(extractDatePreference('parso book kardo'), 'Day After Tomorrow')
})

test('extractDatePreference: "saturday"', () => {
  assert.equal(extractDatePreference('I prefer saturday'), 'Saturday')
})

test('extractDatePreference: "shanivar" (Hindi for Saturday)', () => {
  assert.equal(extractDatePreference('shanivar ko milte hain'), 'Saturday')
})

test('extractDatePreference: "sunday"', () => {
  assert.equal(extractDatePreference('is the clinic open on sunday?'), 'Sunday')
})

test('extractDatePreference: "ravivar" (Hindi for Sunday)', () => {
  assert.equal(extractDatePreference('ravivar chalega'), 'Sunday')
})

test('extractDatePreference: "monday"', () => {
  assert.equal(extractDatePreference('monday morning works'), 'Monday')
})

test('extractDatePreference: "somvar" (Hindi for Monday)', () => {
  assert.equal(extractDatePreference('somvar ko aana chahta hoon'), 'Monday')
})

test('extractDatePreference: specific date "15th Nov"', () => {
  assert.equal(extractDatePreference('book for 15th Nov please'), '15th Nov')
})

test('extractDatePreference: specific date "3rd January"', () => {
  assert.equal(extractDatePreference('appointment on 3rd January'), '3rd January')
})

test('extractDatePreference: returns null when no date in text', () => {
  assert.equal(extractDatePreference('what is the cost of cleaning?'), null)
})

// ═══════════════════════ extractTimePreference ═══════════════════════

test('extractTimePreference: "morning"', () => {
  assert.equal(extractTimePreference('morning works for me'), 'Morning (10:00 AM - 01:00 PM)')
})

test('extractTimePreference: "subah" (Hindi for morning)', () => {
  assert.equal(extractTimePreference('subah ka slot chahiye'), 'Morning (10:00 AM - 01:00 PM)')
})

test('extractTimePreference: "afternoon"', () => {
  assert.equal(extractTimePreference('afternoon slot please'), 'Afternoon (01:00 PM - 04:00 PM)')
})

test('extractTimePreference: "dophar" (Hindi for afternoon)', () => {
  assert.equal(extractTimePreference('dophar ko milna hai'), 'Afternoon (01:00 PM - 04:00 PM)')
})

test('extractTimePreference: "evening"', () => {
  assert.equal(extractTimePreference('I prefer evening'), 'Evening (05:00 PM - 08:30 PM)')
})

test('extractTimePreference: "shaam" (Hindi for evening)', () => {
  assert.equal(extractTimePreference('shaam ko book karo'), 'Evening (05:00 PM - 08:30 PM)')
})

test('extractTimePreference: specific time "5pm"', () => {
  assert.equal(extractTimePreference('I will come at 5pm'), '5PM')
})

test('extractTimePreference: specific time "11:30 AM"', () => {
  assert.equal(extractTimePreference('please book 11:30 AM'), '11:30 AM')
})

test('extractTimePreference: returns null when no time in text', () => {
  assert.equal(extractTimePreference('I want to book an appointment'), null)
})

// ═══════════════════════ extractBranch ═══════════════════════

const testBranches: ClinicBranchContext[] = [
  {
    id: 'branch-01',
    name: 'Indiranagar Main Clinic',
    address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    phone: '+91 98450 12345',
    isMain: true,
  },
  {
    id: 'branch-02',
    name: 'Koramangala Center',
    address: '80 Feet Road, 4th Block, Koramangala',
    city: 'Bengaluru',
    phone: '+91 98450 12346',
    isMain: false,
  },
]

test('extractBranch: matches by branch name keyword "indiranagar"', () => {
  assert.equal(extractBranch('I want to come to indiranagar', testBranches), 'Indiranagar Main Clinic')
})

test('extractBranch: matches by branch name keyword "koramangala"', () => {
  assert.equal(extractBranch('koramangala branch please', testBranches), 'Koramangala Center')
})

test('extractBranch: matches by address keyword "12th"', () => {
  assert.equal(extractBranch('the one on 12th Main Road', testBranches), 'Indiranagar Main Clinic')
})

test('extractBranch: returns null when no branches provided', () => {
  assert.equal(extractBranch('I want to come to indiranagar', undefined), null)
})

test('extractBranch: returns null when empty branches array', () => {
  assert.equal(extractBranch('I want to come to indiranagar', []), null)
})

test('extractBranch: returns null when text matches no branch', () => {
  assert.equal(extractBranch('I want to come to Jayanagar', testBranches), null)
})
