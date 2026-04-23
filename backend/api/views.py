from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from .filters import (
    UsuarioFilter,
    LocalFilter,
    ResponsavelFilter,
    AmbienteFilter,
    MicrocontroladorFilter,
    SensorFilter,
    HistoricoFilter
)

from .models import Usuario, Responsavel, Local, Ambiente, Microcontrolador, Sensor, Historico
from .serializers import (
    RegisterSerializer,
    UsuarioSerializer,
    UsuarioMeSerializer,
    ResponsavelSerializer,
    LocalSerializer,
    AmbienteSerializer,
    MicrocontroladorSerializer,
    SensorSerializer,
    HistoricoSerializer
)
from .services.importar_dados import ImportacaoDadosService

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend]
    filterset_class = UsuarioFilter

    def get_permissions(self):
        if self.action == 'tipo_choices':
            return [AllowAny()]
        if self.action == 'me':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()

        if self.request.user.is_staff:
            return qs

        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'me':
            return UsuarioMeSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        usuario, created = Usuario.objects.get_or_create(
            user=request.user,
            defaults={
                'nome': request.user.get_full_name() or request.user.username,
                'telefone': '',
                'tipo': 'admin' if request.user.is_staff or request.user.is_superuser else 'user'
            }
        )

        tipo_correto = 'admin' if request.user.is_staff or request.user.is_superuser else 'user'

        alterado = False

        if usuario.tipo != tipo_correto:
            usuario.tipo = tipo_correto
            alterado = True

        if not usuario.nome:
            usuario.nome = request.user.get_full_name() or request.user.username
            alterado = True

        if alterado:
            usuario.save()

        serializer = self.get_serializer(usuario)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'mensagem': 'Usuário cadastrado com sucesso'},
            status=status.HTTP_201_CREATED
        )


class ResponsavelViewSet(viewsets.ModelViewSet):
    queryset = Responsavel.objects.all()
    serializer_class = ResponsavelSerializer
    permission_classes = [IsAuthenticated]


class LocalViewSet(viewsets.ModelViewSet):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nome']


class AmbienteViewSet(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AmbienteFilter


class MicrocontroladorViewSet(viewsets.ModelViewSet):
    queryset = Microcontrolador.objects.all()
    serializer_class = MicrocontroladorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MicrocontroladorFilter


class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = SensorFilter


class HistoricoViewSet(viewsets.ModelViewSet):
    queryset = Historico.objects.all().order_by('-timestamp')
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = HistoricoFilter


class HistoricosRecentesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = HistoricoFilter

    def get_queryset(self):
        ultimas_24h = timezone.now() - timedelta(hours=24)
        return Historico.objects.filter(timestamp__gte=ultimas_24h).order_by('-timestamp')


class ImportarDadosView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            raise PermissionDenied("Você não tem permissão para importar dados.")

        try:
            service = ImportacaoDadosService()
            resultado = service.importar()
            return Response(resultado, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'erro': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )