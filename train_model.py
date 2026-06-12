import pandas as pd
import numpy as np
import os
import matplotlib
matplotlib.use('Agg') # Disable interactive GUI windows for cloud runtime safety
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import joblib

def train_performance_model():
    # 1. Load compiled dataset
    if not os.path.exists('aui_students.csv'):
        raise FileNotFoundError("The dataset 'aui_students.csv' does not exist. Run 'generate_data.py' first.")
    
    df = pd.read_csv('aui_students.csv')
    
    # 2. Separate features (X) and target variable (y)
    feature_cols = [
        'waec_score', 'jamb_score', 'internal_test_score', 'first_sem_gpa', 
        'attendance_pct', 'carryover_count', 'assignment_rate', 
        'study_hours', 'student_level'
    ]
    X = df[feature_cols]
    y = df['pass_fail']
    
    # 3. Train-Test split (80/20 with reproducible seed 42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    
    # 4. Fit the Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)
    
    # 5. Evaluate predictions
    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    # Print high fidelity classification report to terminal
    print("\n" + "="*60)
    print("      AUGUSTINE UNIVERSITY (AUI) ACADEMIC PERFORMANCE MODEL REPORT      ")
    print("="*60)
    print(classification_report(y_test, y_pred, target_names=['At Risk', 'Pass / Graduate']))
    print("="*60 + "\n")
    
    # Ensure static directory exists
    os.makedirs('static', exist_ok=True)
    
    # Brand aesthetic definitions for plotting:
    # AUI Navy: #101B30 / #1A2E56
    # AUI Gold: #D4AF37
    navy_dark = '#101B30'
    gold_academic = '#D4AF37'
    gray_light = '#F4F5F7'
    text_color = '#ffffff'
    
    # Plotting helper to apply a gorgeous premium dark theme
    def apply_dark_theme_formatting(ax, title):
        ax.set_facecolor('#131E35')
        ax.figure.patch.set_facecolor(navy_dark)
        ax.spines['bottom'].set_color('#2A3E62')
        ax.spines['top'].set_color('#2A3E62')
        ax.spines['right'].set_color('#2A3E62')
        ax.spines['left'].set_color('#2A3E62')
        ax.tick_params(colors=text_color, which='both')
        ax.yaxis.label.set_color(text_color)
        ax.xaxis.label.set_color(text_color)
        ax.title.set_color(gold_academic)
        ax.set_title(title, fontsize=14, weight='semibold', pad=15, color=gold_academic)
    
    # -------------------------------------------------------------
    # Image 1: Confusion Matrix
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(6.5, 5))
    cm = confusion_matrix(y_test, y_pred)
    
    # Custom color palette matching Navy and Gold gradients
    cmap_custom = sns.light_palette(gold_academic, as_cmap=True)
    
    sns.heatmap(
        cm, 
        annot=True, 
        fmt='d', 
        cmap=cmap_custom, 
        ax=ax, 
        cbar=False,
        xticklabels=['At Risk (0)', 'Pass (1)'],
        yticklabels=['At Risk (0)', 'Pass (1)'],
        annot_kws={'size': 14, 'weight': 'bold', 'color': navy_dark}
    )
    ax.set_ylabel('Empirical Core Status (Actual)', labelpad=10)
    ax.set_xlabel('Model Predicted Vector', labelpad=10)
    apply_dark_theme_formatting(ax, 'Confusion Matrix (TP/TN Metrics)')
    plt.tight_layout()
    plt.savefig('static/confusion_matrix.png', facecolor=navy_dark, dpi=150)
    plt.close()
    
    # -------------------------------------------------------------
    # Image 2: ROC Curve
    # -------------------------------------------------------------
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    
    fig, ax = plt.subplots(figsize=(6.5, 5))
    ax.plot(fpr, tpr, color=gold_academic, lw=2.5, label=f'Model ROC Area = {roc_auc:.4f}')
    ax.plot([0, 1], [0, 1], color='#4E617E', lw=1.5, linestyle='--')
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('False Positive Evaluation Percentage', labelpad=10)
    ax.set_ylabel('True Positive Evaluation Percentage', labelpad=10)
    ax.legend(loc="lower right", facecolor='#131E35', edgecolor='#2A3E62', labelcolor=text_color)
    apply_dark_theme_formatting(ax, f'ROC Curve Summary (AUC: {roc_auc:.2f})')
    plt.grid(True, linestyle=':', alpha=0.15, color='#ffffff')
    plt.tight_layout()
    plt.savefig('static/roc_curve.png', facecolor=navy_dark, dpi=150)
    plt.close()
    
    # -------------------------------------------------------------
    # Image 3: Feature Importance Graph
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(7, 5))
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)
    
    sorted_features = [feature_cols[i] for i in indices]
    sorted_importances = importances[indices]
    
    # Translate tech tags into clean academic descriptions for non-tech examiners
    friendly_names_dict = {
        'waec_score': 'WAEC Grade Index (1-10)',
        'jamb_score': 'JAMB Score (over 400)',
        'internal_test_score': 'Continuous Assessment (CA) Test (over 30)',
        'first_sem_gpa': 'First Semester GPA Benchmark',
        'attendance_pct': 'Lecture Attendance Vector',
        'carryover_count': 'Active Course Carryovers',
        'assignment_rate': 'Assignment Submissions',
        'study_hours': 'Daily Independent Learning',
        'student_level': 'Active Student Level'
    }
    friendly_features = [friendly_names_dict[feat] for feat in sorted_features]
    
    # Generate horizontal bar graph using gold colors and navy shadows
    bars = ax.barh(friendly_features, sorted_importances, color=gold_academic, edgecolor='#ffffff', alpha=0.9, height=0.6)
    
    # Add numerical labels inside/beside bars
    for bar in bars:
        width = bar.get_width()
        ax.text(
            width + 0.01, 
            bar.get_y() + bar.get_height()/2, 
            f'{width*100:.1f}%', 
            va='center', 
            ha='left', 
            color=text_color, 
            fontweight='semibold',
            fontsize=9
        )
        
    ax.set_xlabel('Overall Mathematical Model Weight', labelpad=10)
    apply_dark_theme_formatting(ax, 'Relative Feature Importance Spectrum')
    plt.xlim(0, max(importances) + 0.08)
    plt.tight_layout()
    plt.savefig('static/feature_importance.png', facecolor=navy_dark, dpi=150)
    plt.close()
    
    # 6. Save serialized binary model matrix
    joblib.dump(rf_model, 'model.pkl')
    print("Optimization successful: Saved RandomForest binary matrix as 'model.pkl'")

if __name__ == '__main__':
    train_performance_model()
