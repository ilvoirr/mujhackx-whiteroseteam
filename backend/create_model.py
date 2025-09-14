import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import os

def create_expense_models():
    """Create and save pre-trained models for expense prediction"""
    
    np.random.seed(42)
    n_samples = 1000
    categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare']
    
    # Create sample data
    data = []
    for i in range(n_samples):
        day_of_week = np.random.randint(0, 7)
        month = np.random.randint(1, 13)
        category = np.random.choice(categories)
        prev_spending = np.random.uniform(100, 2000)
        
        # Amount prediction based on realistic patterns
        base_amount = {
            'Food': 150, 'Transport': 200, 'Shopping': 500, 
            'Entertainment': 300, 'Bills': 800, 'Healthcare': 400
        }[category]
        
        # Add some noise and patterns
        weekend_multiplier = 1.5 if day_of_week in [5, 6] else 1.0
        month_multiplier = 1.3 if month in [11, 12, 1] else 1.0
        
        amount = base_amount * weekend_multiplier * month_multiplier * np.random.uniform(0.5, 2.0)
        data.append([day_of_week, month, category, prev_spending, amount])
    
    df = pd.DataFrame(data, columns=['day_of_week', 'month', 'category', 'prev_spending', 'amount'])
    
    # Encode categories
    le = LabelEncoder()
    df['category_encoded'] = le.fit_transform(df['category'])
    
    # Features for amount prediction
    X_amount = df[['day_of_week', 'month', 'category_encoded', 'prev_spending']].values
    y_amount = df['amount'].values
    
    # Features for category prediction
    X_category = df[['day_of_week', 'month', 'prev_spending']].values
    y_category = df['category_encoded'].values
    
    # Train models
    print("🤖 Training Expense Amount Predictor...")
    amount_model = RandomForestRegressor(n_estimators=100, random_state=42)
    amount_model.fit(X_amount, y_amount)
    
    print("🎯 Training Category Classifier...")
    category_model = RandomForestClassifier(n_estimators=100, random_state=42)
    category_model.fit(X_category, y_category)
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Save models
    print("💾 Saving BachatBox AI Models...")
    
    model_data = {
        'amount_predictor': amount_model,
        'category_classifier': category_model,
        'label_encoder': le,
        'categories': categories,
        'version': '1.0',
        'created': datetime.now().isoformat()
    }
    
    with open('models/bachatbox_ai_v1.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print("✅ BachatBox AI Models created successfully!")
    print("📦 Model saved to: models/bachatbox_ai_v1.pkl")
    print(f"📊 Model size: {os.path.getsize('models/bachatbox_ai_v1.pkl') / 1024:.1f} KB")

if __name__ == "__main__":
    create_expense_models()
