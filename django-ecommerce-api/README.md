# Django Ecommerce API

An E-commerce API built using Django Rest Framework.

## Basic Features
- Registration using either phone number or email https://github.com/earthcomfy/drf-phone-email-auth
- Basic E-commerce features.
- Custom permissions set for necessary endpoints.
- Payment integration using Stripe.
- Documentation using [DRF Spectacular](https://drf-spectacular.readthedocs.io/en/latest/)
- Dockerized for local development and production

## Technologies Used
- Django Rest Framework
- PostgreSQL
- Celery
- Redis
- Nginx
- Docker
- Stripe

## ER Diagram
Here is the Entity-Relationship diagram generated using https://dbdiagram.io/

![ER-Diagram](https://user-images.githubusercontent.com/66206865/192154014-3299110f-9ab7-4bd2-9dc0-aa6790074ed9.png)

## Getting Started

Clone this repository to your local machine and rename the `.env.example` file found in the root directory of the project to `.env` and update the environment variables accordingly. Development and production both use **PostgreSQL** via [`config/settings/database_from_env.py`](config/settings/database_from_env.py): set **`DATABASE_URL`** (recommended for Neon and other managed hosts; query params such as `sslmode=require` are applied automatically) **or** set `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_HOSTNAME`, and `DB_PORT` (see `.env.example`). If `DATABASE_URL` is non-empty, it takes precedence over the separate `DB_*` variables.

On a **new** Postgres database, apply migrations before using the app:

```
$ docker-compose exec web python manage.py migrate
```

If you previously used SQLite, data does not move automatically; use a fresh database or `dumpdata` / `loaddata` if you need to migrate data.

```
$ docker-compose up
$ docker-compose exec web python manage.py createsuperuser
```

Navigate to http://localhost:8000/admin/

### Product category tree (Piora Farm)

After migrations, seed **six root categories** and default **Product** rows (names with optional `(local_name)`):

```
$ python manage.py seed_piora_categories
```

If you previously ran the old seed (product names as child categories), run once with:

```
$ python manage.py seed_piora_categories --purge-legacy-child-categories
```

Requires `products/data/piora_placeholder.png` for **new** products and a user in the database (first superuser, or any user, as seller). Safe to run multiple times for roots and products; existing products get `local_name` updated when the script provides one.

### Placeholder product & category images

Until you upload real photos, apply the bundled bowl image to **every** `Product.image` and `ProductCategory.icon`:

```
$ python manage.py apply_placeholder_media
```

Replace `products/data/piora_placeholder.png` in the repo when you have a new default, then run the command again. Options: `--skip-products` or `--skip-categories` if you only want one side updated.

### Google Sign-In

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application). Add **Authorized JavaScript origins** for your frontend (e.g. `http://localhost:3000`).
2. Set **`GOOGLE_CLIENT_ID`** in the Django `.env` and **`REACT_APP_GOOGLE_CLIENT_ID`** in the frontend `.env` (see [`../ecommerce-frontend/.env.example`](../ecommerce-frontend/.env.example)) to the **same** Web client ID string. Restart the Django server after editing `.env`. If **`POST /api/user/login/google/`** returns **501** with `code: "google_not_configured"`, Django still sees an empty `GOOGLE_CLIENT_ID` (typo, wrong `.env` path, or server not restarted).
3. Users can sign in or sign up via **Continue with Google** on the login and register pages; the API endpoint is **`POST /api/user/login/google/`** with JSON `{"id_token": "<credential>"}`.
