# PackIntel Recommendation Evaluation Protocol

## Goal

Evaluate recommendation quality with repeatable scenarios instead of relying only on screenshots or subjective inspection.

## Test Scenario Categories

1. **Normal** — complete food, storage, shelf-life and sustainability inputs.
2. **Boundary** — values near supported limits.
3. **Incomplete** — missing critical requirements.
4. **Conflicting** — requirements that pull the ranking in different directions.
5. **Unsupported / no-evidence** — retrieval cannot provide adequate supporting knowledge.

Keep scenario inputs and the knowledge-data version fixed when comparing two software revisions.

## Required Checks

- Input validation rejects malformed values.
- Critical missing fields are surfaced instead of silently guessed.
- Rankings are deterministic for identical inputs and knowledge snapshots.
- Hard constraints are checked separately from preference scoring.
- Recommendation explanations identify the important factors.
- Low-evidence results expose uncertainty instead of presenting unsupported certainty.
- A ranking change can be compared against a known baseline.

## Metrics

Track at least:

- **Ranking consistency:** identical inputs should produce the same result in deterministic mode.
- **Constraint satisfaction:** how many hard requirements each candidate satisfies.
- **Evidence coverage:** important recommendation factors linked to retrieved evidence.
- **Abstention / uncertainty behavior:** whether unsupported cases avoid unjustified recommendations.
- **Latency:** retrieval and recommendation latency measured separately.

## Regression Fixture

Each important scenario should record:

- input requirements
- candidate materials
- expected eligible materials
- expected hard constraints
- evidence/knowledge version
- expected uncertainty behavior

When recommendation logic changes:

1. Run the complete scenario set.
2. Compare rankings and constraint satisfaction with the previous baseline.
3. Investigate unexplained ranking changes.
4. Document intentional behavior changes.

Do not treat a higher aggregate score as automatically better if it is achieved by violating a hard constraint.

## Safety Boundary

A recommendation is decision support. It must not claim regulatory compliance, food-contact safety, migration safety, machinery compatibility, or validated shelf life unless those claims are backed by appropriate evidence and professional testing.

This evaluation protocol measures software behavior; it does not replace laboratory, regulatory, or engineering validation.
