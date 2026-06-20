from django.contrib import admin
from .models import TelegramUser, BotMessage


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = ['user', 'telegram_id', 'username', 'is_active', 'last_activity']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'username', 'telegram_id']
    readonly_fields = ['created_at', 'last_activity']


@admin.register(BotMessage)
class BotMessageAdmin(admin.ModelAdmin):
    list_display = ['telegram_user', 'message_type', 'message_text', 'sent_at']
    list_filter = ['message_type', 'sent_at']
    search_fields = ['telegram_user__user__username', 'message_text']
    readonly_fields = ['sent_at']
