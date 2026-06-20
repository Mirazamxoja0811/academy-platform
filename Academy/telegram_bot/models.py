from django.db import models
from main.models import CustomUser


class TelegramUser(models.Model):
    """Telegram va Django User o'rtasida bog'lanish"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='telegram_profile')
    telegram_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    language_code = models.CharField(max_length=10, default='uz')
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} (@{self.username})"
    
    class Meta:
        verbose_name = 'Telegram User'
        verbose_name_plural = 'Telegram Users'


class BotMessage(models.Model):
    """Bot orqali yuborilgan xabarlar tarixi"""
    telegram_user = models.ForeignKey(TelegramUser, on_delete=models.CASCADE, related_name='bot_messages')
    message_type = models.CharField(max_length=50)
    message_text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-sent_at']
