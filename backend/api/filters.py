import django_filters
from .models import Usuario, Local, Responsavel, Ambiente, Microcontrolador, Sensor, Historico


class UsuarioFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')
    telefone = django_filters.CharFilter(field_name='telefone', lookup_expr='icontains')
    tipo = django_filters.CharFilter(field_name='tipo', lookup_expr='exact')

    class Meta:
        model = Usuario
        fields = ['nome', 'telefone', 'tipo']


class LocalFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')

    class Meta:
        model = Local
        fields = ['nome']


class ResponsavelFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name='nome', lookup_expr='icontains')

    class Meta:
        model = Responsavel
        fields = ['nome']


class AmbienteFilter(django_filters.FilterSet):
    descricao = django_filters.CharFilter(field_name='descricao', lookup_expr='icontains')
    local = django_filters.NumberFilter(field_name='local')
    responsavel = django_filters.NumberFilter(field_name='responsavel')

    class Meta:
        model = Ambiente
        fields = ['descricao', 'local', 'responsavel']


class MicrocontroladorFilter(django_filters.FilterSet):
    modelo = django_filters.CharFilter(field_name='modelo', lookup_expr='icontains')
    mac_address = django_filters.CharFilter(field_name='mac_address', lookup_expr='icontains')
    status = django_filters.BooleanFilter(field_name='status')
    ambiente = django_filters.NumberFilter(field_name='ambiente')

    class Meta:
        model = Microcontrolador
        fields = ['modelo', 'mac_address', 'status', 'ambiente']


class SensorFilter(django_filters.FilterSet):
    sensor = django_filters.CharFilter(field_name='sensor', lookup_expr='exact')
    unidade_med = django_filters.CharFilter(field_name='unidade_med', lookup_expr='exact')
    status = django_filters.BooleanFilter(field_name='status')
    mic = django_filters.NumberFilter(field_name='mic')

    class Meta:
        model = Sensor
        fields = ['sensor', 'unidade_med', 'status', 'mic']


class HistoricoFilter(django_filters.FilterSet):
    sensor = django_filters.NumberFilter(field_name='sensor')
    valor_min = django_filters.NumberFilter(field_name='valor', lookup_expr='gte')
    valor_max = django_filters.NumberFilter(field_name='valor', lookup_expr='lte')
    timestamp_de = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    timestamp_ate = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')

    tipo_sensor = django_filters.CharFilter(field_name='sensor__sensor', lookup_expr='exact')
    sensor_ativo = django_filters.BooleanFilter(field_name='sensor__status')
    ambiente = django_filters.NumberFilter(field_name='sensor__mic__ambiente')
    local = django_filters.NumberFilter(field_name='sensor__mic__ambiente__local')

    class Meta:
        model = Historico
        fields = [
            'sensor',
            'valor_min',
            'valor_max',
            'timestamp_de',
            'timestamp_ate',
            'tipo_sensor',
            'sensor_ativo',
            'ambiente',
            'local'
        ]