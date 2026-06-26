import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from sqlalchemy.future import select
from passlib.hash import django_pbkdf2_sha256
from database import get_db
from models import CustomUser

BOT_TOKEN = os.getenv("BOT_TOKEN", "8970648186:AAEBrOtMd0sHdHpxdqIJe5MNwwEZcNRxvr0")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://yourdomain.com/webhook")

# Initialize PTB Application
ptb_app = Application.builder().token(BOT_TOKEN).build()

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Simple start command for testing."""
    telegram_id = str(update.message.chat_id)
    
    async for db in get_db():
        result = await db.execute(select(CustomUser).where(CustomUser.telegram_id == telegram_id))
        user = result.scalars().first()
        
        if user:
            await update.message.reply_text(f"Salom, {user.first_name or user.username}! Siz tizimga kirgansiz. Chqish uchun /logout bosing.")
        else:
            await update.message.reply_text(
                "Salom! Mentor Academy botiga xush kelibsiz.\n"
                "Tizimga kirish uchun quyidagi buyruqdan foydalaning:\n"
                "`/login username parol`\n\n"
                "Masalan: `/login admin 1234`",
                parse_mode="Markdown"
            )
        break

async def login_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if len(context.args) < 2:
        await update.message.reply_text("Iltimos, login va parolni kiriting.\nFormat: `/login username parol`", parse_mode="Markdown")
        return
        
    username = context.args[0]
    password = " ".join(context.args[1:])
    telegram_id = str(update.message.chat_id)
    
    async for db in get_db():
        result = await db.execute(select(CustomUser).where(CustomUser.username == username))
        user = result.scalars().first()
        
        if not user:
            await update.message.reply_text("❌ Login yoki parol noto'g'ri.")
            break
            
        try:
            is_valid = django_pbkdf2_sha256.verify(password, user.password)
        except Exception as e:
            is_valid = False
            
        if is_valid:
            user.telegram_id = telegram_id
            await db.commit()
            await update.message.reply_text(f"✅ Muvaffaqiyatli kirdingiz, {user.first_name or user.username}!")
        else:
            await update.message.reply_text("❌ Login yoki parol noto'g'ri.")
        break

async def logout_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = str(update.message.chat_id)
    
    async for db in get_db():
        result = await db.execute(select(CustomUser).where(CustomUser.telegram_id == telegram_id))
        user = result.scalars().first()
        
        if user:
            user.telegram_id = None
            await db.commit()
            await update.message.reply_text("✅ Tizimdan muvaffaqiyatli chiqdingiz.")
        else:
            await update.message.reply_text("Siz tizimga kirmagansiz.")
        break

ptb_app.add_handler(CommandHandler("start", start_command))
ptb_app.add_handler(CommandHandler("login", login_command))
ptb_app.add_handler(CommandHandler("logout", logout_command))

async def init_webhook():
    """Set Webhook on Telegram API"""
    await ptb_app.bot.set_webhook(url=WEBHOOK_URL)

async def process_update(request_data: dict):
    """Process incoming update from Telegram"""
    update = Update.de_json(request_data, ptb_app.bot)
    await ptb_app.process_update(update)
