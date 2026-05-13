from .base import *
from .database_from_env import build_databases

DATABASES = build_databases()
