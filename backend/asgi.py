"""
ASGI config for backend project.
"""
import os
import pymysql
pymysql.install_as_MySQLdb()

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')

application = get_asgi_application()