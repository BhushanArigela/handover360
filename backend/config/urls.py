
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('accounts.urls')),
    path('api/enquiries/', include('enquiries.urls')),
    # path('api/responses/',include('response.urls')),
    path('api/certificates/',include('certificates.urls')),
    path('api/notifications/',include('notifications.urls')),
    path("api/notifications/", include("notifications.urls")),
    path("api/masters/", include("masters.urls")),
    path("api/inspection/", include("inspection.urls"),),
]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )