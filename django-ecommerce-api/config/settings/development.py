import os

from .base import *
from .database_from_env import build_databases

# PostgreSQL: set DATABASE_URL (e.g. Neon) or DB_* in .env — see .env.example
DATABASES = build_databases()

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "../", "mediafiles")


STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "../", "staticfiles")

# Override Redis cache with local memory cache for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
