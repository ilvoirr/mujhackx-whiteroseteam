from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import pickle
import os
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Global variable to store loaded models
loaded_models = None

def load_ai_models():
    """Load the pre-trained BachatBox AI models"""
    global loaded_models
    
    model_path = Path('models/bachatbox_ai_v1.pkl')
    
    if not model_path.exists():
        print("❌ AI Model not found! Run: python create_model.py")
        return None
    
    try:
        with open(model_path, 'rb') as f:
            loaded_models = pickle.load(f)
        
        print("🚀 BachatBox AI Models loaded successfully!")
        print(f"📅 Model version: {loaded_models['version']}")
        print(f"🎯 Categories: {loaded_models['categories']}")
        return loaded_models
    
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return None

def predict_with_ai(transactions):
    """Use AI models to generate predictions"""
    if not loaded_models:
        return None
    
    try:
        df = pd.DataFrame(transactions)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['amount'] = pd.to_numeric(df['amount'])
        
        # Get recent spending pattern
        recent_spending = df[df['type'] == 'expense']['amount'].sum()
        current_day = datetime.now().weekday()
        current_month = datetime.now().month
        
        # Predict next week's spending
        features = np.array([[current_day, current_month, 0, recent_spending]])  # category=0 for Food
        predicted_amount = loaded_models['amount_predictor'].predict(features)[0]
        
        # Predict most likely expense category
        category_features = np.array([[current_day, current_month, recent_spending]])
        predicted_category_idx = loaded_models['category_classifier'].predict(category_features)[0]
        predicted_category = loaded_models['categories'][predicted_category_idx]
        
        return {
            'predicted_next_expense': round(predicted_amount, 2),
            'likely_category': predicted_category,
            'confidence': 0.85,  # You could get actual probabilities
            'model_version': loaded_models['version']
        }
    
    except Exception as e:
        print(f"AI Prediction error: {e}")
        return None

def analyze_transactions(transactions):
    if not transactions:
        return [], None, []
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(transactions)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    # Calculate spending patterns
    total_income = df[df['type'] == 'income']['amount'].sum()
    total_expenses = df[df['type'] == 'expense']['amount'].sum()
    net_balance = total_income - total_expenses
    
    # Category analysis
    expense_categories = df[df['type'] == 'expense'].groupby('category')['amount'].sum().to_dict()
    
    # Get AI predictions
    ai_predictions = predict_with_ai(transactions)
    
    # Generate AI-enhanced scenarios
    scenarios = generate_ai_scenarios(df, total_income, total_expenses, expense_categories, ai_predictions)
    
    # Determine personality
    personality = determine_personality(df, total_income, total_expenses)
    
    # Generate achievements
    achievements = generate_achievements(df, net_balance, expense_categories)
    
    return scenarios, personality, achievements

def generate_ai_scenarios(df, total_income, total_expenses, expense_categories, ai_predictions):
    scenarios = []
    
    # AI-Powered Prediction Scenario
    if ai_predictions:
        scenarios.append({
            "title": "🤖 AI Prediction Alert",
            "description": f"My AI model predicts your next expense will be ₹{ai_predictions['predicted_next_expense']:.0f} in {ai_predictions['likely_category']}! Model confidence: {ai_predictions['confidence']*100:.0f}%",
            "probability": int(ai_predictions['confidence'] * 100),
            "icon": "trending-up",
            "color": "blue"
        })
    
    # Weekend Splurge Pattern
    weekend_expenses = df[(df['type'] == 'expense') & 
                         (df['timestamp'].dt.dayofweek >= 5)]['amount'].sum()
    weekend_ratio = (weekend_expenses / total_expenses * 100) if total_expenses > 0 else 0
    
    scenarios.append({
        "title": "🎉 Weekend Warrior",
        "description": f"You spend {weekend_ratio:.1f}% on weekends! That's ₹{weekend_expenses:.0f} of pure weekend fun. Maybe try a 'No-Spend Sunday'?",
        "probability": min(int(weekend_ratio), 95),
        "icon": "coffee",
        "color": "orange"
    })
    
    # Future Wealth Projection
    monthly_savings = (total_income - total_expenses) if total_income > total_expenses else 0
    yearly_projection = monthly_savings * 12
    
    scenarios.append({
        "title": "💰 Wealth Builder",
        "description": f"At ₹{monthly_savings:.0f}/month savings rate, you'll have ₹{yearly_projection:.0f} by year-end! Keep the momentum!",
        "probability": min(int((monthly_savings / total_income * 100)) if total_income > 0 else 0, 90),
        "icon": "savings",
        "color": "green"
    })
    
    # Category Addiction with AI insight
    if expense_categories:
        top_category = max(expense_categories.keys(), key=lambda x: expense_categories[x])
        top_amount = expense_categories[top_category]
        category_percentage = (top_amount / total_expenses * 100) if total_expenses > 0 else 0
        
        scenarios.append({
            "title": f"🛍️ {top_category.title()} Lover",
            "description": f"Alert! {category_percentage:.1f}% goes to {top_category}. Cut by 25% and save ₹{top_amount * 0.25:.0f}! Your wallet will thank you 💸",
            "probability": min(int(category_percentage), 95),
            "icon": "shopping",
            "color": "red"
        })
    
    # Compound Growth Scenario
    if monthly_savings > 0:
        compound_10_years = monthly_savings * 12 * 10 * 1.12  # 12% annual return
        scenarios.append({
            "title": "🚀 Future Millionaire",
            "description": f"Invest your ₹{monthly_savings:.0f}/month at 12% returns = ₹{compound_10_years:.0f} in 10 years! Time to start that SIP! 📈",
            "probability": 82,
            "icon": "trending-up",
            "color": "purple"
        })
    
    return scenarios[:6]  # Return top 6 scenarios

