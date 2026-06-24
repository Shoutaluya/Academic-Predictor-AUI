# Augustine University (AUI) Academic Prediction Portal

This application is an Academic Prediction Portal designed for Augustine University, Ilara-Epe (AUI). It helps students and faculty analyze academic profiles and predict potential academic risks using a Random Forest model.

## Features

- **Predictive Engine**: Input student baseline profiles (Level, WAEC, JAMB scores) and continuous assessment parameters (GPA, internal test scores, attendance, study hours, carryovers) to evaluate academic standing and identify at-risk students.
- **Data Exploration**: Review and filter historical survey responses and baseline data used to train the predictive model.
- **Model Metrics**: View the influence of individual academic variables on student performance through an interactive, feature-importance breakdown.
- **Privacy First**: All submitted academic variables are strictly processed in-memory for the duration of the inference request. We do not permanently store, sell, or distribute any personally identifiable academic records.

## Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS (served statically via Vite/Express)
- **Backend**: Node.js, Express, TypeScript
- **Validation**: Zod for strict input sanitization
- **AI/ML Logic**: TypeScript implementation of Random Forest Inference logic

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be running locally at `http://localhost:3000`.

### Production Build

To build the application for production:
```bash
npm run build
```

Then start the production server:
```bash
npm start
```

## API Endpoints

- `POST /predict`: Submit academic variables to receive a prediction.
- `GET /api/health`: Check the health status of the application.
- `GET /api/survey`: Fetch anonymized historical survey data.

## Privacy & Data Retention Policy

All submitted academic variables are strictly processed in-memory for the duration of the inference request. Only anonymized telemetry and macroscopic aggregation counters are retained for system health monitoring. Access to underlying logs is restricted to authorized AUI administrative personnel and automated security audits.
