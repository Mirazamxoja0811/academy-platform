"""
Telegram Bot Utilities
Saytdan botga xabar yuborish uchun helper funksiyalar
"""

import asyncio
from telegram import Bot
from telegram.error import TelegramError
import logging

logger = logging.getLogger(__name__)

# Bot token
BOT_TOKEN = '8970648186:AAEBrOtMd0sHdHpxdqIJe5MNwwEZcNRxvr0'


async def send_telegram_message(telegram_id: int, message: str, parse_mode='HTML'):
    """
    Telegram foydalanuvchiga xabar yuborish
    
    Args:
        telegram_id: Telegram user ID
        message: Yuborilishi kerak bo'lgan xabar
        parse_mode: HTML yoki Markdown
    
    Returns:
        bool: Muvaffaqiyatli yuborildi yoki yo'q
    """
    try:
        bot = Bot(token=BOT_TOKEN)
        await bot.send_message(
            chat_id=telegram_id,
            text=message,
            parse_mode=parse_mode
        )
        logger.info(f"Message sent to {telegram_id}")
        return True
    except TelegramError as e:
        logger.error(f"Failed to send message to {telegram_id}: {e}")
        return False


def send_message_sync(telegram_id: int, message: str, parse_mode='HTML'):
    """
    Sync wrapper for send_telegram_message
    Django views'dan ishlatish uchun
    
    Usage:
        from telegram_bot.utils import send_message_sync
        send_message_sync(123456789, "Yangi xabar!")
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(
        send_telegram_message(telegram_id, message, parse_mode)
    )


async def send_bulk_messages(telegram_ids: list, message: str, parse_mode='HTML'):
    """
    Ko'p foydalanuvchilarga xabar yuborish
    
    Args:
        telegram_ids: List of telegram IDs
        message: Xabar matni
        parse_mode: HTML yoki Markdown
    
    Returns:
        dict: {'success': int, 'failed': int}
    """
    bot = Bot(token=BOT_TOKEN)
    success = 0
    failed = 0
    
    for telegram_id in telegram_ids:
        try:
            await bot.send_message(
                chat_id=telegram_id,
                text=message,
                parse_mode=parse_mode
            )
            success += 1
            # Rate limiting - 1 second delay
            await asyncio.sleep(1)
        except TelegramError as e:
            logger.error(f"Failed to send to {telegram_id}: {e}")
            failed += 1
    
    logger.info(f"Bulk send: {success} success, {failed} failed")
    return {'success': success, 'failed': failed}


def notify_new_message(group_id: int, message_title: str, message_content: str = ""):
    """
    Guruh o'quvchilariga yangi xabar haqida notification
    
    Usage:
        from telegram_bot.utils import notify_new_message
        notify_new_message(group_id=1, message_title="Muhim xabar", message_content="To'liq matn...")
    """
    from main.models import Student, Group
    from telegram_bot.models import TelegramUser
    
    try:
        group = Group.objects.get(id=group_id)
        students = Student.objects.filter(group=group).select_related('user')
        
        telegram_users = []
        for student in students:
            try:
                tg_user = TelegramUser.objects.get(user=student.user)
                telegram_users.append(tg_user.telegram_id)
            except TelegramUser.DoesNotExist:
                continue
        
        if telegram_users:
            # To'liq xabar matni bilan notification
            content_text = f"\n\n{message_content}" if message_content else "\n\nXabarni to'liq o'qish uchun botdan foydalaning."
            
            notification_text = f"""
📬 <b>Yangi Xabar!</b>

<b>{message_title}</b>{content_text}

🎓 Guruh: {group.name}
"""
            # Yangi event loop yaratish
            try:
                loop = asyncio.get_event_loop()
                if loop.is_closed():
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            loop.run_until_complete(
                send_bulk_messages(telegram_users, notification_text)
            )
            logger.info(f"✅ Notification sent to {len(telegram_users)} students")
            return True
        else:
            logger.warning(f"⚠️ No telegram users found for group {group_id}")
            return False
    except Exception as e:
        logger.error(f"❌ Failed to send notification: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def notify_new_test(group_id: int, test_title: str, deadline=None):
    """
    Guruh o'quvchilariga yangi test haqida notification
    
    Usage:
        from telegram_bot.utils import notify_new_test
        notify_new_test(group_id=1, test_title="Python Test")
    """
    from main.models import Student, Group
    from telegram_bot.models import TelegramUser
    
    try:
        group = Group.objects.get(id=group_id)
        students = Student.objects.filter(group=group).select_related('user')
        
        telegram_users = []
        for student in students:
            try:
                tg_user = TelegramUser.objects.get(user=student.user)
                telegram_users.append(tg_user.telegram_id)
            except TelegramUser.DoesNotExist:
                continue
        
        if telegram_users:
            deadline_text = f"\n⏰ Muddat: {deadline.strftime('%d.%m.%Y %H:%M')}" if deadline else ""
            
            notification_text = f"""
