import logging
from django.core.management.base import BaseCommand
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

from telegram_bot.utils import BOT_TOKEN

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Web app url
WEB_APP_URL = "http://16.171.67.128"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    
    # Optional: save to database if you want to link later
    from asgiref.sync import sync_to_async
    
    # We create a simple keyboard with a link to the web app
    keyboard = [
        [InlineKeyboardButton("🌐 Saytni ochish", url=WEB_APP_URL)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_html(
        rf"Salom {user.mention_html()}! O'quv platformamizga xush kelibsiz. Saytga kirish uchun quyidagi tugmani bosing:",
        reply_markup=reply_markup,
    )


class Command(BaseCommand):
    help = 'Starts the Telegram bot'

    def handle(self, *args, **options):
        self.stdout.write("Starting telegram bot...")
        
        application = Application.builder().token(BOT_TOKEN).build()
        
        # Add handlers
        application.add_handler(CommandHandler("start", start))
        
        # Run the bot
        application.run_polling(allowed_updates=Update.ALL_TYPES)
