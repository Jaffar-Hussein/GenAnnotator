from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'phone_number', 'is_active', 'last_login_time')
    list_filter = ('role', 'is_active', 'is_staff', 'groups')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('-last_login_time',)
    readonly_fields = ('last_login_time',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'email', 'phone_number')
        }),
        (_('Role and Permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {
            'fields': ('date_joined', 'last_login_time'),
            'classes': ('collapse',),
            'description': _('Last login time is automatically updated and cannot be modified.')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone_number', 'role', 'password1', 'password2'),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        readonly_fields.append('last_login_time')
        if not request.user.is_superuser:
            readonly_fields.extend(['role', 'is_superuser', 'user_permissions'])
        return readonly_fields
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if not request.user.is_superuser:
            return queryset.filter(role__in=['READER', 'ANNOTATOR', 'VALIDATOR'])
        return queryset
    
   