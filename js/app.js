/**
 * Baby Carrusel - Sistema de Gestión del Salón de Eventos
 * Conectado en tiempo real a MariaDB (Docker en Raspberry Pi + Tailscale Funnel)
 * Equipo JOLIE - Núcleo General IV: Creatividad (UPSLP)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Endpoints candidatos para conectar con la Raspberry Pi (Tailscale Funnel HTTPS, Tailscale VPN y Red Local)
  const API_CANDIDATES = [
    ...(window.location.hostname.includes('ts.net') || window.location.port === '8004'
      ? [`${window.location.origin}/babycarrusel/api`, `${window.location.origin}/api`]
      : []),
    'https://hououin-pi.tailcbb698.ts.net/babycarrusel/api',
    'http://100.111.160.87:8004/api',
    'http://192.168.100.78:8004/api'
  ];

  let activeApiBase = null;

  // Estado de la aplicación (con respaldo inicial idéntico al cartel)
  const state = {
    dbConnected: false,
    activeReservationId: 1,
    currentYear: 2025,
    currentMonthIndex: 9, // Octubre (0-indexed)
    selectedDay: 25,
    viewMode: 'month',
    aforo: {
      current: 62,
      max: 80,
      children: 38,
      adults: 24
    },
    deposit: {
      amount: 350.00,
      status: 'held', // 'held' | 'released' | 'deducted'
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
      reservaciones: [],
      clientes: [],
      empleados: [
        { id_empleado: 1, nombre: 'Heriberto García', puesto: 'Dueño del Salón (Propietario)', telefono: '+52 444 540 2978' },
        { id_empleado: 2, nombre: 'Javier García Ramos', puesto: 'Administración y Reservaciones', telefono: '+52 444 540 2978' },
        { id_empleado: 3, nombre: 'Elena Rodríguez', puesto: 'Supervisión de Seguridad e Inspección', telefono: '+52 444 312 8901' },
        { id_empleado: 4, nombre: 'Carlos Méndez', puesto: 'Mantenimiento y Control de Mobiliario', telefono: '+52 444 621 4410' },
        { id_empleado: 5, nombre: 'Sofía Torres', puesto: 'Limpieza Profunda y Sanitización Vapor/UV', telefono: '+52 444 789 3320' },
        { id_empleado: 6, nombre: 'Equipo JOLIE (UPSLP)', puesto: 'Coordinación Operativa y Plataforma Digital', telefono: '+52 444 540 2978' }
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
        { id_regla: 1, titulo: 'Garantía de Depósito Transparente ($350)', descripcion: 'Depósito 100% reembolsable en un máximo de 24 horas tras finalizar el evento e inspección post-evento sin daños ni retrasos mayores a 45 min (Corresponsabilidad ESS).' },
        { id_regla: 2, titulo: 'Control de Aforo y Capacidad Máxima (80 Personas)', descripcion: 'Por normativa de Protección Civil y seguridad comunitaria (ODS 11), el cupo máximo estricto del salón es de 80 asistentes en total (niños + adultos).' },
        { id_regla: 3, titulo: 'Calcetines Antideslizantes Obligatorios', descripcion: 'Todo niño y adulto que ingrese a las áreas de brincolines, alberca de pelotas, túnel oruga o carrusel debe usar calcetines antideslizantes.' },
        { id_regla: 4, titulo: 'Alimentos y Bebidas Exclusivos en Comedor', descripcion: 'Exclusivamente permitidos en el área de mesas y comedor. Prohibido ingresar comida o líquidos a las zonas de juego suave y túneles.' },
        { id_regla: 5, titulo: 'Límite Acústico (80 dB) y Bloqueo de Limpieza (2 hrs)', descripcion: 'El volumen no superará los 80 dB. Se programan 2 horas entre eventos para sanitización profunda y revisión del mobiliario (ODS 8 y ODS 12).' }
      ]
    },
    notifications: [
      { id: 1, title: 'Aforo en Salón Principal', text: 'Se registraron 62 invitados para la fiesta de Lucas en MariaDB.', time: 'Hace 15 min', unread: true },
      { id: 2, title: 'Inspección Pre-Evento Lista', text: 'Elena R. y Javier García completaron los 5 puntos de seguridad.', time: 'Hace 1 hora', unread: true },
      { id: 3, title: 'Depósito de Seguridad Recibido', text: '$350.00 en custodia para la reserva #BC-2025-104.', time: 'Hace 3 horas', unread: true },
      { id: 4, title: 'Recordatorio Sanitario (ODS 8 y 12)', text: 'Próxima inspección de salida programada para las 19:00 hrs.', time: 'Hace 4 horas', unread: false }
    ],
    calendarEvents: {
      19: {
        summary: '2 Eventos Agendados',
        slots: [
          { id_reservacion: 3, time: '09:30 - 13:30', title: 'Fiesta de Cumpleaños Mateo', host: 'Familia Morales', status: 'completed', statusLabel: 'Completado', guests: '40/80' },
          { id_reservacion: 4, time: '15:00 - 19:00', title: 'Cumpleaños #5 de Valeria', host: 'Lucía Mendoza', status: 'completed', statusLabel: 'Completado', guests: '55/80' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'noche' }
        ]
      },
      20: {
        summary: 'Mantenimiento General',
        slots: [
          { time: 'Todo el día', title: 'Mantenimiento y Sanitización Profunda (ODS 12)', host: 'Javier García y Equipo Técnico Baby Carrusel', status: 'maintenance', statusLabel: 'Mantenimiento', guests: '-' }
        ]
      },
      21: {
        summary: '1 Apartado + 2 Disponibles',
        slots: [
          { id_reservacion: 5, time: '10:00 - 14:00', title: 'Apartado Tentativo (Bautizo)', host: 'Alejandro Cruz', status: 'hold', statusLabel: 'Apartado Pendiente', guests: '50 est.' },
          { time: '15:00 - 19:00', title: 'Horario Tarde Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'tarde' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'noche' }
        ]
      },
      22: {
        summary: 'Baby Shower Confirmado',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'mañana' },
          { id_reservacion: 6, time: '14:00 - 18:00', title: 'Baby Shower de Valentina', host: 'Mariana Garza', status: 'confirmed', statusLabel: 'Confirmado', guests: '60/80' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'noche' }
        ]
      },
      23: {
        summary: 'Jornada Completa Disponible',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'mañana' },
          { time: '15:00 - 19:00', title: 'Horario Tarde Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'tarde' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'noche' }
        ]
      },
      24: {
        summary: '1 Confirmado + 1 En Espera',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80', slotKey: 'mañana' },
          { id_reservacion: 7, time: '16:00 - 20:00', title: 'Cumpleaños #3 de Emma', host: 'Daniela Ríos', status: 'confirmed', statusLabel: 'Confirmado', guests: '65/80' },
          { id_reservacion: 8, time: '20:30 - 23:30', title: 'Pijamada VIP (Apartado)', host: 'Karla Gómez', status: 'hold', statusLabel: 'Apartado Pendiente', guests: '30 est.' }
        ]
      },
      25: {
        summary: 'Jornada de Hoy (Activa)',
        slots: [
          { id_reservacion: 2, time: '09:30 - 13:30', title: 'Safari Mágico de Mía', host: 'Valeria Silva', status: 'completed', statusLabel: 'Completado e Inspeccionado', guests: '45/80', depositStatus: 'Liberado' },
          { id_reservacion: 1, time: '15:00 - 19:00', title: 'Cumpleaños #4 de Lucas • Carnaval de Carrusel', host: 'Camila y Roberto Peña', status: 'active', statusLabel: 'En Curso (Activo)', guests: '62/80', depositStatus: '$350 en Garantía' },
          { time: '20:00 - 23:30', title: 'Sesión Nocturna Disponible', host: '-', status: 'open', statusLabel: 'Disponible para Reservar', guests: '0/80', slotKey: 'noche' }
        ]
      }
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  /* ==========================================================================
     CONEXIÓN CON API Y BASE DE DATOS MARIADB (RASPBERRY PI + TAILSCALE)
     ========================================================================== */
  function setDbBadge(connected, label) {
    const badge = document.getElementById('db-status-badge');
    const dot = document.getElementById('db-status-dot');
    const text = document.getElementById('db-status-text');
    if (!badge || !dot || !text) return;

    if (connected) {
      badge.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer';
      dot.className = 'w-2 h-2 rounded-full bg-emerald-600 animate-pulse';
      text.textContent = label || '🗄️ BD MariaDB Conectada (Tailscale)';
    } else {
      badge.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer';
      dot.className = 'w-2 h-2 rounded-full bg-amber-600';
      text.textContent = label || 'Modo Local (Sin conexión a Raspberry)';
    }
  }

  async function apiFetch(path, options = {}) {
    if (!activeApiBase) {
      for (const candidate of API_CANDIDATES) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3500);
          const res = await fetch(`${candidate}/health`, { signal: ctrl.signal });
          clearTimeout(timer);
          if (res.ok) {
            activeApiBase = candidate;
            state.dbConnected = true;
            const isTailscale = candidate.includes('ts.net') || candidate.includes('100.111');
            setDbBadge(true, isTailscale ? '🗄️ BD MariaDB • Tailscale Activo' : '🗄️ BD MariaDB • Raspberry LAN');
            break;
          }
        } catch (_) {
          // Intentar siguiente candidato
        }
      }
    }

    if (!activeApiBase) {
      state.dbConnected = false;
      setDbBadge(false);
      return null;
    }

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
      console.warn('Error en petición API:', err);
      return null;
    }
  }

  function buildCalendarFromDatabase(reservaciones) {
    // Reiniciar días base (manteniendo el lunes 20 de octubre como mantenimiento)
    const newCal = {
      20: {
        summary: 'Mantenimiento General',
        slots: [
          { time: 'Todo el día', title: 'Mantenimiento y Sanitización Profunda (ODS 12)', host: 'Javier García y Equipo Técnico Baby Carrusel', status: 'maintenance', statusLabel: 'Mantenimiento', guests: '-' }
        ]
      }
    };

    // Filtrar reservaciones del mes y año seleccionados
    const monthStr = String(state.currentMonthIndex + 1).padStart(2, '0');
    const yearPrefix = `${state.currentYear}-${monthStr}-`;

    const byDay = {};
    reservaciones.forEach(r => {
      if (r.fecha_evento && r.fecha_evento.startsWith(yearPrefix)) {
        const dayNum = parseInt(r.fecha_evento.split('-')[2], 10);
        byDay[dayNum] = byDay[dayNum] || [];
        byDay[dayNum].push(r);
      }
    });

    // Para todos los días con eventos o los días de la semana visible (19..31)
    const daysToBuild = new Set([19, 21, 22, 23, 24, 25, ...Object.keys(byDay).map(Number)]);
    daysToBuild.forEach(dayNum => {
      if (dayNum === 20 && state.currentMonthIndex === 9 && state.currentYear === 2025 && !byDay[20]) {
        return;
      }
      const dayRes = byDay[dayNum] || [];
      const standardShifts = [
        { key: 'mañana', label: 'Horario Mañana Libre', defaultTime: '09:30 - 13:30', matchHour: h => h < 14 },
        { key: 'tarde', label: 'Horario Tarde Libre', defaultTime: '15:00 - 19:00', matchHour: h => h >= 14 && h < 19 },
        { key: 'noche', label: 'Horario Noche Libre', defaultTime: '20:00 - 23:30', matchHour: h => h >= 19 }
      ];

      const slots = [];
      const usedResIds = new Set();

      standardShifts.forEach(shift => {
        const found = dayRes.find(r => {
          if (usedResIds.has(r.id_reservacion)) return false;
          const hour = parseInt((r.hora_inicio || '15:00').split(':')[0], 10);
          return shift.matchHour(hour);
        });

        if (found) {
          usedResIds.add(found.id_reservacion);
          const hIni = (found.hora_inicio || '15:00').slice(0, 5);
          const hFin = (found.hora_fin || '19:00').slice(0, 5);
          let uiStatus = 'confirmed';
          let uiLabel = 'Confirmado';
          if (found.id_reservacion === state.activeReservationId || (dayNum === 25 && hIni === '15:00' && found.estado === 'confirmada')) {
            uiStatus = 'active';
            uiLabel = 'En Curso (Activo)';
          } else if (found.estado === 'finalizada') {
            uiStatus = 'completed';
            uiLabel = 'Completado e Inspeccionado';
          } else if (found.estado === 'pendiente') {
            uiStatus = 'hold';
            uiLabel = 'Apartado Pendiente';
          } else if (found.estado === 'cancelada') {
            uiStatus = 'hold';
            uiLabel = 'Cancelado';
          }

          slots.push({
            id_reservacion: found.id_reservacion,
            time: `${hIni} - ${hFin}`,
            title: found.tipo_evento || 'Evento Infantil',
            host: found.cliente_nombre || 'Anfitrión',
            phone: found.cliente_telefono || '+52 444 540 2978',
            status: uiStatus,
            statusLabel: uiLabel,
            guests: `${found.numero_invitados}/80`,
            numero_invitados: found.numero_invitados,
            deposito: found.deposito,
            deposito_estado: found.deposito_estado
          });
        } else {
          slots.push({
            time: shift.defaultTime,
            title: dayNum === 25 && shift.key === 'noche' ? 'Sesión Nocturna Disponible' : shift.label,
            host: '-',
            status: 'open',
            statusLabel: 'Disponible',
            guests: '0/80',
            slotKey: shift.key
          });
        }
      });

      newCal[dayNum] = {
        summary: `${dayRes.length} Eventos en BD`,
        slots
      };
    });

    state.calendarEvents = newCal;
    updateCalendarCellBadges();
  }

  function updateCalendarCellBadges() {
    [19, 20, 21, 22, 23, 24, 25].forEach(dayNum => {
      const cell = document.querySelector(`[data-day="${dayNum}"]`);
      if (!cell) return;
      const badgeContainer = cell.querySelector('div.flex.flex-col.gap-1');
      if (!badgeContainer) return;

      if (dayNum === 20) return; // Mantenimiento fijo
      const dayData = state.calendarEvents[dayNum];
      if (!dayData || !dayData.slots) return;

      const badgesHtml = dayData.slots.map(s => {
        const shortTime = s.time.split(' - ')[0];
        if (s.status === 'active') {
          const shortName = s.title.split('•')[0].replace('Cumpleaños #4 de ', '').trim();
          return `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white truncate shadow-xs">${shortTime} ${shortName} ★</span>`;
        } else if (s.status === 'completed' || s.status === 'confirmed') {
          const shortName = s.title.split('•')[0].replace('Cumpleaños ', '').replace('Fiesta de ', '').trim();
          return `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 truncate">${shortTime} ${shortName} ✓</span>`;
        } else if (s.status === 'hold') {
          return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 truncate">${shortTime} Apart.</span>`;
        } else {
          return `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 truncate">${shortTime} Disp.</span>`;
        }
      }).join('');

      badgeContainer.innerHTML = badgesHtml;
    });
  }

  function syncSpotlightReservation(resObj) {
    if (!resObj) return;
    state.activeReservationId = resObj.id_reservacion;

    // Aforo
    const totalGuests = parseInt(resObj.numero_invitados || 62, 10);
    const childrenCount = Math.round(totalGuests * 0.61);
    const adultsCount = totalGuests - childrenCount;
    state.aforo.current = totalGuests;
    state.aforo.children = childrenCount;
    state.aforo.adults = adultsCount;

    // Depósito
    state.deposit.amount = parseFloat(resObj.deposito || 350.0);
    if (resObj.deposito_estado === 'devuelto') {
      state.deposit.status = 'released';
    } else if (resObj.deposito_estado === 'retenido') {
      state.deposit.status = 'deducted';
    } else {
      state.deposit.status = 'held';
    }

    // Textos de la tarjeta destacada
    const parts = (resObj.tipo_evento || 'Cumpleaños #4 de Lucas • Carnaval de Carrusel y Safari Mágico').split('•');
    const mainTitle = parts[0].trim();
    const themeText = parts[1] ? `Temática: ${parts[1].trim()}` : 'Temática: Carnaval de Carrusel y Safari Mágico';

    const codeEl = document.getElementById('spotlight-code');
    const titleEl = document.getElementById('spotlight-title');
    const themeEl = document.getElementById('spotlight-theme');
    const initialsEl = document.getElementById('spotlight-host-initials');
    const hostNameEl = document.getElementById('spotlight-host-name');
    const hostPhoneEl = document.getElementById('spotlight-host-phone');

    if (codeEl) codeEl.textContent = `#BC-2025-${103 + resObj.id_reservacion}`;
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

    // Actualizar Modal de Contacto y Modal Gestionar
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
        `Hola ${hostName}, te saludamos del Salón Baby Carrusel (C. 5 de Mayo 1940, SLP). Confirmamos tu evento "${mainTitle}" con aforo registrado de ${totalGuests}/80 invitados y depósito en garantía reembolsable de $350.00.`
      );
      cWa.href = `https://wa.me/${cleanPhone}?text=${msg}`;
    }
    if (cTel) cTel.href = `tel:+${cleanPhone}`;
    if (cTelText) cTelText.textContent = `Llamar al Móvil (${resObj.cliente_telefono || '+52 444 849 1034'})`;

    const mTitle = document.getElementById('manage-slot-title');
    const mSub = document.getElementById('manage-slot-subtitle');
    if (mTitle) mTitle.textContent = `${mainTitle} (#BC-2025-${103 + resObj.id_reservacion})`;
    if (mSub) mSub.textContent = `Turno ${(resObj.hora_inicio || '15:00').slice(0, 5)} a ${(resObj.hora_fin || '19:00').slice(0, 5)} hrs • Anfitrión: ${hostName}`;

    // Actualizar UI de Aforo
    renderAforoUI();

    // Actualizar UI de Depósito
    renderDepositUI(resObj);

    // Actualizar Checklists de esta reservación desde la BD
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
          <span class="text-xs font-bold text-rose-800">${obs.includes('RETENCIÓN') ? obs.split('.')[0] : 'Retención Aplicada en BD'}</span>
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
    if (!data || data.status !== 'ok') {
      renderReglamentoModal();
      renderMobiliarioModal();
      renderDaySheetModal();
      return;
    }

    state.dbData.reservaciones = data.reservaciones || [];
    state.dbData.clientes = data.clientes || [];
    state.dbData.empleados = data.empleados || state.dbData.empleados;
    state.dbData.mobiliario = data.mobiliario || state.dbData.mobiliario;
    state.dbData.reglamento = data.reglamento || state.dbData.reglamento;

    buildCalendarFromDatabase(state.dbData.reservaciones);

    const activeRes =
      state.dbData.reservaciones.find(r => r.id_reservacion === state.activeReservationId) ||
      state.dbData.reservaciones[0];
    if (activeRes) {
      syncSpotlightReservation(activeRes);
    }

    selectCalendarDay(state.selectedDay);
    renderReglamentoModal();
    renderMobiliarioModal();
    renderDaySheetModal();
  }

  /* ==========================================================================
     RENDERIZADO DE TABLAS ADICIONALES (REGLAMENTO, MOBILIARIO, EMPLEADOS)
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
    const titleEl = document.getElementById('new-rule-title');
    const descEl = document.getElementById('new-rule-desc');
    const titulo = titleEl?.value?.trim();
    const descripcion = descEl?.value?.trim();
    if (!titulo || !descripcion) return;

    const res = await apiFetch('/reglamento', {
      method: 'POST',
      body: JSON.stringify({ titulo, descripcion, activo: 1 })
    });

    if (res && res.id_regla) {
      state.dbData.reglamento.push({ id_regla: res.id_regla, titulo, descripcion, activo: 1 });
      showToast(`Regla #${res.id_regla} guardada en tabla "reglamento" (MariaDB).`, 'success');
    } else {
      state.dbData.reglamento.push({ id_regla: Date.now(), titulo, descripcion, activo: 1 });
      showToast('Regla agregada localmente.', 'info');
    }

    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    renderReglamentoModal();
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
            <option value="en_mantenimiento" ${m.estado === 'en_mantenimiento' ? 'selected' : ''}>Mantenimiento 🔧</option>
            <option value="fuera_de_servicio" ${m.estado === 'fuera_de_servicio' ? 'selected' : ''}>Fuera Servicio ⚠️</option>
          </select>
        </div>
      `;
    }).join('');
  }

  async function changeMobiliarioEstado(idMobiliario, nuevoEstado) {
    const item = state.dbData.mobiliario.find(m => m.id_mobiliario === idMobiliario);
    if (item) item.estado = nuevoEstado;
    renderMobiliarioModal();

    const res = await apiFetch(`/mobiliario/${idMobiliario}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (res) {
      showToast(`Mobiliario #${idMobiliario} actualizado a "${nuevoEstado}" en MariaDB.`);
    } else {
      showToast(`Estado de mobiliario cambiado a "${nuevoEstado}".`, 'info');
    }
  }
  window.changeMobiliarioEstado = changeMobiliarioEstado;

  function renderDaySheetModal() {
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
    const dayData = state.calendarEvents[state.selectedDay];
    if (turnosContainer && dayData && dayData.slots) {
      turnosContainer.innerHTML = dayData.slots.map((s, idx) => `
        <div class="p-2 rounded ${s.status === 'active' ? 'bg-primary-fixed/30 border border-primary/30' : 'bg-surface-container-low'} flex justify-between items-center">
          <div>
            <strong>Turno ${idx + 1} (${s.time}):</strong> ${s.title} • ${s.host} • ${s.guests} Invitados
          </div>
          <span class="${s.status === 'active' ? 'text-primary' : s.status === 'completed' ? 'text-emerald-700' : 'text-blue-700'} font-bold">${s.statusLabel}</span>
        </div>
      `).join('');
    }
  }

  async function resetDemoDatabase() {
    const res = await apiFetch('/reset-demo', { method: 'POST' });
    if (res) {
      await loadDashboardFromDatabase();
      showToast('Datos de demostración restaurados en MariaDB (Raspberry Pi).', 'success');
    } else {
      showToast('No se pudo contactar la BD para restaurar.', 'warning');
    }
  }
  window.resetDemoDatabase = resetDemoDatabase;

  /* ==========================================================================
     SISTEMA DE TOASTS FLOTANTES
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
    }, 4000);
  }
  window.showToast = showToast;

  /* ==========================================================================
     SISTEMA DE MODALES
     ========================================================================== */
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
     AFORO INTERACTIVO (SINCRONIZADO CON MARIADB)
     ========================================================================== */
  async function updateAforo(change) {
    const newTotal = state.aforo.current + change;
    if (newTotal < 0) return;
    if (newTotal > state.aforo.max) {
      showToast(`¡Alerta de Protección Civil! Capacidad máxima del salón alcanzada (${state.aforo.max} personas).`, 'warning');
      return;
    }

    state.aforo.current = newTotal;
    if (change > 0) {
      state.aforo.children += 1;
    } else if (change < 0 && state.aforo.children > 0) {
      state.aforo.children -= 1;
    }

    renderAforoUI();

    const slotHostInfo = document.getElementById('slot-host-info');
    const currentRes = state.dbData.reservaciones.find(r => r.id_reservacion === state.activeReservationId);
    const hostName = currentRes?.cliente_nombre || 'Camila & Roberto Peña';
    if (slotHostInfo) {
      slotHostInfo.textContent = `Anfitrión: ${hostName} • ${state.aforo.current} registrados de 80 Máx • Gran Salón + Carrusel Activo`;
    }

    // Persistir en MariaDB
    const apiRes = await apiFetch(`/reservaciones/${state.activeReservationId}/aforo`, {
      method: 'PATCH',
      body: JSON.stringify({ numero_invitados: state.aforo.current })
    });

    if (currentRes) {
      currentRes.numero_invitados = state.aforo.current;
    }

    if (apiRes) {
      showToast(`Aforo guardado en MariaDB: ${state.aforo.current}/80 invitados.`);
    } else {
      showToast(`Aforo actualizado: ${state.aforo.current} personas en salón.`);
    }
  }
  window.updateAforo = updateAforo;

  /* ==========================================================================
     CHECKLIST DE INSPECCIÓN DEL SALÓN (SINCRONIZADO CON MARIADB)
     ========================================================================== */
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
    const item = state.checklists[tab].find(i => i.id === id);
    if (!item) return;
    item.completed = !item.completed;
    item.estado = item.completed ? 'bueno' : 'pendiente';
    renderChecklist();

    const apiRes = await apiFetch(`/checklist-detalles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: item.estado })
    });

    if (item.completed) {
      showToast(`Verificado en BD: ${item.title}`);
    } else {
      showToast(`Marcado como pendiente en BD: ${item.title}`, 'info');
    }
  }
  window.toggleChecklistItem = toggleChecklistItem;

  /* ==========================================================================
     LIBERACIÓN Y GESTIÓN DEL DEPÓSITO (SINCRONIZADO CON MARIADB)
     ========================================================================== */
  function confirmReleaseDeposit() {
    if (state.deposit.status === 'released') {
      showToast('El depósito de $350.00 ya ha sido liberado anteriormente.', 'info');
      return;
    }
    openModal('modal-confirm-deposit');
  }
  window.confirmReleaseDeposit = confirmReleaseDeposit;

  async function executeReleaseDeposit() {
    state.deposit.status = 'released';
    closeModal('modal-confirm-deposit');

    await apiFetch(`/reservaciones/${state.activeReservationId}/deposito`, {
      method: 'PATCH',
      body: JSON.stringify({ deposito_estado: 'devuelto' })
    });

    renderDepositUI();
    showToast('¡Depósito de $350.00 liberado y registrado como "devuelto" en MariaDB!', 'success');
  }
  window.executeReleaseDeposit = executeReleaseDeposit;

  async function submitIncidentReport(e) {
    if (e) e.preventDefault();
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
    showToast(`Incidencia guardada en MariaDB: -$${amount} por ${reason}. Remanente: $${balance}`, 'warning');
  }
  window.submitIncidentReport = submitIncidentReport;

  /* ==========================================================================
     CALENDARIO Y SESIONES DEL DÍA
     ========================================================================== */
  function renderCalendarMonth() {
    const monthTitle = document.getElementById('calendar-month-title');
    if (monthTitle) {
      monthTitle.textContent = `${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    }
    if (state.dbData.reservaciones.length > 0) {
      buildCalendarFromDatabase(state.dbData.reservaciones);
    }
  }

  function changeMonth(delta) {
    state.currentMonthIndex += delta;
    if (state.currentMonthIndex < 0) {
      state.currentMonthIndex = 11;
      state.currentYear -= 1;
    } else if (state.currentMonthIndex > 11) {
      state.currentMonthIndex = 0;
      state.currentYear += 1;
    }
    renderCalendarMonth();
    selectCalendarDay(state.selectedDay);
    showToast(`Mostrando ${monthNames[state.currentMonthIndex]} de ${state.currentYear}`);
  }
  window.changeMonth = changeMonth;

  function goToToday() {
    state.currentYear = 2025;
    state.currentMonthIndex = 9; // Octubre
    state.selectedDay = 25;
    renderCalendarMonth();
    selectCalendarDay(25);
    showToast('Mostrando la jornada de Hoy (Sábado 25 de Octubre).');
  }
  window.goToToday = goToToday;

  function selectReservationFromSlot(idReservacion) {
    const resObj = state.dbData.reservaciones.find(r => r.id_reservacion === idReservacion);
    if (resObj) {
      syncSpotlightReservation(resObj);
      openManageSlotModal();
    } else {
      openManageSlotModal();
    }
  }
  window.selectReservationFromSlot = selectReservationFromSlot;

  function selectCalendarDay(dayNumber) {
    state.selectedDay = dayNumber;

    document.querySelectorAll('[data-day]').forEach(cell => {
      const cellDay = parseInt(cell.getAttribute('data-day'), 10);
      if (cellDay === dayNumber) {
        cell.classList.add('ring-2', 'ring-primary', 'bg-primary-fixed/30', 'shadow-sm');
        cell.classList.remove('bg-surface-container-low/40');
      } else {
        cell.classList.remove('ring-2', 'ring-primary', 'bg-primary-fixed/30', 'shadow-sm');
        cell.classList.add('bg-surface-container-low/40');
      }
    });

    const dateTitle = document.getElementById('selected-day-title');
    if (dateTitle) {
      dateTitle.textContent = `Sesiones del Día ${dayNumber} de ${monthNames[state.currentMonthIndex]} ${state.currentYear}`;
    }

    const eventData = state.calendarEvents[dayNumber];
    const sessionsContainer = document.getElementById('daily-sessions-container');
    if (!sessionsContainer) return;

    const isoDate = `${state.currentYear}-${String(state.currentMonthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

    if (!eventData || !eventData.slots || eventData.slots.length === 0) {
      sessionsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-surface-container-low text-center flex flex-col items-center justify-center gap-2">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant">event_available</span>
          <p class="font-headline-sm text-on-surface">No hay sesiones registradas para este día.</p>
          <p class="text-xs text-on-surface-variant">Todos los turnos se encuentran disponibles para agendar en MariaDB.</p>
          <button onclick="openBookingModal('tarde', '${isoDate}')" class="mt-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs shadow-xs hover:brightness-105">
            + Agendar Fiesta en esta Fecha
          </button>
        </div>
      `;
      renderDaySheetModal();
      return;
    }

    sessionsContainer.innerHTML = eventData.slots.map(slot => {
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
              <button onclick="openDaySheetModal()" title="Ver Ficha Operativa" class="p-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-variant transition-colors" type="button">
                <span class="material-symbols-outlined text-sm">receipt_long</span>
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
                    ${isCurrentActive ? '<span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>En Progreso Ahora' : 'Confirmado en BD ✓'}
                  </span>
                </div>
                <span id="${isCurrentActive ? 'slot-host-info' : ''}" class="text-xs text-on-surface-variant mt-0.5">Anfitrión: ${slot.host} • ${slot.guests} Invitados Máx • Gran Salón + Carrusel Activo</span>
              </div>
            </div>
            <div class="flex items-center gap-space-xs self-end md:self-center">
              <div class="text-right mr-2 hidden sm:block">
                <span class="text-[11px] font-semibold text-on-surface-variant block">Depósito en Garantía</span>
                <span class="text-xs font-bold text-on-surface">$350.00 (${slot.deposito_estado || 'pagado'})</span>
              </div>
              <button onclick="selectReservationFromSlot(${slot.id_reservacion || 1})" class="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:brightness-105 flex items-center gap-1 transition-all" type="button">
                <span class="material-symbols-outlined text-sm">tune</span>
                <span>Gestionar</span>
              </button>
            </div>
          </div>
        `;
      } else if (slot.status === 'open') {
        const sKey = slot.slotKey || 'noche';
        return `
          <div class="p-space-md rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Turno</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-emerald-950 font-semibold">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200 text-emerald-900">Disponible Inmediato</span>
                </div>
                <span class="text-xs text-emerald-800/80">Disponible para Fiestas Privadas, Cumpleaños o Pijamada de Gala (2 hrs bloqueo limpieza)</span>
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
      } else {
        return `
          <div class="p-space-md rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Turno</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-headline-sm text-headline-sm text-amber-950 font-semibold">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900">${slot.statusLabel}</span>
                </div>
                <span class="text-xs text-amber-800/80">Responsable: ${slot.host} • ${slot.guests}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              ${slot.id_reservacion ? `
              <button onclick="selectReservationFromSlot(${slot.id_reservacion})" class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs">
                Gestionar Apartado
              </button>` : ''}
            </div>
          </div>
        `;
      }
    }).join('');

    renderDaySheetModal();
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

    if (mode === 'month') {
      showToast('Vista de Calendario Mensual activada.');
    } else if (mode === 'week') {
      showToast('Vista de Horario Semanal: 19 al 25 de Octubre.');
    } else {
      showToast('Vista de Piso Diario: Operaciones del Sábado 25.');
    }
  }
  window.setCalendarView = setCalendarView;

  /* ==========================================================================
     FORMULARIO DE NUEVA RESERVACIÓN (INSERTA EN CLIENTES Y RESERVACIONES BD)
     ========================================================================== */
  function openBookingModal(slot = '', dateStr = '') {
    if (slot && document.getElementById('booking-slot')) {
      document.getElementById('booking-slot').value = slot;
    }
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dateInput.value = dateStr;
      } else {
        const iso = `${state.currentYear}-${String(state.currentMonthIndex + 1).padStart(2, '0')}-${String(state.selectedDay).padStart(2, '0')}`;
        dateInput.value = iso;
      }
    }
    openModal('modal-new-booking');
  }
  window.openBookingModal = openBookingModal;

  async function submitNewBooking(e) {
    if (e) e.preventDefault();
    const childName = document.getElementById('booking-child')?.value?.trim() || 'Nuevo Festejado';
    const age = document.getElementById('booking-age')?.value || '4';
    const hostName = document.getElementById('booking-host')?.value?.trim() || 'Anfitrión';
    const phone = document.getElementById('booking-phone')?.value?.trim() || '+52 444 000 0000';
    const email = document.getElementById('booking-email')?.value?.trim() || '';
    const guests = parseInt(document.getElementById('booking-guests')?.value || '50', 10);
    const date = document.getElementById('booking-date')?.value || '2025-10-25';
    const slot = document.getElementById('booking-slot')?.value || 'noche';
    const theme = document.getElementById('booking-theme')?.value?.trim() || 'Carnaval de Carrusel';

    if (guests > 80) {
      showToast('El cupo máximo permitido por Protección Civil es de 80 invitados.', 'warning');
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

    const apiRes = await apiFetch('/reservaciones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (apiRes && apiRes.id_reservacion) {
      state.activeReservationId = apiRes.id_reservacion;
      const parts = date.split('-');
      if (parts.length === 3) {
        state.currentYear = parseInt(parts[0], 10);
        state.currentMonthIndex = parseInt(parts[1], 10) - 1;
        state.selectedDay = parseInt(parts[2], 10);
      }
      await loadDashboardFromDatabase();
      showToast(`¡Reservación #BC-2025-${103 + apiRes.id_reservacion} de ${childName} guardada en MariaDB!`, 'success');
    } else {
      showToast(`¡Fiesta de ${childName} registrada para el ${date}!`, 'success');
    }

    state.notifications.unshift({
      id: Date.now(),
      title: '¡Nueva Reservación en MariaDB!',
      text: `${childName} (${age} años) • Anfitrión: ${hostName} (${guests} inv. • Turno ${slot}).`,
      time: 'Justo ahora',
      unread: true
    });
    updateNotifBadge();
  }
  window.submitNewBooking = submitNewBooking;

  /* ==========================================================================
     NOTIFICACIONES
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
    showToast('Todas las notificaciones marcadas como leídas.');
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

  /* ==========================================================================
     LIGHTBOX DE GALERÍA Y MAPA DEL SALÓN
     ========================================================================== */
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
    renderDaySheetModal();
    openModal('modal-day-sheet');
  }
  window.openDaySheetModal = openDaySheetModal;

  function openContactHostModal() {
    openModal('modal-contact-host');
  }
  window.openContactHostModal = openContactHostModal;

  function openDepositPolicyModal() {
    renderReglamentoModal();
    openModal('modal-deposit-policy');
  }
  window.openDepositPolicyModal = openDepositPolicyModal;

  function openManageSlotModal() {
    renderMobiliarioModal();
    openModal('modal-manage-slot');
  }
  window.openManageSlotModal = openManageSlotModal;

  function printDaySheet() {
    window.print();
  }
  window.printDaySheet = printDaySheet;

  /* ==========================================================================
     NAVEGACIÓN SUPERIOR
     ========================================================================== */
  document.querySelectorAll('nav a[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');

      document.querySelectorAll('nav a[data-path]').forEach(l => {
        l.className = 'px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors rounded-xl';
      });
      link.className = 'px-space-md py-space-sm transition-colors bg-primary-container text-on-primary-container font-semibold rounded-xl';

      if (path === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Vista de Inicio.');
      } else if (path === 'availability-calendar') {
        const calSection = document.getElementById('calendar-section');
        if (calSection) calSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Navegando a Calendario de Disponibilidad.');
      } else if (path === 'rules-and-policies') {
        openDepositPolicyModal();
      } else if (path === 'checklists') {
        const checkSection = document.getElementById('checklists-section');
        if (checkSection) {
          checkSection.scrollIntoView({ behavior: 'smooth' });
          checkSection.classList.add('ring-4', 'ring-primary-container');
          setTimeout(() => checkSection.classList.remove('ring-4', 'ring-primary-container'), 1500);
        }
        showToast('Navegando a Listas de Verificación.');
      } else if (path === 'booking') {
        openBookingModal();
      }
    });
  });

  document.querySelectorAll('a[data-path="booking"], button[data-path="booking"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  // Inicializar interfaz inmediatamente y luego sincronizar con MariaDB en la Raspberry Pi
  renderChecklist();
  renderCalendarMonth();
  selectCalendarDay(25);
  updateNotifBadge();
  loadDashboardFromDatabase();
});
