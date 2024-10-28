# Store Server

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-00BCD4)](https://opensource.org/licenses/MIT)
[![Typescript Version](https://img.shields.io/badge/Typescript-5%2B-00BCD4)](https://www.typescriptlang.org/)
[![GitHub repo size](https://img.shields.io/github/repo-size/marllonmendez/stories?color=00BCD4)]()
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/marllonmendez/stories?color=00BCD4)]()

[![TypeScript](https://img.shields.io/badge/TypeScript-00BCD4?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/fastify-00BCD4?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-00BCD4?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Zod](https://img.shields.io/badge/-Zod-00BCD4?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![PostgresSQL](https://img.shields.io/badge/PostgreSQL-00BCD4?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/cloudinary-00BCD4?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

## Sobre
API desenvolvida para o projeto [Digital Catalog](https://github.com/marllonmendez/digital-catalog)

## Funcionalidades

### Produtos

- **Criar Produto**
  -   **Método:** POST
  -   **Endpoint:** `/product`
  -   **Descrição:** Cria um novo produto com base nos dados fornecidos no corpo da requisição e no arquivo de imagem enviado. É necessário fornecer um token de autenticação válido no cabeçalho da requisição.
  -   **Corpo da Requisição:** Multipart Form Data
    -   `name`: Nome do produto (string)
    -   `price`: Preço do produto (string)
    -   `image`: Arquivo de imagem do produto (file) (tamanho maximo: 3 mb)


- **Buscar Produto**
  -   **Método:** GET
  -   **Endpoint:** `/product/:slug`
  -   **Descrição:** Retorna um produto com base no slug fornecido.
  ```bash
    /product/miniatura-hot-wheels-dodge-charger-hellcat
  ```


- **Listar Produtos**
  -   **Método:** GET
  -   **Endpoint:** `/products`
  -   **Descrição:** Retorna uma lista de todos os produtos.


- **Atualizar Produto**
  -   **Método:** PUT
  -   **Endpoint:** `/product/:slug`
  -   **Descrição:** Atualiza um produto com base no slug fornecido.
  ```json
    {
      "name": "Miniatura Hot Wheels Dodge Charger Hellcat",
      "price": "4.99"
    }
  ```


- **Removerns Produto**
  -   **Método:** DELETE
  -   **Endpoint:** `/product/:slug`
  -   **Descrição:** Remove um produto com base no slug fornecido.
  ```bash
    /product/miniatura-hot-wheels-dodge-charger-hellcat
  ```

## Guia de Instalação

<h4>1. Clonagem do Repositório</h4>

```bash
git clone https://github.com/marllonmendez/catalog-server.git
```

<h4>2. Instalação de Dependências</h4>

```bash
npm install
```

<h4>3. Execução local</h4>

```bash
npm run dev
```

<h4>4. Execução do prisma</h4>

```bash
npx prisma studio
```

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE)
