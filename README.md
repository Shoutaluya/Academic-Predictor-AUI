Title: Academic Predictor for AUI

Short description:
An AI-powered tool that helps Augustine University (AUI) students predict academic outcomes, surface the top drivers of success/risk, and explore simple, actionable interventions.

What the project does (concise):
- Ingests student indicators (prior GPA, attendance, continuous assessment scores, assignment completion rate, entry exam scores, carryovers, study hours).
- Produces a binary prediction (At Risk vs On Track) plus a calibrated confidence score.
- Presents a probability distribution across graduation-class outcomes (First Class, 2:1, 2:2, Third/Pass).
- Ranks feature importances and returns one prioritized “nudge” (actionable suggestion) with an estimated impact.
- Compares the student to an empirical cohort via the survey analytics endpoint.

Why / how it works (simple explanation):
- Primary inference: Node/Express server (server.ts) serves the web UI and runs the production prediction logic.
- If a trained RandomForest model (model.pkl) is available, the server uses it and returns feature importances. If not, a deterministic weighted fallback (normalized features + logistic mapping) computes probabilities.
- The UI is a stepper form that guides students through inputs and shows interactive visualizations, a recovery-sandbox for simulations, and downloadable reports.
- A survey analytics endpoint parses survey CSV data to provide cohort-level context and correlations.

Key features & files:
- server.ts — canonical runtime (Node.js + TypeScript) for serving the web UI and API.
- app.py — auxiliary Flask runtime kept for prototyping/training.
- train_model.py — model training utilities (Python).
- templates/index.html + static/* — frontend UI and assets.
- survey_responses.csv — committed survey dataset (kept as-is per your instruction).
- scripts/generate_synthetic_survey.py — new script to produce synthetic survey data for testing without exposing real records.