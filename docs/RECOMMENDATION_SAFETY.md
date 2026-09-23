# Recommendation Safety Notes

PackIntel recommendations are decision-support outputs, not certification or regulatory approval.

## Input validation
Reject incomplete or contradictory requirements before ranking candidates. Normalize units and preserve the user's original constraints for traceability.

## Evidence
A recommendation should identify the evidence or retrieval context that supports the material properties used in ranking.

## Ranking
Identical inputs should produce stable rankings when the model and retrieval configuration are unchanged. A changed requirement should be able to explainably change the result.

## Uncertainty
When evidence is missing or conflicting, surface the uncertainty instead of inventing a material property or performance claim.

## Evaluation
Keep representative scenarios as versioned fixtures so recommendation regressions can be detected during development.
