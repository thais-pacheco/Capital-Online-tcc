Capital Online

Gerenciamento simples e inteligente das suas finanças pessoais

🔥 Introdução
Sistema desenvolvido para trazer mais agilidade, organização e clareza ao controle financeiro pessoal.
Com o Capital Online, o usuário consegue registrar despesas, acompanhar receitas e visualizar sua saúde financeira de forma rápida e intuitiva.

⚙️ Pré-requisitos
O sistema foi desenvolvido especialmente para uso pessoal e seguro.
Somente usuários cadastrados terão acesso total às funcionalidades.

🔨 Guia de instalação
Caso queira rodar o projeto com um banco de dados próprio, siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. Instalar dependências do FRONT-END (React)

No diretório do frontend:

npm install

2. Configurar o arquivo .env do frontend

Crie o arquivo .env-capital contendo:

REACT_APP_BACKEND_URL= URL do backend da aplicação


➡️ REACT_APP_BACKEND_URL: endereço onde o backend Django está rodando.

3. Rodar o projeto FRONT-END
npm start

O site abrirá automaticamente no navegador.

BACK-END — Django
4. Instalar dependências

(No diretório do backend)

pip install -r requirements.txt

5. Configurar o arquivo .env do backend

Crie um arquivo chamado .env com:

SECRET_KEY=sua_chave
DEBUG=True
DB_NAME=nome_do_banco
DB_USER=usuario_mysql
DB_PASSWORD=senha_mysql
DB_HOST=localhost
DB_PORT=3306


📌 Banco utilizado: MySQL

6. Aplicar migrations
python manage.py migrate

7. Iniciar o servidor Django
python manage.py runserver

🚀 Tecnologias usadas

Front-end



![React](https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 

Back-end

![Python](https://img.shields.io/badge/PYTHON-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/DJANGO-092E20?style=for-the-badge&logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/MYSQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)


👷 Autores

Thais Pacheco

Amanda Plentz


