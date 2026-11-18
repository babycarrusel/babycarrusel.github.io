/**
 * Baby Carrusel - Sistema de Gestión del Salón de Eventos
 * Lógica interactiva en español
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado de la aplicación
  const state = {
    currentYear: 2025,
    currentMonthIndex: 9, // Octubre (0-indexed)
    selectedDay: 25,
    viewMode: 'month', // 'month' | 'week' | 'day'
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
        { id: 1, title: 'Seguridad Mecánica del Carrusel y Arneses', note: 'Inspeccionado y verificado por Elena R. a las 14:15 hrs', completed: true },
        { id: 2, title: 'Sanitización de Área Suave (Toddlers)', note: '100% desinfectado con vapor; ciclo UV en alberca de pelotas completado', completed: true },
        { id: 3, title: 'Mobiliario Infantil y Sillas Chiavari', note: '12 mesas infantiles / 60 sillas verificadas sin daños', completed: true },
        { id: 4, title: 'Sistema de Audio y Luces LED Ambientales', note: 'Prueba OK (volumen seguro limitado a 80dB para niños)', completed: true }
      ],
      post: [
        { id: 5, title: 'Revisión y Apagado Seguro del Carrusel', note: 'Verificar paro de emergencia y desconexión de energía', completed: false },
        { id: 6, title: 'Inventario de Mobiliario y Juegos Suaves', note: 'Comprobar que no existan piezas dañadas o faltantes', completed: false },
        { id: 7, title: 'Limpieza Básica y Desalojo de Salón', note: 'Mesas despejadas, retiro de regalos y pertenencias', completed: false },
        { id: 8, title: 'Entrega de Llaves y Retiro de Brazaletes', note: 'Firma de conformidad de salida con el anfitrión', completed: false }
      ]
    },
    notifications: [
      { id: 1, title: 'Aforo en Salón Principal', text: 'Se registraron 62 invitados para la fiesta de Lucas.', time: 'Hace 15 min', unread: true },
      { id: 2, title: 'Inspección Pre-Evento Lista', text: 'Elena R. completó el protocolo de seguridad del carrusel.', time: 'Hace 1 hora', unread: true },
      { id: 3, title: 'Depósito de Seguridad Recibido', text: '$350.00 USD/MXN en custodia para la reserva #BC-2025-104.', time: 'Hace 3 horas', unread: true },
      { id: 4, title: 'Recordatorio Sanitario', text: 'Próxima inspección de salida programada para las 19:15 hrs.', time: 'Hace 4 horas', unread: false }
    ],
    // Calendario de eventos por día en Octubre 2025
    calendarEvents: {
      19: {
        summary: '2 Eventos Agendados',
        slots: [
          { time: '09:30 - 13:30', title: 'Fiesta de Cumpleaños Mateo', host: 'Familia Morales', status: 'completed', statusLabel: 'Completado', guests: '40/60' },
          { time: '15:00 - 19:00', title: 'Cumpleaños #5 de Valeria', host: 'Lucía Mendoza', status: 'completed', statusLabel: 'Completado', guests: '55/80' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' }
        ]
      },
      20: {
        summary: 'Mantenimiento General',
        slots: [
          { time: 'Todo el día', title: 'Mantenimiento y Sanitización Profunda', host: 'Equipo Técnico Baby Carrusel', status: 'maintenance', statusLabel: 'Mantenimiento', guests: '-' }
        ]
      },
      21: {
        summary: '1 Apartado + 1 Disponible',
        slots: [
          { time: '10:00 - 14:00', title: 'Apartado Tentativo (Bautizo)', host: 'Alejandro Cruz', status: 'hold', statusLabel: 'Apartado Pendiente', guests: '50 est.' },
          { time: '15:00 - 19:00', title: 'Horario Tarde Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' }
        ]
      },
      22: {
        summary: 'Baby Shower Confirmado',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' },
          { time: '14:00 - 18:00', title: 'Baby Shower de Valentina', host: 'Mariana Garza', status: 'confirmed', statusLabel: 'Confirmado', guests: '60/80' },
          { time: '19:00 - 23:00', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' }
        ]
      },
      23: {
        summary: 'Jornada Completa Disponible',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' },
          { time: '15:00 - 19:00', title: 'Horario Tarde Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' },
          { time: '20:00 - 23:30', title: 'Horario Noche Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' }
        ]
      },
      24: {
        summary: '1 Confirmado + 1 En Espera',
        slots: [
          { time: '09:30 - 13:30', title: 'Horario Mañana Libre', host: '-', status: 'open', statusLabel: 'Disponible', guests: '0/80' },
          { time: '16:00 - 20:00', title: 'Cumpleaños #3 de Emma', host: 'Daniela Ríos', status: 'confirmed', statusLabel: 'Confirmado', guests: '65/80' },
          { time: '20:30 - 23:30', title: 'Pijamada VIP (Apartado)', host: 'Karla Gómez', status: 'hold', statusLabel: 'Apartado Pendiente', guests: '30 est.' }
        ]
      },
      25: {
        summary: 'Jornada de Hoy (Activa)',
        slots: [
          { time: '09:30 - 13:30', title: 'Safari Mágico de Mía', host: 'Valeria Silva', status: 'completed', statusLabel: 'Completado e Inspeccionado', guests: '45/60', depositStatus: 'Liberado' },
          { time: '15:00 - 19:00', title: 'Carnaval de Carrusel de Lucas #4', host: 'Camila y Roberto Peña', status: 'active', statusLabel: 'En Curso (Activo)', guests: '62/80', depositStatus: '$350 en Garantía' },
          { time: '20:00 - 23:30', title: 'Sesión Nocturna Disponible', host: '-', status: 'open', statusLabel: 'Disponible para Reservar', guests: '0/80' }
        ]
      }
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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

  // Cerrar modales con tecla Escape y clic en backdrop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-wrapper:not(.hidden)').forEach(modal => {
        closeModal(modal.id);
      });
      // Cerrar popover de notificaciones si está abierto
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
     AFORO INTERACTIVO (CHECK-IN DE INVITADOS)
     ========================================================================== */
  function updateAforo(change) {
    const newTotal = state.aforo.current + change;
    if (newTotal < 0) return;
    if (newTotal > state.aforo.max) {
      showToast(`¡Alerta! Capacidad máxima del salón alcanzada (${state.aforo.max} personas).`, 'warning');
      return;
    }

    state.aforo.current = newTotal;
    if (change > 0) {
      state.aforo.children += 1;
    } else if (change < 0 && state.aforo.children > 0) {
      state.aforo.children -= 1;
    }

    const percentage = Math.round((state.aforo.current / state.aforo.max) * 100);
    const available = state.aforo.max - state.aforo.current;

    // Actualizar elementos en Spotlight Card
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

    // Actualizar tarjeta métrica superior (KPI 4)
    const kpiAforo = document.getElementById('kpi-aforo-count');
    const kpiAforoAvail = document.getElementById('kpi-aforo-avail');
    if (kpiAforo) kpiAforo.textContent = `${state.aforo.current} / ${state.aforo.max} Invitados`;
    if (kpiAforoAvail) kpiAforoAvail.textContent = `${available} Lugares Disponibles`;

    // Actualizar texto en slot activo
    const slotHostInfo = document.getElementById('slot-host-info');
    if (slotHostInfo) {
      slotHostInfo.textContent = `Anfitrión: Camila & Roberto Peña • ${state.aforo.current} registrados de 80 Máx • Gran Salón + Carrusel Activo`;
    }

    showToast(`Aforo actualizado: ${state.aforo.current} personas en salón.`);
  }
  window.updateAforo = updateAforo;

  /* ==========================================================================
     CHECKLIST DE INSPECCIÓN DEL SALÓN
     ========================================================================== */
  function renderChecklist() {
    const list = state.checklists[state.activeChecklistTab];
    const container = document.getElementById('checklist-container');
    if (!container) return;

    container.innerHTML = list.map(item => `
      <div onclick="toggleChecklistItem('${state.activeChecklistTab}', ${item.id})" 
           class="flex items-start gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer select-none ${item.completed ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-surface-container-low/60 hover:bg-surface-container-low border border-transparent'}">
        <span class="material-symbols-outlined text-lg mt-0.5 ${item.completed ? 'text-emerald-600' : 'text-on-surface-variant'}" 
              style="font-variation-settings: 'FILL' ${item.completed ? 1 : 0};">
          ${item.completed ? 'check_circle' : 'radio_button_unchecked'}
        </span>
        <div class="flex flex-col text-xs flex-1">
          <span class="font-semibold ${item.completed ? 'text-emerald-950' : 'text-on-surface'}">${item.title}</span>
          <span class="text-[11px] ${item.completed ? 'text-emerald-700' : 'text-on-surface-variant'}">${item.note}</span>
        </div>
      </div>
    `).join('');

    // Actualizar botones de tabs
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

  function toggleChecklistItem(tab, id) {
    const item = state.checklists[tab].find(i => i.id === id);
    if (!item) return;
    item.completed = !item.completed;
    renderChecklist();

    if (item.completed) {
      showToast(`Verificado: ${item.title}`);
    } else {
      showToast(`Punto marcado como pendiente: ${item.title}`, 'info');
    }
  }
  window.toggleChecklistItem = toggleChecklistItem;

  /* ==========================================================================
     LIBERACIÓN Y GESTIÓN DEL DEPÓSITO
     ========================================================================== */
  function confirmReleaseDeposit() {
    if (state.deposit.status === 'released') {
      showToast('El depósito de $350.00 ya ha sido liberado anteriormente.', 'info');
      return;
    }

    openModal('modal-confirm-deposit');
  }
  window.confirmReleaseDeposit = confirmReleaseDeposit;

  function executeReleaseDeposit() {
    state.deposit.status = 'released';
    closeModal('modal-confirm-deposit');

    // Actualizar botón de liberación
    const releaseBtn = document.getElementById('btn-release-deposit');
    if (releaseBtn) {
      releaseBtn.innerHTML = `
        <span class="material-symbols-outlined text-base">check_circle</span>
        <span>Depósito de $350 Liberado ✓</span>
      `;
      releaseBtn.className = 'flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-label-md text-label-md opacity-90 cursor-default flex items-center justify-center gap-1';
      releaseBtn.disabled = true;
    }

    // Actualizar estado en la ficha destacada
    const depositStatus = document.getElementById('spotlight-deposit-status');
    if (depositStatus) {
      depositStatus.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-lg text-emerald-700">verified</span>
          <span class="text-xs font-semibold">Depósito de Garantía:</span>
        </div>
        <span class="text-xs font-bold text-emerald-800">$350.00 Reembolsado Exitosamente</span>
      `;
    }

    showToast('¡Depósito de $350.00 liberado satisfactoriamente al anfitrión!', 'success');
  }
  window.executeReleaseDeposit = executeReleaseDeposit;

  function submitIncidentReport(e) {
    if (e) e.preventDefault();
    const reason = document.getElementById('incident-reason')?.value || 'Deducción operativa';
    const amount = document.getElementById('incident-amount')?.value || '50';
    const notes = document.getElementById('incident-notes')?.value || '';

    state.deposit.status = 'deducted';
    state.deposit.deduction = parseFloat(amount);
    const balance = state.deposit.amount - state.deposit.deduction;

    closeModal('modal-report-incident');

    const depositStatus = document.getElementById('spotlight-deposit-status');
    if (depositStatus) {
      depositStatus.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-lg text-rose-700">report_problem</span>
          <span class="text-xs font-semibold">Depósito de Garantía:</span>
        </div>
        <span class="text-xs font-bold text-rose-800">-$${amount} Deducido ($${balance} Restante)</span>
      `;
    }

    showToast(`Incidencia registrada: -$${amount} por ${reason}. Remanente: $${balance}`, 'warning');
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

  function selectCalendarDay(dayNumber) {
    state.selectedDay = dayNumber;

    // Actualizar estilos de selección en las celdas de días
    document.querySelectorAll('[data-day]').forEach(cell => {
      const cellDay = parseInt(cell.getAttribute('data-day'));
      if (cellDay === dayNumber) {
        cell.classList.add('ring-2', 'ring-primary', 'bg-primary-fixed/30', 'shadow-sm');
        cell.classList.remove('bg-surface-container-low/40');
      } else {
        cell.classList.remove('ring-2', 'ring-primary', 'bg-primary-fixed/30', 'shadow-sm');
        cell.classList.add('bg-surface-container-low/40');
      }
    });

    // Actualizar título y tarjetas de sesiones del día
    const dateTitle = document.getElementById('selected-day-title');
    if (dateTitle) {
      dateTitle.textContent = `Sesiones del Sábado ${dayNumber} de ${monthNames[state.currentMonthIndex]} 2025`;
    }

    const eventData = state.calendarEvents[dayNumber];
    const sessionsContainer = document.getElementById('daily-sessions-container');
    if (!sessionsContainer) return;

    if (!eventData || !eventData.slots || eventData.slots.length === 0) {
      sessionsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-surface-container-low text-center flex flex-col items-center justify-center gap-2">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant">event_available</span>
          <p class="font-headline-sm text-on-surface">No hay sesiones registradas para este día.</p>
          <p class="text-xs text-on-surface-variant">Todos los turnos se encuentran disponibles para agendar.</p>
          <button onclick="openBookingModal('mañana', '${dayNumber} de ${monthNames[state.currentMonthIndex]}')" class="mt-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs shadow-xs hover:brightness-105">
            + Agendar Fiesta en esta Fecha
          </button>
        </div>
      `;
      return;
    }

    sessionsContainer.innerHTML = eventData.slots.map(slot => {
      if (slot.status === 'completed') {
        return `
          <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-center">
                <span class="text-xs font-bold uppercase tracking-wider">Mañana</span>
                <span class="font-label-sm text-[11px] text-on-surface font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-on-surface">${slot.title}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">${slot.statusLabel}</span>
                </div>
                <span class="text-xs text-on-surface-variant">Anfitrión: ${slot.host} • ${slot.guests} Invitados • Depósito $350 Pre-autorizado</span>
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
      } else if (slot.status === 'active') {
        return `
          <div class="p-space-md rounded-xl bg-primary-fixed/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
            <div class="flex items-start gap-space-md pl-1">
              <div class="flex flex-col items-center justify-center w-20 py-1.5 rounded-lg bg-primary text-white text-center shadow-xs">
                <span class="text-xs font-bold uppercase tracking-wider">Activo</span>
                <span class="font-label-sm text-[11px] font-semibold">${slot.time}</span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${slot.title}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    En Progreso Ahora
                  </span>
                </div>
                <span id="slot-host-info" class="text-xs text-on-surface-variant mt-0.5">Anfitrión: ${slot.host} • ${state.aforo.current} registrados de 80 Máx • Gran Salón + Carrusel Activo</span>
              </div>
            </div>
            <div class="flex items-center gap-space-xs self-end md:self-center">
              <div class="text-right mr-2 hidden sm:block">
                <span class="text-[11px] font-semibold text-on-surface-variant block">Depósito en Garantía</span>
                <span class="text-xs font-bold text-on-surface">$350.00 en Custodia</span>
              </div>
              <button onclick="openManageSlotModal()" class="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs hover:brightness-105 flex items-center gap-1 transition-all" type="button">
                <span class="material-symbols-outlined text-sm">tune</span>
                <span>Gestionar</span>
              </button>
            </div>
          </div>
        `;
      } else if (slot.status === 'open') {
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
                <span class="text-xs text-emerald-800/80">Disponible para Fiestas Privadas, Cumpleaños o Pijamada de Gala</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <button onclick="openBookingModal('noche', '${dayNumber} de ${monthNames[state.currentMonthIndex]}')" class="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1" type="button">
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
                <span class="text-xs text-amber-800/80">Contacto: ${slot.host} • ${slot.guests}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end md:self-center">
              <button onclick="showToast('Apartado en proceso de confirmación.')" class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs">
                Ver Detalles
              </button>
            </div>
          </div>
        `;
      }
    }).join('');
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
     FORMULARIO DE NUEVA RESERVACIÓN
     ========================================================================== */
  function openBookingModal(slot = '', date = '') {
    if (slot && document.getElementById('booking-slot')) {
      document.getElementById('booking-slot').value = slot;
    }
    if (date && document.getElementById('booking-date-text')) {
      document.getElementById('booking-date-text').textContent = date;
    }
    openModal('modal-new-booking');
  }
  window.openBookingModal = openBookingModal;

  function submitNewBooking(e) {
    if (e) e.preventDefault();
    const childName = document.getElementById('booking-child')?.value || 'Nuevo Festejado';
    const age = document.getElementById('booking-age')?.value || '4';
    const hostName = document.getElementById('booking-host')?.value || 'Anfitrión';
    const phone = document.getElementById('booking-phone')?.value || '';
    const date = document.getElementById('booking-date')?.value || '2025-10-26';
    const slot = document.getElementById('booking-slot')?.value || 'tarde';
    const theme = document.getElementById('booking-theme')?.value || 'Temática Personalizada';

    closeModal('modal-new-booking');

    // Registrar en notificaciones
    state.notifications.unshift({
      id: Date.now(),
      title: '¡Nueva Reservación Confirmada!',
      text: `${childName} (${age} años) - Anfitrión: ${hostName} (${slot}).`,
      time: 'Justo ahora',
      unread: true
    });
    updateNotifBadge();

    showToast(`¡Fiesta de ${childName} registrada con éxito para el ${date}!`, 'success');
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
    const modal = document.getElementById('modal-gallery-lightbox');
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
    openModal('modal-day-sheet');
  }
  window.openDaySheetModal = openDaySheetModal;

  function openContactHostModal() {
    openModal('modal-contact-host');
  }
  window.openContactHostModal = openContactHostModal;

  function openDepositPolicyModal() {
    openModal('modal-deposit-policy');
  }
  window.openDepositPolicyModal = openDepositPolicyModal;

  function openManageSlotModal() {
    openModal('modal-manage-slot');
  }
  window.openManageSlotModal = openManageSlotModal;

  function printDaySheet() {
    window.print();
  }
  window.printDaySheet = printDaySheet;

  /* ==========================================================================
     NAVEGACIÓN SUPERIOR (Pestañas de la barra de navegación)
     ========================================================================== */
  document.querySelectorAll('nav a[data-path]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');

      // Actualizar clases activas del navbar
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

  // Botón CTA "Nueva Reservación" en header
  document.querySelectorAll('a[data-path="booking"], button[data-path="booking"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  // Inicializar componentes
  renderChecklist();
  renderCalendarMonth();
  selectCalendarDay(25);
  updateNotifBadge();
});
