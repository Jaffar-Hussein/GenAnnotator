"""
URL configuration for GenAnnot project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from rest_framework import routers

routers = routers.DefaultRouter()

urlpatterns = [
    path("", RedirectView.as_view(url='/data/', permanent=True), name='home-redirect'),
    path("admin/", admin.site.urls),
    path("access/", include("AccessControl.urls")),
    path("data/", include("GeneAtlas.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/",include("allauth.urls")),
    path("api/", include(routers.urls)),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)