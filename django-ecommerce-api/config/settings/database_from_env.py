"""Build Django DATABASES from DATABASE_URL (e.g. Neon) or from DB_* variables."""
from urllib.parse import parse_qs, unquote, urlparse

from decouple import config
from django.core.exceptions import ImproperlyConfigured


def _ensure_neon_ssl(host, options):
    """Neon requires TLS; set sslmode if not already provided."""
    if not host or "neon.tech" not in host.lower():
        return
    if "sslmode" not in options:
        options["sslmode"] = "require"


def build_databases():
    url = config("DATABASE_URL", default="").strip()
    if url.startswith(("postgres://", "postgresql://")):
        return _from_database_url(url)
    return _from_split_env()


def _from_database_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in ("postgres", "postgresql"):
        raise ValueError(
            "DATABASE_URL must use the postgres:// or postgresql:// scheme."
        )
    path = (parsed.path or "").lstrip("/")
    if not path:
        raise ValueError("DATABASE_URL must include a database name after the host.")
    hostname = parsed.hostname or ""
    if not hostname:
        raise ValueError("DATABASE_URL must include a host.")
    username = unquote(parsed.username or "")
    password = unquote(parsed.password or "")
    port = str(parsed.port or 5432)
    options = {}
    if parsed.query:
        for key, values in parse_qs(parsed.query).items():
            if values:
                options[key] = values[0]
    _ensure_neon_ssl(hostname, options)
    cfg = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": path,
        "USER": username,
        "PASSWORD": password,
        "HOST": hostname,
        "PORT": port,
    }
    if options:
        cfg["OPTIONS"] = options
    return {"default": cfg}


def _from_split_env():
    name = config("DB_NAME", default="").strip()
    user = config("DB_USERNAME", default="").strip()
    password = config("DB_PASSWORD", default="").strip()
    host = config("DB_HOSTNAME", default="").strip()
    port = (config("DB_PORT", default="5432") or "5432").strip()
    if not name or not user or not host:
        raise ImproperlyConfigured(
            "Database is not configured. Set DATABASE_URL to a full postgresql:// URL (see .env.example), "
            "or set DB_NAME, DB_USERNAME, DB_PASSWORD, and DB_HOSTNAME."
        )
    options = {}
    sslmode = config("DB_SSLMODE", default="").strip()
    if sslmode:
        options["sslmode"] = sslmode
    _ensure_neon_ssl(host, options)
    cfg = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": name,
        "USER": user,
        "PASSWORD": password,
        "HOST": host,
        "PORT": port,
    }
    if options:
        cfg["OPTIONS"] = options
    return {"default": cfg}
