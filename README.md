# Termômetro Cabana V2.0 — banco central

Esta versão separa claramente:
- `/` = terminal anônimo do colaborador
- `/admin/` = painel administrativo autenticado
- Supabase/Postgres = banco central compartilhado entre máquinas

## 1. Criar o projeto
Crie um projeto no Supabase.

## 2. Criar o banco
Abra o SQL Editor e execute `supabase.sql`.

## 3. Criar o usuário do administrador
No Supabase, abra Authentication > Users e crie o e-mail/senha que será usado no painel.

## 4. Configurar o site
Abra `config.js` e coloque:
- URL do projeto Supabase
- Publishable Key

Use somente a Publishable Key no navegador. Nunca coloque Secret/Service Role Key no GitHub.

## 5. Publicar
Envie os arquivos para o repositório GitHub Pages:
index.html, style.css, app.js, config.js, manifest.webmanifest e a pasta admin.

## Resultado
Qualquer tablet/computador conectado à internet grava e consulta o mesmo banco central.

A versão inicial não inclui fila offline. Se a internet cair, a resposta não é gravada até a conexão voltar.
