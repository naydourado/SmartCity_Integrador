from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class RegisterSerializer(serializers.Serializer):
    # dados que serão criados na tabela auth_user
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        user.is_active = True
        user.save()

        return user


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