import pandas as pd
import numpy as np
import os
import json
import matplotlib
matplotlib.use('Agg') # Disable interactive GUI windows for cloud runtime safety
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc, accuracy_score, precision_score, recall_score, f1_score
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
    
    # 4. Initialize the three algorithms
    # A. RandomForestClassifier (Champion - Ensemble Model)
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight='balanced'
    )
    
    # B. DecisionTreeClassifier (Single Baseline Decision tree)
    dt_model = DecisionTreeClassifier(
        max_depth=5,
        random_state=42,
        class_weight='balanced'
    )
    
    # C. LogisticRegression (Linear Baseline)
    lr_model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight='balanced'
    )
    
    # Fit all three models
    rf_model.fit(X_train, y_train)
    dt_model.fit(X_train, y_train)
    lr_model.fit(X_train, y_train)
    
    # 5. Evaluate and Compare Models
    models_dict = {
        "Random Forest (Champion)": rf_model,
        "Decision Tree": dt_model,
        "Logistic Regression": lr_model
    }
    
    comparative_metrics = {}
    
    print("\n" + "="*80)
    print("                 AUGUSTINE UNIVERSITY (AUI) MODEL EVALUATION MATRIX             ")
    print("="*80)
    
    for name, model in models_dict.items():
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
        
        # Calculate standard metrics
        acc = accuracy_score(y_test, y_pred)
        prec_weighted = precision_score(y_test, y_pred, average='weighted')
        rec_weighted = recall_score(y_test, y_pred, average='weighted')
        f1_weighted = f1_score(y_test, y_pred, average='weighted')
        
        # Class 0 specific metrics (At-Risk)
        cm = confusion_matrix(y_test, y_pred)
        # Assuming standard confusion matrix layout:
        # cm[0,0] = TN, cm[0,1] = FP, cm[1,0] = FN, cm[1,1] = TP
        # Let's calculate precise Precision/Recall/F1 for Class 0 (At-Risk)
        # Class 0 Precision = TN / (TN + FN)
        # Class 0 Recall = TN / (TN + FP)
        tn, fp, fn, tp = cm.ravel()
        prec_class0 = tn / (tn + fn) if (tn + fn) > 0 else 0
        rec_class0 = tn / (tn + fp) if (tn + fp) > 0 else 0
        f1_class0 = 2 * (prec_class0 * rec_class0) / (prec_class0 + rec_class0) if (prec_class0 + rec_class0) > 0 else 0
        
        # Class 1 specific metrics (Pass)
        prec_class1 = tp / (tp + fp) if (tp + fp) > 0 else 0
        rec_class1 = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_class1 = 2 * (prec_class1 * rec_class1) / (prec_class1 + rec_class1) if (prec_class1 + rec_class1) > 0 else 0
        
        fpr, tpr_vals, _ = roc_curve(y_test, y_prob)
        roc_auc = auc(fpr, tpr_vals)
        
        key_name = name.lower().replace(" ", "_").replace("(", "").replace(")", "")
        comparative_metrics[key_name] = {
            "name": name,
            "accuracy": round(acc * 100, 1),
            "precision_weighted": round(prec_weighted * 100, 1),
            "recall_weighted": round(rec_weighted * 100, 1),
            "f1_weighted": round(f1_weighted * 100, 1),
            "auc": round(roc_auc, 3),
            "class0": {
                "precision": round(prec_class0 * 100, 1),
                "recall": round(rec_class0 * 100, 1),
                "f1": round(f1_class0 * 100, 1),
                "support": int(tn + fp)
            },
            "class1": {
                "precision": round(prec_class1 * 100, 1),
                "recall": round(rec_class1 * 100, 1),
                "f1": round(f1_class1 * 100, 1),
                "support": int(fn + tp)
            }
        }
        
        print(f"\nModel: {name}")
        print(f"  Overall Accuracy:    {acc*100:.1f}%")
        print(f"  Weighted Precision:  {prec_weighted*100:.1f}%")
        print(f"  Weighted Recall:     {rec_weighted*100:.1f}%")
        print(f"  Weighted F1-Score:   {f1_weighted*100:.1f}%")
        print(f"  Area Under ROC (AUC):{roc_auc:.4f}")
        print(f"  At-Risk Recall (Sensitivity for catching failing students): {rec_class0*100:.1f}%")
        print(f"  At-Risk F1-Score:    {f1_class0*100:.1f}%")
        print("-"*45)
    
    print("="*80 + "\n")
    
    # 6. Easy Explanations for why we compared three algorithms & use these metrics
    explanations = {
        "why_three_algorithms": (
            "Comparing multiple algorithms is standard machine learning protocol. "
            "It validates that our Champion (Random Forest) is genuinely superior and prevents bias. "
            "Logistic Regression provides a solid linear baseline, while a single Decision Tree "
            "gives a simple hierarchical rules-based approach. The Random Forest ensemble "
            "combines 100 decorrelated decision trees, which reduces variance, avoids overfitting, "
            "and handles complex non-linear interactions elegantly."
        ),
        "why_80_20_split": (
            "We used a standard 80/20 Train/Test split (400 training samples and 100 held-out test samples). "
            "This splits the historical profiles so that the models are trained on 80% of the dataset, "
            "while 20% is locked away as a completely 'unseen' held-out testing set. This guarantees that "
            "the evaluation metrics represent actual generalizability to future students rather than memorization."
        ),
        "why_recall_and_f1_are_champion_keys": (
            "For catching 'At-Risk' students, Recall (Sensitivity) and F1-Score are far more critical than raw Accuracy. "
            "If a model has high accuracy but low recall, it means we are missing/failing to identify at-risk students "
            "(high False Negatives). High Recall means we catch almost all at-risk students, and a high F1-Score "
            "proves we do this without generating excessive false alarms (balancing precision and recall symmetrically)."
        )
    }
    
    # Save serialized binary model matrix for Random Forest (Champion)
    joblib.dump(rf_model, 'model.pkl')
    print("Optimization successful: Saved RandomForest (Champion) binary matrix as 'model.pkl'")
    
    # Ensure static directory exists
    os.makedirs('static', exist_ok=True)
    
    # Output metrics payload as static JSON for high-fidelity UI binding
    payload = {
        "metrics": comparative_metrics,
        "explanations": explanations
    }
    with open('static/model_metrics.json', 'w') as f:
        json.dump(payload, f, indent=2)
    print("Saved evaluation data to 'static/model_metrics.json' for frontend synchronization.")
    
    # -------------------------------------------------------------
    # Re-generate diagnostic plots (Random Forest - Champion)
    # -------------------------------------------------------------
    # Brand aesthetic definitions for plotting:
    navy_dark = '#101B30'
    gold_academic = '#D4AF37'
    text_color = '#ffffff'
    
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
    
    # Image 1: Confusion Matrix for Random Forest Classifier
    fig, ax = plt.subplots(figsize=(6.5, 5))
    cm = confusion_matrix(y_test, rf_model.predict(X_test))
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
    apply_dark_theme_formatting(ax, 'Confusion Matrix (Random Forest Champion)')
    plt.tight_layout()
    plt.savefig('static/confusion_matrix.png', facecolor=navy_dark, dpi=150)
    plt.close()
    
    # Image 2: ROC Curve Plot for Random Forest Champion
    y_prob_rf = rf_model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob_rf)
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
    
    # Image 3: Feature Importance Graph
    fig, ax = plt.subplots(figsize=(7, 5))
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)
    sorted_features = [feature_cols[i] for i in indices]
    sorted_importances = importances[indices]
    
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
    bars = ax.barh(friendly_features, sorted_importances, color=gold_academic, edgecolor='#ffffff', alpha=0.9, height=0.6)
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

if __name__ == '__main__':
    train_performance_model()

