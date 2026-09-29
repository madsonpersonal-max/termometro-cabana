# Termômetro Cabana — V1.0

Protótipo funcional inicial do sistema de clima organizacional do Cabana Clube.

## Como testar

1. Extraia o arquivo ZIP.
2. Abra `index.html` no navegador.
3. A aba **Tablet** simula o terminal da portaria.
4. A aba **Dashboard** mostra os indicadores.
5. A aba **Histórico** mostra os registros.
6. Os dados ficam armazenados apenas no `localStorage` do navegador neste protótipo.

## Importante

Esta V1 é um protótipo de validação de fluxo. Ainda não utiliza banco de dados, autenticação administrativa ou sincronização entre dispositivos.

## Próxima etapa técnica

- banco de dados real;
- API;
- autenticação do painel;
- sincronização online;
- regras definitivas de anonimato;
- exportação de relatórios;
- instalação do modo kiosk no tablet.


## V1.1 — Separação de acesso

- `/` = terminal público do colaborador.
- `/admin/` = área administrativa do protótipo.
- O colaborador não vê Dashboard/Histórico no terminal.
- A senha presente nesta V1.1 é apenas uma barreira de protótipo e NÃO deve ser usada como segurança de produção.
- A produção deverá usar autenticação real no servidor/API e banco central.
