from sqlalchemy.orm import Session
from sqlalchemy import text
import models
import json
import os
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv
from pathlib import Path

# Load .env relative to this file to ensure the key is available
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --------------------
# USERS
# --------------------

def create_or_get_user(db: Session, email: str, role: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(email=email, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_tokens(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.tokens if user else 0

def deduct_tokens(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or user.tokens < amount:
        return "INSUFFICIENT"
    user.tokens -= amount
    db.commit()
    return user.tokens

def create_campaign(db: Session, vendor_id: int, product_name: str, description: str):
    campaign = models.Campaign(
        vendor_id=vendor_id,
        product_name=product_name,
        description=description
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def get_all_campaigns(db: Session):
    return db.query(models.Campaign).all()

# --------------------
# ANALYTICS → AI ADAPTER
# --------------------

def extract_ai_analytics(analytics: dict) -> dict:
    sales = analytics.get("sales", [])
    kpis = analytics.get("kpis", {})

    total_revenue = kpis.get("total_revenue", 0)
    total_units = kpis.get("total_units_sold", 0)

    avg_order_value = total_revenue / total_units if total_units else 0

    top_products = sorted(sales, key=lambda x: x["quantity"], reverse=True)[:3]
    low_products = sorted(sales, key=lambda x: x["quantity"])[:3]

    return {
        "revenue": {
            "total": total_revenue
        },
        "orders": {
            "total": total_units,
            "average_order_value": round(avg_order_value, 2)
        },
        "products": {
            "top": top_products,
            "low": low_products
        }
    }

def validate_ai_analytics(data: dict):
    if data["orders"]["total"] == 0:
        raise HTTPException(status_code=400, detail="No sales data for AI insights")
    if data["revenue"]["total"] < 1000:
        raise HTTPException(status_code=400, detail="Revenue too low for AI insights")
    

def create_product(db: Session, product):
    new_product = models.Product(
        vendor_id=product.vendor_id,
        product_name=product.product_name,
        cost_price=product.cost_price,
        quantity_available=product.quantity_available,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def get_products(db: Session, vendor_id: int):
    return (
        db.query(models.Product)
        .filter(models.Product.vendor_id == vendor_id)
        .all()
    )


# --------------------
# GEMINI AI
# --------------------

def build_marketing_prompt(analytics: dict) -> str:
    return f"""
You are a senior performance marketing strategist.

Rules:
- Use ONLY the provided data
- Do NOT invent numbers
- Be specific and actionable
- Avoid generic advice

Analytics data:
{json.dumps(analytics, indent=2)}

Return STRICT JSON:

{{
  "key_insights": [],
  "problems": [],
  "recommended_actions": [
    {{
      "priority": "HIGH | MEDIUM | LOW",
      "action": "",
      "reason": "",
      "metric_to_track": ""
    }}
  ],
  "budget_advice": ""
}}
"""

def generate_marketing_insights(ai_analytics: dict) -> str:
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(
        build_marketing_prompt(ai_analytics),
        generation_config={"temperature": 0.4}
    )
    return response.text

def safe_parse_ai_response(text: str):
    try:
        return json.loads(text)
    except Exception:
        return {
            "error": "Invalid AI response",
            "raw": text
        }
