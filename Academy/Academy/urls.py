"""
URL configuration for Academy project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('superadmin/', admin.site.urls),
    path('', include('main.urls')),
]

# Frontend static assets (_next, favicon) — dev va production
if settings.FRONTEND_DIR.exists():
    urlpatterns += [
        re_path(
            r'^_next/(?P<path>.*)$',
            serve,
            {'document_root': settings.FRONTEND_DIR / '_next'},
        ),
        re_path(
            r'^(?P<path>favicon\.ico|.*\.svg)$',
            serve,
            {'document_root': settings.FRONTEND_DIR},
        ),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
