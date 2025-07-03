from django.contrib import admin

from .models import Address, PhoneNumber, Profile, User

admin.site.register(PhoneNumber)
admin.site.register(Profile)
admin.site.register(Address)
