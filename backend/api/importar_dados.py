import pandas as pd
from api.models import Local, Responsavel, Ambiente, Microcontrolador, Sensor, Historico

def importar():
    Historico.objects.all().delete()
    Sensor.objects.all().delete()
    Microcontrolador.objects.all().delete()
    Ambiente.objects.all().delete()
    Responsavel.objects.all().delete()
    Local.objects.all().delete()

    df_locais = pd.read_excel('dados/01 - locais.xlsx')
    for _, row in df_locais.iterrows():
        Local.objects.create(nome=row['local'])

    df_responsaveis = pd.read_excel('dados/02 - responsaveis.xlsx')
    for _, row in df_responsaveis.iterrows():
        Responsavel.objects.create(nome=row['responsavel'])

    df_ambientes = pd.read_excel('dados/03 - ambientes.xlsx')
    for _, row in df_ambientes.iterrows():
        Ambiente.objects.create(
            local=Local.objects.get(pk=row['local']),
            descricao=row['descricao'],
            responsavel=Responsavel.objects.get(pk=row['responsavel'])
        )

    df_micro = pd.read_excel('dados/04 - microcontroladores.xlsx')
    for _, row in df_micro.iterrows():
        Microcontrolador.objects.create(
            modelo=row['modelo'],
            mac_address=row['mac_address'],
            latitude=row['latitude'],
            longitude=row['longitude'],
            status=bool(row['status']),
            ambiente=Ambiente.objects.get(pk=row['ambiente'])
        )

    df_sensores = pd.read_excel('dados/05-sensores.xlsx')
    for _, row in df_sensores.iterrows():
        Sensor.objects.create(
            sensor=row['sensor'],
            unidade_med=row['unidade_med'],
            mic=Microcontrolador.objects.get(pk=row['mic']),
            status=bool(row['status'])
        )

    df_historicos = pd.read_excel('dados/06 - historicos.xlsx')
    for _, row in df_historicos.iterrows():
        Historico.objects.create(
            sensor=Sensor.objects.get(pk=row['sensor']),
            valor=row['valor'],
            timestamp=row['timestamp']
        )

    print('Importação concluída com sucesso!')