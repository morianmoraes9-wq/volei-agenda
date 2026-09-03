// ===== Agenda Vôlei - App Completo =====
// Dados simulados com localStorage

const OBSCENE_WORDS = [
  'caralho', 'merda', 'puta', 'foder', 'foda', 'cu', 'bosta', 'porra',
  'viado', 'bicha', 'arrombado', 'babaca', 'cabrão', 'cabrao', 'cona',
  'piça', 'pila', 'buceta', 'filho da puta', 'vai se foder', 'fdp',
  'desgraça', 'cacete', 'porra', 'xaroca', 'paneleiro'
];

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// State
let currentUser = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;

// Storage helpers
function load(key, def = []) {
  try {
    const data = localStorage.getItem('volei_' + key);
    return data ? JSON.parse(data) : def;
  } catch {
    return def;
  }
}

function save(key, data) {
  localStorage.setItem('volei_' + key, JSON.stringify(data));
}

// Init data if empty
function initData() {
  if (!localStorage.getItem('volei_users')) {
    const demoUsers = [
      {
        id: 'prof1',
        name: 'Prof. Carlos Silva',
        email: 'professor@volei.com',
        password: 'Senha@123',
        role: 'professor',
        points: 0
      },
      {
        id: 'aluno1',
        name: 'Ana Souza',
        email: 'aluno@volei.com',
        password: 'Senha@123',
        role: 'aluno',
        points: 12
      },
      {
        id: 'aluno2',
        name: 'Bruno Lima',
        email: 'bruno@volei.com',
        password: 'Senha@123',
        role: 'aluno',
        points: 8
      },
      {
        id: 'aluno3',
        name: 'Carla Mendes',
        email: 'carla@volei.com',
        password: 'Senha@123',
        role: 'aluno',
        points: 15
      }
    ];
    save('users', demoUsers);
  }
  if (!localStorage.getItem('volei_games')) save('games', []);
  if (!localStorage.getItem('volei_teams')) save('teams', []);
  if (!localStorage.getItem('volei_championships')) save('championships', []);
}

// ===== Auth =====
function checkPasswordStrength(pwd) {
  let score = 0;
  const rules = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  };
  if (rules.length) score++;
  if (rules.upper) score++;
  if (rules.special) score++;
  if (pwd.length >= 12) score++;

  let text = 'Fraca';
  let color = '#ef4444';
  let width = '33%';
  if (score >= 3) {
    text = 'Forte';
    color = '#10b981';
    width = '100%';
  } else if (score === 2) {
    text = 'Média';
    color = '#f59e0b';
    width = '66%';
  }

  return { rules, text, color, width, score };
}

function isPasswordValid(pwd) {
  const { rules } = checkPasswordStrength(pwd);
  return rules.length && rules.upper && rules.special;
}

function containsObscene(name) {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return OBSCENE_WORDS.some(w => lower.includes(w));
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ===== UI Auth =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    const formId = tab.dataset.tab === 'login' ? 'login-form' : 'signup-form';
    document.getElementById(formId).classList.add('active');
  });
});

document.getElementById('signup-password').addEventListener('input', (e) => {
  const res = checkPasswordStrength(e.target.value);
  const fill = document.getElementById('strength-fill');
  fill.style.width = res.width;
  fill.style.background = res.color;
  document.getElementById('strength-text').textContent = res.text;
  document.getElementById('rule-length').classList.toggle('valid', res.rules.length);
  document.getElementById('rule-upper').classList.toggle('valid', res.rules.upper);
  document.getElementById('rule-special').classList.toggle('valid', res.rules.special);
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pwd = document.getElementById('login-password').value;
  const users = load('users');
  const user = users.find(u => u.email === email && u.password === pwd);
  if (user) {
    currentUser = user;
    save('currentUser', user);
    showMain();
    showToast('Bem-vindo, ' + user.name + '!');
  } else {
    showToast('E-mail ou senha incorretos', 'error');
  }
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const role = document.getElementById('signup-role').value;
  const pwd = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!role) return showToast('Selecione o tipo de conta', 'error');
  if (pwd !== confirm) return showToast('Senhas não coincidem', 'error');
  if (!isPasswordValid(pwd)) return showToast('Senha não atende os requisitos (mín. 8, 1 maiúscula, 1 especial)', 'error');

  const users = load('users');
  if (users.some(u => u.email === email)) return showToast('E-mail já cadastrado', 'error');

  const newUser = {
    id: 'u' + Date.now(),
    name,
    email,
    password: pwd,
    role,
    points: 0
  };
  users.push(newUser);
  save('users', users);
  currentUser = newUser;
  save('currentUser', newUser);
  showToast('Conta criada com sucesso!');
  showMain();
});

