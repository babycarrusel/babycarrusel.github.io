/**
 * Baby Carrusel - Sistema de Reservaciones y Centro de Operaciones en Tiempo Real
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

  // Fecha actual real del sistema
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
    activeReservationId: 1,
    currentYear: TODAY_YEAR,
    currentMonthIndex: TODAY_MONTH,
    selectedDay: TODAY_DAY,
    popupYear: TODAY_YEAR,
    popupMonthIndex: TODAY_MONTH,
    popupSelectedDay: TODAY_DAY,
    viewMode: 'month', // 'month' | 'week' | 'day'
    aforo: {
      current: 62,
      max: 80,
      children: 38,
      adults: 24
    },
    deposit: {
      amount: 350.00,
      status: 'held',
      deduction: 0
    },
    activeChecklistTab: 'pre',
    checklists: {
      pre: [
        { id: 1, title: 'Seguridad Mecánica del Carrusel y Arneses', note: 'Inspeccionado y verificado por Elena R. a las 14:15 hrs', completed: true, estado: 'bueno' },
        { id: 2, title: 'Sanitización de Área Suave (Toddlers)', note: '100% desinfectado con vapor; ciclo UV en alberca de pelotas completado', completed: true, estado: 'bueno' },
        { id: 3, title: 'Mobiliario Infantil y Sillas Chiavari', note: '12 mesas infantiles / 60 sillas verificadas sin daños', completed: true, estado: 'bueno' },
        { id: 4, title: 'Sistema de Audio y Luces LED Ambientales', note: 'Prueba OK (volumen seguro limitado a 80dB para niños)', completed: true, estado: 'bueno' },
        { id: 5, title: 'Higiene de Sanitarios, Botiquín y Extintores', note: 'Sanitarios con cambiador desinfectados y salidas de emergencia libres', completed: true, estado: 'bueno' }
      ],
      post: [
        { id: 6, title: 'Revisión y Apagado Seguro del Carrusel', note: 'Verificar paro de emergencia y desconexión de energía', completed: false, estado: 'pendiente' },
        { id: 7, title: 'Inventario de Mobiliario y Juegos Suaves', note: 'Comprobar que no existan piezas dañadas o faltantes', completed: false, estado: 'pendiente' },
        { id: 8, title: 'Limpieza Básica y Desalojo de Salón', note: 'Mesas despejadas, retiro de regalos y pertenencias', completed: false, estado: 'pendiente' },
        { id: 9, title: 'Inspección de Brincolines y Redes de Protección', note: 'Verificar lonas y costuras sin rasgaduras por objetos', completed: false, estado: 'pendiente' },
        { id: 10, title: 'Entrega de Llaves y Retiro de Brazaletes', note: 'Firma de conformidad de salida con el anfitrión', completed: false, estado: 'pendiente' }
      ]
    },
    dbData: {
      reservaciones: [
        { id_reservacion: 1, id_cliente: 1, cliente_nombre: 'Camila y Roberto Peña', cliente_telefono: '+52 444 849 1034', fecha_evento: '2026-11-21', hora_inicio: '15:00:00', hora_fin: '19:00:00', tipo_evento: 'Cumpleaños #4 de Lucas • Carnaval de Carrusel y Safari Mágico', numero_invitados: 62, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 2, id_cliente: 2, cliente_nombre: 'Valeria Silva', cliente_telefono: '+52 444 219 4501', fecha_evento: '2026-11-21', hora_inicio: '09:30:00', hora_fin: '13:30:00', tipo_evento: 'Safari Mágico de Mía', numero_invitados: 45, estado: 'finalizada', deposito: 350, deposito_estado: 'devuelto' },
        { id_reservacion: 3, id_cliente: 3, cliente_nombre: 'Familia Morales', cliente_telefono: '+52 444 310 8821', fecha_evento: '2026-11-22', hora_inicio: '09:30:00', hora_fin: '13:30:00', tipo_evento: 'Fiesta de Cumpleaños Mateo', numero_invitados: 40, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 4, id_cliente: 4, cliente_nombre: 'Lucía Mendoza', cliente_telefono: '+52 444 509 7712', fecha_evento: '2026-11-22', hora_inicio: '15:00:00', hora_fin: '19:00:00', tipo_evento: 'Cumpleaños #5 de Valeria', numero_invitados: 55, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 5, id_cliente: 3, cliente_nombre: 'Familia Morales', cliente_telefono: '+52 444 310 8821', fecha_evento: '2026-11-22', hora_inicio: '20:00:00', hora_fin: '23:30:00', tipo_evento: 'Cumpleaños #2 de Leo • Dinosaurios', numero_invitados: 50, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 6, id_cliente: 5, cliente_nombre: 'Alejandro Cruz', cliente_telefono: '+52 444 618 9940', fecha_evento: '2026-11-24', hora_inicio: '09:30:00', hora_fin: '13:30:00', tipo_evento: 'Bautizo de Santiago', numero_invitados: 50, estado: 'pendiente', deposito: 350, deposito_estado: 'pendiente' },
        { id_reservacion: 7, id_cliente: 6, cliente_nombre: 'Mariana Garza', cliente_telefono: '+52 444 720 1138', fecha_evento: '2026-11-25', hora_inicio: '15:00:00', hora_fin: '19:00:00', tipo_evento: 'Baby Shower de Valentina', numero_invitados: 60, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 8, id_cliente: 7, cliente_nombre: 'Daniela Ríos', cliente_telefono: '+52 444 831 5560', fecha_evento: '2026-11-27', hora_inicio: '15:00:00', hora_fin: '19:00:00', tipo_evento: 'Cumpleaños #3 de Emma • Unicornios', numero_invitados: 65, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 9, id_cliente: 8, cliente_nombre: 'Karla Gómez', cliente_telefono: '+52 444 942 6671', fecha_evento: '2026-11-27', hora_inicio: '20:00:00', hora_fin: '23:30:00', tipo_evento: 'Pijamada VIP de Sofía', numero_invitados: 30, estado: 'pendiente', deposito: 350, deposito_estado: 'pendiente' },
        { id_reservacion: 10, id_cliente: 6, cliente_nombre: 'Mariana Garza', cliente_telefono: '+52 444 720 1138', fecha_evento: '2026-11-28', hora_inicio: '09:30:00', hora_fin: '13:30:00', tipo_evento: 'Cumpleaños #1 de Regina • Baby Splash', numero_invitados: 45, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' },
        { id_reservacion: 11, id_cliente: 7, cliente_nombre: 'Daniela Ríos', cliente_telefono: '+52 444 831 5560', fecha_evento: '2026-11-28', hora_inicio: '15:00:00', hora_fin: '19:00:00', tipo_evento: 'Fiesta Sorpresa de Emiliano #6', numero_invitados: 70, estado: 'confirmada', deposito: 350, deposito_estado: 'pagado' }
      ],
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
        { id_mobiliario: 1, nombre: 'Carrusel Mecánico Infantil (12 caballos)', cantidad: 1, estado: 'disponible', descripcion: 'Carrusel central motorizado con arneses de seguridad.' },
        { id_mobiliario: 2, nombre: 'Mesas Infantiles Chiavari', cantidad: 12, estado: 'disponible', descripcion: 'Mesas tamaño infantil para área de comedor.' },
        { id_mobiliario: 3, nombre: 'Sillas Infantiles Chiavari', cantidad: 60, estado: 'disponible', descripcion: 'Sillas ergonómicas infantiles de alta resistencia.' },
        { id_mobiliario: 4, nombre: 'Brincolines y Trampolines Acolchonados', cantidad: 2, estado: 'disponible', descripcion: 'Zona de salto con redes de protección perimetral.' },
        { id_mobiliario: 5, nombre: 'Túnel Oruga y Set de Estimulación Temprana', cantidad: 1, estado: 'disponible', descripcion: 'Área suave para bebés de 0 a 3 años.' },
        { id_mobiliario: 6, nombre: 'Alberca de Pelotas con Sistema Vapor/UV', cantidad: 1, estado: 'disponible', descripcion: 'Alberca infantil con ciclo de sanitización UV.' }
      ],
      reglamento: [
        { id_regla: 1, titulo: 'Garantía de Depósito Reembolsable ($350)', descripcion: 'El depósito en garantía ($350.00) protege las instalaciones y el mobiliario. Es 100% reembolsable dentro de las 24 horas posteriores al evento tras verificar que no existan daños ni retrasos mayores a 45 minutos en la entrega del salón.' },
        { id_regla: 2, titulo: 'Capacidad y Aforo Máximo (80 Personas)', descripcion: 'Por seguridad y normativa de Protección Civil, el cupo máximo permitido es de 80 asistentes en total (incluyendo niños y adultos acompañantes).' },
        { id_regla: 3, titulo: 'Uso Obligatorio de Calcetines Antideslizantes', descripcion: 'Todo niño y adulto que ingrese al área de brincolines, alberca de pelotas, túnel oruga o carrusel deberá portar calcetines antideslizantes por higiene y seguridad.' },
        { id_regla: 4, titulo: 'Alimentos y Bebidas Exclusivos en Área de Comedor', descripcion: 'Los alimentos, bebidas, pastel y dulces están permitidos únicamente en la zona de mesas y comedor. No se permite ingresar comida o líquidos a los juegos suaves.' },
        { id_regla: 5, titulo: 'Nivel de Sonido Seguro (80 dB) y Puntualidad de Turnos', descripcion: 'Por bienestar infantil el sonido ambiental no supera los 80 dB. Entre cada turno se reservan de 90 a 120 minutos exclusivos para limpieza profunda y desinfección.' }
      ]
    },
    notifications: [
      { id: 1, title: 'Aforo en Salón Principal', text: 'Se registraron 62 invitados para la fiesta de Lucas.', time: 'Hace 15 min', unread: true },
      { id: 2, title: 'Inspección Pre-Evento Lista', text: 'Elena R. completó el protocolo de seguridad del carrusel.', time: 'Hace 1 hora', unread: true },
      { id: 3, title: 'Depósito de Seguridad Recibido', text: '$350.00 en custodia para la reserva #BC-2026-104.', time: 'Hace 3 horas', unread: true },
      { id: 4, title: 'Recordatorio de Cierre', text: 'Inspección de salida programada para las 19:00 hrs.', time: 'Hace 4 horas', unread: false }
    ]
  };

  /* ==========================================================================
     VALIDACIÓN DE FECHAS PASADAS Y DÍAS LLENOS
     ========================================================================== */
  function isPastDate(year, monthIdx, day) {
    if (year < TODAY_YEAR) return true;
    if (year > TODAY_YEAR) return false;
    if (monthIdx < TODAY_MONTH) return true;
    if (monthIdx > TODAY_MONTH) return false;
    return day < TODAY_DAY;
  }

  function isDayFullyBooked(dayInfo) {
    if (!dayInfo || dayInfo.isMaintenance) return false;
    const openCount = dayInfo.slots.filter(s => s.status === 'open').length;
    return openCount === 0;
  }

  /* ==========================================================================
     COMUNICACIÓN CON EL SERVIDOR
     ========================================================================== */
  async function apiFetch(path, options = {}) {
    if (!activeApiBase) {
      for (const candidate of API_CANDIDATES) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3000);
          const res = await fetch(`${candidate}/health`, { signal: ctrl.signal });
          clearTimeout(timer);
          if (res.ok) {
            activeApiBase = candidate;
            break;
          }
        } catch (_) {
          // Probar siguiente candidato
        }
      }
    }

    if (!activeApiBase) return null;

    try {
      const res = await fetch(`${activeApiBase}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Aviso de red:', err);
      return null;
    }
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
      if (heroBadgeParty) heroBadgeParty.textContent = '✨ Fiestas & Celebraciones';
      if (heroSubtitle) heroSubtitle.textContent = 'Consulta fechas disponibles, conoce nuestras instalaciones y reserva el día ideal para la fiesta de tus pequeños.';
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
     LÓGICA DE TURNOS POR FECHA
     ========================================================================== */
  function getSlotsForDate(year, monthIdx, day) {
    const isoDate = formatIsoDate(year, monthIdx, day);

    const dayRes = state.dbData.reservaciones.filter(
      r => r.fecha_evento === isoDate && r.estado !== 'cancelada'
    );

    const standardShifts = [
      { key: 'mañana', label: 'Horario Mañana Disponible', shortLabel: '09:30 Mañana', defaultTime: '09:30 - 13:30', matchHour: h => h < 14 },
      { key: 'tarde', label: 'Horario Tarde Disponible', shortLabel: '15:00 Tarde', defaultTime: '15:00 - 19:00', matchHour: h => h >= 14 && h < 19 },
      { key: 'noche', label: 'Horario Noche Disponible', shortLabel: '20:00 Noche', defaultTime: '20:00 - 23:30', matchHour: h => h >= 19 }
    ];

    const usedIds = new Set();
    const isTodayDate = year === TODAY_YEAR && monthIdx === TODAY_MONTH && day === TODAY_DAY;

    const slots = standardShifts.map(shift => {
      const found = dayRes.find(r => {
        if (usedIds.has(r.id_reservacion)) return false;
        const hour = parseInt((r.hora_inicio || '15:00').split(':')[0], 10);
        return shift.matchHour(hour);
      });

      if (found) {
        usedIds.add(found.id_reservacion);
        const hIni = (found.hora_inicio || '15:00').slice(0, 5);
        const hFin = (found.hora_fin || '19:00').slice(0, 5);

        let uiStatus = 'confirmed';
        let uiLabel = 'Confirmado';

        if ((isTodayDate && shift.key === 'tarde' && found.estado === 'confirmada') || (found.id_reservacion === state.activeReservationId && isTodayDate)) {
          uiStatus = 'active';
          uiLabel = 'En Curso (Activo)';
        } else if (found.estado === 'finalizada') {
          uiStatus = 'completed';
          uiLabel = 'Completado';
        } else if (found.estado === 'pendiente') {
          uiStatus = 'hold';
          uiLabel = 'Apartado (En Confirmación)';
        }

        return {
          id_reservacion: found.id_reservacion,
          slotKey: shift.key,
          shortTime: hIni,
          time: `${hIni} - ${hFin}`,
          title: found.tipo_evento || 'Celebración Infantil',
          host: found.cliente_nombre || 'Cliente Registrado',
          phone: found.cliente_telefono || '+52 444 540 2978',
          status: uiStatus,
          statusLabel: uiLabel,
          guests: `${found.numero_invitados}/80`,
          numero_invitados: found.numero_invitados,
          deposito: found.deposito,
          deposito_estado: found.deposito_estado,
          estado_db: found.estado
        };
      }

      return {
        slotKey: shift.key,
        shortTime: shift.defaultTime.split(' - ')[0],
        time: shift.defaultTime,
        title: shift.label,
        host: '-',
        status: 'open',
        statusLabel: 'Disponible',
        guests: '0/80'
      };
    });

    return {
      isMaintenance: false,
      slots
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

  function renderDayCellBadges(dayInfo, past, full) {
    if (past) {
      return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/70 text-slate-500 truncate">No disponible</span>`;
    }

    if (full) {
      return `
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white truncate shadow-2xs">🔴 Todo Reservado</span>
        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-200/80 text-rose-900 truncate">Sin Cupo (3/3)</span>
      `;
    }

    if (!state.isOwner) {
      const openCount = dayInfo.slots.filter(s => s.status === 'open').length;
      if (openCount === 3) {
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 truncate">3 Turnos Libres</span>`;
      } else if (openCount === 2) {
        return `
          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 truncate">2 Turnos Libres</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-800 truncate">1 Ocupado</span>
        `;
      } else {
        return `
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 truncate">¡Último Turno!</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-800 truncate">2 Reservados</span>
        `;
      }
    }

    // Vista detallada para DUEÑO / ADMINISTRACIÓN
    return dayInfo.slots.map(s => {
      if (s.status === 'active') {
        const shortTitle = s.title.split('•')[0].replace('Cumpleaños #4 de ', '').replace('Cumpleaños ', '').trim();
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white truncate shadow-xs">${s.shortTime} ${shortTitle} ★</span>`;
      } else if (s.status === 'completed' || s.status === 'confirmed') {
        const shortTitle = s.title.split('•')[0].replace('Cumpleaños ', '').replace('Fiesta de ', '').trim();
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 truncate">${s.shortTime} ${shortTitle} ✓</span>`;
      } else if (s.status === 'hold') {
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 truncate">${s.shortTime} Apartado</span>`;
      } else {
        return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 truncate">${s.shortTime} Disp.</span>`;
      }
    }).join('');
  }

  function renderMonthView(container) {
    const year = state.currentYear;
    const month = state.currentMonthIndex;
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Celdas de relleno del mes anterior (siempre opacas/bloqueadas si son pasadas)
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const prevDay = prevMonthDays - i;
      cells.push(`
        <div class="min-h-[86px] p-2 rounded-xl bg-slate-100/40 opacity-30 flex flex-col justify-between cursor-not-allowed select-none">
          <span class="font-label-sm text-xs text-slate-400">${prevDay}</span>
          <span class="text-[9px] text-slate-400">${monthNames[(month + 11) % 12].slice(0, 3)}</span>
        </div>
      `);
    }

    // Días reales del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === TODAY_YEAR && month === TODAY_MONTH && day === TODAY_DAY;
      const isSelected = day === state.selectedDay;
      const past = isPastDate(year, month, day);
      const dayInfo = getSlotsForDate(year, month, day);
      const full = !past && isDayFullyBooked(dayInfo);

      if (past) {
        // Día pasado: opaco y SIN permitir clic
        cells.push(`
          <div title="Fecha pasada no disponible" class="min-h-[92px] p-2 rounded-xl bg-slate-100/80 border border-slate-200/60 opacity-40 flex flex-col justify-between cursor-not-allowed select-none">
            <span class="font-label-sm text-xs text-slate-400 font-semibold line-through">${day}</span>
            <div class="flex flex-col gap-1 mt-1">
              ${renderDayCellBadges(dayInfo, true, false)}
            </div>
          </div>
        `);
        continue;
      }

      if (full) {
        // Día con los 3 turnos ocupados: En ROJO y opaco; al dar clic avisa que ya está todo reservado
        const ringClass = isSelected ? 'ring-2 ring-rose-600' : '';
        cells.push(`
          <div onclick="handleCalendarDayClick(${year}, ${month}, ${day})" data-day="${day}" class="min-h-[92px] p-2 rounded-xl bg-rose-100/80 border-2 border-rose-300 text-rose-900 opacity-85 ${ringClass} flex flex-col justify-between relative cursor-pointer hover:bg-rose-200/70 transition-all">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-xs font-bold text-rose-800">${day}${isToday ? ' HOY' : ''}</span>
              <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            </div>
            <div class="flex flex-col gap-1 mt-1">
              ${renderDayCellBadges(dayInfo, false, true)}
            </div>
          </div>
        `);
        continue;
      }

      // Día disponible (Hoy o futuro con turnos libres)
      const cellClasses = isSelected
        ? 'min-h-[92px] p-2 rounded-xl bg-primary-fixed/25 ring-2 ring-primary shadow-sm flex flex-col justify-between relative cursor-pointer transition-all'
        : isToday
        ? 'min-h-[92px] p-2 rounded-xl bg-primary-fixed/15 ring-1 ring-primary/50 flex flex-col justify-between relative cursor-pointer hover:bg-primary-fixed/25 transition-all'
        : 'min-h-[92px] p-2 rounded-xl bg-surface-container-low/50 border border-emerald-200/50 flex flex-col justify-between cursor-pointer hover:bg-emerald-50/40 transition-colors';

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
            ${renderDayCellBadges(dayInfo, false, false)}
          </div>
        </div>
      `);
    }

    // Celdas del mes siguiente
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

      if (past) {
        cards.push(`
          <div class="min-h-[175px] p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 opacity-40 flex flex-col justify-between cursor-not-allowed select-none">
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

      const shiftsHtml = dayInfo.slots.map(s => {
        const badgeColor =
          full
            ? 'bg-rose-200/80 text-rose-900 font-bold'
            : s.status === 'active'
            ? 'bg-primary text-white font-bold'
            : s.status === 'confirmed' || s.status === 'completed'
            ? 'bg-blue-100 text-blue-800 font-semibold'
            : s.status === 'hold'
            ? 'bg-amber-100 text-amber-800 font-semibold'
            : 'bg-emerald-100 text-emerald-800 font-semibold';

        const labelText = state.isOwner
          ? (s.status === 'open' ? `${s.shortTime} Disponible` : `${s.shortTime} ${s.title.split('•')[0]}`)
          : (s.status === 'open' ? `${s.shortTime} Libre` : `${s.shortTime} ${s.status === 'hold' ? 'Apartado' : 'Ocupado'}`);

        return `
          <div class="p-1.5 rounded-lg ${badgeColor} text-[10px] flex flex-col gap-0.5 truncate">
            <span class="truncate">${labelText}</span>
          </div>
        `;
      }).join('');

      const cardStyle = full
        ? 'bg-rose-100/80 border-2 border-rose-300 opacity-85'
        : isSelected
        ? 'bg-primary-fixed/25 ring-2 ring-primary shadow-sm'
        : 'bg-surface-container-low/50 hover:bg-surface-container-low';

      cards.push(`
        <div onclick="handleCalendarDayClick(${y}, ${m}, ${dayNum})" class="min-h-[175px] p-2.5 rounded-xl ${cardStyle} flex flex-col justify-between cursor-pointer transition-all">
          <div class="flex items-center justify-between border-b border-surface-container pb-1.5 mb-1.5">
            <span class="text-xs font-bold ${full ? 'text-rose-800' : isSelected || isToday ? 'text-primary' : 'text-on-surface'}">${dayNamesShort[i]} ${dayNum}</span>
            ${isToday ? '<span class="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold">HOY</span>' : full ? '<span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">LLENO</span>' : ''}
          </div>
          <div class="flex flex-col gap-1.5 flex-1 justify-center">
            ${shiftsHtml}
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
    const [sMorning, sAfternoon, sNight] = dayInfo.slots;

    const buildTimelineRow = (slot, shiftTitle) => {
      const isFree = slot.status === 'open';
      const bgClass = isFree
        ? 'bg-emerald-50/70 border-emerald-200'
        : slot.status === 'active'
        ? 'bg-primary-fixed/25 border-primary'
        : slot.status === 'hold'
        ? 'bg-amber-50/70 border-amber-200'
        : 'bg-rose-50/70 border-rose-200';

      const displayTitle = state.isOwner
        ? slot.title
        : isFree
        ? shiftTitle + ' Disponible'
        : slot.status === 'hold'
        ? 'Horario Apartado (En Confirmación)'
        : 'Horario Reservado (Ocupado)';

      const displaySub = state.isOwner
        ? (isFree ? 'Salón listo para nueva reservación' : `Anfitrión: ${slot.host} • Aforo: ${slot.guests} Invitados`)
        : (isFree ? 'Disponible para paquete Fiesta Carrusel Mágico (hasta 80 invitados)' : 'Este turno ya se encuentra reservado');

      const actionBtn = isFree
        ? `<button onclick="openBookingModal('${slot.slotKey}', '${isoDate}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">Reservar Turno</button>`
        : state.isOwner
        ? `<button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-105">Gestionar</button>`
        : `<span class="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">Ocupado</span>`;

      return `
        <div class="p-3.5 rounded-xl border ${bgClass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest font-bold text-xs text-on-surface shadow-2xs whitespace-nowrap">${slot.time}</span>
            <div class="flex flex-col">
              <span class="font-bold text-sm text-on-surface">${displayTitle}</span>
              <span class="text-xs text-on-surface-variant">${displaySub}</span>
            </div>
          </div>
          ${actionBtn}
        </div>
      `;
    };

    container.innerHTML = `
      <div class="p-2.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between text-xs text-on-surface-variant">
        <span class="font-semibold">08:30 - 09:30 hrs • Apertura, Sanitización con Vapor e Inspección Previa</span>
        <span class="text-emerald-700 font-bold">Protocolo Diario ✓</span>
      </div>
      ${buildTimelineRow(sMorning, 'Turno Mañana')}
      <div class="p-2.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between text-xs text-on-surface-variant">
        <span class="font-semibold">13:30 - 15:00 hrs • Bloqueo de Limpieza Profunda, Desinfección y Revisión de Mobiliario</span>
        <span class="text-secondary font-bold">90 min Preparación</span>
      </div>
      ${buildTimelineRow(sAfternoon, 'Turno Tarde')}
      <div class="p-2.5 rounded-xl bg-surface-container-low/60 flex items-center justify-between text-xs text-on-surface-variant">
        <span class="font-semibold">19:00 - 20:00 hrs • Inspección de Entrega y Preparación Nocturna</span>
        <span class="text-secondary font-bold">60 min Preparación</span>
      </div>
      ${buildTimelineRow(sNight, 'Turno Noche')}
    `;
  }

  /* ==========================================================================
     MANEJO DE CLIC EN DÍAS (BLOQUEO DE PASADOS + ALERTA EN DÍAS LLENOS)
     ========================================================================== */
  function handleCalendarDayClick(year, monthIdx, day) {
    if (isPastDate(year, monthIdx, day)) {
      // No permite seleccionar días antes de hoy
      return;
    }

    state.currentYear = year;
    state.currentMonthIndex = monthIdx;
    state.selectedDay = day;

    const dayInfo = getSlotsForDate(year, monthIdx, day);
    const full = isDayFullyBooked(dayInfo);

    renderCalendar();
    renderDailySessions();

    if (full) {
      showToast(
        `⚠️ Ya está todo reservado para el ${day} de ${monthNames[monthIdx]} (los 3 turnos están ocupados). Por favor elige otra fecha.`,
        'error'
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

    // No permitir retroceder a meses anteriores al mes actual
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

    // Sincronizar también el calendario principal de atrás
    state.currentYear = year;
    state.currentMonthIndex = monthIdx;
    state.selectedDay = day;

    const dayInfo = getSlotsForDate(year, monthIdx, day);
    if (isDayFullyBooked(dayInfo)) {
      showToast(`⚠️ Ya está todo reservado para el ${day} de ${monthNames[monthIdx]}.`, 'error');
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
      todayText.textContent = `Hoy es ${todayWeekday} ${TODAY_DAY} de ${monthNames[TODAY_MONTH]} ${TODAY_YEAR} • Selecciona un día a partir de hoy`;
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
      const openCount = dayInfo.slots.filter(s => s.status === 'open').length;

      if (past) {
        // Día antes de hoy: Opaco y bloqueado (sin onclick)
        cells.push(`
          <div class="h-16 p-1.5 rounded-xl bg-slate-100 border border-slate-200/70 opacity-35 flex flex-col items-center justify-center cursor-not-allowed select-none">
            <span class="text-xs font-bold text-slate-400 line-through">${day}</span>
            <span class="text-[9px] text-slate-400">Pasado</span>
          </div>
        `);
      } else if (full) {
        // Día lleno (3/3 ocupados): En ROJO y opaco; al dar clic avisa que ya está todo reservado
        cells.push(`
          <div onclick="selectPopupDay(${year}, ${month}, ${day})" class="h-16 p-1.5 rounded-xl bg-rose-100/90 border-2 ${isSelected ? 'border-rose-700 ring-2 ring-rose-500' : 'border-rose-300'} opacity-85 flex flex-col items-center justify-between cursor-pointer hover:bg-rose-200/80 transition-all">
            <div class="flex items-center gap-1">
              <span class="text-xs font-extrabold text-rose-900">${day}</span>
              ${isToday ? '<span class="px-1 rounded bg-rose-700 text-white text-[8px] font-bold">HOY</span>' : ''}
            </div>
            <span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold truncate max-w-full">🔴 Lleno</span>
          </div>
        `);
      } else {
        // Día disponible
        const badgeClass =
          openCount === 3
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-900';

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
            <span class="px-1.5 py-0.5 rounded-full ${badgeClass} text-[9px] font-bold truncate max-w-full">
              ${openCount} ${openCount === 1 ? 'Libre' : 'Libres'}
            </span>
          </div>
        `);
      }
    }

    grid.innerHTML = cells.join('');

    // Renderizar el detalle inferior del día seleccionado en el modal
    if (!detailBox) return;
    const selDay = state.popupSelectedDay;
    const selDateObj = new Date(year, month, selDay);
    const selWeekday = dayNamesFull[selDateObj.getDay()];
    const selIso = formatIsoDate(year, month, selDay);
    const selInfo = getSlotsForDate(year, month, selDay);
    const selFull = isDayFullyBooked(selInfo);

    if (selFull) {
      detailBox.className = 'mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex flex-col gap-2 text-center';
      detailBox.innerHTML = `
        <div class="flex items-center justify-center gap-2 text-rose-800 font-bold text-sm">
          <span class="material-symbols-outlined text-xl text-rose-600">block</span>
          <span>¡Ya está todo reservado para el ${selWeekday} ${selDay} de ${monthNames[month]} ${year}!</span>
        </div>
        <p class="text-xs text-rose-700">
          Los 3 horarios del salón (Mañana, Tarde y Noche) ya se encuentran ocupados en esta fecha. Por favor selecciona otro día en verde o amarillo en el calendario.
        </p>
      `;
    } else {
      detailBox.className = 'mt-4 p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5';
      const slotsButtons = selInfo.slots.map(s => {
        const shiftName = s.slotKey === 'mañana' ? '☀️ Turno Mañana' : s.slotKey === 'tarde' ? '🎈 Turno Tarde' : '🌙 Turno Noche';
        if (s.status === 'open') {
          return `
            <div class="p-2.5 rounded-xl bg-surface-container-lowest border border-emerald-200 flex items-center justify-between gap-2">
              <div>
                <span class="font-bold text-xs text-on-surface block">${shiftName}</span>
                <span class="text-[11px] text-emerald-700 font-semibold">${s.time} • Disponible</span>
              </div>
              <button onclick="chooseSlotFromPopup('${s.slotKey}', '${selIso}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
                Elegir Turno
              </button>
            </div>
          `;
        } else {
          return `
            <div class="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 opacity-75 flex items-center justify-between gap-2">
              <div>
                <span class="font-bold text-xs text-rose-900 block line-through">${shiftName}</span>
                <span class="text-[11px] text-rose-700 font-semibold">${s.time} • Ya Reservado</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900 text-[10px] font-bold">Sin Cupo</span>
            </div>
          `;
        }
      }).join('');

      detailBox.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-on-surface">Horarios para el ${selWeekday} ${selDay} de ${monthNames[month]} ${year}:</span>
          <span class="text-[11px] text-emerald-700 font-semibold">Selecciona un turno libre</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          ${slotsButtons}
        </div>
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
      dateTitle.textContent = `${state.isOwner ? 'Sesiones' : 'Horarios'} del ${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    }

    const dayInfo = getSlotsForDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    const full = isDayFullyBooked(dayInfo);

    if (dateSub) {
      dateSub.textContent = full
        ? '⚠️ Todos los turnos de este día ya se encuentran reservados'
        : state.isOwner
        ? 'Turnos programados, estado de entrega y anfitriones responsables'
        : 'Consulta qué turnos están libres y reserva tu horario en línea';
    }

    const sessionsContainer = document.getElementById('daily-sessions-container');
    if (!sessionsContainer) return;

    const fullBannerHtml = full
      ? `<div class="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
           <span class="material-symbols-outlined text-lg text-rose-600">error</span>
           <span>Ya está todo reservado para este día. Los 3 turnos (Mañana, Tarde y Noche) están ocupados; selecciona otra fecha en el calendario.</span>
         </div>`
      : '';

    const cardsHtml = dayInfo.slots.map(slot => {
      // 1. Turno Libre (Verde)
      if (slot.status === 'open') {
        const sKey = slot.slotKey || 'noche';
        const shiftLabel = sKey === 'mañana' ? 'Mañana' : sKey === 'tarde' ? 'Tarde' : 'Noche';
        return `
          <div class="p-space-md rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">${shiftLabel}</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-emerald-950 font-semibold">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-900">Disponible</span>
                </div>
                <span class="text-xs text-emerald-800/80">Salón completo, carrusel mecánico, brincolines y comedor infantil (Cupo máx. 80 personas)</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <button onclick="openBookingModal('${sKey}', '${isoDate}')" class="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1" type="button">
                <span class="material-symbols-outlined text-sm">add_circle</span>
                <span>Reservar Horario</span>
              </button>
            </div>
          </div>
        `;
      }

      // 2. VISTA CLIENTE: Ocultar nombres privados en turnos ocupados
      if (!state.isOwner) {
        const shiftLabel = slot.slotKey === 'mañana' ? 'Mañana' : slot.slotKey === 'tarde' ? 'Tarde' : 'Noche';
        return `
          <div class="p-space-md rounded-xl bg-rose-50/60 border border-rose-200 opacity-85 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">${shiftLabel}</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-rose-950 font-semibold">Horario Reservado</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">Ocupado</span>
                </div>
                <span class="text-xs text-rose-800/80">Este turno ya fue reservado y no se encuentra disponible.</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <span class="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">Sin Cupo</span>
            </div>
          </div>
        `;
      }

      // 3. VISTA DUEÑO / ADMINISTRACIÓN
      if (slot.status === 'completed') {
        return `
          <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Finalizado</span>
                <span class="font-label-sm text-[11px] text-on-surface font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-on-surface">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">${slot.statusLabel}</span>
                </div>
                <span class="text-xs text-on-surface-variant">Anfitrión: ${slot.host} • ${slot.guests} Invitados • Depósito $350 Reembolsado</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Depósito Liberado</span>
              </span>
              <button onclick="selectReservationFromSlot(${slot.id_reservacion})" title="Gestionar Evento" class="p-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-variant transition-colors" type="button">
                <span class="material-symbols-outlined text-sm">tune</span>
              </button>
            </div>
          </div>
        `;
      } else if (slot.status === 'active' || slot.status === 'confirmed') {
        const isCurrentActive = slot.status === 'active';
        return `
          <div class="p-space-md rounded-xl ${isCurrentActive ? 'bg-primary-fixed/20' : 'bg-blue-50/60 border border-blue-100'} shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 ${isCurrentActive ? 'bg-primary' : 'bg-blue-600'}"></div>
            <div class="flex items-start gap-space-md pl-1">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg ${isCurrentActive ? 'bg-primary text-white' : 'bg-blue-600 text-white'} text-center shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider">${isCurrentActive ? 'Activo' : 'Confirmado'}</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${slot.title}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isCurrentActive ? 'bg-primary text-white' : 'bg-blue-100 text-blue-800'} flex items-center gap-1">
                    ${isCurrentActive ? '<span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>En Progreso Ahora' : 'Confirmado ✓'}
                  </span>
                </div>
                <span id="${isCurrentActive ? 'slot-host-info' : ''}" class="text-xs text-on-surface-variant mt-0.5">Anfitrión: ${slot.host} • ${slot.guests} Invitados Máx • Gran Salón + Carrusel Activo</span>
              </div>
            </div>
            <div class="flex items-center gap-space-xs self-end md:self-center">
              <div class="text-right mr-2 hidden sm:block">
                <span class="text-[11px] font-semibold text-on-surface-variant block">Depósito en Garantía</span>
                <span class="text-xs font-bold text-on-surface">$350.00 en Custodia</span>
              </div>
              <button onclick="selectReservationFromSlot(${slot.id_reservacion || 1})" class="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:brightness-105 flex items-center gap-1 transition-all" type="button">
                <span class="material-symbols-outlined text-sm">tune</span>
                <span>Gestionar</span>
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="p-space-md rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Apartado</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-amber-950 font-semibold">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900">Pendiente de Pago</span>
                </div>
                <span class="text-xs text-amber-800/80">Cliente: ${slot.host} (${slot.phone || ''}) • ${slot.guests} Invitados</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <button onclick="quickConfirmReservation(${slot.id_reservacion})" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs">
                Confirmar Pago
              </button>
              <button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs">
                Gestionar
              </button>
            </div>
          </div>
        `;
      }
    }).join('');

    sessionsContainer.innerHTML = fullBannerHtml + cardsHtml;
    renderDaySheetModal();
  }

  /* ==========================================================================
     SINCRONIZACIÓN DE FICHA DESTACADA (MODO DUEÑO)
     ========================================================================== */
  function syncSpotlightReservation(resObj) {
    if (!resObj) return;
    state.activeReservationId = resObj.id_reservacion;

    const totalGuests = parseInt(resObj.numero_invitados || 62, 10);
    const childrenCount = Math.round(totalGuests * 0.61);
    const adultsCount = totalGuests - childrenCount;
    state.aforo.current = totalGuests;
    state.aforo.children = childrenCount;
    state.aforo.adults = adultsCount;

    state.deposit.amount = parseFloat(resObj.deposito || 350.0);
    if (resObj.deposito_estado === 'devuelto') {
      state.deposit.status = 'released';
    } else if (resObj.deposito_estado === 'retenido') {
      state.deposit.status = 'deducted';
    } else {
      state.deposit.status = 'held';
    }

    const parts = (resObj.tipo_evento || 'Cumpleaños #4 de Lucas • Carnaval de Carrusel y Safari Mágico').split('•');
    const mainTitle = parts[0].trim();
    const themeText = parts[1] ? `Temática: ${parts[1].trim()}` : 'Temática: Carnaval de Carrusel y Safari Mágico';

    const codeEl = document.getElementById('spotlight-code');
    const titleEl = document.getElementById('spotlight-title');
    const themeEl = document.getElementById('spotlight-theme');
    const initialsEl = document.getElementById('spotlight-host-initials');
    const hostNameEl = document.getElementById('spotlight-host-name');
    const hostPhoneEl = document.getElementById('spotlight-host-phone');

    if (codeEl) codeEl.textContent = `#BC-2026-${103 + resObj.id_reservacion}`;
    if (titleEl) titleEl.textContent = mainTitle;
    if (themeEl) themeEl.textContent = themeText;

    const hostName = resObj.cliente_nombre || 'Camila & Roberto Peña';
    const initials = hostName
      .split(' ')
      .filter(w => w.length > 2 && w.toLowerCase() !== 'del')
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'BC';

    if (initialsEl) initialsEl.textContent = initials;
    if (hostNameEl) hostNameEl.textContent = hostName;
    if (hostPhoneEl) hostPhoneEl.textContent = `${resObj.cliente_telefono || '+52 444 849 1034'} • Salón Principal`;

    const cInit = document.getElementById('contact-host-initials');
    const cName = document.getElementById('contact-host-name');
    const cEvent = document.getElementById('contact-host-event');
    const cWa = document.getElementById('contact-wa-link');
    const cTel = document.getElementById('contact-tel-link');
    const cTelText = document.getElementById('contact-tel-text');
    const cleanPhone = (resObj.cliente_telefono || '+524448491034').replace(/[^0-9]/g, '');

    if (cInit) cInit.textContent = initials;
    if (cName) cName.textContent = hostName;
    if (cEvent) cEvent.textContent = `${mainTitle} (${resObj.fecha_evento})`;
    if (cWa) {
      const msg = encodeURIComponent(
        `Hola ${hostName}, te saludamos del Salón Baby Carrusel (C. 5 de Mayo 1940, San Luis Potosí). Confirmamos tu evento "${mainTitle}" con cupo máximo de 80 invitados y depósito en garantía reembolsable de $350.00.`
      );
      cWa.href = `https://wa.me/${cleanPhone}?text=${msg}`;
    }
    if (cTel) cTel.href = `tel:+${cleanPhone}`;
    if (cTelText) cTelText.textContent = `Llamar al Móvil (${resObj.cliente_telefono || '+52 444 849 1034'})`;

    const mTitle = document.getElementById('manage-slot-title');
    const mSub = document.getElementById('manage-slot-subtitle');
    if (mTitle) mTitle.textContent = `${mainTitle} (#BC-2026-${103 + resObj.id_reservacion})`;
    if (mSub) mSub.textContent = `Turno ${(resObj.hora_inicio || '15:00').slice(0, 5)} a ${(resObj.hora_fin || '19:00').slice(0, 5)} hrs • Anfitrión: ${hostName}`;

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

  function renderAforoUI() {
    const percentage = Math.round((state.aforo.current / state.aforo.max) * 100);
    const available = state.aforo.max - state.aforo.current;

    const aforoText = document.getElementById('spotlight-aforo-text');
    const aforoBar = document.getElementById('spotlight-aforo-bar');
    const aforoDetail = document.getElementById('spotlight-aforo-detail');
    if (aforoText) aforoText.textContent = `${state.aforo.current} / ${state.aforo.max} Máx (${percentage}%)`;
    if (aforoBar) {
      aforoBar.style.width = `${percentage}%`;
      if (percentage >= 90) {
        aforoBar.className = 'bg-rose-500 h-2.5 rounded-full transition-all duration-300';
      } else if (percentage >= 75) {
        aforoBar.className = 'bg-primary h-2.5 rounded-full transition-all duration-300';
      } else {
        aforoBar.className = 'bg-emerald-500 h-2.5 rounded-full transition-all duration-300';
      }
    }
    if (aforoDetail) {
      aforoDetail.innerHTML = `<span>${state.aforo.children} Niños (Ingresados)</span><span>${state.aforo.adults} Adultos (Acompañantes)</span>`;
    }

    const kpiAforo = document.getElementById('kpi-aforo-count');
    const kpiAforoAvail = document.getElementById('kpi-aforo-avail');
    if (kpiAforo) kpiAforo.textContent = `${state.aforo.current} / ${state.aforo.max} Invitados`;
    if (kpiAforoAvail) kpiAforoAvail.textContent = `${available} Lugares Disponibles`;
  }

  function renderDepositUI(resObj) {
    const depositStatus = document.getElementById('spotlight-deposit-status');
    const releaseBtn = document.getElementById('btn-release-deposit');

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

  async function loadDashboardFromDatabase() {
    const data = await apiFetch('/dashboard');
    if (data && data.status === 'ok') {
      if (data.reservaciones && data.reservaciones.length > 0) {
        state.dbData.reservaciones = data.reservaciones;
      }
      if (data.clientes) state.dbData.clientes = data.clientes;
      if (data.empleados && data.empleados.length > 0) state.dbData.empleados = data.empleados;
      if (data.mobiliario && data.mobiliario.length > 0) state.dbData.mobiliario = data.mobiliario;
      if (data.reglamento && data.reglamento.length > 0) state.dbData.reglamento = data.reglamento;
    }

    const activeRes =
      state.dbData.reservaciones.find(r => r.id_reservacion === state.activeReservationId) ||
      state.dbData.reservaciones[0];
    if (activeRes) {
      syncSpotlightReservation(activeRes);
    }

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
    const subEl = document.getElementById('day-sheet-date-subtitle');
    if (subEl) {
      subEl.textContent = `${weekdayName} ${state.selectedDay} de ${monthNames[state.currentMonthIndex]} ${state.currentYear} • Salón Baby Carrusel`;
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
    const dayInfo = getSlotsForDate(state.currentYear, state.currentMonthIndex, state.selectedDay);
    if (turnosContainer && dayInfo && dayInfo.slots) {
      turnosContainer.innerHTML = dayInfo.slots.map((s, idx) => `
        <div class="p-2 rounded ${s.status === 'active' ? 'bg-primary-fixed/30 border border-primary/30' : 'bg-surface-container-low'} flex justify-between items-center">
          <div>
            <strong>Turno ${idx + 1} (${s.time}):</strong> ${s.title} ${s.host !== '-' ? `• ${s.host} • ${s.guests} Invitados` : ''}
          </div>
          <span class="${s.status === 'active' ? 'text-primary' : s.status === 'completed' ? 'text-emerald-700' : 'text-blue-700'} font-bold">${s.statusLabel}</span>
        </div>
      `).join('');
    }
  }

  async function quickConfirmReservation(idReservacion) {
    const resObj = state.dbData.reservaciones.find(r => r.id_reservacion === idReservacion);
    if (resObj) {
      resObj.estado = 'confirmada';
      resObj.deposito_estado = 'pagado';
    }
    await apiFetch(`/reservaciones/${idReservacion}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'confirmada', deposito_estado: 'pagado' })
    });
    await loadDashboardFromDatabase();
    showToast('Reservación y depósito confirmados.', 'success');
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
      showToast(`Capacidad máxima del salón alcanzada (${state.aforo.max} personas).`, 'warning');
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
     FORMULARIO DE NUEVA RESERVACIÓN EN TIEMPO REAL
     ========================================================================== */
  function openBookingModal(slot = '', dateStr = '') {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      dateInput.min = TODAY_ISO;
      let targetIso = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        ? dateStr
        : formatIsoDate(state.currentYear, state.currentMonthIndex, state.selectedDay);

      const [yS, mS, dS] = targetIso.split('-').map(Number);
      if (isPastDate(yS, mS - 1, dS)) {
        targetIso = TODAY_ISO;
      }

      // Verificar si la fecha elegida ya está llena (3/3)
      const [yCheck, mCheck, dCheck] = targetIso.split('-').map(Number);
      const checkInfo = getSlotsForDate(yCheck, mCheck - 1, dCheck);
      if (isDayFullyBooked(checkInfo)) {
        showToast(`⚠️ Ya está todo reservado para el ${dCheck} de ${monthNames[mCheck - 1]}. Elige otro día en el calendario.`, 'error');
      }

      dateInput.value = targetIso;

      // Si no se especificó turno, seleccionar automáticamente el primer turno libre de ese día
      const slotSelect = document.getElementById('booking-slot');
      if (slotSelect) {
        if (slot) {
          slotSelect.value = slot;
        } else {
          const firstOpen = checkInfo.slots.find(s => s.status === 'open');
          if (firstOpen && firstOpen.slotKey) {
            slotSelect.value = firstOpen.slotKey;
          }
        }
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
    const guests = parseInt(document.getElementById('booking-guests')?.value || '50', 10);
    const date = document.getElementById('booking-date')?.value || TODAY_ISO;
    const slot = document.getElementById('booking-slot')?.value || 'tarde';
    const theme = document.getElementById('booking-theme')?.value?.trim() || 'Carnaval de Carrusel';

    if (guests > 80) {
      showToast('El cupo máximo permitido en el salón es de 80 personas.', 'warning');
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
      showToast(`⚠️ Ya está todo reservado para el ${dNum} de ${monthNames[mIdx]}. Por favor selecciona otro día.`, 'error');
      return;
    }

    const matchingSlot = existingInfo.slots.find(s => s.slotKey === slot);
    if (matchingSlot && matchingSlot.status !== 'open') {
      const freeSlots = existingInfo.slots.filter(s => s.status === 'open').map(s => s.slotKey).join(' o ');
      showToast(`El turno de la ${slot} ya está ocupado ese día. Turnos libres: ${freeSlots}.`, 'warning');
      return;
    }

    closeModal('modal-new-booking');

    const payload = {
      festejado: childName,
      edad: age,
      nombre_cliente: hostName,
      telefono: phone,
      correo: email || null,
      fecha_evento: date,
      turno: slot,
      tematica: theme,
      numero_invitados: guests,
      estado: 'confirmada',
      deposito: 350.00,
      deposito_estado: 'pagado'
    };

    // Actualizar en memoria inmediatamente para respuesta en tiempo real
    const slotTimes = {
      'mañana': ['09:30:00', '13:30:00'],
      'tarde': ['15:00:00', '19:00:00'],
      'noche': ['20:00:00', '23:30:00']
    };
    const [hIni, hFin] = slotTimes[slot] || ['15:00:00', '19:00:00'];
    const tempId = state.dbData.reservaciones.length + 1;
    state.dbData.reservaciones.push({
      id_reservacion: tempId,
      cliente_nombre: hostName,
      cliente_telefono: phone,
      fecha_evento: date,
      hora_inicio: hIni,
      hora_fin: hFin,
      tipo_evento: `Cumpleaños #${age} de ${childName} • ${theme}`,
      numero_invitados: guests,
      estado: 'confirmada',
      deposito: 350,
      deposito_estado: 'pagado'
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

    // Comprobar si con esta reservación se llenó el día (3/3)
    const updatedDayInfo = getSlotsForDate(yNum, mIdx, dNum);
    const nowFull = isDayFullyBooked(updatedDayInfo);

    if (nowFull) {
      showToast(`¡Reservación confirmada! El día ${dNum} de ${monthNames[mIdx]} ahora se encuentra 100% lleno (en rojo).`, 'success');
    } else {
      showToast(`¡Reservación de ${childName} confirmada para el ${dNum} de ${monthNames[mIdx]} (turno ${slot})!`, 'success');
    }

    // Guardar en la base de datos en segundo plano y sincronizar
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
      title: 'Nueva Reservación Confirmada',
      text: `${childName} (${age} años) • Anfitrión: ${hostName} (${guests} inv. • Turno ${slot}).`,
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
    renderMobiliarioModal();
    openModal('modal-manage-slot');
  }
  window.openManageSlotModal = openManageSlotModal;

  function printDaySheet() {
    window.print();
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

  // Inicializar interfaz inmediatamente
  applyRoleUI();
  renderChecklist();
  updateNotifBadge();
  loadDashboardFromDatabase();
});
