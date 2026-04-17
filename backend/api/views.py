from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend

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

    def get_permissions(self):
        if self.action == 'tipo_choices':
            return [AllowAny()]
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

    @action(detail=False, methods=['get'], url_path='tipo-choices')
    def tipo_choices(self, request):
        return Response([
            {"value": valor, "label": nome}
            for valor, nome in Usuario.TIPO_CHOICES
        ])

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        usuario = Usuario.objects.filter(user=request.user).first()

        if not usuario:
            return Response(
                {'detail': 'Perfil de usuário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

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
    filterset_fields = ['local', 'responsavel', 'descricao']


class MicrocontroladorViewSet(viewsets.ModelViewSet):
    queryset = Microcontrolador.objects.all()
    serializer_class = MicrocontroladorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['modelo', 'status', 'ambiente']


class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sensor', 'status', 'mic']


class HistoricoViewSet(viewsets.ModelViewSet):
    queryset = Historico.objects.all().order_by('-timestamp')
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'sensor': ['exact'],
        'timestamp': ['exact', 'gte', 'lte'],
        'sensor__sensor': ['exact'],
        'sensor__status': ['exact'],
        'sensor__mic__ambiente': ['exact'],
        'sensor__mic__ambiente__local': ['exact'],
    }


class HistoricosRecentesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HistoricoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'sensor': ['exact'],
        'sensor__sensor': ['exact'],
        'sensor__status': ['exact'],
        'sensor__mic__ambiente__local': ['exact'],
    }

    def get_queryset(self):
        ultimas_24h = timezone.now() - timedelta(hours=24)
        return Historico.objects.filter(timestamp__gte=ultimas_24h).order_by('-timestamp')


class ImportarDadosView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            service = ImportacaoDadosService()
            resultado = service.importar()
            return Response(resultado, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'erro': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )