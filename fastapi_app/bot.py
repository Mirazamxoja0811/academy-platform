import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.getenv("BOT_TOKEN", "8970648186:AAEBrOtMd0sHdHpxdqIJe5MNwwEZcNRxvr0")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://yourdomain.com/webhook")

# Initialize PTB Application
ptb_app = Application.builder().token(BOT_TOKEN).build()

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Simple start command for testing."""
    await update.message.reply_text("Salom! Men FastAPI orqali ishlayapman 🚀")

ptb_app.add_handler(CommandHandler("start", start_command))

async def init_webhook():
    """Set Webhook on Telegram API"""
    await ptb_app.bot.set_webhook(url=WEBHOOK_URL)

async def process_update(request_data: dict):
    """Process incoming update from Telegram"""
    update = Update.de_json(request_data, ptb_app.bot)
    await ptb_app.process_update(update)
