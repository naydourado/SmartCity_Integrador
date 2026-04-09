from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'responsaveis', ResponsavelViewSet)
router.register(r'locais', LocalViewSet)
router.register(r'ambientes', AmbienteViewSet)
router.register(r'microcontroladores', MicrocontroladorViewSet)
router.register(r'sensores', SensorViewSet)
router.register(r'historicos', HistoricoViewSet)
router.register(r'historicos-recentes', HistoricosRecentesViewSet, basename='historicos-recentes')

urlpatterns = [
    path('', include(router.urls)),
]