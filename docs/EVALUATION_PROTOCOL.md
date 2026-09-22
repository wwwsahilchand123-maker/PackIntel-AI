# PackIntel-AI Evaluation Protocol

## Goal
Evaluate recommendation behavior with repeatable scenarios instead of relying only on UI inspection.

## Scenario record
Each evaluation case should capture the food commodity, storage conditions, target shelf life, barrier requirements, sustainability preference, expected candidate materials, evidence sources, and final recommendation.

## Checks
1. Validate inputs and reject contradictory requirements.
2. Verify retrieval relevance for the scenario.
3. Verify ranking consistency for identical inputs.
4. Check that recommendations expose supporting evidence.
5. Test how rankings change when one requirement changes.
6. Keep outputs as decision support; do not claim regulatory certification.

## Reproducibility
Store scenarios as versioned fixtures and record the model/retrieval configuration used for each run so regressions remain reproducible.