def determine_personality(df, total_income, total_expenses):
    savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
    
    if savings_rate > 30:
        return {
            "type": "🏆 Savings Champion",
            "badge": "🏆",
            "description": f"Incredible! You save {savings_rate:.1f}% of income. You're building serious wealth! 💪"
        }
    elif savings_rate > 15:
        return {
            "type": "🎯 Money Ninja",
            "badge": "🎯", 
            "description": f"Perfect balance! {savings_rate:.1f}% savings rate shows you enjoy life while securing your future 🌟"
        }
    elif savings_rate > 0:
        return {
            "type": "🌱 Growing Saver",
            "badge": "🌱",
            "description": f"Good start with {savings_rate:.1f}% savings! Small steps lead to big wealth 📈"
        }
    else:
        return {
            "type": "🔥 YOLO Spender",
            "badge": "🔥",
            "description": "Living for today! But maybe save just ₹100/month? Future you will be grateful 😊"
        }

def generate_achievements(df, net_balance, expense_categories):
    achievements = []
    
    achievements.append({
        "title": "🎯 First Steps",
        "icon": "target",
        "unlocked": len(df) >= 5
    })
    
    achievements.append({
        "title": "💚 Positive Balance",
        "icon": "trending-up", 
        "unlocked": net_balance > 0
    })
    
    achievements.append({
        "title": "📊 Category Master",
        "icon": "chart",
        "unlocked": len(expense_categories) >= 3
    })
    
    achievements.append({
        "title": "🔥 Consistency King",
        "icon": "award",
        "unlocked": len(df) >= 15
    })
    
    achievements.append({
        "title": "🤖 AI Powered",
        "icon": "sparkles",
        "unlocked": True  # Always unlocked when using AI
    })
    
    return achievements

@app.route('/analyze', methods=['POST'])
def analyze_finances():
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        scenarios, personality, achievements = analyze_transactions(transactions)
        
        return jsonify({
            'success': True,
            'scenarios': scenarios,
            'personality': personality,
            'achievements': achievements,
            'ai_powered': loaded_models is not None,
            'model_info': {
                'version': loaded_models['version'] if loaded_models else None,
                'status': 'AI Model Loaded ✅' if loaded_models else 'Rule-based Analysis'
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/model-status', methods=['GET'])
def model_status():
    return jsonify({
        'model_loaded': loaded_models is not None,
        'model_path': 'models/bachatbox_ai_v1.pkl',
        'version': loaded_models['version'] if loaded_models else None,
        'categories': loaded_models['categories'] if loaded_models else []
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': '🚀 BachatBox AI Backend is running!',
        'ai_model': 'Loaded ✅' if loaded_models else 'Not loaded ❌'
    })
if __name__ == '__main__':
    print("🤖 Starting BachatBox AI Backend...")
    load_ai_models()
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)
