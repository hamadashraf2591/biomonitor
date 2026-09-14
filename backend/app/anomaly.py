import numpy as np
from sklearn.ensemble import IsolationForest

NORMAL_RANGES = {
    "heart_rate":   (60, 100),
    "temperature":  (36.1, 37.5),
    "oxygen_level": (95, 100),
    "systolic_bp":  (90, 130),
    "diastolic_bp": (60, 85),
}


def rule_based_check(vital):
    issues = []
    checks = {
        "heart_rate": vital.heart_rate,
        "temperature": vital.temperature,
        "oxygen_level": vital.oxygen_level,
        "systolic_bp": vital.systolic_bp,
        "diastolic_bp": vital.diastolic_bp,
    }

    for key, value in checks.items():
        if value is None:
            continue
        low, high = NORMAL_RANGES[key]
        if value < low:
            issues.append({
                "metric": key,
                "value": value,
                "status": "LOW",
                "message": f"{key.replace('_', ' ').title()} is too LOW ({value})"
            })
        elif value > high:
            issues.append({
                "metric": key,
                "value": value,
                "status": "HIGH",
                "message": f"{key.replace('_', ' ').title()} is too HIGH ({value})"
            })

    if len(issues) == 0:
        severity = "NORMAL"
    elif len(issues) == 1:
        severity = "WARNING"
    else:
        severity = "CRITICAL"

    return {
        "severity": severity,
        "issues": issues,
        "is_anomaly": len(issues) > 0
    }


def ml_detect_anomalies(vitals_list):
    if len(vitals_list) < 5:
        return {}

    data = []
    ids = []
    for v in vitals_list:
        data.append([
            v.heart_rate or 0,
            v.temperature or 0,
            v.oxygen_level or 0,
            v.systolic_bp or 0,
            v.diastolic_bp or 0,
        ])
        ids.append(v.id)

    X = np.array(data)

    model = IsolationForest(
        contamination=0.15,
        random_state=42,
        n_estimators=100
    )
    model.fit(X)
    predictions = model.predict(X)

    result = {}
    for vid, pred in zip(ids, predictions):
        result[vid] = (pred == -1)

    return result