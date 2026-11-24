/**
 * Baby Carrusel - Sistema de Reservaciones y Centro de Operaciones en Tiempo Real
 * Paquetes para 50 y 80 personas • 7 Horas de Evento (Horario antes de las 11:00 PM)
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_CANDIDATES = [
    ...(window.location.hostname.includes('ts.net') || window.location.port === '8004'
      ? [`${window.location.origin}/babycarrusel/api`, `${window.location.origin}/api`]
      : []),
    'https://hououin-pi.tailcbb698.ts.net/babycarrusel/api',
    'http://100.111.160.87:8004/api',
    'http://192.168.100.78:8004/api'
  ];

  let activeApiBase = null;

  const now = new Date();
  const TODAY_YEAR = now.getFullYear();
  const TODAY_MONTH = now.getMonth();
  const TODAY_DAY = now.getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function formatIsoDate(year, monthIdx, day) {
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const TODAY_ISO = formatIsoDate(TODAY_YEAR, TODAY_MONTH, TODAY_DAY);

  const state = {
    isOwner: sessionStorage.getItem('bc_owner_logged') === '1',
    activeReservationId: null,
    currentYear: TODAY_YEAR,
    currentMonthIndex: TODAY_MONTH,
    selectedDay: TODAY_DAY,
    popupYear: TODAY_YEAR,
    popupMonthIndex: TODAY_MONTH,
    popupSelectedDay: TODAY_DAY,
    viewMode: 'month', // 'month' | 'week' | 'day'
    aforo: {
      current: 0,
      max: 80,
      children: 0,
      adults: 0
    },
    deposit: {
      amount: 350.00,
      status: 'none',
      deduction: 0
    },
    activeChecklistTab: 'pre',
    checklists: {
      pre: [
        { id: 1, title: 'Trampolín con Red, Túnel Oruga y Casitas con Resbaladilla', note: 'Juegos infantiles en piso verde limpios y verificados', completed: true, estado: 'bueno' },
        { id: 2, title: 'Mesas, Sillas, Manteles y Cubremanteles Instalados', note: 'Montaje completo de acuerdo al paquete contratado (50 u 80 personas)', completed: true, estado: 'bueno' },
        { id: 3, title: 'Cocina: Refrigerador, Estufa con Gas y Microondas', note: 'Electrodomésticos funcionando y suministro de gas verificado', completed: true, estado: 'bueno' },
        { id: 4, title: 'Internet Wi-Fi, Iluminación y Ventiladores de Techo', note: 'Red Wi-Fi activa y ventilación lista en área de comedor', completed: true, estado: 'bueno' },
        { id: 5, title: 'Higiene de Sanitarios, Botiquín y Extintor', note: 'Sanitarios limpios con insumos completos y extintor en cocina', completed: true, estado: 'bueno' }
      ],
      post: [
        { id: 6, title: 'Revisión de Trampolín, Resbaladillas y Juegos Infantiles', note: 'Verificar que la malla y los juegos plásticos no presenten daños', completed: false, estado: 'pendiente' },
        { id: 7, title: 'Conteo de Mesas, Sillas, Manteles y Cubremanteles', note: 'Comprobar que la mantelería y sillas estén completas y sin roturas', completed: false, estado: 'pendiente' },
        { id: 8, title: 'Revisión de Cocina: Estufa (Gas Cerrado), Refri y Microondas', note: 'Verificar llave de gas cerrada y electrodomésticos limpios', completed: false, estado: 'pendiente' },
        { id: 9, title: 'Limpieza General y Retiro de Pertenencias', note: 'Comedor y barra despejados al concluir el evento', completed: false, estado: 'pendiente' },
        { id: 10, title: 'Entrega del Salón y Liberación de Depósito ($350)', note: 'Conformidad de cierre con el anfitrión', completed: false, estado: 'pendiente' }
      ]
    },
    dbData: {
      reservaciones: [],
      clientes: [],
      empleados: [
        { id_empleado: 1, nombre: 'Heriberto García', puesto: 'Propietario del Salón', telefono: '+52 444 540 2978' },
        { id_empleado: 2, nombre: 'Javier García Ramos', puesto: 'Administración y Reservaciones', telefono: '+52 444 540 2978' },
        { id_empleado: 3, nombre: 'Elena Rodríguez', puesto: 'Supervisión de Seguridad e Inspección', telefono: '+52 444 312 8901' },
        { id_empleado: 4, nombre: 'Carlos Méndez', puesto: 'Mantenimiento y Control de Mobiliario', telefono: '+52 444 621 4410' },
        { id_empleado: 5, nombre: 'Sofía Torres', puesto: 'Limpieza Profunda y Sanitización', telefono: '+52 444 789 3320' },
        { id_empleado: 6, nombre: 'Jolie', puesto: 'Gerente de Turno y Coordinación', telefono: '+52 444 540 2978' }
      ],
      mobiliario: [
        { id_mobiliario: 1, nombre: 'Mesas, Sillas, Manteles y Cubremanteles (50 / 80 personas)', cantidad: 10, estado: 'disponible', descripcion: 'Mobiliario completo con manteles y cubremanteles incluidos.' },
        { id_mobiliario: 2, nombre: 'Cocina Equipada (Refrigerador, Estufa con Gas y Microondas)', cantidad: 1, estado: 'disponible', descripcion: 'Refrigerador, estufa conectada a gas, microondas, tarja y barra.' },
        { id_mobiliario: 3, nombre: 'Trampolín Circular con Red de Seguridad', cantidad: 1, estado: 'disponible', descripcion: 'Brincolín infantil en área de piso verde con malla protectora.' },
        { id_mobiliario: 4, nombre: 'Túnel Oruga, Casitas con Resbaladilla y Juegos Infantiles', cantidad: 1, estado: 'disponible', descripcion: 'Túnel oruga morado, casitas con resbaladilla y juegos.' },
        { id_mobiliario: 5, nombre: 'Mesita y Sillitas Infantiles + Mesa de Pastel y Dulces', cantidad: 2, estado: 'disponible', descripcion: 'Mesas infantiles con mini sillitas y área de pastel.' },
        { id_mobiliario: 6, nombre: 'Servicio de Internet Wi-Fi y Ventilación del Salón', cantidad: 1, estado: 'disponible', descripcion: 'Conexión a internet inalámbrico para invitados.' }
      ],
      reglamento: [
        { id_regla: 1, titulo: 'Duración de 7 Horas y Horario Límite (Antes de las 11:00 PM)', descripcion: 'Cada reservación incluye 7 horas continuas de evento. Por disposición del salón, todos los eventos deben concluir antes de las 11:00 de la noche (23:00 hrs).' },
        { id_regla: 2, titulo: 'Dos Modalidades de Capacidad: 50 Personas y 80 Personas', descripcion: 'El salón maneja dos precios según el aforo contratado: Paquete para 50 personas o Paquete para 80 personas (cupo máximo permitido).' },
        { id_regla: 3, titulo: 'Servicios Incluidos en tu Renta', descripcion: 'Tu reservación incluye mesas, sillas, manteles, cubremanteles, área de juegos infantiles, internet Wi-Fi, refrigerador, microondas, estufa y gas.' },
        { id_regla: 4, titulo: 'Garantía de Depósito Reembolsable ($350)', descripcion: 'El depósito en garantía ($350.00) protege el mobiliario, mantelería, electrodomésticos y juegos. Es 100% reembolsable tras verificar al cierre que las instalaciones se entregan sin daños.' },
        { id_regla: 5, titulo: 'Cuidado del Área de Juegos (Piso Verde) y Comedor', descripcion: 'Se solicita supervisar a los niños en el trampolín, resbaladillas y túnel oruga, así como mantener los alimentos y bebidas dentro del área de comedor.' }
      ]
    },
    notifications: []
  };

  // Hidratar instantáneamente desde la última lectura real guardada en caché local (evita parpadeos al cargar)
  try {
    const cachedRaw = localStorage.getItem('bc_dashboard_cache_v3');
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Array.isArray(cached.reservaciones)) {
        state.dbData.reservaciones = cached.reservaciones;
      }
      if (Array.isArray(cached.empleados) && cached.empleados.length > 0) {
        state.dbData.empleados = cached.empleados;
      }
      if (Array.isArray(cached.mobiliario) && cached.mobiliario.length > 0) {
        state.dbData.mobiliario = cached.mobiliario;
      }
      if (Array.isArray(cached.reglamento) && cached.reglamento.length > 0) {
        state.dbData.reglamento = cached.reglamento;
      }
    }
  } catch (_) {}

  /* ==========================================================================
     VALIDACIÓN DE FECHAS PASADAS, DÍAS PENDIENTES Y DÍAS CONFIRMADOS (SIN CUPO)
     ========================================================================== */
  function isPastDate(year, monthIdx, day) {
    if (year < TODAY_YEAR) return true;
    if (year > TODAY_YEAR) return false;
    if (monthIdx < TODAY_MONTH) return true;
    if (monthIdx > TODAY_MONTH) return false;
    return day < TODAY_DAY;
  }

  function isDayFullyBooked(dayInfo) {
    if (!dayInfo || !dayInfo.slots) return false;
    return dayInfo.slots.some(
      s => s.status === 'confirmed' || s.status === 'active' || s.status === 'completed'
    );
  }

  function isDayPendingFull(dayInfo) {
    if (!dayInfo || !dayInfo.slots) return false;
    return !isDayFullyBooked(dayInfo) && dayInfo.slots.some(s => s.status === 'hold');
  }

  /* ==========================================================================
     COMUNICACIÓN DIRECTA EN 1 SOLO VIAJE CON EL SERVIDOR (SIN LATENCIA DOBLE)
     ========================================================================== */
  async function apiFetch(path, options = {}) {
    const candidates = activeApiBase
      ? [activeApiBase, ...API_CANDIDATES.filter(c => c !== activeApiBase)]
      : API_CANDIDATES;

    for (const candidate of candidates) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(`${candidate}${path}`, {
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          signal: ctrl.signal,
          ...options
        });
        clearTimeout(timer);
        if (res.ok) {
          activeApiBase = candidate;
          return await res.json();
        }
      } catch (_) {
        // Intentar siguiente candidato si este falla
      }
    }
    return null;
  }

  /* ==========================================================================
     GESTIÓN DE ROLES: VISTA CLIENTE vs. VISTA DUEÑO (Jolie / Babycarrusel1234)
     ========================================================================== */
  function applyRoleUI() {
    const isOwner = state.isOwner;

    const btnLogin = document.getElementById('btn-open-login');
    const ownerHeader = document.getElementById('owner-header-controls');
    const navChecklists = document.getElementById('nav-link-checklists');

    const heroTitle = document.getElementById('hero-main-title');
    const heroBadgeLive = document.getElementById('hero-badge-live');
    const heroBadgeParty = document.getElementById('hero-badge-party');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroActionsClient = document.getElementById('hero-actions-client');
    const heroActionsOwner = document.getElementById('hero-actions-owner');

    const kpiGrid = document.getElementById('owner-kpi-grid');
    const clientPanel = document.getElementById('client-side-panel');
    const ownerPanel = document.getElementById('owner-side-panel');
    const ownerRuleForm = document.getElementById('owner-add-rule-form');

    if (isOwner) {
      if (btnLogin) btnLogin.classList.add('hidden');
      if (ownerHeader) {
        ownerHeader.classList.remove('hidden');
        ownerHeader.classList.add('flex');
      }
      if (navChecklists) navChecklists.classList.remove('hidden');

      if (heroTitle) heroTitle.textContent = 'Centro de Operaciones Baby Carrusel';
      if (heroBadgeLive) heroBadgeLive.textContent = 'En Vivo';
      if (heroBadgeParty) heroBadgeParty.textContent = '✨ Modo Fiesta Activo';
      if (heroSubtitle) heroSubtitle.textContent = 'Celebraciones mágicas, gestión sin esfuerzo del salón y logística segura para los más pequeños.';
      if (heroActionsClient) heroActionsClient.classList.add('hidden');
      if (heroActionsOwner) {
        heroActionsOwner.classList.remove('hidden');
        heroActionsOwner.classList.add('flex');
      }

      if (kpiGrid) {
        kpiGrid.classList.remove('hidden');
        kpiGrid.classList.add('grid');
      }
      if (clientPanel) clientPanel.classList.add('hidden');
      if (ownerPanel) {
        ownerPanel.classList.remove('hidden');
        ownerPanel.classList.add('flex');
      }
      if (ownerRuleForm) {
        ownerRuleForm.classList.remove('hidden');
        ownerRuleForm.classList.add('flex');
      }
    } else {
      if (btnLogin) btnLogin.classList.remove('hidden');
      if (ownerHeader) {
        ownerHeader.classList.add('hidden');
        ownerHeader.classList.remove('flex');
      }
      if (navChecklists) navChecklists.classList.add('hidden');

      if (heroTitle) heroTitle.textContent = 'Salón de Eventos Infantiles Baby Carrusel';
      if (heroBadgeLive) heroBadgeLive.textContent = 'Agenda Abierta';
      if (heroBadgeParty) heroBadgeParty.textContent = '✨ Paquetes 50 y 80 Personas • 7 Hrs';
      if (heroSubtitle) heroSubtitle.textContent = 'Incluye mesas, sillas, manteles, cubremanteles, juegos infantiles, internet, refrigerador, microondas, estufa, gas y 7 horas de evento.';
      if (heroActionsClient) heroActionsClient.classList.remove('hidden');
      if (heroActionsOwner) {
        heroActionsOwner.classList.add('hidden');
        heroActionsOwner.classList.remove('flex');
      }

      if (kpiGrid) {
        kpiGrid.classList.add('hidden');
        kpiGrid.classList.remove('grid');
      }
      if (clientPanel) clientPanel.classList.remove('hidden');
      if (ownerPanel) {
        ownerPanel.classList.add('hidden');
        ownerPanel.classList.remove('flex');
      }
      if (ownerRuleForm) {
        ownerRuleForm.classList.add('hidden');
        ownerRuleForm.classList.remove('flex');
      }
    }

    renderCalendar();
    renderDailySessions();
    renderPopupCalendar();
  }

  function openAdminLoginModal() {
    if (state.isOwner) {
      showToast('Sesión de administración activa como Jolie.');
      return;
    }
    const errEl = document.getElementById('admin-login-error');
    if (errEl) errEl.classList.add('hidden');
    openModal('modal-admin-login');
    setTimeout(() => document.getElementById('admin-login-user')?.focus(), 100);
  }
  window.openAdminLoginModal = openAdminLoginModal;

  async function submitAdminLogin(e) {
    if (e) e.preventDefault();
    const user = document.getElementById('admin-login-user')?.value?.trim() || '';
    const pass = document.getElementById('admin-login-pass')?.value || '';
    const errEl = document.getElementById('admin-login-error');

    if (user.toLowerCase() === 'jolie' && pass === 'Babycarrusel1234') {
      state.isOwner = true;
      sessionStorage.setItem('bc_owner_logged', '1');
      if (errEl) errEl.classList.add('hidden');
      closeModal('modal-admin-login');
      applyRoleUI();
      showToast('¡Bienvenida, Jolie! Panel de Operaciones activado.', 'success');
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: user, password: pass })
      });
    } else {
      if (errEl) errEl.classList.remove('hidden');
    }
  }
  window.submitAdminLogin = submitAdminLogin;

  function logoutAdmin() {
    state.isOwner = false;
    sessionStorage.removeItem('bc_owner_logged');
    applyRoleUI();
    showToast('Sesión cerrada. Mostrando Vista de Cliente.', 'info');
  }
  window.logoutAdmin = logoutAdmin;

  /* ==========================================================================
     LÓGICA DE EVENTOS DE 7 HORAS POR FECHA (ANTES DE LAS 11:00 PM)
     ========================================================================== */
  function getSlotsForDate(year, monthIdx, day) {
    const isoDate = formatIsoDate(year, monthIdx, day);
    const isTodayDate = year === TODAY_YEAR && monthIdx === TODAY_MONTH && day === TODAY_DAY;

    // Buscar si existe una reservación activa/pendiente/confirmada en esta fecha
    const dayRes = state.dbData.reservaciones.filter(
      r => r.fecha_evento === isoDate && r.estado !== 'cancelada'
    );

    if (dayRes.length > 0) {
      // Priorizar confirmada sobre pendiente si hubiera más de una
      const found = dayRes.find(r => r.estado === 'confirmada' || r.estado === 'finalizada') || dayRes[0];
      const hIni = (found.hora_inicio || '14:00').slice(0, 5);
      const hFin = (found.hora_fin || '21:00').slice(0, 5);
      const capMax = found.numero_invitados <= 50 ? 50 : 80;

      let uiStatus = 'confirmed';
      let uiLabel = 'Confirmado • Sin Cupo';

      if (isTodayDate && found.estado === 'confirmada') {
        uiStatus = 'active';
        uiLabel = 'En Curso';
      } else if (found.estado === 'finalizada') {
        uiStatus = 'completed';
        uiLabel = 'Finalizado';
      } else if (found.estado === 'pendiente') {
        uiStatus = 'hold';
        uiLabel = 'Pendiente de Confirmación';
      }

      return {
        isMaintenance: false,
        slots: [
          {
            id_reservacion: found.id_reservacion,
            slotKey: `${hIni}-${hFin}`,
            shortTime: hIni,
            time: `${hIni} - ${hFin}`,
            title: found.tipo_evento || 'Evento Infantil',
            host: found.cliente_nombre || 'Cliente Registrado',
            phone: found.cliente_telefono || '+52 444 540 2978',
            status: uiStatus,
            statusLabel: uiLabel,
            guests: `${found.numero_invitados}/${capMax}`,
            numero_invitados: found.numero_invitados,
            deposito: found.deposito,
            deposito_estado: found.deposito_estado,
            estado_db: found.estado
          }
        ]
      };
    }

    // Día libre
    return {
      isMaintenance: false,
      slots: [
        {
          slotKey: '14:00-21:00',
          shortTime: 'Libre',
          time: 'Horario a elegir',
          title: 'Fecha Disponible',
          host: '-',
          status: 'open',
          statusLabel: 'Disponible',
          guests: '50 o 80 Pers.'
        }
      ]
    };
  }

  /* ==========================================================================
     RENDERIZADO DEL CALENDARIO PRINCIPAL (MENSUAL, SEMANAL, DIARIO)
     ========================================================================== */
  function renderCalendar() {
    const titleEl = document.getElementById('calendar-month-title');
    const weekdaysHeader = document.getElementById('calendar-weekdays-header');
    const gridContainer = document.getElementById('calendar-grid-container');
    if (!gridContainer) return;

    if (state.viewMode === 'month') {
      if (titleEl) titleEl.textContent = `${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
      if (weekdaysHeader) weekdaysHeader.classList.remove('hidden');
      gridContainer.className = 'grid grid-cols-7 gap-2';
      renderMonthView(gridContainer);
    } else if (state.viewMode === 'week') {
      if (weekdaysHeader) weekdaysHeader.classList.remove('hidden');
      gridContainer.className = 'grid grid-cols-1 sm:grid-cols-7 gap-2';
      renderWeekView(gridContainer, titleEl);
    } else {
      if (weekdaysHeader) weekdaysHeader.classList.add('hidden');
      gridContainer.className = 'flex flex-col gap-2.5';
      renderDayFloorView(gridContainer, titleEl);
    }
  }

  function renderDayCellBadges(dayInfo, past, full, pending) {
    if (past) {
      return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/70 text-slate-500 truncate">No disponible</span>`;
    }

    if (full) {
      if (state.isOwner) {
        const s = dayInfo.slots[0];
        const shortTitle = s.title.split('•')[0].replace('Cumpleaños #4 de ', '').replace('Cumpleaños ', '').trim();
        return `
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white truncate shadow-2xs">🔴 Sin Cupo</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-200/80 text-rose-900 truncate">${s.shortTime} ${shortTitle}</span>
        `;
      }
      return `
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white truncate shadow-2xs">🔴 Sin Cupo</span>
        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-200/80 text-rose-900 truncate">Reservado</span>
      `;
    }

    if (pending) {
      if (state.isOwner) {
        const s = dayInfo.slots[0];
        const shortTitle = s.title.split('•')[0].replace('Cumpleaños ', '').trim();
        return `
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white truncate shadow-2xs">⏳ Pendiente</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-950 truncate">${shortTitle}</span>
        `;
      }
      return `
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white truncate shadow-2xs">⏳ Pendiente</span>
        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-900 truncate">En Confirmación</span>
      `;
    }

    return `
      <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 truncate">🟢 Disponible</span>
    `;
  }

  function renderMonthView(container) {
    const year = state.currentYear;
    const month = state.currentMonthIndex;
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      cells.push(`
        <div class="min-h-[86px] p-2 rounded-xl bg-slate-100/40 opacity-30 flex flex-col justify-between cursor-not-allowed select-none">
          <span class="font-label-sm text-xs text-slate-400">${prevDay}</span>
          <span class="text-[9px] text-slate-400">${monthNames[(month + 11) % 12].slice(0, 3)}</span>
        </div>
      `);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === TODAY_YEAR && month === TODAY_MONTH && day === TODAY_DAY;
      const isSelected = day === state.selectedDay;
      const past = isPastDate(year, month, day);
      const dayInfo = getSlotsForDate(year, month, day);
      const full = !past && isDayFullyBooked(dayInfo);
      const pending = !past && isDayPendingFull(dayInfo);

      if (past) {
        cells.push(`
          <div title="Fecha pasada no disponible" class="min-h-[92px] p-2 rounded-xl bg-slate-100/80 border border-slate-200/60 opacity-40 flex flex-col justify-between cursor-not-allowed select-none">
            <span class="font-label-sm text-xs text-slate-400 font-semibold line-through">${day}</span>
            <div class="flex flex-col gap-1 mt-1">
              ${renderDayCellBadges(dayInfo, true, false, false)}
            </div>
          </div>
        `);
        continue;
      }

      if (full) {
        const ringClass = isSelected ? 'ring-2 ring-rose-600' : '';
        cells.push(`
          <div onclick="handleCalendarDayClick(${year}, ${month}, ${day})" data-day="${day}" class="min-h-[92px] p-2 rounded-xl bg-rose-100/80 border-2 border-rose-300 text-rose-900 opacity-85 ${ringClass} flex flex-col justify-between relative cursor-pointer hover:bg-rose-200/70 transition-all">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-xs font-bold text-rose-800">${day}${isToday ? ' HOY' : ''}</span>
              <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            </div>
            <div class="flex flex-col gap-1 mt-1">
              ${renderDayCellBadges(dayInfo, false, true, false)}
            </div>
          </div>
        `);
        continue;
      }

      if (pending) {
        const ringClass = isSelected ? 'ring-2 ring-amber-500' : '';
        cells.push(`
          <div onclick="handleCalendarDayClick(${year}, ${month}, ${day})" data-day="${day}" class="min-h-[92px] p-2 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 ${ringClass} flex flex-col justify-between relative cursor-pointer hover:bg-amber-100/70 transition-all">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-xs font-bold text-amber-900">${day}${isToday ? ' HOY' : ''}</span>
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div class="flex flex-col gap-1 mt-1">
              ${renderDayCellBadges(dayInfo, false, false, true)}
            </div>
          </div>
        `);
        continue;
      }

      // Día Libre (Verde)
      const cellClasses = isSelected
        ? 'min-h-[92px] p-2 rounded-xl bg-primary-fixed/25 ring-2 ring-primary shadow-sm flex flex-col justify-between relative cursor-pointer transition-all'
        : isToday
        ? 'min-h-[92px] p-2 rounded-xl bg-primary-fixed/15 ring-1 ring-primary/50 flex flex-col justify-between relative cursor-pointer hover:bg-primary-fixed/25 transition-all'
        : 'min-h-[92px] p-2 rounded-xl bg-surface-container-low/50 border border-emerald-200/60 flex flex-col justify-between cursor-pointer hover:bg-emerald-50/50 transition-colors';

      const headerHtml = isToday
        ? `<div class="flex items-center justify-between">
             <span class="font-label-sm text-xs font-bold text-primary">${day} HOY</span>
             <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
           </div>`
        : `<span class="font-label-sm text-xs ${isSelected ? 'font-bold text-primary' : 'text-on-surface font-semibold'}">${day}</span>`;

      cells.push(`
        <div onclick="handleCalendarDayClick(${year}, ${month}, ${day})" data-day="${day}" class="${cellClasses}">
          ${headerHtml}
          <div class="flex flex-col gap-1 mt-1">
            ${renderDayCellBadges(dayInfo, false, false, false)}
          </div>
        </div>
      `);
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      cells.push(`
        <div onclick="changeMonthAndSelect(1, ${nextDay})" class="min-h-[86px] p-2 rounded-xl bg-surface-container-low/30 opacity-60 flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity">
          <span class="font-label-sm text-xs text-on-surface-variant font-semibold">${nextDay}</span>
          <span class="text-[10px] text-emerald-700 font-medium">${monthNames[(month + 1) % 12].slice(0, 3)} • Disp.</span>
        </div>
      `);
    }

    container.innerHTML = cells.join('');
  }

  function renderWeekView(container, titleEl) {
    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const dayOfWeek = selDate.getDay();
    const sunday = new Date(selDate);
    sunday.setDate(selDate.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    if (titleEl) {
      titleEl.textContent = `Semana del ${sunday.getDate()} de ${monthNames[sunday.getMonth()]} al ${saturday.getDate()} de ${monthNames[saturday.getMonth()]} ${saturday.getFullYear()}`;
    }

    const cards = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const dayNum = d.getDate();

      const isToday = y === TODAY_YEAR && m === TODAY_MONTH && dayNum === TODAY_DAY;
      const isSelected = y === state.currentYear && m === state.currentMonthIndex && dayNum === state.selectedDay;
      const past = isPastDate(y, m, dayNum);
      const dayInfo = getSlotsForDate(y, m, dayNum);
      const full = !past && isDayFullyBooked(dayInfo);
      const pending = !past && isDayPendingFull(dayInfo);

      if (past) {
        cards.push(`
          <div class="min-h-[155px] p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 opacity-40 flex flex-col justify-between cursor-not-allowed select-none">
            <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
              <span class="text-xs font-bold text-slate-400 line-through">${dayNamesShort[i]} ${dayNum}</span>
            </div>
            <div class="flex-1 flex items-center justify-center text-center">
              <span class="text-[11px] font-semibold text-slate-400">Fecha Pasada<br/>No Disponible</span>
            </div>
          </div>
        `);
        continue;
      }

      const cardStyle = full
        ? 'bg-rose-100/80 border-2 border-rose-300 opacity-85'
        : pending
        ? 'bg-amber-50 border-2 border-amber-300'
        : isSelected
        ? 'bg-primary-fixed/25 ring-2 ring-primary shadow-sm'
        : 'bg-surface-container-low/50 hover:bg-surface-container-low';

      cards.push(`
        <div onclick="handleCalendarDayClick(${y}, ${m}, ${dayNum})" class="min-h-[155px] p-2.5 rounded-xl ${cardStyle} flex flex-col justify-between cursor-pointer transition-all">
          <div class="flex items-center justify-between border-b border-surface-container pb-1.5 mb-1.5">
            <span class="text-xs font-bold ${full ? 'text-rose-800' : pending ? 'text-amber-900' : isSelected || isToday ? 'text-primary' : 'text-on-surface'}">${dayNamesShort[i]} ${dayNum}</span>
            ${isToday ? '<span class="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold">HOY</span>' : full ? '<span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">SIN CUPO</span>' : pending ? '<span class="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">PEND.</span>' : ''}
          </div>
          <div class="flex flex-col gap-1.5 flex-1 justify-center">
            ${renderDayCellBadges(dayInfo, false, full, pending)}
          </div>
        </div>
      `);
    }

    container.innerHTML = cards.join('');
  }

  function renderDayFloorView(container, titleEl) {
    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const weekdayName = dayNamesFull[selDate.getDay()];
    const isoDate = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);

    if (titleEl) {
      titleEl.textContent = `Piso Diario • ${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    }

    const dayInfo = getSlotsForDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const slot = dayInfo.slots[0];
    const isFree = slot.status === 'open';
    const isPending = slot.status === 'hold';

    const bgClass = isFree
      ? 'bg-emerald-50/70 border-emerald-200'
      : isPending
      ? 'bg-amber-50/80 border-amber-300'
      : 'bg-rose-50/75 border-rose-300';

    const displayTitle = state.isOwner
      ? slot.title
      : isFree
      ? 'Salón Disponible para Reservar'
      : isPending
      ? 'Reservación en Espera de Confirmación (Pendiente)'
      : 'Fecha Reservada y Confirmada (Sin Cupo)';

    const displaySub = state.isOwner
      ? (isFree ? 'Disponible para Paquete de 50 o 80 personas' : `Anfitrión: ${slot.host} • Aforo: ${slot.guests} Invitados`)
      : (isFree ? 'Incluye mesas, sillas, manteles, cubremanteles, juegos, internet, refri, microondas, estufa y gas' : isPending ? 'Un cliente solicitó esta fecha; pendiente de confirmación del dueño' : 'Esta fecha ya fue confirmada y no tiene cupo disponible');

    const actionBtn = isFree
      ? `<button onclick="openBookingModal('14:00-21:00', '${isoDate}')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">Reservar Este Día</button>`
      : state.isOwner
      ? `<div class="flex items-center gap-2">
           ${isPending ? `<button onclick="quickConfirmReservation(${slot.id_reservacion})" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">Confirmar</button>` : ''}
           <button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105">Gestionar</button>
         </div>`
      : `<span class="px-3 py-1.5 rounded-lg ${isPending ? 'bg-amber-200 text-amber-950' : 'bg-rose-600 text-white'} text-xs font-bold">${isPending ? '⏳ Pendiente' : 'Sin Cupo'}</span>`;

    container.innerHTML = `
      <div class="p-2.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between text-xs text-on-surface-variant">
        <span class="font-semibold">Preparación Pre-Evento • Montaje de Manteles, Cubremanteles, Cocina y Limpieza de Juegos</span>
        <span class="text-emerald-700 font-bold">Incluido ✓</span>
      </div>
      <div class="p-4 rounded-xl border ${bgClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="px-3 py-2 rounded-lg bg-surface-container-lowest font-bold text-xs text-on-surface shadow-2xs whitespace-nowrap">${slot.time}</span>
          <div class="flex flex-col">
            <span class="font-bold text-sm text-on-surface">${displayTitle}</span>
            <span class="text-xs text-on-surface-variant">${displaySub}</span>
          </div>
        </div>
        ${actionBtn}
      </div>
      <div class="p-2.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between text-xs text-on-surface-variant">
        <span class="font-semibold">Cierre del Salón e Inspección de Entrega</span>
        <span class="text-secondary font-bold">Inspección y Entrega</span>
      </div>
    `;
  }

  /* ==========================================================================
     MANEJO DE CLIC EN DÍAS (BLOQUEO DE PASADOS + ALERTA EN DÍAS LLENOS)
     ========================================================================== */
  function handleCalendarDayClick(year, monthIdx, day) {
    if (isPastDate(year, monthIdx, day)) {
      return;
    }

    state.currentYear = year;
    state.currentMonthIndex = monthIdx;
    state.selectedDay = day;

    const dayInfo = getSlotsForDate(year, monthIdx, day);
    const full = isDayFullyBooked(dayInfo);
    const pending = isDayPendingFull(dayInfo);

    renderCalendar();
    renderDailySessions();

    if (full) {
      showToast(
        `⚠️ Sin Cupo: Ya está reservado y confirmado el evento para el ${day} de ${monthNames[monthIdx]}. Por favor elige otra fecha.`,
        'error'
      );
    } else if (pending && !state.isOwner) {
      showToast(
        `⏳ El ${day} de ${monthNames[monthIdx]} tiene una solicitud PENDIENTE de confirmación por el dueño.`,
        'warning'
      );
    }
  }
  window.handleCalendarDayClick = handleCalendarDayClick;

  /* ==========================================================================
     MODAL DE CALENDARIO INTERACTIVO EN TIEMPO REAL (#modal-interactive-calendar)
     ========================================================================== */
  function openInteractiveCalendarModal() {
    state.popupYear = state.currentYear;
    state.popupMonthIndex = state.currentMonthIndex;
    state.popupSelectedDay = isPastDate(state.currentYear, state.currentMonthIndex, state.selectedDay)
      ? TODAY_DAY
      : state.selectedDay;

    renderPopupCalendar();
    openModal('modal-interactive-calendar');
  }
  window.openInteractiveCalendarModal = openInteractiveCalendarModal;

  function navigatePopupCalendar(delta) {
    let newMonth = state.popupMonthIndex + delta;
    let newYear = state.popupYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    if (newYear < TODAY_YEAR || (newYear === TODAY_YEAR && newMonth < TODAY_MONTH)) {
      showToast('No es posible consultar ni reservar en meses pasados.', 'warning');
      return;
    }

    state.popupYear = newYear;
    state.popupMonthIndex = newMonth;
    if (newYear === TODAY_YEAR && newMonth === TODAY_MONTH && state.popupSelectedDay < TODAY_DAY) {
      state.popupSelectedDay = TODAY_DAY;
    } else {
      const maxD = new Date(newYear, newMonth + 1, 0).getDate();
      if (state.popupSelectedDay > maxD) state.popupSelectedDay = 1;
    }

    renderPopupCalendar();
  }
  window.navigatePopupCalendar = navigatePopupCalendar;

  function selectPopupDay(year, monthIdx, day) {
    if (isPastDate(year, monthIdx, day)) return;

    state.popupYear = year;
    state.popupMonthIndex = monthIdx;
    state.popupSelectedDay = day;

    state.currentYear = year;
    state.currentMonthIndex = monthIdx;
    state.selectedDay = day;

    const dayInfo = getSlotsForDate(year, monthIdx, day);
    if (isDayFullyBooked(dayInfo)) {
      showToast(`⚠️ Sin Cupo: Ya está reservado y confirmado el ${day} de ${monthNames[monthIdx]}.`, 'error');
    } else if (isDayPendingFull(dayInfo) && !state.isOwner) {
      showToast(`⏳ El ${day} de ${monthNames[monthIdx]} está PENDIENTE de confirmación por el dueño.`, 'warning');
    }

    renderPopupCalendar();
    renderCalendar();
    renderDailySessions();
  }
  window.selectPopupDay = selectPopupDay;

  function chooseSlotFromPopup(slotKey, isoDate) {
    closeModal('modal-interactive-calendar');
    openBookingModal(slotKey, isoDate);
  }
  window.chooseSlotFromPopup = chooseSlotFromPopup;

  function renderPopupCalendar() {
    const grid = document.getElementById('popup-calendar-grid');
    const monthLabel = document.getElementById('popup-calendar-month-label');
    const todayText = document.getElementById('popup-calendar-today-text');
    const detailBox = document.getElementById('popup-calendar-day-detail');
    if (!grid) return;

    const todayWeekday = dayNamesFull[new Date(TODAY_YEAR, TODAY_MONTH, TODAY_DAY).getDay()];
    if (todayText) {
      todayText.textContent = `Hoy es ${todayWeekday} ${TODAY_DAY} de ${monthNames[TODAY_MONTH]} ${TODAY_YEAR} • Selecciona una fecha disponible`;
    }
    if (monthLabel) {
      monthLabel.textContent = `${monthNames[state.popupMonthIndex]} ${state.popupYear}`;
    }

    const year = state.popupYear;
    const month = state.popupMonthIndex;
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(`<div class="h-16 rounded-xl bg-slate-50/50"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === TODAY_YEAR && month === TODAY_MONTH && day === TODAY_DAY;
      const isSelected = day === state.popupSelectedDay;
      const past = isPastDate(year, month, day);
      const dayInfo = getSlotsForDate(year, month, day);
      const full = !past && isDayFullyBooked(dayInfo);
      const pending = !past && isDayPendingFull(dayInfo);

      if (past) {
        cells.push(`
          <div class="h-16 p-1.5 rounded-xl bg-slate-100 border border-slate-200/70 opacity-35 flex flex-col items-center justify-center cursor-not-allowed select-none">
            <span class="text-xs font-bold text-slate-400 line-through">${day}</span>
            <span class="text-[9px] text-slate-400">Pasado</span>
          </div>
        `);
      } else if (full) {
        cells.push(`
          <div onclick="selectPopupDay(${year}, ${month}, ${day})" class="h-16 p-1.5 rounded-xl bg-rose-100/90 border-2 ${isSelected ? 'border-rose-700 ring-2 ring-rose-500' : 'border-rose-300'} opacity-85 flex flex-col items-center justify-between cursor-pointer hover:bg-rose-200/80 transition-all">
            <div class="flex items-center gap-1">
              <span class="text-xs font-extrabold text-rose-900">${day}</span>
              ${isToday ? '<span class="px-1 rounded bg-rose-700 text-white text-[8px] font-bold">HOY</span>' : ''}
            </div>
            <span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold truncate max-w-full">🔴 Sin Cupo</span>
          </div>
        `);
      } else if (pending) {
        cells.push(`
          <div onclick="selectPopupDay(${year}, ${month}, ${day})" class="h-16 p-1.5 rounded-xl bg-amber-50 border-2 ${isSelected ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-400'} flex flex-col items-center justify-between cursor-pointer hover:bg-amber-100/80 transition-all">
            <div class="flex items-center gap-1">
              <span class="text-xs font-extrabold text-amber-950">${day}</span>
              ${isToday ? '<span class="px-1 rounded bg-amber-600 text-white text-[8px] font-bold">HOY</span>' : ''}
            </div>
            <span class="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold truncate max-w-full">⏳ Pendiente</span>
          </div>
        `);
      } else {
        const boxClass = isSelected
          ? 'bg-primary-fixed/30 border-2 border-primary ring-2 ring-primary/40 shadow-sm'
          : isToday
          ? 'bg-primary-fixed/15 border-2 border-primary/60 hover:bg-primary-fixed/25'
          : 'bg-surface-container-low/60 border border-emerald-200 hover:bg-emerald-50/70';

        cells.push(`
          <div onclick="selectPopupDay(${year}, ${month}, ${day})" class="h-16 p-1.5 rounded-xl ${boxClass} flex flex-col items-center justify-between cursor-pointer transition-all">
            <div class="flex items-center gap-1">
              <span class="text-xs font-bold ${isSelected || isToday ? 'text-primary' : 'text-on-surface'}">${day}</span>
              ${isToday ? '<span class="px-1 rounded bg-primary text-white text-[8px] font-bold">HOY</span>' : ''}
            </div>
            <span class="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold truncate max-w-full">
              🟢 Disponible
            </span>
          </div>
        `);
      }
    }

    grid.innerHTML = cells.join('');

    if (!detailBox) return;
    const selDay = state.popupSelectedDay;
    const selDateObj = new Date(year, month, selDay);
    const selWeekday = dayNamesFull[selDateObj.getDay()];
    const selIso = formatIsoDate(year, month, selDay);
    const selInfo = getSlotsForDate(year, month, selDay);
    const selFull = isDayFullyBooked(selInfo);
    const selPending = isDayPendingFull(selInfo);

    if (selFull) {
      detailBox.className = 'mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex flex-col gap-2 text-center';
      detailBox.innerHTML = `
        <div class="flex items-center justify-center gap-2 text-rose-800 font-bold text-sm">
          <span class="material-symbols-outlined text-xl text-rose-600">block</span>
          <span>¡Sin Cupo! Ya está reservado y confirmado el ${selWeekday} ${selDay} de ${monthNames[month]} ${year}</span>
        </div>
        <p class="text-xs text-rose-700">
          El evento para esta fecha ya fue confirmado por el dueño del salón. Por favor selecciona otro día en verde en el calendario.
        </p>
      `;
    } else if (selPending) {
      const s = selInfo.slots[0];
      detailBox.className = 'mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3';
      detailBox.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-2xl text-amber-600">hourglass_top</span>
          <div>
            <span class="font-bold text-sm text-amber-950 block">⏳ Reservación Pendiente de Confirmación (${selWeekday} ${selDay} de ${monthNames[month]})</span>
            <span class="text-xs text-amber-800">Un cliente solicitó este día (${s.time}). Se pondrá en rojo (Sin Cupo) cuando el dueño confirme la reservación.</span>
          </div>
        </div>
        ${state.isOwner ? `<button onclick="quickConfirmReservation(${s.id_reservacion})" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 whitespace-nowrap">Confirmar Ahora</button>` : `<span class="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-950 text-xs font-bold whitespace-nowrap">⏳ Pendiente</span>`}
      `;
    } else {
      detailBox.className = 'mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3';
      detailBox.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-2xl text-emerald-600">event_available</span>
          <div>
            <span class="font-bold text-sm text-emerald-950 block">🟢 ${selWeekday} ${selDay} de ${monthNames[month]} ${year} • Fecha Disponible</span>
            <span class="text-xs text-emerald-800">Paquete para 50 u 80 personas • Incluye mesas, sillas, manteles, cubremanteles, juegos, internet, refri, microondas, estufa y gas.</span>
          </div>
        </div>
        <button onclick="chooseSlotFromPopup('14:00-21:00', '${selIso}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs whitespace-nowrap">
          Reservar Este Día
        </button>
      `;
    }
  }

  /* ==========================================================================
     NAVEGACIÓN DE FECHAS Y DÍAS DEL CALENDARIO PRINCIPAL
     ========================================================================== */
  function navigateCalendar(delta) {
    if (state.viewMode === 'month') {
      let targetMonth = state.currentMonthIndex + delta;
      let targetYear = state.currentYear;
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear -= 1;
      } else if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }

      if (!state.isOwner && (targetYear < TODAY_YEAR || (targetYear === TODAY_YEAR && targetMonth < TODAY_MONTH))) {
        showToast('No es posible reservar en meses pasados.', 'warning');
        return;
      }

      state.currentYear = targetYear;
      state.currentMonthIndex = targetMonth;
      const maxDays = new Date(state.currentYear, state.currentMonthIndex + 1, 0).getDate();
      if (state.currentYear === TODAY_YEAR && state.currentMonthIndex === TODAY_MONTH && state.selectedDay < TODAY_DAY) {
        state.selectedDay = TODAY_DAY;
      } else if (state.selectedDay > maxDays) {
        state.selectedDay = maxDays;
      }
    } else if (state.viewMode === 'week') {
      const d = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay + delta * 7);
      if (!state.isOwner && isPastDate(d.getFullYear(), d.getMonth(), d.getDate())) {
        state.currentYear = TODAY_YEAR;
        state.currentMonthIndex = TODAY_MONTH;
        state.selectedDay = TODAY_DAY;
      } else {
        state.currentYear = d.getFullYear();
        state.currentMonthIndex = d.getMonth();
        state.selectedDay = d.getDate();
      }
    } else {
      const d = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay + delta);
      if (!state.isOwner && isPastDate(d.getFullYear(), d.getMonth(), d.getDate())) {
        showToast('No es posible seleccionar días pasados.', 'warning');
        return;
      }
      state.currentYear = d.getFullYear();
      state.currentMonthIndex = d.getMonth();
      state.selectedDay = d.getDate();
    }

    renderCalendar();
    renderDailySessions();
  }
  window.navigateCalendar = navigateCalendar;
  window.changeMonth = navigateCalendar;

  function changeMonthAndSelect(monthDelta, dayNum) {
    let targetMonth = state.currentMonthIndex + monthDelta;
    let targetYear = state.currentYear;
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
    if (isPastDate(targetYear, targetMonth, dayNum)) return;
    state.currentYear = targetYear;
    state.currentMonthIndex = targetMonth;
    state.selectedDay = dayNum;
    renderCalendar();
    renderDailySessions();
  }
  window.changeMonthAndSelect = changeMonthAndSelect;

  function selectExactDate(year, monthIdx, dayNum) {
    handleCalendarDayClick(year, monthIdx, dayNum);
  }
  window.selectExactDate = selectExactDate;

  function goToToday() {
    state.currentYear = TODAY_YEAR;
    state.currentMonthIndex = TODAY_MONTH;
    state.selectedDay = TODAY_DAY;
    renderCalendar();
    renderDailySessions();
    showToast(`Mostrando hoy: ${TODAY_DAY} de ${monthNames[TODAY_MONTH]} ${TODAY_YEAR}.`);
  }
  window.goToToday = goToToday;

  function selectCalendarDay(dayNumber) {
    handleCalendarDayClick(state.currentYear, state.currentMonthIndex, dayNumber);
  }
  window.selectCalendarDay = selectCalendarDay;

  function setCalendarView(mode) {
    state.viewMode = mode;
    const btnMonth = document.getElementById('view-mode-month');
    const btnWeek = document.getElementById('view-mode-week');
    const btnDay = document.getElementById('view-mode-day');

    const activeClasses = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-lowest text-on-surface shadow-xs';
    const inactiveClasses = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface';

    if (btnMonth) btnMonth.className = mode === 'month' ? activeClasses : inactiveClasses;
    if (btnWeek) btnWeek.className = mode === 'week' ? activeClasses : inactiveClasses;
    if (btnDay) btnDay.className = mode === 'day' ? activeClasses : inactiveClasses;

    renderCalendar();
  }
  window.setCalendarView = setCalendarView;

  /* ==========================================================================
     DESGLOSE DE HORARIOS / SESIONES DEL DÍA SELECCIONADO
     ========================================================================== */
  function renderDailySessions() {
    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const weekdayName = dayNamesFull[selDate.getDay()];
    const isoDate = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);

    const dateTitle = document.getElementById('selected-day-title');
    const dateSub = document.getElementById('selected-day-subtitle');
    if (dateTitle) {
      dateTitle.textContent = `${state.isOwner ? 'Evento' : 'Disponibilidad'} del ${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    }

    const dayInfo = getSlotsForDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const full = isDayFullyBooked(dayInfo);
    const pending = isDayPendingFull(dayInfo);

    if (dateSub) {
      dateSub.textContent = full
        ? '🔴 Sin Cupo: Esta fecha ya fue confirmada por la administración'
        : pending
        ? '⏳ Solicitud de reservación en espera de confirmación por el dueño'
        : '🟢 Fecha disponible para reservar tu evento';
    }

    const sessionsContainer = document.getElementById('daily-sessions-container');
    if (!sessionsContainer) return;

    const slot = dayInfo.slots[0];

    // 1. Día Libre (Verde)
    if (slot.status === 'open') {
      sessionsContainer.innerHTML = `
        <div class="p-space-md rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div class="flex items-start gap-space-md">
            <div class="flex flex-col items-center justify-center w-24 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-center">
              <span class="text-xs font-bold uppercase tracking-wider">Disponible</span>
              <span class="font-label-sm text-[11px] font-semibold">50 / 80 Pers.</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-headline-sm text-headline-sm text-emerald-950 font-bold">Fecha Disponible • Paquete 50 o 80 Personas</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">🟢 Disponible</span>
              </div>
              <span class="text-xs text-emerald-900/80 mt-0.5">Incluye: Mesas, sillas, manteles, cubremanteles, juegos infantiles, internet Wi-Fi, refrigerador, microondas, estufa y gas.</span>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end md:self-center">
            <button onclick="openBookingModal('14:00-21:00', '${isoDate}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5" type="button">
              <span class="material-symbols-outlined text-sm">add_circle</span>
              <span>Reservar Este Día</span>
            </button>
          </div>
        </div>
      `;
      syncSelectedDayToOwnerPanel();
      renderDaySheetModal();
      return;
    }

    // 2. VISTA CLIENTE: Mostrar PENDIENTE en amarillo o SIN CUPO en rojo
    if (!state.isOwner) {
      if (slot.status === 'hold') {
        sessionsContainer.innerHTML = `
          <div class="p-space-md rounded-xl bg-amber-50/80 border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-24 py-2 rounded-lg bg-amber-100 text-amber-900 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Horario</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-amber-950 font-bold">Reservación en Espera de Confirmación</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">⏳ Pendiente</span>
                </div>
                <span class="text-xs text-amber-900/80 mt-0.5">Un cliente solicitó reservar este día. Se marcará en rojo (Sin Cupo) una vez que el dueño del salón confirme la reservación.</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <span class="px-3.5 py-1.5 rounded-lg bg-amber-200 text-amber-950 text-xs font-bold">⏳ Pendiente</span>
            </div>
          </div>
        `;
      } else {
        sessionsContainer.innerHTML = `
          <div class="p-space-md rounded-xl bg-rose-50/80 border-2 border-rose-300 opacity-90 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-24 py-2 rounded-lg bg-rose-100 text-rose-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Reservado</span>
                <span class="font-label-sm text-[11px] font-semibold">Confirmado</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-rose-950 font-bold">Fecha Reservada y Confirmada</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">🔴 Sin Cupo</span>
                </div>
                <span class="text-xs text-rose-800/80 mt-0.5">Este día ya fue confirmado por la administración del salón. Por favor selecciona otra fecha disponible en el calendario.</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <span class="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold">Sin Cupo</span>
            </div>
          </div>
        `;
      }
      syncSelectedDayToOwnerPanel();
      renderDaySheetModal();
      return;
    }

    // 3. VISTA DUEÑO / ADMINISTRACIÓN
    if (slot.status === 'hold') {
      sessionsContainer.innerHTML = `
        <div class="p-space-md rounded-xl bg-amber-50/80 border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div class="flex items-start gap-space-md">
            <div class="flex flex-col items-center justify-center w-24 py-2 rounded-lg bg-amber-100 text-amber-900 text-center">
              <span class="text-xs font-bold uppercase tracking-wider">Pendiente</span>
              <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-headline-sm text-headline-sm text-amber-950 font-bold">${slot.title}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">⏳ Pendiente de Confirmar</span>
              </div>
              <span class="text-xs text-amber-900/90 mt-0.5">Cliente: ${slot.host} (${slot.phone || ''}) • Aforo: ${slot.guests} Personas</span>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end md:self-center">
            <button onclick="quickConfirmReservation(${slot.id_reservacion})" class="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs">
              Confirmar Reservación
            </button>
            <button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs">
              Gestionar
            </button>
          </div>
        </div>
      `;
    } else {
      const isCurrentActive = slot.status === 'active';
      sessionsContainer.innerHTML = `
        <div class="p-space-md rounded-xl ${isCurrentActive ? 'bg-primary-fixed/20' : 'bg-rose-50/60 border border-rose-200'} shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1.5 ${isCurrentActive ? 'bg-primary' : 'bg-rose-600'}"></div>
          <div class="flex items-start gap-space-md pl-1">
            <div class="flex flex-col items-center justify-center w-24 py-2 rounded-lg ${isCurrentActive ? 'bg-primary text-white' : 'bg-rose-600 text-white'} text-center shadow-xs">
              <span class="text-xs font-bold uppercase tracking-wider">${isCurrentActive ? 'En Curso' : 'Confirmado'}</span>
              <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${slot.title}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isCurrentActive ? 'bg-primary text-white' : 'bg-rose-100 text-rose-800'} flex items-center gap-1">
                  ${isCurrentActive ? '<span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>Activo Ahora' : '🔴 Sin Cupo (Confirmado)'}
                </span>
              </div>
              <span id="${isCurrentActive ? 'slot-host-info' : ''}" class="text-xs text-on-surface-variant mt-0.5">Anfitrión: ${slot.host} (${slot.phone || ''}) • ${slot.guests} Invitados</span>
            </div>
          </div>
          <div class="flex items-center gap-space-xs self-end md:self-center">
            <div class="text-right mr-2 hidden sm:block">
              <span class="text-[11px] font-semibold text-on-surface-variant block">Depósito en Garantía</span>
              <span class="text-xs font-bold text-on-surface">$350.00 en Custodia</span>
            </div>
            <button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:brightness-105 flex items-center gap-1 transition-all" type="button">
              <span class="material-symbols-outlined text-sm">tune</span>
              <span>Gestionar</span>
            </button>
          </div>
        </div>
      `;
    }

    syncSelectedDayToOwnerPanel();
    renderDaySheetModal();
  }

  /* ==========================================================================
     SINCRONIZACIÓN EN TIEMPO REAL DE LOS 4 KPIS Y FICHA DEL DÍA SELECCIONADO
     ========================================================================== */
  function getActiveReservationForDate(isoDate) {
    const dayRes = state.dbData.reservaciones.filter(
      r => r.fecha_evento === isoDate && r.estado !== 'cancelada'
    );
    if (dayRes.length === 0) return null;
    return dayRes.find(r => r.estado === 'confirmada' || r.estado === 'finalizada') || dayRes[0];
  }

  function syncSelectedDayToOwnerPanel() {
    const selectedIso = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const dayRes = getActiveReservationForDate(selectedIso);

    if (dayRes) {
      syncSpotlightReservation(dayRes);
    } else {
      renderEmptySpotlightForAvailableDay(selectedIso);
    }

    updateOwnerKPIs(selectedIso, dayRes);
  }

  function renderEmptySpotlightForAvailableDay(selectedIso) {
    state.activeReservationId = null;
    state.aforo.current = 0;
    state.aforo.max = 80;
    state.aforo.children = 0;
    state.aforo.adults = 0;
    state.deposit.status = 'none';

    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const weekdayName = dayNamesFull[selDate.getDay()];
    const dateLabel = `${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]}`;

    const headerLabelEl = document.getElementById('spotlight-header-label');
    const codeEl = document.getElementById('spotlight-code');
    const titleEl = document.getElementById('spotlight-title');
    const emojiEl = document.getElementById('spotlight-emoji');
    const themeEl = document.getElementById('spotlight-theme');
    const initialsEl = document.getElementById('spotlight-host-initials');
    const hostNameEl = document.getElementById('spotlight-host-name');
    const hostPhoneEl = document.getElementById('spotlight-host-phone');
    const aforoControlsEl = document.getElementById('spotlight-aforo-controls');
    const pkgLabelEl = document.getElementById('spotlight-package-label');
    const pkgStatusEl = document.getElementById('spotlight-package-status');
    const quickActionsEl = document.getElementById('spotlight-quick-actions');
    const footerNoteEl = document.getElementById('spotlight-footer-note');
    const exitTimeEl = document.getElementById('checklist-exit-time');
    const exitStatusEl = document.getElementById('checklist-exit-status');

    if (headerLabelEl) headerLabelEl.textContent = `Estado (${state.selectedDay} ${monthNames[state.currentMonthIndex].slice(0, 3)})`;
    if (codeEl) {
      codeEl.textContent = '🟢 Disponible';
      codeEl.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white';
    }
    if (titleEl) titleEl.textContent = 'Salón Disponible';
    if (emojiEl) emojiEl.textContent = '🎠✨';
    if (themeEl) themeEl.textContent = `Sin reservación programada para el ${dateLabel}`;

    if (initialsEl) initialsEl.textContent = 'BC';
    if (hostNameEl) hostNameEl.textContent = 'Sin Anfitrión Asignado';
    if (hostPhoneEl) hostPhoneEl.textContent = 'Fecha libre para Paquete 50 u 80 personas';
    if (aforoControlsEl) aforoControlsEl.classList.add('hidden');

    if (pkgLabelEl) pkgLabelEl.textContent = 'Estado de la Fecha:';
    if (pkgStatusEl) {
      pkgStatusEl.textContent = 'Disponible (50 o 80 Pers.)';
      pkgStatusEl.className = 'text-xs font-bold text-emerald-700';
    }

    if (quickActionsEl) {
      quickActionsEl.innerHTML = `
        <button onclick="openBookingModal('14:00-21:00', '${selectedIso}')" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1.5" type="button">
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Agendar Reservación en Esta Fecha</span>
        </button>
      `;
    }

    if (footerNoteEl) {
      footerNoteEl.textContent = `*El ${dateLabel} se encuentra libre. Puedes agendar una reservación o hacer clic en otro día del calendario.`;
    }
    if (exitTimeEl) exitTimeEl.textContent = 'Estado de Instalaciones';
    if (exitStatusEl) {
      exitStatusEl.textContent = 'Salón Listo ✓';
      exitStatusEl.className = 'text-emerald-700 font-bold text-[11px]';
    }

    renderAforoUI();
    renderDepositUI(null);
  }

  function syncSpotlightReservation(resObj) {
    if (!resObj) {
      const selectedIso = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
      renderEmptySpotlightForAvailableDay(selectedIso);
      return;
    }
    state.activeReservationId = resObj.id_reservacion;

    const totalGuests = parseInt(resObj.numero_invitados || 50, 10);
    const maxCap = totalGuests <= 50 && (resObj.tipo_evento || '').includes('50') ? 50 : 80;
    const childrenCount = Math.round(totalGuests * 0.6);
    const adultsCount = totalGuests - childrenCount;
    state.aforo.current = totalGuests;
    state.aforo.max = maxCap;
    state.aforo.children = childrenCount;
    state.aforo.adults = adultsCount;

    state.deposit.amount = parseFloat(resObj.deposito || 350.0);
    if (resObj.deposito_estado === 'devuelto') {
      state.deposit.status = 'released';
    } else if (resObj.deposito_estado === 'retenido') {
      state.deposit.status = 'deducted';
    } else if (resObj.estado === 'pendiente' && resObj.deposito_estado === 'pendiente') {
      state.deposit.status = 'pending';
    } else {
      state.deposit.status = 'held';
    }

    const parts = (resObj.tipo_evento || 'Evento Infantil • Paquete 80 Personas').split('•');
    const mainTitle = parts[0].trim();
    const restParts = parts.slice(1).map(p => p.replace('(7 Horas)', '').trim()).filter(Boolean);
    const themeText = restParts.length > 0 ? `Modalidad: ${restParts.join(' • ')}` : `Modalidad: Paquete ${maxCap} Personas`;

    const isPending = resObj.estado === 'pendiente';
    const hIni = (resObj.hora_inicio || '14:00').slice(0, 5);
    const hFin = (resObj.hora_fin || '21:00').slice(0, 5);

    const headerLabelEl = document.getElementById('spotlight-header-label');
    const codeEl = document.getElementById('spotlight-code');
    const titleEl = document.getElementById('spotlight-title');
    const emojiEl = document.getElementById('spotlight-emoji');
    const themeEl = document.getElementById('spotlight-theme');
    const initialsEl = document.getElementById('spotlight-host-initials');
    const hostNameEl = document.getElementById('spotlight-host-name');
    const hostPhoneEl = document.getElementById('spotlight-host-phone');
    const aforoControlsEl = document.getElementById('spotlight-aforo-controls');
    const pkgLabelEl = document.getElementById('spotlight-package-label');
    const pkgStatusEl = document.getElementById('spotlight-package-status');
    const quickActionsEl = document.getElementById('spotlight-quick-actions');
    const footerNoteEl = document.getElementById('spotlight-footer-note');
    const exitTimeEl = document.getElementById('checklist-exit-time');
    const exitStatusEl = document.getElementById('checklist-exit-status');

    if (headerLabelEl) {
      headerLabelEl.textContent = isPending ? 'Solicitud Pendiente de Confirmar' : 'Reservación Confirmada';
    }
    if (codeEl) {
      codeEl.textContent = isPending
        ? `⏳ Pendiente • #BC-${100 + resObj.id_reservacion}`
        : `🔴 Confirmada • #BC-${100 + resObj.id_reservacion}`;
      codeEl.className = isPending
        ? 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white'
        : 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white';
    }
    if (titleEl) titleEl.textContent = mainTitle;
    if (emojiEl) emojiEl.textContent = isPending ? '⏳🎈' : '🎉🎂';
    if (themeEl) themeEl.textContent = themeText;

    const hostName = resObj.cliente_nombre || 'Cliente Registrado';
    const initials = hostName
      .split(' ')
      .filter(w => w.length > 1 && w.toLowerCase() !== 'del')
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'BC';

    if (initialsEl) initialsEl.textContent = initials;
    if (hostNameEl) hostNameEl.textContent = hostName;
    if (hostPhoneEl) hostPhoneEl.textContent = `${resObj.cliente_telefono || '+52 444 540 2978'} • Horario ${hIni} a ${hFin}`;
    if (aforoControlsEl) aforoControlsEl.classList.remove('hidden');

    if (pkgLabelEl) pkgLabelEl.textContent = `Paquete ${maxCap} Personas:`;
    if (pkgStatusEl) {
      pkgStatusEl.textContent = isPending ? 'Por Confirmar con Cliente' : 'Confirmado (Sin Cupo)';
      pkgStatusEl.className = isPending ? 'text-xs font-bold text-amber-700' : 'text-xs font-bold text-emerald-700';
    }

    if (quickActionsEl) {
      quickActionsEl.innerHTML = isPending
        ? `
          <button onclick="quickConfirmReservation(${resObj.id_reservacion})" class="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1" type="button">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            <span>Confirmar Reservación</span>
          </button>
          <button onclick="selectReservationFromSlot(${resObj.id_reservacion})" class="px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-variant transition-colors" type="button">
            Gestionar
          </button>
        `
        : `
          <button onclick="selectReservationFromSlot(${resObj.id_reservacion})" class="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs flex items-center justify-center gap-1.5" type="button">
            <span class="material-symbols-outlined text-sm">tune</span>
            <span>Gestionar Evento y Estado</span>
          </button>
        `;
    }

    if (footerNoteEl) {
      footerNoteEl.textContent = `*Horario programado de ${hIni} a ${hFin} hrs para ${hostName}. El depósito de garantía ($350.00) se libera al concluir la revisión de salida.`;
    }
    if (exitTimeEl) exitTimeEl.textContent = `Protocolo de Salida (${hFin} hrs)`;
    if (exitStatusEl) {
      exitStatusEl.textContent = isPending ? '⏳ En Espera de Confirmación' : '🔴 Evento Confirmado';
      exitStatusEl.className = isPending ? 'text-amber-600 font-bold text-[11px]' : 'text-primary font-bold text-[11px]';
    }

    const cInit = document.getElementById('contact-host-initials');
    const cName = document.getElementById('contact-host-name');
    const cEvent = document.getElementById('contact-host-event');
    const cWa = document.getElementById('contact-wa-link');
    const cTel = document.getElementById('contact-tel-link');
    const cTelText = document.getElementById('contact-tel-text');
    const cleanPhone = (resObj.cliente_telefono || '+524445402978').replace(/[^0-9]/g, '');

    if (cInit) cInit.textContent = initials;
    if (cName) cName.textContent = hostName;
    if (cEvent) cEvent.textContent = `${mainTitle} (${resObj.fecha_evento} • ${hIni}-${hFin})`;
    if (cWa) {
      const msg = encodeURIComponent(
        `Hola ${hostName}, te saludamos del Salón Baby Carrusel (C. 5 de Mayo 1940, San Luis Potosí) respecto a tu evento "${mainTitle}" para el día ${resObj.fecha_evento} en horario de ${hIni} a ${hFin} hrs.`
      );
      cWa.href = `https://wa.me/${cleanPhone}?text=${msg}`;
    }
    if (cTel) cTel.href = `tel:+${cleanPhone}`;
    if (cTelText) cTelText.textContent = `Llamar al Móvil (${resObj.cliente_telefono || '+52 444 540 2978'})`;

    const mTitle = document.getElementById('manage-slot-title');
    const mSub = document.getElementById('manage-slot-subtitle');
    if (mTitle) mTitle.textContent = `${mainTitle} (#BC-${100 + resObj.id_reservacion})`;
    if (mSub) mSub.textContent = `Fecha: ${resObj.fecha_evento} • Horario ${hIni} a ${hFin} hrs • Anfitrión: ${hostName}`;

    renderAforoUI();
    renderDepositUI(resObj);

    if (resObj.checklists) {
      const preChk = resObj.checklists.pre_evento;
      const postChk = resObj.checklists.post_evento;
      if (preChk && preChk.detalles && preChk.detalles.length > 0) {
        state.checklists.pre = preChk.detalles.map(d => ({
          id: d.id_detalle,
          title: d.elemento,
          note: d.observaciones || 'Verificado en inspección pre-evento',
          completed: d.estado === 'bueno',
          estado: d.estado
        }));
      }
      if (postChk && postChk.detalles && postChk.detalles.length > 0) {
        state.checklists.post = postChk.detalles.map(d => ({
          id: d.id_detalle,
          title: d.elemento,
          note: d.observaciones || 'Pendiente de revisión al cierre',
          completed: d.estado === 'bueno',
          estado: d.estado
        }));
      }
      renderChecklist();
    }
  }

  function updateOwnerKPIs(selectedIso, dayRes) {
    const isSelectedToday = selectedIso === TODAY_ISO;
    const monthShort = monthNames[state.currentMonthIndex].slice(0, 3);

    // 1. KPI: Estado de Hoy / Estado del Día Seleccionado
    const kpiTodayLabel = document.getElementById('kpi-today-label');
    const kpiTodayEvent = document.getElementById('kpi-today-event');
    const kpiTodayStatus = document.getElementById('kpi-today-status');
    const kpiTodayDot = document.getElementById('kpi-today-dot');
    const kpiTodayStatusText = document.getElementById('kpi-today-status-text');

    if (kpiTodayLabel) {
      kpiTodayLabel.textContent = isSelectedToday ? 'Estado de Hoy' : `Estado (${state.selectedDay} ${monthShort})`;
    }

    if (dayRes) {
      const mainTitle = (dayRes.tipo_evento || 'Evento Programado').split('•')[0].trim();
      const hIni = (dayRes.hora_inicio || '14:00').slice(0, 5);
      const hFin = (dayRes.hora_fin || '21:00').slice(0, 5);
      if (kpiTodayEvent) kpiTodayEvent.textContent = mainTitle;

      if (dayRes.estado === 'pendiente') {
        if (kpiTodayStatus) kpiTodayStatus.className = 'font-label-sm text-label-sm text-amber-700 font-semibold flex items-center gap-1';
        if (kpiTodayDot) kpiTodayDot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
        if (kpiTodayStatusText) kpiTodayStatusText.textContent = `⏳ Pendiente (${hIni}-${hFin})`;
      } else {
        if (kpiTodayStatus) kpiTodayStatus.className = 'font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1';
        if (kpiTodayDot) kpiTodayDot.className = 'w-2 h-2 rounded-full bg-primary animate-pulse';
        if (kpiTodayStatusText) kpiTodayStatusText.textContent = `🔴 Confirmado (${hIni}-${hFin})`;
      }
    } else {
      if (kpiTodayEvent) kpiTodayEvent.textContent = 'Salón Disponible';
      if (kpiTodayStatus) kpiTodayStatus.className = 'font-label-sm text-label-sm text-emerald-700 font-semibold flex items-center gap-1';
      if (kpiTodayDot) kpiTodayDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
      if (kpiTodayStatusText) kpiTodayStatusText.textContent = '🟢 Sin Evento Programado';
    }

    // 2. KPI: Ocupación Fin de Semana del Mes Actual en Tiempo Real
    const daysInMonth = new Date(state.currentYear, state.currentMonthIndex + 1, 0).getDate();
    let totalWeekendDays = 0;
    let bookedWeekendDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(state.currentYear, state.currentMonthIndex, d).getDay();
      if (dow === 0 || dow === 6) {
        totalWeekendDays++;
        const iso = formatIsoDate(state.currentYear, state.currentMonthIndex, d);
        if (getActiveReservationForDate(iso)) {
          bookedWeekendDays++;
        }
      }
    }
    const weekendPct = totalWeekendDays > 0 ? Math.round((bookedWeekendDays / totalWeekendDays) * 100) : 0;
    const kpiWeekendText = document.getElementById('kpi-weekend-text');
    const kpiWeekendBar = document.getElementById('kpi-weekend-bar');
    if (kpiWeekendText) {
      kpiWeekendText.textContent = `${weekendPct}% (${bookedWeekendDays}/${totalWeekendDays} Días)`;
    }
    if (kpiWeekendBar) {
      kpiWeekendBar.style.width = `${weekendPct}%`;
    }

    // 3. KPI: Seguridad & Sanitización en Tiempo Real
    const kpiSafetyTitle = document.getElementById('kpi-safety-title');
    const kpiSafetySub = document.getElementById('kpi-safety-sub');
    const preTotal = state.checklists.pre.length || 5;
    const preDone = state.checklists.pre.filter(i => i.completed).length;
    if (dayRes) {
      const safetyPct = Math.round((preDone / preTotal) * 100);
      if (kpiSafetyTitle) kpiSafetyTitle.textContent = `${safetyPct}% Inspeccionado`;
      if (kpiSafetySub) kpiSafetySub.textContent = `${preDone}/${preTotal} Puntos Pre-Evento ✓`;
    } else {
      if (kpiSafetyTitle) kpiSafetyTitle.textContent = 'Salón Verificado';
      if (kpiSafetySub) kpiSafetySub.textContent = 'Instalaciones en Orden ✓';
    }

    // 4. KPI: Aforo de la Fecha Seleccionada
    const kpiAforoLabel = document.getElementById('kpi-aforo-label');
    const kpiAforoCount = document.getElementById('kpi-aforo-count');
    const kpiAforoAvail = document.getElementById('kpi-aforo-avail');
    if (kpiAforoLabel) {
      kpiAforoLabel.textContent = isSelectedToday ? 'Aforo de Hoy' : `Aforo (${state.selectedDay} ${monthShort})`;
    }
    if (dayRes) {
      const guests = parseInt(dayRes.numero_invitados || 50, 10);
      const maxCap = guests <= 50 && (dayRes.tipo_evento || '').includes('50') ? 50 : 80;
      if (kpiAforoCount) kpiAforoCount.textContent = `${guests} / ${maxCap} Invitados`;
      if (kpiAforoAvail) {
        kpiAforoAvail.textContent = `Paquete ${maxCap} Pers. (${dayRes.estado === 'pendiente' ? 'Pendiente' : 'Confirmado'})`;
      }
    } else {
      if (kpiAforoCount) kpiAforoCount.textContent = '0 / 80 Invitados';
      if (kpiAforoAvail) kpiAforoAvail.textContent = 'Disponible (50 u 80 Pers.)';
    }
  }

  function renderAforoUI() {
    const percentage = state.aforo.max > 0 ? Math.round((state.aforo.current / state.aforo.max) * 100) : 0;

    const aforoText = document.getElementById('spotlight-aforo-text');
    const aforoBar = document.getElementById('spotlight-aforo-bar');
    const aforoDetail = document.getElementById('spotlight-aforo-detail');
    if (aforoText) aforoText.textContent = `${state.aforo.current} / ${state.aforo.max} Máx (${percentage}%)`;
    if (aforoBar) {
      aforoBar.style.width = `${Math.min(percentage, 100)}%`;
      if (percentage >= 90) {
        aforoBar.className = 'bg-rose-500 h-2.5 rounded-full transition-all duration-300';
      } else if (percentage >= 75) {
        aforoBar.className = 'bg-primary h-2.5 rounded-full transition-all duration-300';
      } else {
        aforoBar.className = 'bg-emerald-500 h-2.5 rounded-full transition-all duration-300';
      }
    }
    if (aforoDetail) {
      aforoDetail.innerHTML = state.activeReservationId
        ? `<span>${state.aforo.children} Niños (Estimados)</span><span>${state.aforo.adults} Adultos (Acompañantes)</span>`
        : `<span>0 Niños</span><span>0 Adultos</span>`;
    }
  }

  function renderDepositUI(resObj) {
    const depositStatus = document.getElementById('spotlight-deposit-status');
    const releaseBtn = document.getElementById('btn-release-deposit');

    if (!resObj || state.deposit.status === 'none') {
      if (depositStatus) {
        depositStatus.className = 'flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant';
        depositStatus.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-on-surface-variant">shield_locked</span>
            <span class="text-xs font-semibold">Depósito de Garantía:</span>
          </div>
          <span class="text-xs font-bold">Sin Depósito Activo</span>
        `;
      }
      if (releaseBtn) {
        releaseBtn.innerHTML = `
          <span class="material-symbols-outlined text-base">event_available</span>
          <span>Sin Reservación en Esta Fecha</span>
        `;
        releaseBtn.className = 'flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-label-md text-label-md cursor-not-allowed flex items-center justify-center gap-1';
        releaseBtn.disabled = true;
      }
      return;
    }

    if (state.deposit.status === 'released') {
      if (depositStatus) {
        depositStatus.className = 'flex items-center justify-between p-space-sm rounded-xl bg-emerald-50 text-emerald-900';
        depositStatus.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-emerald-700">verified</span>
            <span class="text-xs font-semibold">Depósito de Garantía:</span>
          </div>
          <span class="text-xs font-bold text-emerald-800">$350.00 Reembolsado Exitosamente</span>
        `;
      }
      if (releaseBtn) {
        releaseBtn.innerHTML = `
          <span class="material-symbols-outlined text-base">check_circle</span>
          <span>Depósito de $350 Liberado ✓</span>
        `;
        releaseBtn.className = 'flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-label-md text-label-md opacity-90 cursor-default flex items-center justify-center gap-1';
        releaseBtn.disabled = true;
      }
    } else if (state.deposit.status === 'deducted') {
      const obs = resObj?.observaciones || '';
      if (depositStatus) {
        depositStatus.className = 'flex items-center justify-between p-space-sm rounded-xl bg-rose-50 text-rose-900';
        depositStatus.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-rose-700">report_problem</span>
            <span class="text-xs font-semibold">Depósito de Garantía:</span>
          </div>
          <span class="text-xs font-bold text-rose-800">${obs.includes('RETENCIÓN') ? obs.split('.')[0] : 'Retención Aplicada'}</span>
        `;
      }
      if (releaseBtn) {
        releaseBtn.disabled = false;
      }
    } else if (state.deposit.status === 'pending') {
      if (depositStatus) {
        depositStatus.className = 'flex items-center justify-between p-space-sm rounded-xl bg-amber-50 text-amber-950';
        depositStatus.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-amber-600">hourglass_top</span>
            <span class="text-xs font-semibold">Depósito de Garantía:</span>
          </div>
          <span class="text-xs font-bold text-amber-800">$350.00 Pendiente de Confirmar</span>
        `;
      }
      if (releaseBtn) {
        releaseBtn.innerHTML = `
          <span class="material-symbols-outlined text-base">check</span>
          <span>Liberar Depósito de $350</span>
        `;
        releaseBtn.className = 'flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-label-md text-label-md hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1';
        releaseBtn.disabled = false;
      }
    } else {
      if (depositStatus) {
        depositStatus.className = 'flex items-center justify-between p-space-sm rounded-xl bg-emerald-50 text-emerald-900';
        depositStatus.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lg text-emerald-700">lock</span>
            <span class="text-xs font-semibold">Depósito de Garantía:</span>
          </div>
          <span class="text-xs font-bold">$350.00 en Custodia</span>
        `;
      }
      if (releaseBtn) {
        releaseBtn.innerHTML = `
          <span class="material-symbols-outlined text-base">check</span>
          <span>Liberar Depósito de $350</span>
        `;
        releaseBtn.className = 'flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-label-md text-label-md hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-1';
        releaseBtn.disabled = false;
      }
    }
  }

  function rebuildNotificationsFromDB() {
    const activeList = state.dbData.reservaciones
      .filter(r => r.estado !== 'cancelada')
      .sort((a, b) => (a.fecha_evento > b.fecha_evento ? 1 : -1));

    if (activeList.length === 0) {
      state.notifications = [
        {
          id: 1,
          title: 'Agenda al Día',
          text: 'No hay solicitudes pendientes por confirmar en este momento.',
          time: 'Actualizado',
          unread: false
        }
      ];
    } else {
      state.notifications = activeList.map(r => {
        const isPend = r.estado === 'pendiente';
        const mainTitle = (r.tipo_evento || 'Reservación').split('•')[0].trim();
        const hIni = (r.hora_inicio || '14:00').slice(0, 5);
        const hFin = (r.hora_fin || '21:00').slice(0, 5);
        return {
          id: r.id_reservacion,
          title: isPend ? `⏳ Pendiente: ${r.fecha_evento}` : `🔴 Confirmada: ${r.fecha_evento}`,
          text: `${mainTitle} • Cliente: ${r.cliente_nombre || 'Registrado'} (${r.numero_invitados} pers. • ${hIni}-${hFin})`,
          time: isPend ? 'Por confirmar' : 'Confirmado',
          unread: isPend
        };
      });
    }
    updateNotifBadge();
  }

  async function loadDashboardFromDatabase() {
    const data = await apiFetch('/dashboard');
    if (data && data.status === 'ok') {
      if (Array.isArray(data.reservaciones)) {
        state.dbData.reservaciones = data.reservaciones;
      }
      if (Array.isArray(data.clientes)) state.dbData.clientes = data.clientes;
      if (Array.isArray(data.empleados) && data.empleados.length > 0) state.dbData.empleados = data.empleados;
      if (Array.isArray(data.mobiliario) && data.mobiliario.length > 0) state.dbData.mobiliario = data.mobiliario;
      if (Array.isArray(data.reglamento) && data.reglamento.length > 0) state.dbData.reglamento = data.reglamento;

      try {
        localStorage.setItem('bc_dashboard_cache_v3', JSON.stringify(data));
      } catch (_) {}
    }

    rebuildNotificationsFromDB();
    renderCalendar();
    renderDailySessions();
    renderPopupCalendar();
    renderReglamentoModal();
    renderMobiliarioModal();
    renderDaySheetModal();
  }

  /* ==========================================================================
     MODALES DE REGLAMENTO, MOBILIARIO, HOJA DEL DÍA Y GESTIÓN
     ========================================================================== */
  function renderReglamentoModal() {
    const container = document.getElementById('db-reglamento-list');
    if (!container) return;
    container.innerHTML = state.dbData.reglamento.map((r, idx) => `
      <div class="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-2">
        <span class="w-5 h-5 rounded-full bg-primary-fixed text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">${idx + 1}</span>
        <div class="flex flex-col">
          <strong class="text-on-surface font-bold text-xs">${r.titulo}</strong>
          <span class="text-on-surface-variant text-[11px]">${r.descripcion}</span>
        </div>
      </div>
    `).join('');
  }

  async function submitNewRule(e) {
    if (e) e.preventDefault();
    if (!state.isOwner) return;
    const titleEl = document.getElementById('new-rule-title');
    const descEl = document.getElementById('new-rule-desc');
    const titulo = titleEl?.value?.trim();
    const descripcion = descEl?.value?.trim();
    if (!titulo || !descripcion) return;

    const res = await apiFetch('/reglamento', {
      method: 'POST',
      body: JSON.stringify({ titulo, descripcion, activo: 1 })
    });

    state.dbData.reglamento.push({
      id_regla: res?.id_regla || Date.now(),
      titulo,
      descripcion,
      activo: 1
    });

    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    renderReglamentoModal();
    showToast('Nueva norma publicada en el reglamento del salón.', 'success');
  }
  window.submitNewRule = submitNewRule;

  function renderMobiliarioModal() {
    const container = document.getElementById('db-mobiliario-list');
    if (!container) return;

    container.innerHTML = state.dbData.mobiliario.map(m => {
      const badgeClass =
        m.estado === 'disponible'
          ? 'bg-emerald-100 text-emerald-800'
          : m.estado === 'en_mantenimiento'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-rose-100 text-rose-800';

      return `
        <div class="p-2 rounded-lg bg-surface-container-lowest flex items-center justify-between gap-2 shadow-2xs">
          <div class="flex flex-col min-w-0">
            <span class="font-semibold text-on-surface text-xs truncate">${m.nombre} (Cant: ${m.cantidad})</span>
            <span class="text-[10px] text-on-surface-variant truncate">${m.descripcion || ''}</span>
          </div>
          <select onchange="changeMobiliarioEstado(${m.id_mobiliario}, this.value)" class="px-2 py-1 rounded-lg text-[11px] font-bold ${badgeClass} border-none focus:outline-none cursor-pointer">
            <option value="disponible" ${m.estado === 'disponible' ? 'selected' : ''}>Disponible ✓</option>
            <option value="en_mantenimiento" ${m.estado === 'en_mantenimiento' ? 'selected' : ''}>En Mantenimiento 🔧</option>
            <option value="fuera_de_servicio" ${m.estado === 'fuera_de_servicio' ? 'selected' : ''}>Fuera de Servicio ⚠️</option>
          </select>
        </div>
      `;
    }).join('');
  }

  async function changeMobiliarioEstado(idMobiliario, nuevoEstado) {
    const item = state.dbData.mobiliario.find(m => m.id_mobiliario === idMobiliario);
    if (item) item.estado = nuevoEstado;
    renderMobiliarioModal();

    await apiFetch(`/mobiliario/${idMobiliario}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    showToast(`Estado de mobiliario actualizado.`);
  }
  window.changeMobiliarioEstado = changeMobiliarioEstado;

  function renderDaySheetModal() {
    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const weekdayName = dayNamesFull[selDate.getDay()];
    const selectedIso = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const subEl = document.getElementById('day-sheet-date-subtitle');
    if (subEl) {
      subEl.textContent = `${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear} • Salón Baby Carrusel`;
    }

    const dayRes = getActiveReservationForDate(selectedIso);
    const badgeEl = document.getElementById('day-sheet-status-badge');
    if (badgeEl) {
      if (!dayRes) {
        badgeEl.textContent = '🟢 Fecha Disponible';
        badgeEl.className = 'px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold';
      } else if (dayRes.estado === 'pendiente') {
        badgeEl.textContent = '⏳ Pendiente de Confirmar';
        badgeEl.className = 'px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold';
      } else {
        badgeEl.textContent = '🔴 Reservación Confirmada';
        badgeEl.className = 'px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold';
      }
    }

    const empContainer = document.getElementById('day-sheet-empleados');
    if (empContainer) {
      empContainer.innerHTML = state.dbData.empleados.map(e => `
        <div class="p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
          <div>
            <strong class="text-on-surface block">${e.nombre}</strong>
            <span class="text-[11px] text-on-surface-variant">${e.puesto}</span>
          </div>
          <span class="text-[10px] font-semibold text-primary">${e.telefono || ''}</span>
        </div>
      `).join('');
    }

    const turnosContainer = document.getElementById('day-sheet-turnos');
    if (turnosContainer) {
      if (dayRes) {
        const hIni = (dayRes.hora_inicio || '14:00').slice(0, 5);
        const hFin = (dayRes.hora_fin || '21:00').slice(0, 5);
        const maxCap = dayRes.numero_invitados <= 50 && (dayRes.tipo_evento || '').includes('50') ? 50 : 80;
        const cleanTitle = (dayRes.tipo_evento || 'Evento Infantil').replace('(7 Horas)', '').trim();
        turnosContainer.innerHTML = `
          <div class="p-3 rounded-xl ${dayRes.estado === 'pendiente' ? 'bg-amber-50 border border-amber-300' : 'bg-primary-fixed/25 border border-primary/30'} flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <strong class="text-sm text-on-surface">${cleanTitle} (#BC-${100 + dayRes.id_reservacion})</strong>
              <span class="font-bold ${dayRes.estado === 'pendiente' ? 'text-amber-800' : 'text-primary'}">${dayRes.estado === 'pendiente' ? '⏳ Pendiente' : '🔴 Confirmado'}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-on-surface-variant">
              <span><strong>Anfitrión:</strong> ${dayRes.cliente_nombre || 'Cliente Registrado'}</span>
              <span><strong>Teléfono:</strong> ${dayRes.cliente_telefono || '+52 444 540 2978'}</span>
              <span><strong>Horario:</strong> ${hIni} a ${hFin} hrs</span>
              <span><strong>Aforo / Paquete:</strong> ${dayRes.numero_invitados} / ${maxCap} Personas</span>
              <span><strong>Depósito en Garantía:</strong> $${parseFloat(dayRes.deposito || 350).toFixed(2)} (${dayRes.deposito_estado || 'en custodia'})</span>
              <span><strong>Incluye:</strong> Mesas, sillas, mantelería, juegos, Wi-Fi y cocina con gas</span>
            </div>
          </div>
        `;
      } else {
        turnosContainer.innerHTML = `
          <div class="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <strong class="text-on-surface block">Salón Disponible (Sin Evento Programado)</strong>
              <span class="text-on-surface-variant">No hay ninguna reservación registrada para el ${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}.</span>
            </div>
            <span class="text-emerald-700 font-bold">🟢 Libre</span>
          </div>
        `;
      }
    }
  }

  async function quickConfirmReservation(idReservacion) {
    const resObj = state.dbData.reservaciones.find(r => r.id_reservacion === idReservacion);
    if (resObj) {
      resObj.estado = 'confirmada';
      resObj.deposito_estado = 'pagado';
    }
    renderCalendar();
    renderDailySessions();
    renderPopupCalendar();

    await apiFetch(`/reservaciones/${idReservacion}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'confirmada', deposito_estado: 'pagado' })
    });
    await loadDashboardFromDatabase();

    showToast('¡Reservación confirmada por el dueño! El día ahora aparece en ROJO (SIN CUPO).', 'success');
  }
  window.quickConfirmReservation = quickConfirmReservation;

  async function changeReservationStatus(nuevoEstado) {
    const id = state.activeReservationId;
    const resObj = state.dbData.reservaciones.find(r => r.id_reservacion === id);
    if (resObj) {
      resObj.estado = nuevoEstado;
    }
    await apiFetch(`/reservaciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({
        estado: nuevoEstado,
        ...(nuevoEstado === 'confirmada' ? { deposito_estado: 'pagado' } : {})
      })
    });
    closeModal('modal-manage-slot');
    await loadDashboardFromDatabase();
    showToast(`Estado de la reservación actualizado a "${nuevoEstado}".`, 'success');
  }
  window.changeReservationStatus = changeReservationStatus;

  async function resetDemoDatabase() {
    await apiFetch('/reset-demo', { method: 'POST' });
    await loadDashboardFromDatabase();
    showToast('Valores del turno activo restaurados.', 'success');
  }
  window.resetDemoDatabase = resetDemoDatabase;

  /* ==========================================================================
     SISTEMA DE TOASTS Y MODALES
     ========================================================================== */
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' 
      ? 'bg-emerald-600 text-white' 
      : type === 'warning'
      ? 'bg-amber-600 text-white'
      : type === 'info'
      ? 'bg-secondary text-white'
      : 'bg-rose-600 text-white';

    const icon = type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'error';

    toast.className = `toast flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg font-body-md text-sm ${bgClass}`;
    toast.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="material-symbols-outlined text-xl">${icon}</span>
        <span>${message}</span>
      </div>
      <button class="opacity-80 hover:opacity-100 text-white text-lg leading-none p-1" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
  window.showToast = showToast;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
  window.openModal = openModal;

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
  window.closeModal = closeModal;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-wrapper:not(.hidden)').forEach(modal => {
        closeModal(modal.id);
      });
      const notifPopover = document.getElementById('notif-popover');
      if (notifPopover) notifPopover.classList.add('hidden');
    }
  });

  document.querySelectorAll('.modal-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) {
        closeModal(wrapper.id);
      }
    });
  });

  /* ==========================================================================
     AFORO, CHECKLISTS Y DEPÓSITO (EXCLUSIVO DUEÑO)
     ========================================================================== */
  async function updateAforo(change) {
    if (!state.isOwner) return;
    const newTotal = state.aforo.current + change;
    if (newTotal < 0) return;
    if (newTotal > state.aforo.max) {
      showToast(`Capacidad máxima del paquete alcanzada (${state.aforo.max} personas).`, 'warning');
      return;
    }

    state.aforo.current = newTotal;
    if (change > 0) {
      state.aforo.children += 1;
    } else if (change < 0 && state.aforo.children > 0) {
      state.aforo.children -= 1;
    }

    renderAforoUI();

    const currentRes = state.dbData.reservaciones.find(r => r.id_reservacion === state.activeReservationId);
    if (currentRes) {
      currentRes.numero_invitados = state.aforo.current;
    }

    await apiFetch(`/reservaciones/${state.activeReservationId}/aforo`, {
      method: 'PATCH',
      body: JSON.stringify({ numero_invitados: state.aforo.current })
    });

    renderDailySessions();
    showToast(`Aforo actualizado: ${state.aforo.current} invitados en salón.`);
  }
  window.updateAforo = updateAforo;

  function renderChecklist() {
    const list = state.checklists[state.activeChecklistTab];
    const container = document.getElementById('checklist-container');
    if (!container) return;

    container.innerHTML = list.map(item => {
      const isDamaged = item.estado === 'danado';
      const cardClass = isDamaged
        ? 'bg-rose-50 border border-rose-200'
        : item.completed
        ? 'bg-emerald-50/70 border border-emerald-200'
        : 'bg-surface-container-low/60 hover:bg-surface-container-low border border-transparent';

      const iconName = isDamaged ? 'error' : item.completed ? 'check_circle' : 'radio_button_unchecked';
      const iconColor = isDamaged ? 'text-rose-600' : item.completed ? 'text-emerald-600' : 'text-on-surface-variant';

      return `
        <div onclick="toggleChecklistItem('${state.activeChecklistTab}', ${item.id})" 
             class="flex items-start gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer select-none ${cardClass}">
          <span class="material-symbols-outlined text-lg mt-0.5 ${iconColor}" 
                style="font-variation-settings: 'FILL' ${item.completed || isDamaged ? 1 : 0};">
            ${iconName}
          </span>
          <div class="flex flex-col text-xs flex-1">
            <span class="font-semibold ${isDamaged ? 'text-rose-950' : item.completed ? 'text-emerald-950' : 'text-on-surface'}">${item.title}</span>
            <span class="text-[11px] ${isDamaged ? 'text-rose-700' : item.completed ? 'text-emerald-700' : 'text-on-surface-variant'}">${item.note}</span>
          </div>
        </div>
      `;
    }).join('');

    const tabPre = document.getElementById('tab-btn-pre');
    const tabPost = document.getElementById('tab-btn-post');
    if (tabPre && tabPost) {
      if (state.activeChecklistTab === 'pre') {
        tabPre.className = 'flex-1 py-1.5 rounded-lg text-xs font-bold bg-surface-container-lowest text-on-surface shadow-xs flex items-center justify-center gap-1';
        tabPost.className = 'flex-1 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1';
      } else {
        tabPre.className = 'flex-1 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-1';
        tabPost.className = 'flex-1 py-1.5 rounded-lg text-xs font-bold bg-surface-container-lowest text-on-surface shadow-xs flex items-center justify-center gap-1';
      }
    }
  }

  function setChecklistTab(tab) {
    state.activeChecklistTab = tab;
    renderChecklist();
  }
  window.setChecklistTab = setChecklistTab;

  async function toggleChecklistItem(tab, id) {
    if (!state.isOwner) return;
    const item = state.checklists[tab].find(i => i.id === id);
    if (!item) return;
    item.completed = !item.completed;
    item.estado = item.completed ? 'bueno' : 'pendiente';
    renderChecklist();

    await apiFetch(`/checklist-detalles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: item.estado })
    });

    if (item.completed) {
      showToast(`Punto verificado: ${item.title}`);
    } else {
      showToast(`Marcado como pendiente: ${item.title}`, 'info');
    }
  }
  window.toggleChecklistItem = toggleChecklistItem;

  function confirmReleaseDeposit() {
    if (!state.isOwner) return;
    if (state.deposit.status === 'released') {
      showToast('El depósito de $350.00 ya ha sido liberado anteriormente.', 'info');
      return;
    }
    openModal('modal-confirm-deposit');
  }
  window.confirmReleaseDeposit = confirmReleaseDeposit;

  async function executeReleaseDeposit() {
    if (!state.isOwner) return;
    state.deposit.status = 'released';
    closeModal('modal-confirm-deposit');

    await apiFetch(`/reservaciones/${state.activeReservationId}/deposito`, {
      method: 'PATCH',
      body: JSON.stringify({ deposito_estado: 'devuelto' })
    });

    renderDepositUI();
    showToast('¡Depósito de $350.00 liberado satisfactoriamente al anfitrión!', 'success');
  }
  window.executeReleaseDeposit = executeReleaseDeposit;

  async function submitIncidentReport(e) {
    if (e) e.preventDefault();
    if (!state.isOwner) return;
    const reason = document.getElementById('incident-reason')?.value || 'Deducción operativa';
    const amount = document.getElementById('incident-amount')?.value || '50';
    const notes = document.getElementById('incident-notes')?.value || '';

    state.deposit.status = 'deducted';
    state.deposit.deduction = parseFloat(amount);
    const balance = state.deposit.amount - state.deposit.deduction;

    closeModal('modal-report-incident');

    const motivoCompleto = notes ? `${reason} (${notes})` : reason;
    await apiFetch(`/reservaciones/${state.activeReservationId}/deposito`, {
      method: 'PATCH',
      body: JSON.stringify({
        deposito_estado: 'retenido',
        monto_retenido: parseFloat(amount),
        motivo: motivoCompleto
      })
    });

    renderDepositUI({
      observaciones: `RETENCIÓN -$${amount} (${reason}). Restante: $${balance}`
    });

    await loadDashboardFromDatabase();
    showToast(`Incidencia registrada: -$${amount} por ${reason}. Remanente: $${balance}`, 'warning');
  }
  window.submitIncidentReport = submitIncidentReport;

  function selectReservationFromSlot(idReservacion) {
    if (!state.isOwner) return;
    const resObj = state.dbData.reservaciones.find(r => r.id_reservacion === idReservacion);
    if (resObj) {
      syncSpotlightReservation(resObj);
    }
    openManageSlotModal();
  }
  window.selectReservationFromSlot = selectReservationFromSlot;

  /* ==========================================================================
     FORMULARIO DE NUEVA RESERVACIÓN (PAQUETES 50 Y 80 PERSONAS • 7 HORAS)
     ========================================================================== */
  function onPackageCapacityChange(pkgVal) {
    const guestsInput = document.getElementById('booking-guests');
    const summaryPkg = document.getElementById('booking-summary-pkg');
    const cap = parseInt(pkgVal || '80', 10);
    if (guestsInput) {
      guestsInput.max = String(cap);
      guestsInput.value = String(cap);
    }
    if (summaryPkg) {
      summaryPkg.textContent = `Paquete Seleccionado (${cap} Personas):`;
    }
  }
  window.onPackageCapacityChange = onPackageCapacityChange;

  function openBookingModalWithPackage(pkgCap) {
    const pkgSelect = document.getElementById('booking-package');
    if (pkgSelect) {
      pkgSelect.value = String(pkgCap);
      onPackageCapacityChange(pkgCap);
    }
    openBookingModal();
  }
  window.openBookingModalWithPackage = openBookingModalWithPackage;

  function findNextAvailableIsoDate(startYear, startMonthIdx, startDay) {
    for (let offset = 0; offset < 45; offset++) {
      const d = new Date(startYear, startMonthIdx, startDay + offset);
      const y = d.getFullYear();
      const m = d.getMonth();
      const dayNum = d.getDate();
      if (isPastDate(y, m, dayNum)) continue;
      const info = getSlotsForDate(y, m, dayNum);
      if (!isDayFullyBooked(info) && !isDayPendingFull(info)) {
        return formatIsoDate(y, m, dayNum);
      }
    }
    return TODAY_ISO;
  }

  function openBookingModal(slot = '', dateStr = '') {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      dateInput.min = TODAY_ISO;
      let targetIso = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        ? dateStr
        : formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);

      const [yS, mS, dS] = targetIso.split('-').map(Number);
      if (isPastDate(yS, mS - 1, dS)) {
        targetIso = findNextAvailableIsoDate(TODAY_YEAR, TODAY_MONTH, TODAY_DAY);
      } else {
        const checkInfo = getSlotsForDate(yS, mS - 1, dS);
        if (!dateStr && (isDayFullyBooked(checkInfo) || isDayPendingFull(checkInfo))) {
          targetIso = findNextAvailableIsoDate(yS, mS - 1, dS);
        }
      }

      dateInput.value = targetIso;

      const slotSelect = document.getElementById('booking-slot');
      if (slotSelect && slot && slot.includes('-')) {
        slotSelect.value = slot;
      }
    }
    openModal('modal-new-booking');
  }
  window.openBookingModal = openBookingModal;

  async function submitNewBooking(e) {
    if (e) e.preventDefault();
    const childName = document.getElementById('booking-child')?.value?.trim() || 'Festejado';
    const age = document.getElementById('booking-age')?.value || '4';
    const hostName = document.getElementById('booking-host')?.value?.trim() || 'Anfitrión';
    const phone = document.getElementById('booking-phone')?.value?.trim() || '+52 444 000 0000';
    const email = document.getElementById('booking-email')?.value?.trim() || '';
    const pkgCap = parseInt(document.getElementById('booking-package')?.value || '80', 10);
    const guests = parseInt(document.getElementById('booking-guests')?.value || String(pkgCap), 10);
    const date = document.getElementById('booking-date')?.value || TODAY_ISO;
    const slot = document.getElementById('booking-slot')?.value || '14:00-21:00';
    const theme = document.getElementById('booking-theme')?.value?.trim() || `Paquete ${pkgCap} Personas (7 Horas)`;

    if (guests > pkgCap) {
      showToast(`Para más de 50 personas por favor selecciona el Paquete para 80 Personas (cupo máximo 80).`, 'warning');
      return;
    }

    const [yStr, mStr, dStr] = date.split('-');
    const yNum = parseInt(yStr, 10);
    const mIdx = parseInt(mStr, 10) - 1;
    const dNum = parseInt(dStr, 10);

    if (isPastDate(yNum, mIdx, dNum)) {
      showToast('No es posible reservar en fechas anteriores al día de hoy.', 'error');
      return;
    }

    const existingInfo = getSlotsForDate(yNum, mIdx, dNum);
    if (isDayFullyBooked(existingInfo)) {
      showToast(`⚠️ Sin Cupo: El ${dNum} de ${monthNames[mIdx]} ya está reservado y confirmado. Por favor selecciona otro día.`, 'error');
      return;
    }
    if (isDayPendingFull(existingInfo)) {
      showToast(`⏳ El ${dNum} de ${monthNames[mIdx]} ya tiene una solicitud pendiente de confirmación. Elige otra fecha disponible.`, 'warning');
      return;
    }

    closeModal('modal-new-booking');

    const initialStatus = state.isOwner ? 'confirmada' : 'pendiente';
    const initialDepositStatus = state.isOwner ? 'pagado' : 'pendiente';
    const [hIniShort, hFinShort] = slot.split('-');
    const hIni = `${hIniShort}:00`;
    const hFin = `${hFinShort}:00`;
    const fullTheme = `${theme} • Paquete ${pkgCap} Personas (7 Horas)`;

    const payload = {
      festejado: childName,
      edad: age,
      nombre_cliente: hostName,
      telefono: phone,
      correo: email || null,
      fecha_evento: date,
      turno: slot,
      hora_inicio: hIni,
      hora_fin: hFin,
      tematica: fullTheme,
      numero_invitados: guests,
      estado: initialStatus,
      deposito: 350.00,
      deposito_estado: initialDepositStatus
    };

    const tempId = state.dbData.reservaciones.length + 1;
    state.dbData.reservaciones.push({
      id_reservacion: tempId,
      cliente_nombre: hostName,
      cliente_telefono: phone,
      fecha_evento: date,
      hora_inicio: hIni,
      hora_fin: hFin,
      tipo_evento: `Cumpleaños #${age} de ${childName} • ${fullTheme}`,
      numero_invitados: guests,
      estado: initialStatus,
      deposito: 350,
      deposito_estado: initialDepositStatus
    });

    state.currentYear = yNum;
    state.currentMonthIndex = mIdx;
    state.selectedDay = dNum;
    state.popupYear = yNum;
    state.popupMonthIndex = mIdx;
    state.popupSelectedDay = dNum;

    renderCalendar();
    renderDailySessions();
    renderPopupCalendar();

    if (!state.isOwner) {
      showToast(
        `⏳ Solicitud registrada como PENDIENTE para el ${dNum} de ${monthNames[mIdx]} (${hIniShort} a ${hFinShort} hrs • 7 Horas). Se pondrá en rojo (Sin Cupo) cuando el dueño confirme.`,
        'warning'
      );
    } else {
      showToast(
        `¡Reservación de ${childName} confirmada para el ${dNum} de ${monthNames[mIdx]}! El día ahora está en ROJO (SIN CUPO).`,
        'success'
      );
    }

    const apiRes = await apiFetch('/reservaciones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (apiRes && apiRes.id_reservacion) {
      if (state.isOwner) state.activeReservationId = apiRes.id_reservacion;
      await loadDashboardFromDatabase();
    }

    state.notifications.unshift({
      id: Date.now(),
      title: state.isOwner ? 'Reservación Confirmada' : 'Nueva Solicitud Pendiente',
      text: `${childName} (${age} años) • Anfitrión: ${hostName} (Paquete ${pkgCap} pers. • ${hIniShort}-${hFinShort}).`,
      time: 'Justo ahora',
      unread: true
    });
    updateNotifBadge();
  }
  window.submitNewBooking = submitNewBooking;

  /* ==========================================================================
     NOTIFICACIONES, GALERÍA Y NAVEGACIÓN
     ========================================================================== */
  function toggleNotifications() {
    const popover = document.getElementById('notif-popover');
    if (!popover) return;
    popover.classList.toggle('hidden');
    renderNotificationsList();
  }
  window.toggleNotifications = toggleNotifications;

  function renderNotificationsList() {
    const listContainer = document.getElementById('notif-items-list');
    if (!listContainer) return;

    listContainer.innerHTML = state.notifications.map(n => `
      <div class="p-3 rounded-xl ${n.unread ? 'bg-primary-fixed/20 border-l-4 border-primary' : 'bg-surface-container-low/40'} flex flex-col gap-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface">${n.title}</span>
          <span class="text-[10px] text-on-surface-variant">${n.time}</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-snug">${n.text}</p>
      </div>
    `).join('');
  }

  function markAllNotificationsRead() {
    state.notifications.forEach(n => n.unread = false);
    updateNotifBadge();
    renderNotificationsList();
    showToast('Notificaciones marcadas como leídas.');
  }
  window.markAllNotificationsRead = markAllNotificationsRead;

  function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    const unreadCount = state.notifications.filter(n => n.unread).length;
    if (badge) {
      if (unreadCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  function openGalleryLightbox(imgSrc, title, subtitle) {
    const imgEl = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const subtitleEl = document.getElementById('lightbox-subtitle');

    if (imgEl) imgEl.src = imgSrc;
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    openModal('modal-gallery-lightbox');
  }
  window.openGalleryLightbox = openGalleryLightbox;

  function openVenueMapModal() {
    openModal('modal-venue-map');
  }
  window.openVenueMapModal = openVenueMapModal;

  function openDaySheetModal() {
    if (!state.isOwner) {
      openAdminLoginModal();
      return;
    }
    renderDaySheetModal();
    openModal('modal-day-sheet');
  }
  window.openDaySheetModal = openDaySheetModal;

  function openContactHostModal() {
    if (!state.isOwner) return;
    if (!state.activeReservationId) {
      showToast('Esta fecha está disponible y no tiene un anfitrión asignado.', 'info');
      return;
    }
    openModal('modal-contact-host');
  }
  window.openContactHostModal = openContactHostModal;

  function openDepositPolicyModal() {
    renderReglamentoModal();
    openModal('modal-deposit-policy');
  }
  window.openDepositPolicyModal = openDepositPolicyModal;

  function openManageSlotModal() {
    if (!state.isOwner) {
      openAdminLoginModal();
      return;
    }
    if (!state.activeReservationId) {
      showToast('Selecciona primero un día con reservación para gestionarla.', 'info');
      return;
    }
    renderMobiliarioModal();
    openModal('modal-manage-slot');
  }
  window.openManageSlotModal = openManageSlotModal;

  function printDaySheet() {
    const selDate = new Date(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const weekdayName = dayNamesFull[selDate.getDay()];
    const fullDateStr = `${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    const selectedIso = formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const dayRes = getActiveReservationForDate(selectedIso);

    let eventHtml = '';
    let statusBadgeText = 'FECHA DISPONIBLE';
    let statusBadgeColor = '#065f46; background:#d1fae5;';

    if (dayRes) {
      const hIni = (dayRes.hora_inicio || '14:00').slice(0, 5);
      const hFin = (dayRes.hora_fin || '21:00').slice(0, 5);
      const maxCap = dayRes.numero_invitados <= 50 && (dayRes.tipo_evento || '').includes('50') ? 50 : 80;
      const cleanTitle = (dayRes.tipo_evento || 'Evento Infantil').replace('(7 Horas)', '').trim();
      const isPend = dayRes.estado === 'pendiente';
      statusBadgeText = isPend ? 'PENDIENTE DE CONFIRMAR' : 'RESERVACIÓN CONFIRMADA';
      statusBadgeColor = isPend ? '#92400e; background:#fef3c7;' : '#9f1239; background:#ffe4e6;';

      eventHtml = `
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tr>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; width:22%; font-weight:700; background:#f8fafc;">Folio y Evento:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; width:78%;" colspan="3"><strong>#BC-${100 + dayRes.id_reservacion}</strong> — ${cleanTitle}</td>
          </tr>
          <tr>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Anfitrión / Cliente:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1;">${dayRes.cliente_nombre || 'Cliente Registrado'}</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Teléfono:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1;">${dayRes.cliente_telefono || '+52 444 540 2978'}</td>
          </tr>
          <tr>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Horario Programado:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1;">${hIni} a ${hFin} hrs (7 Horas)</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Aforo / Paquete:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1;">${dayRes.numero_invitados} invitados (Paquete ${maxCap} Personas)</td>
          </tr>
          <tr>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Depósito en Garantía:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1;">$${parseFloat(dayRes.deposito || 350).toFixed(2)} MXN (${dayRes.deposito_estado || 'en custodia'})</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700; background:#f8fafc;">Estado:</td>
            <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:700;">${isPend ? 'Pendiente de Confirmar' : 'Confirmada'}</td>
          </tr>
        </table>
      `;
    } else {
      eventHtml = `
        <div style="padding:10px 12px; border:1px solid #a7f3d0; background:#ecfdf5; border-radius:8px; font-size:12px; color:#065f46;">
          <strong>Salón Disponible (Sin Evento Programado):</strong> No existe ninguna reservación registrada para el ${fullDateStr}. El salón se encuentra libre para paquete de 50 u 80 personas.
        </div>
      `;
    }

    const staffRows = state.dbData.empleados.map(e => `
      <tr>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:600;">${e.nombre}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1;">${e.puesto}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1;">${e.telefono || '+52 444 540 2978'}</td>
      </tr>
    `).join('');

    const checklistRows = [...state.checklists.pre, ...state.checklists.post].map((item, idx) => `
      <tr>
        <td style="padding:4px 8px; border:1px solid #cbd5e1; text-align:center;">${idx < 5 ? 'Pre-Evento' : 'Post-Evento'}</td>
        <td style="padding:4px 8px; border:1px solid #cbd5e1;"><strong>${item.title}</strong></td>
        <td style="padding:4px 8px; border:1px solid #cbd5e1; text-align:center; font-weight:700;">${item.completed ? '✓ Verificado' : '☐ Por Revisar'}</td>
      </tr>
    `).join('');

    const printHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Hoja de Operaciones - ${fullDateStr}</title>
  <style>
    @page { size: letter portrait; margin: 12mm; }
    * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #fff; font-size: 12px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #a43073; padding-bottom: 10px; margin-bottom: 12px; }
    .title { font-size: 18px; font-weight: 800; color: #a43073; margin: 0; }
    .subtitle { font-size: 12px; color: #475569; margin: 2px 0 0 0; }
    .badge { padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; color: ${statusBadgeColor} }
    .section { margin-bottom: 12px; }
    .section-title { font-size: 13px; font-weight: 800; color: #1e293b; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.4px; }
    .info-bar { padding: 8px 12px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .signatures { display: flex; justify-content: space-between; gap: 30px; margin-top: 28px; padding-top: 10px; }
    .sig-box { flex: 1; text-align: center; border-top: 1px solid #64748b; padding-top: 6px; font-size: 11px; color: #334155; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">SALÓN DE EVENTOS INFANTILES BABY CARRUSEL</h1>
      <p class="subtitle">Hoja Oficial de Operaciones del Día • ${fullDateStr}</p>
    </div>
    <div class="badge">${statusBadgeText}</div>
  </div>

  <div class="info-bar">
    <div>
      <strong>Responsable en Turno:</strong> Jolie &amp; Javier García Ramos<br/>
      <span><strong>Propietario:</strong> Heriberto García • C. 5 de Mayo 1940, San Juan de Guadalupe, San Luis Potosí, S.L.P. • Tel: +52 444 540 2978</span>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">1. Detalle del Evento / Reservación de la Fecha</h2>
    ${eventHtml}
  </div>

  <div class="section">
    <h2 class="section-title">2. Equipo del Salón en Turno</h2>
    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Nombre</th>
          <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Puesto / Función</th>
          <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Contacto</th>
        </tr>
      </thead>
      <tbody>
        ${staffRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">3. Lista de Verificación de Instalaciones, Cocina y Seguridad</h2>
    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:5px 8px; border:1px solid #cbd5e1; width:16%;">Fase</th>
          <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Punto de Inspección</th>
          <th style="padding:5px 8px; border:1px solid #cbd5e1; width:18%;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${checklistRows}
      </tbody>
    </table>
  </div>

  <div class="signatures">
    <div class="sig-box">
      <strong>Jolie / Javier García Ramos</strong><br/>
      Administración y Entrega del Salón Baby Carrusel
    </div>
    <div class="sig-box">
      <strong>${dayRes ? (dayRes.cliente_nombre || 'Firma del Anfitrión') : 'Firma del Anfitrión'}</strong><br/>
      Conformidad de Recepción y Devolución de Depósito ($350.00)
    </div>
  </div>
</body>
</html>`;

    let iframe = document.getElementById('bc-print-iframe');
    if (iframe) iframe.remove();
    iframe = document.createElement('iframe');
    iframe.id = 'bc-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 150);
  }
  window.printDaySheet = printDaySheet;

  document.querySelectorAll('nav a[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');

      document.querySelectorAll('nav a[data-path]').forEach(l => {
        if (!l.classList.contains('hidden')) {
          l.className = 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors rounded-xl';
        }
      });
      link.className = 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary-container font-semibold rounded-xl';

      if (path === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path === 'availability-calendar') {
        openInteractiveCalendarModal();
      } else if (path === 'rules-and-policies') {
        openDepositPolicyModal();
      } else if (path === 'checklists') {
        const checkSection = document.getElementById('checklists-section');
        if (checkSection) {
          checkSection.scrollIntoView({ behavior: 'smooth' });
          checkSection.classList.add('ring-4', 'ring-primary-container');
          setTimeout(() => checkSection.classList.remove('ring-4', 'ring-primary-container'), 1500);
        }
      } else if (path === 'booking') {
        openBookingModal();
      }
    });
  });

  // Actualizar etiqueta del botón "Hoy" con el día real actual
  const btnTodayEl = document.getElementById('btn-go-today');
  if (btnTodayEl) {
    btnTodayEl.textContent = `Hoy (${TODAY_DAY} ${monthNames[TODAY_MONTH].slice(0, 3)})`;
  }

  // Inicializar interfaz inmediatamente y sincronizar con la base de datos en tiempo real
  rebuildNotificationsFromDB();
  applyRoleUI();
  renderChecklist();
  updateNotifBadge();
  loadDashboardFromDatabase();

  // Mantener sincronizado en tiempo real entre dispositivos cada 15 segundos y al enfocar la pestaña
  setInterval(loadDashboardFromDatabase, 15000);
  window.addEventListener('focus', loadDashboardFromDatabase);
});
