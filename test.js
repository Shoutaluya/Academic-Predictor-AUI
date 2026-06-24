fetch('http://127.0.0.1:3000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_level: 100,
    waec_score: 7,
    jamb_score: 250,
    internal_test_score: 22,
    first_sem_gpa: 3.0,
    attendance_pct: 80,
    carryover_count: 0,
    assignment_rate: 0.8,
    study_hours: 4
  })
}).then(r => r.text()).then(console.log).catch(console.error);
