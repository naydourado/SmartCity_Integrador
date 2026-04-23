# Smart City – Monitoramento de Sensores

Sistema web para monitoramento de ambientes com sensores (temperatura, umidade, luminosidade e contador).

---

## Funcionalidades

- Autenticação com JWT  
- Controle de acesso:
  - **Admin:** CRUD completo  
  - **User:** apenas visualização  
- Dashboard
- Gestão de:
  - Sensores  
  - Ambientes  
  - Microcontroladores  
- Histórico de medições  
- Importação de dados Excel via script 

---

## Tecnologias

**Backend**
- Django  
- Django REST Framework  
- django-filter  

**Frontend**
- React  
- Axios  

---

## Como rodar

### Backend
```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py migrations
python manage.py migrate
```
Para importar os dados:
```bash
cd api/services
python importar_dados.py
```
Volte para a pasta backend:
```bash
cd ../..
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm install axios
npm run dev
```
