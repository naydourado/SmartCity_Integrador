from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Usuario, Responsavel, Local, Ambiente, Microcontrolador, Sensor, Historico


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    nome = serializers.CharField(required=False, allow_blank=True, default='')
    telefone = serializers.CharField(required=False, allow_blank=True, default='')
    tipo = serializers.ChoiceField(choices=Usuario.TIPO_CHOICES)

    def create(self, validated_data):
        nome = validated_data.get('nome', '')
        email = validated_data.get('email', '')
        telefone = validated_data.get('telefone', '')
        tipo = validated_data['tipo']

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password']
        )

        if tipo == 'admin':
            user.is_staff = True
        else:
            user.is_staff = False

        user.is_active = True
        user.is_superuser = False
        user.save()

        Usuario.objects.create(
            user=user,
            nome=nome if nome else user.username,
            telefone=telefone,
            tipo=tipo
        )

        return user


class UsuarioMeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'idUsuario',
            'nome',
            'telefone',
            'tipo',
            'username',
            'email',
            'is_superuser',
            'is_staff',
            'is_active'
        ]


class ResponsavelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsavel
        fields = '__all__'


class LocalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Local
        fields = '__all__'


class AmbienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambiente
        fields = '__all__'


class MicrocontroladorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Microcontrolador
        fields = '__all__'


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'


class HistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historico
        fields = '__all__'

    def validate(self, data):
        sensor = data.get('sensor')

        if sensor and not sensor.status:
            raise serializers.ValidationError(
                'Não é permitido registrar medição para sensor inativo.'
            )

        return data