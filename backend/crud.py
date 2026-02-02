from sqlalchemy.orm import Session
import models
from sqlalchemy import text
from schemas import BillCreate

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


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


# --------------------
# CAMPAIGNS
# --------------------

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
# CHATS
# --------------------

def create_or_get_chat(
    db: Session,
    campaign_id: int,
    vendor_id: int,
    influencer_id: int
):
    chat = (
        db.query(models.Chat)
        .filter(
            models.Chat.campaign_id == campaign_id,
            models.Chat.vendor_id == vendor_id,
            models.Chat.influencer_id == influencer_id
        )
        .first()
    )

    if not chat:
        chat = models.Chat(
            campaign_id=campaign_id,
            vendor_id=vendor_id,
            influencer_id=influencer_id
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)

    return chat


def get_chats_by_user(db: Session, user_id: int):
    return (
        db.query(models.Chat)
        .filter(
            (models.Chat.vendor_id == user_id) |
            (models.Chat.influencer_id == user_id)
        )
        .all()
    )


# --------------------
# MESSAGES
# --------------------

def create_message(db: Session, chat_id: int, sender_id: int, text: str):
    message = models.Message(
        chat_id=chat_id,
        sender_id=sender_id,
        text=text
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_messages_by_chat(db: Session, chat_id: int):
    return (
        db.query(models.Message)
        .filter(models.Message.chat_id == chat_id)
        .order_by(models.Message.created_at)
        .all()
    )

# --------------------
# TOKENS
# --------------------

def get_user_tokens(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.tokens if user else None


def deduct_tokens(db: Session, user_id: int, amount: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        return None

    if user.tokens < amount:
        return "INSUFFICIENT"

    user.tokens -= amount
    db.commit()
    db.refresh(user)
    return user.tokens
    

def get_profile(db: Session, user_id: int):
    profile = db.query(models.InfluencerProfile)\
        .filter(models.InfluencerProfile.user_id == user_id)\
        .first()

    if not profile:
        return None

    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "niche": profile.niche,
        "followers_range": profile.followers_range,
        "engagement": profile.engagement,
        "bio": profile.bio,
        "availability": profile.availability,
        "content_types": profile.content_types.split(",") if profile.content_types else []
    }


def create_or_update_profile(db: Session, data):
    profile = db.query(models.InfluencerProfile)\
        .filter(models.InfluencerProfile.user_id == data.user_id)\
        .first()

    content_types_str = ",".join(data.content_types)

    if profile:
        profile.name = data.name
        profile.niche = data.niche
        profile.followers_range = data.followers_range
        profile.engagement = data.engagement
        profile.bio = data.bio
        profile.availability = data.availability
        profile.content_types = content_types_str
    else:
        profile = models.InfluencerProfile(
            user_id=data.user_id,
            name=data.name,
            niche=data.niche,
            followers_range=data.followers_range,
            engagement=data.engagement,
            bio=data.bio,
            availability=data.availability,
            content_types=content_types_str,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return get_profile(db, data.user_id)


# -------- PRODUCTS --------
def create_product(db: Session, data):
    product = models.Product(**data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session, vendor_id: int):
    return db.query(models.Product).filter(
        models.Product.vendor_id == vendor_id
    ).all()


# -------- BILLS --------
def create_bill(db: Session, bill):
    product = db.query(models.Product).filter(
        models.Product.id == bill.product_id,
        models.Product.vendor_id == bill.vendor_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.quantity_available < bill.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # 🔑 CORE LOGIC
    cost_price = product.cost_price           # PER UNIT
    selling_price = bill.selling_price        # PER UNIT

    profit_per_unit = selling_price - cost_price
    total_profit = profit_per_unit * bill.quantity

    new_bill = models.Bill(
        vendor_id=bill.vendor_id,
        product_id=bill.product_id,
        quantity=bill.quantity,
        selling_price=selling_price,
        cost_price=cost_price,
        profit=total_profit
    )

    product.quantity_available -= bill.quantity

    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return new_bill
