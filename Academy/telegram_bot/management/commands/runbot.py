import logging
import os
import django
from django.core.management.base import BaseCommand
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, ConversationHandler

from telegram_bot.utils import BOT_TOKEN
from telegram_bot.models import TelegramUser
from django.contrib.auth import authenticate
from main.models import CustomUser

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Web app url
WEB_APP_URL = "http://16.171.67.128"

# States for conversation
USERNAME, PASSWORD = range(2)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    from asgiref.sync import sync_to_async
    
    @sync_to_async
    def get_telegram_user(telegram_id):
        return TelegramUser.objects.filter(telegram_id=telegram_id).first()
        
    tg_user = await get_telegram_user(user.id)
    
    if tg_user:
        keyboard = [[InlineKeyboardButton("🌐 Saytni ochish", url=WEB_APP_URL)]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_html(
            rf"Salom {user.mention_html()}! Siz allaqachon bog'langansiz ({tg_user.user.get_full_name() or tg_user.user.username}). Saytga kirish uchun quyidagi tugmani bosing:",
            reply_markup=reply_markup,
        )
        return ConversationHandler.END
    else:
        await update.message.reply_html(
            rf"Salom {user.mention_html()}! O'quv platformamizga xush kelibsiz.\n\nSizga baho va davomat xabarlarini yuborishimiz uchun hisobingizni bog'lashimiz kerak.\n\nIltimos, saytdagi <b>Loginingizni (Username)</b> kiriting:",
        )
        return USERNAME

async def get_username(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['username'] = update.message.text.strip()
    await update.message.reply_text("Yaxshi. Endi saytdagi parolingizni kiriting:")
    return PASSWORD

async def get_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    password = update.message.text.strip()
    username = context.user_data.get('username')
    user = update.effective_user
    
    from asgiref.sync import sync_to_async
    
    @sync_to_async
    def authenticate_and_link(un, pw, telegram_user_info):
        django_user = authenticate(username=un, password=pw)
        if django_user:
            TelegramUser.objects.update_or_create(
                user=django_user,
                defaults={
                    'telegram_id': telegram_user_info.id,
                    'username': telegram_user_info.username,
                    'first_name': telegram_user_info.first_name,
                    'last_name': telegram_user_info.last_name,
                }
            )
            return django_user
        return None
        
    django_user = await authenticate_and_link(username, password, user)
    
    # Delete the password message for security if possible
    try:
        await update.message.delete()
    except:
        pass
        
    if django_user:
        keyboard = [[InlineKeyboardButton("🌐 Saytni ochish", url=WEB_APP_URL)]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_html(
            f"✅ <b>Muvaffaqiyatli bog'landi!</b>\n\nHurmatli {django_user.get_full_name() or django_user.username}, sizning profilingiz ulandi. Endi baho va davomat xabarlari shu botga keladi.",
            reply_markup=reply_markup
        )
    else:
        await update.message.reply_html(
            "❌ <b>Login yoki parol xato!</b>\n\nIltimos, qaytadan /start komandasini bosib, to'g'ri login va parolni kiriting."
        )
        
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text("Amaliyot bekor qilindi. Qaytadan boshlash uchun /start bosing.")
    return ConversationHandler.END

class Command(BaseCommand):
    help = 'Starts the Telegram bot'

    def handle(self, *args, **options):
        self.stdout.write("Starting telegram bot...")
        
        application = Application.builder().token(BOT_TOKEN).build()
        
        conv_handler = ConversationHandler(
            entry_points=[CommandHandler("start", start)],
            states={
                USERNAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_username)],
                PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_password)],
            },
            fallbacks=[CommandHandler("cancel", cancel)],
        )

        application.add_handler(conv_handler)
        
        # Run the bot
        application.run_polling(allowed_updates=Update.ALL_TYPES)
