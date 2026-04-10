import pandas as pd
from api.models import Local, Responsavel, Ambiente, Microcontrolador, Sensor, Historico


class ImportacaoDadosService:
    def importar(self):

        # leitura dos arquivos Excel (direto da pasta "dados")
        locais = pd.read_excel('dados/01 - locais.xlsx')
        responsaveis = pd.read_excel('dados/02 - responsaveis.xlsx')
        ambientes = pd.read_excel('dados/03 - ambientes.xlsx')
        microcontroladores = pd.read_excel('dados/04 - microcontroladores.xlsx')
        sensores = pd.read_excel('dados/05-sensores.xlsx')
        historicos = pd.read_excel('dados/06 - historicos.xlsx')

        # limpa todas as tabelas antes de importar (evita duplicidade e erro de FK)
        Historico.objects.all().delete()
        Sensor.objects.all().delete()
        Microcontrolador.objects.all().delete()
        Ambiente.objects.all().delete()
        Responsavel.objects.all().delete()
        Local.objects.all().delete()

        # ---------------- LOCAIS ----------------
        # cria cada local com base na coluna "local"
        for i in range(len(locais)):
            Local.objects.create(
                nome=locais.loc[i, 'local']
            )

        # ---------------- RESPONSÁVEIS ----------------
        # cria cada responsável
        for i in range(len(responsaveis)):
            Responsavel.objects.create(
                nome=responsaveis.loc[i, 'responsavel']
            )

        # ---------------- AMBIENTES ----------------
        # cria ambiente e liga com local e responsável
        for i in range(len(ambientes)):
            Ambiente.objects.create(
                local=Local.objects.get(pk=ambientes.loc[i, 'local']),
                descricao=ambientes.loc[i, 'descricao'],
                responsavel=Responsavel.objects.get(pk=ambientes.loc[i, 'responsavel'])
            )

        # ---------------- MICROCONTROLADORES ----------------
        # cria microcontrolador e liga com ambiente
        for i in range(len(microcontroladores)):
            Microcontrolador.objects.create(
                modelo=microcontroladores.loc[i, 'modelo'],
                mac_address=microcontroladores.loc[i, 'mac_address'],
                latitude=microcontroladores.loc[i, 'latitude'],
                longitude=microcontroladores.loc[i, 'longitude'],
                status=microcontroladores.loc[i, 'status'],
                ambiente=Ambiente.objects.get(pk=microcontroladores.loc[i, 'ambiente'])
            )

        # ---------------- SENSORES ----------------
        # cria sensor e liga com microcontrolador
        for i in range(len(sensores)):
            Sensor.objects.create(
                sensor=sensores.loc[i, 'sensor'],
                unidade_med=sensores.loc[i, 'unidade_med'],
                mic=Microcontrolador.objects.get(pk=sensores.loc[i, 'mic']),
                status=sensores.loc[i, 'status']
            )

        # ---------------- HISTÓRICOS ----------------
        # cria medições e liga com sensor
        for i in range(len(historicos)):
            Historico.objects.create(
                sensor=Sensor.objects.get(pk=historicos.loc[i, 'sensor']),
                valor=historicos.loc[i, 'valor'],
                timestamp=historicos.loc[i, 'timestamp']
            )

        # retorno simples para confirmar que funcionou
        return {'mensagem': 'Importação realizada com sucesso'}