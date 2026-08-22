import os
import sys

# Add the directory containing this file to the Python path
# This is crucial for Vercel monorepos so Django can find the 'config' module
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.insert(0, path)

from django.core.wsgi import get_wsgi_application

# Vercel needs 'app' specifically
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
app = get_wsgi_application()
