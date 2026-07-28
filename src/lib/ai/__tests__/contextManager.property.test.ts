// Feature: ai-career-advisor-chatbot, Property 6: sliding window size invariant
// Feature: ai-career-advisor-chatbot, Property 7: entity extraction coverage
// Feature: ai-career-advisor-chatbot, Property 8: entity accumulation monotonicity
// Feature: ai-career-advisor-chatbot, Property 9: context session round-trip

import { describe, it, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  addTurn,
  extractEntities,
  getSnapshot,
  persist,
  restore,
  _resetState,
  COMPANIES,
  ROLES,
  SKILLS,
} from '../contextManager';
import type { ConversationTurn } from '../types';

// Mock sessionStorage for Property 9 (not available in test environment)
const sessionStorageStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem: (key: string) => sessionStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { sessionStorageStore[key] = value; },
  removeItem: (key: string) => { delete sessionStorageStore[key]; },
  clear: () => { Object.keys(sessionStorageStore).forEach(k => delete sessionStorageStore[k]); },
};

vi.stubGlobal('sessionStorage', sessionStorageMock);

/**
 * **Validates: Requirements 3.1, 3.2**
 *
 * Property 6: Sliding Window Size Invariant
 * After adding N > 10 turns, `getSnapshot().turns.length === 10` and
 * the turns are the N most recent.
 */
describe('contextManager — Property 6: Sliding Window Size Invariant', () => {
  beforeEach(() => {
    _resetState();
  });

  it('getSnapshot().turns.length === 10 after adding N > 10 turns', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string(),
            timestamp: fc.integer(),
          }),
          { minLength: 11, maxLength: 30 }
        ),
        (turns) => {
          _resetState();

          for (const turn of turns) {
            addTurn(turn);
          }

          const snapshot = getSnapshot();
          return snapshot.turns.length === 10;
        }
      )
    );
  });

  it('the retained turns are the N most recent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string(),
            timestamp: fc.integer(),
          }),
          { minLength: 11, maxLength: 30 }
        ),
        (turns) => {
          _resetState();

          for (const turn of turns) {
            addTurn(turn);
          }

          const snapshot = getSnapshot();
          const expected = turns.slice(turns.length - 10);

          // Verify each retained turn matches the expected most-recent turns
          for (let i = 0; i < 10; i++) {
            if (
              snapshot.turns[i].role !== expected[i].role ||
              snapshot.turns[i].content !== expected[i].content ||
              snapshot.turns[i].timestamp !== expected[i].timestamp
            ) {
              return false;
            }
          }

          return true;
        }
      )
    );
  });
});

/**
 * **Validates: Requirements 3.3**
 *
 * Property 7: Entity Extraction Coverage
 * Any message containing a term from the entity dictionary must have that
 * term in the corresponding entity array.
 */
describe('contextManager — Property 7: Entity Extraction Coverage', () => {
  it('a company term embedded in a message is found in extracted companies', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...COMPANIES),
        fc.string(),
        fc.string(),
        (company, prefix, suffix) => {
          const message = `${prefix} ${company} ${suffix}`;
          const entities = extractEntities(message);
          return entities.companies.includes(company);
        }
      )
    );
  });

  it('a role term embedded in a message is found in extracted roles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ROLES),
        fc.string(),
        fc.string(),
        (role, prefix, suffix) => {
          const message = `${prefix} ${role} ${suffix}`;
          const entities = extractEntities(message);
          return entities.roles.includes(role);
        }
      )
    );
  });

  it('a skill term embedded in a message is found in extracted skills', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SKILLS),
        fc.string(),
        fc.string(),
        (skill, prefix, suffix) => {
          const message = `${prefix} ${skill} ${suffix}`;
          const entities = extractEntities(message);
          return entities.skills.includes(skill);
        }
      )
    );
  });
});

/**
 * **Validates: Requirements 3.4**
 *
 * Property 8: Entity Accumulation Monotonicity
 * The entity set after N turns is always a superset of the entity set
 * after N-1 turns (entities are never removed, only added).
 */
