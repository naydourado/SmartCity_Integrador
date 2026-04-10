from django.db import models
from django.contrib.auth.models import User

# Locais
class Local(models.Model):
    idLocal = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)

    class Meta:
        db_table = 'locais'

    def __str__(self):
        return self.nome
    

# Responsáveis
class Responsavel(models.Model):
    idResponsavel = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)

    class Meta:
        db_table = 'responsaveis'

    def __str__(self):
        return self.nome
    
    
# Ambientes
class Ambiente(models.Model):
    idAmbiente = models.AutoField(primary_key=True)

    local = models.ForeignKey(
        Local,
        on_delete=models.CASCADE,
        db_column='local'
    )

    descricao = models.CharField(max_length=200)

    responsavel = models.ForeignKey(
        Responsavel,
        on_delete=models.CASCADE,
        db_column='responsavel'
    )

    class Meta:
        db_table = 'ambientes'

    def __str__(self):
        return self.descricao
    
# Microcontroladores
class Microcontrolador(models.Model):
    idMicro = models.AutoField(primary_key=True)

    modelo = models.CharField(max_length=100)
    mac_address = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    status = models.BooleanField()

    ambiente = models.ForeignKey(
        Ambiente,
        on_delete=models.CASCADE,
        db_column='ambiente'
    )

    class Meta:
        db_table = 'microcontroladores'

    def __str__(self):
        return self.modelo


# Sensores
class Sensor(models.Model):
    idSensor = models.AutoField(primary_key=True)

    TIPO_CHOICES = [
        ('temperatura', 'Temperatura'),
        ('umidade', 'Umidade'),
        ('luminosidade', 'Luminosidade'),
        ('contador', 'Contador'),
    ]

    UNIDADE_CHOICES = [
        ('C', '°C'),
        ('%', '%'),
        ('lux', 'lux'),
        ('uni', 'uni'),
    ]

    sensor = models.CharField(max_length=20, choices=TIPO_CHOICES)
    unidade_med = models.CharField(max_length=10, choices=UNIDADE_CHOICES)

    mic = models.ForeignKey(
        Microcontrolador,
        on_delete=models.CASCADE,
        db_column='mic'
    )

    status = models.BooleanField()

    class Meta:
        db_table = 'sensores'

    def __str__(self):
        return self.sensor


# Históricos
class Historico(models.Model):
    idHistorico = models.AutoField(primary_key=True)

    sensor = models.ForeignKey(
        Sensor,
        on_delete=models.CASCADE,
        db_column='sensor'
    )

    valor = models.FloatField()
    timestamp = models.DateTimeField()

    class Meta:
        db_table = 'historicos'

    def __str__(self):
        return f"{self.sensor} - {self.valor}"
    

# Usuários
class Usuario(models.Model):
    idUsuario = models.AutoField(primary_key=True)

    TIPO_CHOICES = [
        ('admin', 'Administrador'),
        ('user', 'Usuário'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    nome = models.CharField(max_length=100)
    telefone = models.CharField(max_length=20)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return self.nome
