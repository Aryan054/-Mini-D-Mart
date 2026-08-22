import os
from django.core.wsgi import get_wsgi_application

# Vercel needs 'app' specifically
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
app = get_wsgi_application()
