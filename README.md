# Gerenciador de Tarefas Acadêmicas

Aplicação web de escopo acadêmico para cadastro e acompanhamento de tarefas de disciplinas. O projeto utiliza Node.js, Express e JavaScript puro, aplica o padrão arquitetural **MVC (Model-View-Controller)** e expõe uma API REST com operações CRUD completas.

Os dados são mantidos exclusivamente em memória, em um array de objetos, conforme exigido pela atividade. Não há banco de dados, ORM, autenticação, framework frontend nem qualquer forma alternativa de persistência.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Instalação e execução](#instalação-e-execução)
- [Testes automatizados](#testes-automatizados)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Convenções de código](#convenções-de-código)
- [Arquitetura MVC aplicada](#arquitetura-mvc-aplicada)
- [Modelo de dados](#modelo-de-dados)
- [API REST](#api-rest)
- [Validações e regras de negócio](#validações-e-regras-de-negócio)
- [Fluxo de uma requisição](#fluxo-de-uma-requisição)
- [Armazenamento em memória e limitações](#armazenamento-em-memória-e-limitações)
- [Roteiro de apresentação](#roteiro-de-apresentação)

## Funcionalidades

1. Cadastrar tarefa.
2. Listar todas as tarefas.
3. Consultar os detalhes de uma tarefa específica.
4. Editar título, descrição e disciplina.
5. Concluir uma tarefa pendente.
6. Excluir uma tarefa após confirmação do usuário.
7. Filtrar tarefas por todas, pendentes ou concluídas.

A interface também apresenta indicadores com o total de tarefas, pendentes e concluídas, notificações de sucesso e erro, validação nos dois lados (frontend e backend) e layout responsivo para desktop e dispositivos móveis.

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
| --- | --- |
| Node.js | Ambiente de execução do servidor |
| Express.js | Roteamento HTTP e servição dos arquivos estáticos |
| JavaScript (CommonJS no backend) | Backend e frontend sem frameworks |
| Módulos ES no navegador | Organização do JavaScript da View |
| HTML5 | Estrutura da interface |
| CSS3 | Estilização e responsividade |
| Fetch API | Comunicação da View com a API |
| UUID (`uuid`) | Geração automática dos identificadores |
| Array de objetos | Armazenamento em memória |
| `node:test` + `node:assert` | Testes de integração da API |

Não são utilizados: banco de dados, ORM, React ou outro framework frontend, TypeScript, autenticação, Docker ou microsserviços.

## Instalação e execução

### Pré-requisitos

- Node.js 18 ou superior
- npm

### Passos

```bash
# 1. Entrar na pasta do projeto
cd projeto

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor
npm start
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

Para desenvolvimento com reinício automático após alterações:

```bash
npm run dev
```

Para usar outra porta:

```bash
# Windows (PowerShell)
$env:PORT=8080; npm start

# Linux/macOS
PORT=8080 npm start
```

## Testes automatizados

O projeto possui uma suíte de integração com `node:test`, que inicia a aplicação em uma porta aleatória e testa a API por HTTP.

```bash
npm test
```

A suíte cobre:

- criação de tarefa com UUID e status inicial `pending`;
- tentativa de forçar `id` ou `status` no cadastro;
- validação de campos obrigatórios, tamanhos mínimos e máximos;
- listagem, consulta por ID e tratamento de ID inexistente;
- edição sem alteração de ID ou status;
- conclusão de tarefa e bloqueio de conclusão duplicada;
- filtro por status e rejeição de status inválido;
- exclusão e tratamento de ID inexistente;
- JSON malformado, rota de API inexistente e disponibilidade da View;
- carregamento dos quatro arquivos CSS e dos quatro módulos JavaScript da interface.

Resultado esperado: **14 testes aprovados**.

O fluxo completo da interface também foi verificado em navegador (Chrome): cadastro, validação do formulário, detalhes, edição, conclusão, filtros, cancelamento da exclusão, confirmação da exclusão, descrição opcional e responsividade em desktop e mobile.

## Estrutura de pastas

```text
projeto/
├── src/
│   ├── controllers/
│   │   └── taskController.js
│   ├── models/
│   │   └── taskModel.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── views/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── layout.css
│   │   │   ├── components.css
│   │   │   └── responsive.css
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── app.js
│   │   │   ├── notifications.js
│   │   │   └── taskUI.js
│   │   └── index.html
│   └── app.js
├── tests/
│   └── api.test.js
├── server.js
├── package.json
├── README.md
└── APRESENTACAO.md
```

Observação: `src/app.js` configura a aplicação Express consumida pelo servidor. Já `src/views/js/app.js` é o módulo de inicialização executado no navegador. Apesar do nome, são arquivos com responsabilidades diferentes.

## Convenções de código

O código-fonte utiliza inglês de ponta a ponta, inclusive nomes de arquivos, diretórios, variáveis, funções, propriedades, identificadores HTML, classes CSS, endpoints, campos da API, testes e mensagens técnicas. Essa é uma convenção de desenvolvimento do projeto.

A separação de idiomas é intencional:

| Contexto | Idioma |
| --- | --- |
| Código-fonte, API e mensagens técnicas | Inglês |
| Textos visíveis na interface | Português |
| Documentação acadêmica | Português, com identificadores técnicos em inglês |

Convenções adotadas:

- `camelCase` para variáveis, funções e propriedades;
- `PascalCase` para classes, quando aplicável;
- `kebab-case` para arquivos e classes CSS;
- `UPPER_SNAKE_CASE` para constantes globais;
- nomes de status na API: `pending` e `completed`;
- rótulos exibidos ao usuário: **Pendente** e **Concluída**.

## Arquitetura MVC aplicada

### Model — `src/models/taskModel.js`

Responsável apenas pelos dados e pelas operações sobre eles:

- mantém o array de tarefas em memória;
- gera o `id` com UUID;
- define o status inicial como `pending`;
- implementa `getAll`, `getById`, `create`, `update`, `complete` e `deleteById`;
- não conhece `req`, `res`, HTTP, HTML, CSS ou Fetch API.

### View — `src/views/`

Responsável pela apresentação e interação. A View não acessa o Model diretamente; ela apenas consome os endpoints HTTP.

O HTML foi mantido sem framework ou mecanismo de template. A organização interna usa seções semânticas, identificadores em inglês e comentários que separam cabeçalho, indicadores, formulário, lista e modais.

O CSS foi dividido por responsabilidade:

| Arquivo | Responsabilidade |
| --- | --- |
| `main.css` | Variáveis globais, reset, tipografia e utilitários |
| `layout.css` | Cabeçalho, indicadores, grid principal e painéis |
| `components.css` | Formulário, botões, filtros, cards, modais e notificações |
| `responsive.css` | Media queries e preferência por movimento reduzido |

O JavaScript do navegador foi separado em módulos ES:

| Arquivo | Responsabilidade |
| --- | --- |
| `app.js` | Inicialização, estado da tela, eventos e coordenação do fluxo |
| `api.js` | Comunicação HTTP com a API e tratamento dos erros de rede |
| `taskUI.js` | Renderização da lista, dos detalhes, do formulário e dos modais |
| `notifications.js` | Criação, fechamento e remoção das notificações |

### Controller — `src/controllers/taskController.js`

Responsável por intermediar requisições e Model:

- lê os dados de `req.body`, `req.params` e `req.query`;
- valida e normaliza `title`, `description` e `subject`;
- impede que o cliente defina `id` ou altere `status` pela edição;
- aciona os métodos do Model;
- devolve JSON com códigos HTTP adequados;
- trata erros de validação, tarefa inexistente e conclusão duplicada.

Os handlers exportados são `getAllTasks`, `getTaskById`, `createTask`, `updateTask`, `completeTask` e `deleteTask`.

### Routes — `src/routes/taskRoutes.js`

Define os endpoints REST e delega cada um ao handler correspondente do Controller. O roteador é montado em `/api/tasks` por `src/app.js`.

### Responsabilidades resumidas

| Camada | Arquivo | Responsabilidade |
| --- | --- | --- |
| Model | `src/models/taskModel.js` | Dados e regras de manipulação do array |
| Controller | `src/controllers/taskController.js` | Validação, orquestração e resposta HTTP |
| View | `src/views/index.html`, `src/views/css/*`, `src/views/js/*` | Interface e consumo da API |
| Routes | `src/routes/taskRoutes.js` | Mapeamento dos endpoints |
| Configuração | `src/app.js`, `server.js` | Express, middlewares e inicialização |

## Modelo de dados

Cada tarefa possui exatamente os campos abaixo:

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | string | Sim | UUID v4 gerado automaticamente pelo Model |
| `title` | string | Sim | 3 a 100 caracteres |
| `description` | string | Não | Até 500 caracteres; ausente vira string vazia |
| `subject` | string | Sim | 2 a 80 caracteres |
| `status` | string | Sim | `pending` ou `completed`; sempre inicia como `pending` |

O cliente não pode informar `id` nem `status` no cadastro. Campos enviados fora desse modelo são ignorados. Na edição (`PUT`), somente `title`, `description` e `subject` podem ser alterados.

## API REST

Base: `http://localhost:3000/api/tasks`

| Método | Endpoint | Ação | Sucesso | Erros previstos |
| --- | --- | --- | --- | --- |
| POST | `/api/tasks` | Cadastrar tarefa | `201` | `400` |
| GET | `/api/tasks` | Listar tarefas | `200` | `400` para status inválido |
| GET | `/api/tasks/:id` | Consultar detalhes | `200` | `404` |
| PUT | `/api/tasks/:id` | Editar campos permitidos | `200` | `400`, `404` |
| PATCH | `/api/tasks/:id/complete` | Concluir tarefa pendente | `200` | `400`, `404` |
| DELETE | `/api/tasks/:id` | Excluir tarefa | `200` | `404` |

### Formato das respostas

- Listagem: `{ "total": número, "tasks": [...] }`
- Tarefa única: `{ "task": {...} }`
- Criação, edição e conclusão: `{ "message": "...", "task": {...} }`
- Exclusão: `{ "message": "..." }`
- Erro: `{ "error": "CÓDIGO", "message": "...", "details": ["..."] }`, em que `details` é opcional

As mensagens técnicas da API são em inglês. A View traduz os códigos de erro para mensagens em português antes de exibi-las ao usuário.

### Exemplos de utilização

#### Cadastrar tarefa

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trabalho de Arquitetura de Software",
    "description": "Implementar uma aplicação MVC com Node.js e Express.",
    "subject": "Arquitetura de Software"
  }'
```

Resposta `201 Created`:

```json
{
  "message": "Task created successfully.",
  "task": {
    "id": "8f14e45f-ceea-4a67-9c1e-3d6b7a0c1234",
    "title": "Trabalho de Arquitetura de Software",
    "description": "Implementar uma aplicação MVC com Node.js e Express.",
    "subject": "Arquitetura de Software",
    "status": "pending"
  }
}
```

#### Listar todas as tarefas

```bash
curl http://localhost:3000/api/tasks
```

#### Filtrar por status

```bash
curl "http://localhost:3000/api/tasks?status=pending"
curl "http://localhost:3000/api/tasks?status=completed"
```

Sem o parâmetro, todas as tarefas são retornadas. Um status diferente de `pending` ou `completed` retorna `400` com `error` igual a `INVALID_STATUS`.

#### Consultar uma tarefa

```bash
curl http://localhost:3000/api/tasks/SEU_ID_AQUI
```

#### Editar título, descrição e disciplina

```bash
curl -X PUT http://localhost:3000/api/tasks/SEU_ID_AQUI \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trabalho final de Arquitetura",
    "description": "Documentar o padrão MVC e apresentar o fluxo da requisição.",
    "subject": "Arquitetura de Software"
  }'
```

Mesmo que `id` ou `status` sejam enviados no corpo, eles não são alterados.

> O `PUT` representa a atualização completa dos campos editáveis: `title` e `subject` são obrigatórios, e uma `description` omitida é armazenada como string vazia. A interface sempre envia os três campos.

#### Concluir tarefa

```bash
curl -X PATCH http://localhost:3000/api/tasks/SEU_ID_AQUI/complete
```

Se a tarefa já estiver concluída, a API responde `400` com `error` igual a `TASK_ALREADY_COMPLETED`.

#### Excluir tarefa

```bash
curl -X DELETE http://localhost:3000/api/tasks/SEU_ID_AQUI
```

A confirmação antes da exclusão é feita pela interface, por meio de um modal. A API executa a exclusão ao receber a requisição `DELETE`.

#### Exemplos de erro

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "details": [
    "Title must be between 3 and 100 characters.",
    "Subject is required."
  ]
}
```

```json
{
  "error": "TASK_NOT_FOUND",
  "message": "Task not found."
}
```

> No Windows, utilize `curl.exe` no PowerShell ou execute os exemplos em Git Bash/WSL. A interface não depende de `curl`; ela usa `fetch`.

## Validações e regras de negócio

| Regra | Onde é aplicada | Comportamento |
| --- | --- | --- |
| Título obrigatório, 3 a 100 caracteres | Frontend e Controller | Erro no campo ou `400` |
| Disciplina obrigatória, 2 a 80 caracteres | Frontend e Controller | Erro no campo ou `400` |
| Descrição opcional, até 500 caracteres | Frontend e Controller | Ausente é armazenada como `""` |
| `id` gerado apenas pelo servidor | Controller + Model | Campos enviados pelo cliente são ignorados |
| Status inicial sempre `pending` | Model | Cliente não define o status no cadastro |
| Status restrito a `pending`/`completed` | Controller | Filtro inválido retorna `400` |
| Edição não altera `id` nem `status` | Controller + Model | Apenas campos editáveis são repassados |
| Conclusão apenas de tarefa pendente | Controller | Segunda conclusão retorna `400` |
| ID inexistente | Controller | Retorna `404` |
| JSON malformado | Middleware do Express | Retorna `400` com `INVALID_JSON` |
| Exclusão somente após confirmação | View | Modal com opções Cancelar/Excluir |

O frontend remove espaços extras, exibe contadores de caracteres, destaca campos inválidos e impede o envio antes de chamar a API. O backend repete as validações, pois não confia apenas na interface.

## Fluxo de uma requisição

Exemplo: **cadastro de uma tarefa**.

```text
Usuário
  │ preenche o formulário e envia
  ▼
View (src/views/index.html + js/app.js)
  │ handleFormSubmit valida os campos
  │ api.js executa fetch("POST", /api/tasks)
  ▼
Route (src/routes/taskRoutes.js)
  │ router.post("/", taskController.createTask)
  ▼
Controller (src/controllers/taskController.js)
  │ valida title, description e subject
  │ ignora id e status enviados pelo cliente
  ▼
Model (src/models/taskModel.js)
  │ create gera o UUID, define status "pending" e insere no array
  ▼
Controller
  │ recebe a tarefa criada e responde 201 com JSON
  ▼
View
  │ interpreta a resposta, exibe notificação de sucesso,
  │ limpa o formulário e consulta GET /api/tasks
  │ para atualizar lista e indicadores
  ▼
```

## Armazenamento em memória e limitações

O array de tarefas existe apenas no processo do servidor. Consequências:

- ao reiniciar o servidor, todas as tarefas são perdidas;
- não há persistência em banco de dados, arquivo JSON ou `localStorage`;
- não há autenticação, controle de usuários ou compartilhamento entre instâncias;
- a aplicação deve ser executada em um único processo para manter uma visão consistente dos dados.

Essas limitações são intencionais e fazem parte do escopo acadêmico. Para uso real, seria necessário adicionar persistência e outros requisitos de segurança e escalabilidade.

## Roteiro de apresentação

O roteiro completo do vídeo de 5 a 8 minutos, com falas sugeridas, checklist de gravação e perguntas prováveis da banca, está em [`APRESENTACAO.md`](./APRESENTACAO.md).
