import os
import sys
import django

# pega o caminho até a pasta backend (onde está o manage.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# adiciona no path do Python
sys.path.append(BASE_DIR)

# define o settings do projeto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartcity.settings')

# inicia o Django
django.setup()

import pandas as pd
from api.models import Local, Responsavel, Ambiente, Microcontrolador, Sensor, Historico

class ImportacaoDadosService:
    def importar(self):
        # leitura dos arquivos
        locais = pd.read_excel('../../dados/01 - locais.xlsx')
        responsaveis = pd.read_excel('../../dados/02 - responsaveis.xlsx')
        ambientes = pd.read_excel('../../dados/03 - ambientes.xlsx')
        microcontroladores = pd.read_excel('../../dados/04 - microcontroladores.xlsx')
        sensores = pd.read_excel('../../dados/05-sensores.xlsx')
        historicos = pd.read_excel('../../dados/06 - historicos.xlsx')

        # limpa tabelas antes de importar
        Historico.objects.all().delete()
        Sensor.objects.all().delete()
        Microcontrolador.objects.all().delete()
        Ambiente.objects.all().delete()
        Responsavel.objects.all().delete()
        Local.objects.all().delete()

        # ---------------- LOCAIS ----------------
        # como a planilha não tem id, vamos usar a ordem das linhas
        for i in range(len(locais)):
            Local.objects.create(
                idLocal=i + 1,
                nome=locais.loc[i, 'local']
            )

        # ---------------- RESPONSÁVEIS ----------------
        # também usa a ordem das linhas como id
        for i in range(len(responsaveis)):
            Responsavel.objects.create(
                idResponsavel=i + 1,
                nome=responsaveis.loc[i, 'responsavel']
            )

        # ---------------- AMBIENTES ----------------
        # aqui a planilha já usa os ids de local e responsável
        for i in range(len(ambientes)):
            Ambiente.objects.create(
                idAmbiente=i + 1,
                local=Local.objects.get(pk=int(ambientes.loc[i, 'local'])),
                descricao=ambientes.loc[i, 'descricao'],
                responsavel=Responsavel.objects.get(pk=int(ambientes.loc[i, 'responsavel']))
            )

        # ---------------- MICROCONTROLADORES ----------------
        for i in range(len(microcontroladores)):
            valor_status = str(microcontroladores.loc[i, 'status']).strip().upper()

            if valor_status in ['VERDADEIRO', 'TRUE', '1']:
                status_convertido = True
            else:
                status_convertido = False

            Microcontrolador.objects.create(
                idMicro=i + 1,
                modelo=microcontroladores.loc[i, 'modelo'],
                mac_address=microcontroladores.loc[i, 'mac_address'],
                latitude=microcontroladores.loc[i, 'latitude'],
                longitude=microcontroladores.loc[i, 'longitude'],
                status=status_convertido,
                ambiente=Ambiente.objects.get(pk=int(microcontroladores.loc[i, 'ambiente']))
            )

        # ---------------- SENSORES ----------------
        for i in range(len(sensores)):
            valor_status = str(sensores.loc[i, 'status']).strip().upper()

            if valor_status in ['VERDADEIRO', 'TRUE', '1']:
                status_convertido = True
            else:
                status_convertido = False

            unidade = str(sensores.loc[i, 'unidade_med']).strip()

            # ajusta °C para bater com o model
            if unidade == 'ºC':
                unidade = 'C'

            Sensor.objects.create(
                idSensor=i + 1,
                sensor=str(sensores.loc[i, 'sensor']).strip().lower(),
                unidade_med=unidade,
                mic=Microcontrolador.objects.get(pk=int(sensores.loc[i, 'mic'])),
                status=status_convertido
            )

        # ---------------- HISTÓRICOS ----------------
        for i in range(len(historicos)):
            Historico.objects.create(
                idHistorico=i + 1,
                sensor=Sensor.objects.get(pk=int(historicos.loc[i, 'sensor'])),
                valor=historicos.loc[i, 'valor'],
                timestamp=historicos.loc[i, 'timestamp']
            )

        return {'mensagem': 'Importação realizada com sucesso'}
    
if __name__ == "__main__":
    service = ImportacaoDadosService()
    resultado = service.importar()
    print(resultado)