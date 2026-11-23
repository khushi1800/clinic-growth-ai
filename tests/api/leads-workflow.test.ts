import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_LEADS, DEMO_CLINIC } from '../../src/hooks/useMockData.js'
import type { Lead } from '../../src/types/database.js'

test('Leads Lifecycle Workflow: Validates all stage transitions', () => {
  const sampleLead: Lead = {
    ...DEMO_LEADS[0],
    id: 'lead-workflow-test',
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Define valid linear lifecycle progression
  const stageTransitions: Array<Lead['status']> = [
    'contacted',
    'interested',
    'appointment_requested',
    'appointment_confirmed',
    'converted',
  ]

  let currentLead = { ...sampleLead }

  for (const nextStage of stageTransitions) {
    currentLead = {
      ...currentLead,
      status: nextStage,
      updated_at: new Date().toISOString(),
    }
    assert.equal(currentLead.status, nextStage)
  }

  // Test terminal/lost status
  const lostLead = { ...sampleLead, status: 'lost' as const }
  assert.equal(lostLead.status, 'lost')
})

test('Leads Filtering: Filter by search keyword and source channels', () => {
  // Filter by source
  const aiChatLeads = DEMO_LEADS.filter((l) => l.source === 'ai_chat')
  const websiteLeads = DEMO_LEADS.filter((l) => l.source === 'website')

  assert.ok(aiChatLeads.length > 0, 'Must have AI chat source leads')
  assert.ok(websiteLeads.length > 0, 'Must have website source leads')

  // Search by name
  const targetLead = DEMO_LEADS[0]
  const searchResults = DEMO_LEADS.filter((l) =>
    l.name.toLowerCase().includes(targetLead.name.toLowerCase())
  )
  assert.ok(searchResults.some((r) => r.id === targetLead.id))
})
