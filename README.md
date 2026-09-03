# Agenda Vôlei 🏐

Site de agendamento de jogos de vôlei ao longo do ano.

## Como usar

Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).

### Contas demo

| E-mail | Senha | Tipo |
|--------|-------|------|
| professor@volei.com | Senha@123 | Professor |
| aluno@volei.com | Senha@123 | Aluno |
| bruno@volei.com | Senha@123 | Aluno |
| carla@volei.com | Senha@123 | Aluno |

Ou use o botão **Entrar com Google** (simulado) para escolher rapidamente.

## Funcionalidades implementadas

### Autenticação
- Login e criação de contas (Aluno / Professor)
- Validação de senha: mínimo 8 caracteres + 1 maiúscula + 1 caractere especial
- Indicador de força: Fraca / Média / Forte
- Redefinição de senha (simulada)
- Login com Google (simulado – em produção use Firebase/Supabase)

### Permissões
| Ação | Professor | Aluno |
|------|-----------|-------|
| Cadastrar jogos no calendário | ✅ | ❌ |
| Criar equipe | ✅ | ✅ |
| Entrar em time / jogo | ✅ | ✅ |
| Criar campeonato | ✅ | ❌ |
| Registrar resultados | ✅ | ❌ |
| Ver dashboard e times | ✅ | ✅ |

### Calendário
- Navegação por todos os meses e anos
- Apenas professor cadastra jogos (data + horário + local)
- Ao clicar em um dia, vê os jogos
- Se houver mais de 1 time possível → opção de criar campeonato

### Times
- Máximo 6 pessoas (incluindo criador)
- Nome de equipe filtrado contra palavras obscenas
- Painel com integrantes + pontos individuais
- Placar de vitórias e derrotas por time

### Campeonato
- Aparece quando há 2+ times
- Professor cria e registra resultados
- Vitória dá +3 pontos a cada membro do time vencedor

## Dados
Tudo fica no `localStorage` do navegador (persistente por dispositivo).  
Limpe o storage do site se quiser resetar.

## Próximos passos para produção
1. Backend real (Node/Express + MongoDB ou Supabase/Firebase)
2. Google OAuth real (Firebase Auth ou Supabase Auth)
3. E-mail real para redefinição de senha
4. Notificações
5. Upload de foto de perfil / logo do time
