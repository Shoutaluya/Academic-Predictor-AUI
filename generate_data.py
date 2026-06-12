import numpy as np
import pandas as pd

def generate_student_data():
    # Set seed for reproducible data generation
    np.random.seed(42)
    n_samples = 500
    
    # Generate high-fidelity feature space
    waec_score = np.random.randint(1, 11, size=n_samples) # Score representing entrance performance (1 to 10)
    jamb_score = np.random.randint(100, 401, size=n_samples) # Unified Tertiary Matriculation Examination entry score (100 to 400)
    internal_test_score = np.random.randint(5, 31, size=n_samples) # Continuous assessments (5 to 30)
    first_sem_gpa = np.round(np.random.uniform(0.0, 5.0, size=n_samples), 2) # First semester CGPA on AUI 5.0 scale
    attendance_pct = np.random.randint(40, 101, size=n_samples) # Lecture presence rating (40 to 100%)
    carryover_count = np.random.randint(0, 7, size=n_samples) # Backlogs or failed courses (0 to 6)
    assignment_rate = np.round(np.random.uniform(0.0, 1.0, size=n_samples), 2) # Timely assignments submission index (0.0 to 1.0)
    study_hours = np.random.randint(0, 11, size=n_samples) # Daily self study hours (0 to 10)
    student_level = np.random.choice([100, 200, 300, 400], size=n_samples) # Academic year of student
    
    # Normalize variables to standard [0, 1] range to apply theoretical weights
    norm_attendance = (attendance_pct - 40) / 60.0
    norm_gpa = first_sem_gpa / 5.0
    norm_assignment = assignment_rate
    norm_internal = (internal_test_score - 5) / 25.0
    norm_waec = (waec_score - 1) / 9.0
    norm_jamb = (jamb_score - 100) / 300.0
    norm_study = study_hours / 10.0
    norm_carryover = carryover_count / 6.0
    
    # Multi-variable interaction scoring rule aligning to AUI guidelines
    # Highly dominant variables: first_sem_gpa, attendance_pct, assignment_rate
    weighted_score = (
        norm_gpa * 0.36 +
        norm_attendance * 0.26 +
        norm_assignment * 0.14 +
        norm_internal * 0.10 +
        norm_study * 0.05 +
        norm_jamb * 0.04 +
        norm_waec * 0.05 -
        norm_carryover * 0.20 # Significant penalty for carrying over structures
    )
    
    # Introduce small Gaussian noise to represent real-world anomalies/exceptions
    gaussian_noise = np.random.normal(0, 0.06, n_samples)
    final_structural_score = weighted_score + gaussian_noise
    
    # Derive binary target (1 = Pass / Graduate, 0 = At Risk of Spillover / Poor Standing)
    # Set threshold such that approx 75-80% pass (common baseline AUI standard)
    pass_fail = (final_structural_score >= 0.38).astype(int)
    
    # Build core dataframe
    student_dataframe = pd.DataFrame({
        'waec_score': waec_score,
        'jamb_score': jamb_score,
        'internal_test_score': internal_test_score,
        'first_sem_gpa': first_sem_gpa,
        'attendance_pct': attendance_pct,
        'carryover_count': carryover_count,
        'assignment_rate': assignment_rate,
        'study_hours': study_hours,
        'student_level': student_level,
        'pass_fail': pass_fail
    })
    
    # Export to disk
    student_dataframe.to_csv('aui_students.csv', index=False)
    print(f"Data Generation complete: Saved 500 high-fidelity records to 'aui_students.csv'.")
    print(f"Class Distribution: Pass={sum(pass_fail == 1)}, At-Risk={sum(pass_fail == 0)}")

if __name__ == '__main__':
    generate_student_data()