📝 <b>Yangi Test!</b>

<b>{test_title}</b>{deadline_text}

Testni topshirish uchun web saytga kiring.

🎓 Guruh: {group.name}
"""
            loop = asyncio.get_event_loop()
            loop.run_until_complete(
                send_bulk_messages(telegram_users, notification_text)
            )
            logger.info(f"Test notification sent to {len(telegram_users)} students")
    except Exception as e:
        logger.error(f"Failed to send test notification: {e}")


def notify_new_coins(student_id: int, amount: int, reason: str):
    """
    O'quvchiga yangi coins haqida notification
    
    Usage:
        from telegram_bot.utils import notify_new_coins
        notify_new_coins(student_id=1, amount=10, reason="Faol ishtirok")
    """
    from main.models import Student
    from telegram_bot.models import TelegramUser
    
    try:
        student = Student.objects.select_related('user').get(id=student_id)
        tg_user = TelegramUser.objects.get(user=student.user)
        
        notification_text = f"""
🪙 <b>Yangi Coins!</b>

Siz <b>+{amount}</b> coins oldingiz!

<b>Sabab:</b> {reason}

💰 Jami coinslaringiz: {student.total_coins}
"""
        send_message_sync(tg_user.telegram_id, notification_text)
        logger.info(f"Coins notification sent to student {student_id}")
    except TelegramUser.DoesNotExist:
        logger.warning(f"TelegramUser not found for student {student_id}")
    except Exception as e:
        logger.error(f"Failed to send coins notification: {e}")


def notify_new_grade(student_id: int, subject: str, grade: int, teacher_name: str = "", date_time: str = ""):
    """
    O'quvchiga yangi baho haqida notification
    """
    from main.models import Student
    from telegram_bot.models import TelegramUser
    from datetime import datetime
    
    if not date_time:
        date_time = datetime.now().strftime('%d.%m.%Y %H:%M')
    
    try:
        student = Student.objects.select_related('user').get(id=student_id)
        tg_user = TelegramUser.objects.get(user=student.user)
        
        student_name = student.user.get_full_name() or student.user.username
        
        notification_text = f"""Talaba {student_name} darsda baxo oldi.

Fan: {subject}
Mentor: {teacher_name}
Vaqt: {date_time}
Baxo: 🟢 {grade}
"""
        send_message_sync(tg_user.telegram_id, notification_text)
        logger.info(f"Grade notification sent to student {student_id}")
    except TelegramUser.DoesNotExist:
        logger.warning(f"TelegramUser not found for student {student_id}")
    except Exception as e:
        logger.error(f"Failed to send grade notification: {e}")

def notify_attendance(student_id: int, subject: str, teacher_name: str, date_str: str, status: str, time_range: str = ""):
    """
    Davomat haqida umumiy xabarnoma (Keldi, Kelmadi, Sababli)
    """
    from main.models import Student
    from telegram_bot.models import TelegramUser
    
    try:
        student = Student.objects.select_related('user').get(id=student_id)
        tg_user = TelegramUser.objects.get(user=student.user)
        
        student_name = student.user.get_full_name() or student.user.username
        
        time_text = f" Dars {time_range} oralig'ida o'tkazildi." if time_range else ""
        
        if status in ['absent', 'false', False]:
            notification_text = f"""🔴 Hurmatli {student_name},

Siz {subject} fanidan {date_str} sanasidagi darsga qatnashmadingiz.{time_text}

Sizning ta'lim jarayonida muntazam qatnashishingiz muvaffaqiyatingiz uchun juda muhim. Iltimos, darslarimizga o'z vaqtida qatnashing.

Hurmat bilan, Fan mentori {teacher_name}"""
        elif status == 'present':
            notification_text = f"""🟢 Hurmatli {student_name},

Siz {subject} fanidan {date_str} sanasidagi darsga qatnashdingiz.{time_text}

Muvaffaqiyatlar tilaymiz! O'qishdan charchamang.

Hurmat bilan, Fan mentori {teacher_name}"""
        elif status == 'excused':
            notification_text = f"""🟡 Hurmatli {student_name},

Siz {subject} fanidan {date_str} sanasidagi darsga sababli qatnashmadingiz.{time_text} Darslarni o'zlashtirib oling.

Hurmat bilan, Fan mentori {teacher_name}"""
        else:
            return
            
        send_message_sync(tg_user.telegram_id, notification_text)
        logger.info(f"Attendance ({status}) notification sent to student {student_id}")
    except TelegramUser.DoesNotExist:
        logger.warning(f"TelegramUser not found for student {student_id}")
    except Exception as e:
        logger.error(f"Failed to send attendance notification: {e}")
