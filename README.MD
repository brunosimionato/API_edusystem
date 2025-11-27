# API Escolar - Projeto de Conclusão de Curso

Este projeto é uma **API escolar** desenvolvida em **Node.js** com **PostgreSQL**, como parte do **Trabalho de Conclusão de Curso (TCC)** do curso de **Bacharelado em Ciência da Computação** da **Universidade Regional Integrada do Alto Uruguai e das Missões – URI, Câmpus de Erechim**.

O sistema tem como objetivo oferecer uma base sólida para o desenvolvimento de um ambiente web completo de **gestão escolar**, permitindo o gerenciamento de alunos, professores e secretaria.

---

## 👨‍💻 Autor

**Bruno Nava Simionato**  
📧 101061@aluno.uricer.edu.br  

## 🎓 Orientador

**Prof. Neilor Avelino Tonin**  
📧 nat@aluno.uricer.edu.br  

---

## 🔹 Pré-requisitos

Antes de iniciar o projeto, certifique-se de ter instalado:

- [Node.js 23](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

---

## 🔹 Configuração do `.env`

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=escolar
CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/escolar
PORT=3000
JWT_SECRET=algumsegredoaqui
```

> ⚠️ Verifique se o PostgreSQL está rodando localmente e se o banco `escolar` já foi criado.

---

## 🔹 Instalação e execução

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Criar o banco de dados

No PostgreSQL, execute:

```sql
CREATE DATABASE escolar;
```

### 3️⃣ Executar a API

```bash
npm run dev
```

> A API será iniciada em **http://localhost:3000**

---

## 🔹 Teste rápido

Para verificar se a API está funcionando, acesse:

```bash
http://localhost:3000/
```

Deve retornar:

```json
{
  "message": "Funcionando"
}
```

---

## 🔹 Estrutura básica do projeto

| Pasta / Arquivo | Descrição |
|------------------|------------|
| `/src/controllers` | Lógica dos endpoints da API |
| `/src/routes` | Definição das rotas |
| `/src/models` | Modelos e consultas ao banco |
| `/src/config` | Configuração de banco e variáveis de ambiente |
| `index.js` | Ponto de entrada da aplicação |

---

## 🔹 Passos de desenvolvimento

1. Configure o `.env` com suas credenciais do banco.  
2. Crie o banco `escolar` no PostgreSQL.  
3. Instale as dependências com `npm install`.  
4. Rode a API com `npm run dev`.  
5. Teste os endpoints via navegador, **Postman** ou **Insomnia**.

---

## 📘 Informações Institucionais

**Universidade Regional Integrada do Alto Uruguai e das Missões (URI)**  
**Câmpus Erechim – Curso de Ciência da Computação**  
Projeto de Conclusão de Curso – 2025