describe('contextManager — Property 8: Entity Accumulation Monotonicity', () => {
  beforeEach(() => {
    _resetState();
  });

  it('entity sets grow monotonically as turns are added', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string(),
            timestamp: fc.integer(),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (turns) => {
          _resetState();

          let prevCompanies: string[] = [];
          let prevRoles: string[] = [];
          let prevSkills: string[] = [];

          for (const turn of turns) {
            addTurn(turn);
            const snapshot = getSnapshot();

            const currCompanies = snapshot.entities.companies;
            const currRoles = snapshot.entities.roles;
            const currSkills = snapshot.entities.skills;

            // Each previous entity must still be present (superset property)
            for (const c of prevCompanies) {
              if (!currCompanies.includes(c)) return false;
            }
            for (const r of prevRoles) {
              if (!currRoles.includes(r)) return false;
            }
            for (const s of prevSkills) {
              if (!currSkills.includes(s)) return false;
            }

            // Sizes must be non-decreasing
            if (
              currCompanies.length < prevCompanies.length ||
              currRoles.length < prevRoles.length ||
              currSkills.length < prevSkills.length
            ) {
              return false;
            }

            prevCompanies = [...currCompanies];
            prevRoles = [...currRoles];
            prevSkills = [...currSkills];
          }

          return true;
        }
      )
    );
  });
});

/**
 * **Validates: Requirements 3.6, 10.1, 10.2**
 *
 * Property 9: Context Session Round-Trip
 * `persist(uid)` then `restore(uid)` on a fresh instance produces a
 * structurally equivalent snapshot (same turns in order, same entity sets).
 */
describe('contextManager — Property 9: Context Session Round-Trip', () => {
  beforeEach(() => {
    _resetState();
    sessionStorageMock.clear();
  });

  it('persist then restore produces structurally equivalent snapshot', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.array(
          fc.record({
            role: fc.constantFrom('user' as const, 'assistant' as const),
            content: fc.string(),
            timestamp: fc.integer(),
          }),
          { minLength: 0, maxLength: 15 }
        ),
        (uid, turns) => {
          _resetState();
          sessionStorageMock.clear();

          // Add turns to build up state
          for (const turn of turns) {
            addTurn(turn);
          }

          // Capture snapshot before persist
          const snapshotBefore = getSnapshot();

          // Persist current state
          persist(uid);

          // Reset to fresh state
          _resetState();

          // Restore from persisted state
          const restored = restore(uid);

          // If no turns were added, restore may return false (nothing to restore)
          // but the snapshot should still be equivalent (empty)
          if (!restored && turns.length === 0) {
            return true;
          }

          if (!restored) return false;

          // Capture snapshot after restore
          const snapshotAfter = getSnapshot();

          // Turns must be in the same order with same content
          if (snapshotBefore.turns.length !== snapshotAfter.turns.length) return false;

          for (let i = 0; i < snapshotBefore.turns.length; i++) {
            const before = snapshotBefore.turns[i];
            const after = snapshotAfter.turns[i];
            if (
              before.role !== after.role ||
              before.content !== after.content ||
              before.timestamp !== after.timestamp
            ) {
              return false;
            }
          }

          // Entity sets must be equivalent
          const entBefore = snapshotBefore.entities;
          const entAfter = snapshotAfter.entities;

          const setsEqual = (a: string[], b: string[]) =>
            a.length === b.length && a.every((v) => b.includes(v));

          return (
            setsEqual(entBefore.companies, entAfter.companies) &&
            setsEqual(entBefore.roles, entAfter.roles) &&
            setsEqual(entBefore.skills, entAfter.skills)
          );
        }
      )
    );
  });

  it('restore returns false when no session exists for uid', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (uid) => {
        _resetState();
        sessionStorageMock.clear();
        const result = restore(uid);
        return result === false;
      })
    );
  });
});
