# PackIntel Recommendation Evaluation Protocol

## Goal
Evaluate recommendation quality with repeatable scenarios instead of relying only on screenshots or subjective inspection.

## Test Scenario Categories
1. **Normal** — complete food, storage, shelf-life and sustainability inputs.
2. **Boundary** — values near supported limits.
3. **Incomplete** — missing critical requirements.
4. **Conflicting** — requirements that pull the ranking in different directions.
5. **No-evidence** — retrieval cannot provide adequate supporting knowledge.

## Required Checks
- Input validation rejects malformed values.
- Critical missing fields are surfaced instead of silently guessed.
- Rankings are deterministic for identical inputs and knowledge snapshots.
- Recommendation explanations identify the important factors.
- Low-evidence results expose uncertainty.
- A ranking change can be compared against a known baseline.

## Safety Boundary
A recommendation is decision support. It must not claim regulatory compliance, food-contact safety, migration safety, or validated shelf life unless those claims are backed by appropriate evidence and testing.

## Regression Fixture
Each important scenario should record input requirements, expected eligible materials, expected ranking constraints, evidence/knowledge version, and expected uncertainty behavior.

This makes changes to recommendation logic measurable and reviewable.