// Google mock
function mockGoogleLogin() {
  openModal(`
    <h3>Login com Google (Simulado)</h3>
    <p class="hint">Em produção usa a API real do Google. Escolha um perfil demo:</p>
    <button class="btn btn-primary" style="margin-bottom:8px" onclick="loginAsDemo('professor')">Entrar como Professor (Carlos)</button>
    <button class="btn btn-primary" style="margin-bottom:8px" onclick="loginAsDemo('aluno')">Entrar como Aluno (Ana)</button>
    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

document.getElementById('google-login').addEventListener('click', mockGoogleLogin);
document.getElementById('google-signup').addEventListener('click', mockGoogleLogin);

window.loginAsDemo = function(role) {
  const users = load('users');
  const user = users.find(u => u.role === role);
  if (user) {
    currentUser = user;
    save('currentUser', user);
    closeModal();
    showMain();
    showToast('Login Google simulado: ' + user.name);
  }
};

document.getElementById('forgot-password').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('reset-form').classList.add('active');
});

document.getElementById('back-to-login').addEventListener('click', () => {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('login-form').classList.add('active');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab[data-tab="login"]').classList.add('active');
});

document.getElementById('reset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  const users = load('users');
  if (users.some(u => u.email === email.toLowerCase())) {
    showToast('Link de redefinição enviado para ' + email + ' (simulado)');
  } else {
    showToast('E-mail não encontrado', 'error');
  }
  document.getElementById('back-to-login').click();
});

// ===== Main App =====
function showMain() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('main-screen').classList.add('active');
  const roleBadge = currentUser.role === 'professor'
    ? '<span class="badge badge-professor">Professor</span>'
    : '<span class="badge badge-aluno">Aluno</span>';
  document.getElementById('user-info').innerHTML = `${currentUser.name} ${roleBadge}`;

  // Show professor controls
  const isProf = currentUser.role === 'professor';
  document.getElementById('professor-calendar-controls').style.display = isProf ? 'block' : 'none';

  renderDashboard();
  renderCalendar();
  renderTeams();
  checkChampionshipNav();
}

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('volei_currentUser');
  document.getElementById('main-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('login-form').reset();
});

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + btn.dataset.page).classList.add('active');
    if (btn.dataset.page === 'calendar') renderCalendar();
    if (btn.dataset.page === 'teams') renderTeams();
    if (btn.dataset.page === 'championship') renderChampionships();
    if (btn.dataset.page === 'dashboard') renderDashboard();
  });
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ===== Dashboard =====
function renderDashboard() {
  const games = load('games');
  const teams = load('teams');
  const myTeams = teams.filter(t => t.members.includes(currentUser.id) || t.creatorId === currentUser.id);
  const upcoming = games
    .filter(g => new Date(g.date + 'T' + g.time) >= new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 5);

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="value">${games.length}</div><div class="label">Jogos cadastrados</div></div>
    <div class="stat-card"><div class="value">${teams.length}</div><div class="label">Times</div></div>
    <div class="stat-card"><div class="value">${currentUser.points || 0}</div><div class="label">Meus pontos</div></div>
    <div class="stat-card"><div class="value">${myTeams.length}</div><div class="label">Meus times</div></div>
  `;

  const gamesEl = document.getElementById('upcoming-games');
  if (upcoming.length === 0) {
    gamesEl.innerHTML = '<div class="empty-state">Nenhum jogo agendado ainda.</div>';
  } else {
    gamesEl.innerHTML = upcoming.map(g => `
      <div class="game-item">
        <div>
          <div class="date">${formatDate(g.date)}</div>
          <div class="time">${g.time} • ${g.location || 'Quadra principal'}</div>
        </div>
        <div>${g.teams?.length || 0} time(s)</div>
      </div>
    `).join('');
  }

  const myTeamCard = document.getElementById('my-team-card');
  if (myTeams.length > 0) {
    myTeamCard.style.display = 'block';
    document.getElementById('my-team-info').innerHTML = myTeams.map(t => {
      const members = getMemberNames(t.members);
      return `<div style="margin-bottom:12px"><strong>${t.name}</strong><br><small>${members.join(', ')}</small><br>
        <span class="team-stats"><span>V: ${t.wins || 0}</span><span>D: ${t.losses || 0}</span></span></div>`;
    }).join('');
  } else {
    myTeamCard.style.display = 'none';
  }
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function getMemberNames(ids) {
  const users = load('users');
  return ids.map(id => {
    const u = users.find(x => x.id === id);
    return u ? u.name : 'Desconhecido';
  });
}

// ===== Calendar =====
function renderCalendar() {
  const title = document.getElementById('calendar-title');
  title.textContent = `${MONTHS_PT[currentMonth]} ${currentYear}`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = DAYS_PT.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPrev = new Date(currentYear, currentMonth, 0).getDate();

  const games = load('games');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.innerHTML += `<div class="cal-day other-month">${daysPrev - i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasGame = games.some(g => g.date === dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = selectedDay === dateStr;
    grid.innerHTML += `
      <div class="cal-day ${hasGame ? 'has-game' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
           data-date="${dateStr}" onclick="selectDay('${dateStr}')">
        ${d}
        ${hasGame ? '<div class="dot"></div>' : ''}
      </div>`;
  }

  // Next month fill
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    grid.innerHTML += `<div class="cal-day other-month">${i}</div>`;
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  selectedDay = null;
  document.getElementById('day-details').style.display = 'none';
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  selectedDay = null;
  document.getElementById('day-details').style.display = 'none';
  renderCalendar();
});

window.selectDay = function(dateStr) {
  selectedDay = dateStr;
  renderCalendar();
  const games = load('games').filter(g => g.date === dateStr);
  const teamsOnDay = [];
  games.forEach(g => {
    if (g.teams) g.teams.forEach(tid => { if (!teamsOnDay.includes(tid)) teamsOnDay.push(tid); });
  });

  const details = document.getElementById('day-details');
  details.style.display = 'block';
  document.getElementById('day-details-title').textContent = `Jogos em ${formatDate(dateStr)}`;

  if (games.length === 0) {
    document.getElementById('day-games').innerHTML = '<p class="empty-state">Nenhum jogo neste dia.</p>';
  } else {
    document.getElementById('day-games').innerHTML = games.map(g => {
      const teamNames = (g.teams || []).map(tid => {
        const t = load('teams').find(x => x.id === tid);
        return t ? t.name : '?';
      }).join(', ') || 'Aberto';
      return `<div class="game-item">
        <div><strong>${g.time}</strong> • ${g.location || 'Quadra'}<br><small>Times: ${teamNames}</small></div>
        ${currentUser.role === 'aluno' || currentUser.role === 'professor' ? 
          `<button class="btn btn-outline" onclick="joinGame('${g.id}')">Entrar</button>` : ''}
      </div>`;
    }).join('');
  }

  // Championship option if > 1 team or >1 game potential
  const champOpt = document.getElementById('championship-option');
  if (teamsOnDay.length > 1 || games.length > 1) {
    champOpt.style.display = 'block';
  } else {
    // Also check if multiple teams exist that could play
    const allTeams = load('teams');
    champOpt.style.display = allTeams.length > 1 ? 'block' : 'none';
  }
};

document.getElementById('add-game-btn').addEventListener('click', () => {
  if (currentUser.role !== 'professor') return showToast('Apenas professores podem cadastrar jogos', 'error');
  openModal(`
    <h3>Cadastrar Jogo</h3>
    <div class="form-group">
      <label>Data</label>
      <input type="date" id="game-date" value="${selectedDay || ''}" required>
    </div>
    <div class="form-group">
      <label>Horário</label>
      <input type="time" id="game-time" required>
    </div>
    <div class="form-group">
      <label>Local</label>
      <input type="text" id="game-location" placeholder="Quadra principal" value="Quadra principal">
    </div>
    <div class="form-group">
      <label>Observações</label>
      <input type="text" id="game-notes" placeholder="Opcional">
    </div>
    <button class="btn btn-primary" onclick="saveGame()">Salvar Jogo</button>
  `);
});

window.saveGame = function() {
  const date = document.getElementById('game-date').value;
  const time = document.getElementById('game-time').value;
  const location = document.getElementById('game-location').value || 'Quadra principal';
  const notes = document.getElementById('game-notes').value;
  if (!date || !time) return showToast('Preencha data e horário', 'error');

  const games = load('games');
  games.push({
    id: 'g' + Date.now(),
    date,
    time,
    location,
    notes,
    creatorId: currentUser.id,
    teams: [],
    createdAt: new Date().toISOString()
  });
  save('games', games);
  closeModal();
  showToast('Jogo cadastrado com sucesso!');
  selectedDay = date;
  renderCalendar();
  selectDay(date);
  renderDashboard();
};

window.joinGame = function(gameId) {
  // Simple join - for demo, just show message. In full would add to participants.
  showToast('Você se inscreveu no jogo! (simulado)');
};

// ===== Teams =====
function renderTeams() {
  const teams = load('teams');
  const list = document.getElementById('teams-list');
  if (teams.length === 0) {
    list.innerHTML = '<div class="empty-state">Nenhum time cadastrado ainda. Crie o primeiro!</div>';
    return;
  }
  const users = load('users');
  list.innerHTML = teams.map(t => {
    const members = t.members.map(mid => {
      const u = users.find(x => x.id === mid);
      return u ? `<li>${u.name} <span style="color:var(--text-muted)">${u.points || 0} pts</span></li>` : '';
    }).join('');
    const isMember = t.members.includes(currentUser.id);
    return `
      <div class="team-card">
        <h3>${t.name}</h3>
        <div class="team-meta">Criado por ${getMemberNames([t.creatorId])[0]} • ${t.members.length}/6 membros</div>
        <ul class="team-members">${members}</ul>
        <div class="team-stats">
          <span>Vitórias: ${t.wins || 0}</span>
          <span>Derrotas: ${t.losses || 0}</span>
        </div>
        ${!isMember && t.members.length < 6 ? 
          `<button class="btn btn-outline" style="margin-top:12px;width:100%" onclick="joinTeam('${t.id}')">Entrar no time</button>` : 
          isMember ? '<div style="margin-top:8px;color:var(--success);font-size:13px">✓ Você faz parte</div>' : ''}
      </div>`;
  }).join('');
}

document.getElementById('create-team-btn').addEventListener('click', () => {
  // Both aluno and professor can create team
  const users = load('users').filter(u => u.id !== currentUser.id);
  const options = users.map(u => `
    <label><input type="checkbox" value="${u.id}" class="member-check"> ${u.name} (${u.role})</label>
  `).join('');

  openModal(`
    <h3>Criar Equipe</h3>
    <div class="form-group">
      <label>Nome da equipe</label>
      <input type="text" id="team-name" placeholder="Ex: Os Campeões" maxlength="30">
    </div>
    <div class="form-group">
      <label>Membros (máx. 5 além de você = 6 total)</label>
      <div class="member-list-select">${options || '<p>Nenhum outro usuário cadastrado</p>'}</div>
    </div>
    <p class="hint">Você será incluído automaticamente. Máximo 6 pessoas no total.</p>
    <button class="btn btn-primary" onclick="saveTeam()">Criar Equipe</button>
  `);
});

window.saveTeam = function() {
  const name = document.getElementById('team-name').value.trim();
  if (!name) return showToast('Digite o nome da equipe', 'error');
  if (containsObscene(name)) return showToast('Nome de equipe contém palavras não permitidas', 'error');

  const checks = document.querySelectorAll('.member-check:checked');
  const memberIds = Array.from(checks).map(c => c.value);
  if (memberIds.length > 5) return showToast('Máximo 5 membros além de você (total 6)', 'error');

  const allMembers = [currentUser.id, ...memberIds];
  const teams = load('teams');
  if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
    return showToast('Já existe um time com esse nome', 'error');
  }

  teams.push({
    id: 't' + Date.now(),
    name,
    creatorId: currentUser.id,
    members: allMembers,
    wins: 0,
    losses: 0,
    createdAt: new Date().toISOString()
  });
  save('teams', teams);
  closeModal();
  showToast('Equipe "' + name + '" criada!');
  renderTeams();
  renderDashboard();
  checkChampionshipNav();
};

window.joinTeam = function(teamId) {
  const teams = load('teams');
  const team = teams.find(t => t.id === teamId);
  if (!team) return;
  if (team.members.includes(currentUser.id)) return showToast('Você já está no time', 'error');
  if (team.members.length >= 6) return showToast('Time já está completo (máx. 6)', 'error');
  team.members.push(currentUser.id);
  save('teams', teams);
  showToast('Você entrou no time ' + team.name);
  renderTeams();
  renderDashboard();
};

// ===== Championship =====
function checkChampionshipNav() {
  const teams = load('teams');
  const champNav = document.getElementById('nav-championship');
  if (teams.length > 1) {
    champNav.style.display = 'inline-block';
  } else {
    champNav.style.display = 'none';
  }
}

document.getElementById('create-championship-btn').addEventListener('click', () => {
  if (currentUser.role !== 'professor') return showToast('Apenas professores podem criar campeonatos', 'error');
  const teams = load('teams');
  if (teams.length < 2) return showToast('É necessário pelo menos 2 times', 'error');

  const options = teams.map(t => `
    <label><input type="checkbox" value="${t.id}" class="champ-team-check" checked> ${t.name}</label>
  `).join('');

  openModal(`
    <h3>Criar Campeonato</h3>
    <div class="form-group">
      <label>Nome do campeonato</label>
      <input type="text" id="champ-name" placeholder="Ex: Torneio de Setembro" value="Campeonato ${formatDate(selectedDay || new Date().toISOString().slice(0,10))}">
    </div>
    <div class="form-group">
      <label>Data</label>
      <input type="date" id="champ-date" value="${selectedDay || ''}">
    </div>
    <div class="form-group">
      <label>Times participantes</label>
      <div class="member-list-select">${options}</div>
    </div>
    <button class="btn btn-primary" onclick="saveChampionship()">Criar Campeonato</button>
  `);
});

window.saveChampionship = function() {
  const name = document.getElementById('champ-name').value.trim();
  const date = document.getElementById('champ-date').value;
  const checks = document.querySelectorAll('.champ-team-check:checked');
  const teamIds = Array.from(checks).map(c => c.value);
  if (!name || !date) return showToast('Preencha nome e data', 'error');
  if (teamIds.length < 2) return showToast('Selecione pelo menos 2 times', 'error');

  const champs = load('championships');
  champs.push({
    id: 'c' + Date.now(),
    name,
    date,
    teams: teamIds,
    matches: [],
    creatorId: currentUser.id,
    status: 'aberto'
  });
  save('championships', champs);
  closeModal();
  showToast('Campeonato criado!');
  checkChampionshipNav();
  document.querySelector('.nav-btn[data-page="championship"]').click();
};

function renderChampionships() {
  const champs = load('championships');
  const el = document.getElementById('championships-list');
  if (champs.length === 0) {
    el.innerHTML = '<div class="empty-state">Nenhum campeonato criado ainda. Quando houver mais de 1 time no mesmo dia, a opção aparece no calendário.</div>';
    return;
  }
  const teams = load('teams');
  el.innerHTML = champs.map(c => {
    const teamNames = c.teams.map(tid => {
      const t = teams.find(x => x.id === tid);
      return t ? t.name : '?';
    }).join(', ');
    return `
      <div class="card">
        <h3>${c.name}</h3>
        <p>Data: ${formatDate(c.date)} • Status: ${c.status}</p>
        <p>Times: ${teamNames}</p>
        ${currentUser.role === 'professor' ? `
          <button class="btn btn-outline" style="margin-top:8px" onclick="addMatchResult('${c.id}')">Registrar Resultado</button>
        ` : ''}
      </div>`;
  }).join('');
}

window.addMatchResult = function(champId) {
  const champs = load('championships');
  const c = champs.find(x => x.id === champId);
  if (!c) return;
  const teams = load('teams').filter(t => c.teams.includes(t.id));
  const opts = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

  openModal(`
    <h3>Registrar Resultado</h3>
    <div class="form-group">
      <label>Time Vencedor</label>
      <select id="winner-team">${opts}</select>
    </div>
    <div class="form-group">
      <label>Time Perdedor</label>
      <select id="loser-team">${opts}</select>
    </div>
    <button class="btn btn-primary" onclick="saveMatchResult('${champId}')">Salvar</button>
  `);
};

window.saveMatchResult = function(champId) {
  const winnerId = document.getElementById('winner-team').value;
  const loserId = document.getElementById('loser-team').value;
  if (winnerId === loserId) return showToast('Selecione times diferentes', 'error');

  const teams = load('teams');
  const winner = teams.find(t => t.id === winnerId);
  const loser = teams.find(t => t.id === loserId);
  if (winner) winner.wins = (winner.wins || 0) + 1;
  if (loser) loser.losses = (loser.losses || 0) + 1;

  // Add points to members of winner
  const users = load('users');
  if (winner) {
    winner.members.forEach(mid => {
      const u = users.find(x => x.id === mid);
      if (u) u.points = (u.points || 0) + 3;
    });
  }
  save('users', users);
  save('teams', teams);

  // Update current user points if needed
  const updatedMe = users.find(u => u.id === currentUser.id);
  if (updatedMe) currentUser.points = updatedMe.points;

  closeModal();
  showToast('Resultado registrado! +3 pts para o time vencedor');
  renderChampionships();
  renderTeams();
  renderDashboard();
};

// ===== Init =====
initData();
const savedUser = load('currentUser', null);
if (savedUser && savedUser.id) {
  // Refresh user data
  const users = load('users');
  const fresh = users.find(u => u.id === savedUser.id);
  if (fresh) {
    currentUser = fresh;
    showMain();
  }
}
