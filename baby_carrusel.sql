-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-11-2026 a las 00:20:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `baby_carrusel`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `checklists`
--

CREATE TABLE `checklists` (
  `id_checklist` int(11) NOT NULL,
  `id_reservacion` int(11) NOT NULL,
  `tipo` enum('pre_evento','post_evento') NOT NULL,
  `fecha_revision` datetime DEFAULT current_timestamp(),
  `responsable` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `checklist_detalles`
--

CREATE TABLE `checklist_detalles` (
  `id_detalle` int(11) NOT NULL,
  `id_checklist` int(11) NOT NULL,
  `elemento` varchar(100) NOT NULL,
  `estado` enum('bueno','regular','danado','pendiente') NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id_empleado` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `puesto` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mobiliario`
--

CREATE TABLE `mobiliario` (
  `id_mobiliario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `estado` enum('disponible','en_mantenimiento','fuera_de_servicio') DEFAULT 'disponible',
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reglamento`
--

CREATE TABLE `reglamento` (
  `id_regla` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservaciones`
--

CREATE TABLE `reservaciones` (
  `id_reservacion` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_evento` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo_evento` varchar(100) DEFAULT NULL,
  `numero_invitados` int(11) NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','finalizada') DEFAULT 'pendiente',
  `deposito` decimal(10,2) DEFAULT 0.00,
  `deposito_estado` enum('pendiente','pagado','devuelto','retenido') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservacion_mobiliario`
--

CREATE TABLE `reservacion_mobiliario` (
  `id_reservacion_mobiliario` int(11) NOT NULL,
  `id_reservacion` int(11) NOT NULL,
  `id_mobiliario` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Volcado de datos iniciales para las tablas de `baby_carrusel`
-- Alineado con el Proyecto Creativo (Equipo JOLIE - UPSLP)
-- Salón Baby Carrusel: C. 5 de Mayo 1940, San Juan de Guadalupe, S.L.P.
--

INSERT INTO `clientes` (`id_cliente`, `nombre`, `telefono`, `correo`, `fecha_registro`) VALUES
(1, 'Camila y Roberto Peña', '+52 444 849 1034', 'camila.pena@correo.mx', '2026-11-05 12:00:00'),
(2, 'Valeria Silva', '+52 444 219 4501', 'valeria.silva@correo.mx', '2026-11-06 10:30:00'),
(3, 'Familia Morales', '+52 444 310 8821', 'morales.fam@correo.mx', '2026-11-01 16:15:00'),
(4, 'Lucía Mendoza', '+52 444 509 7712', 'lucia.mendoza@correo.mx', '2026-11-02 11:20:00'),
(5, 'Alejandro Cruz', '+52 444 618 9940', 'alejandro.cruz@correo.mx', '2026-11-08 09:45:00'),
(6, 'Mariana Garza', '+52 444 720 1138', 'mariana.garza@correo.mx', '2026-11-09 14:00:00'),
(7, 'Daniela Ríos', '+52 444 831 5560', 'daniela.rios@correo.mx', '2026-11-10 17:30:00'),
(8, 'Karla Gómez', '+52 444 942 6671', 'karla.gomez@correo.mx', '2026-11-12 18:10:00');

INSERT INTO `empleados` (`id_empleado`, `nombre`, `puesto`, `telefono`, `activo`) VALUES
(1, 'Heriberto García', 'Propietario del Salón', '+52 444 540 2978', 1),
(2, 'Javier García Ramos', 'Administración y Reservaciones', '+52 444 540 2978', 1),
(3, 'Elena Rodríguez', 'Supervisión de Seguridad e Inspección', '+52 444 312 8901', 1),
(4, 'Carlos Méndez', 'Mantenimiento y Control de Mobiliario', '+52 444 621 4410', 1),
(5, 'Sofía Torres', 'Limpieza Profunda y Sanitización', '+52 444 789 3320', 1),
(6, 'Jolie', 'Gerente de Turno y Coordinación', '+52 444 540 2978', 1);

INSERT INTO `mobiliario` (`id_mobiliario`, `nombre`, `cantidad`, `estado`, `descripcion`) VALUES
(1, 'Carrusel Mecánico Infantil (12 caballos)', 1, 'disponible', 'Carrusel central motorizado con arneses de seguridad y paro de emergencia.'),
(2, 'Mesas Infantiles Chiavari', 12, 'disponible', 'Mesas tamaño infantil para área de comedor festivo y pastel.'),
(3, 'Sillas Infantiles Chiavari', 60, 'disponible', 'Sillas ergonómicas infantiles de alta resistencia para comedor.'),
(4, 'Brincolines y Trampolines Acolchonados', 2, 'disponible', 'Zona de salto con redes de protección perimetral y piso amortiguante.'),
(5, 'Túnel Oruga y Set de Estimulación Temprana', 1, 'disponible', 'Área suave para bebés de 0 a 3 años desinfectada con vapor.'),
(6, 'Alberca de Pelotas con Sistema Vapor/UV', 1, 'disponible', 'Alberca infantil gigante con resbaladilla suave y sanitización UV.');

INSERT INTO `reglamento` (`id_regla`, `titulo`, `descripcion`, `activo`, `fecha_actualizacion`) VALUES
(1, 'Garantía de Depósito Reembolsable ($350)', 'El depósito en garantía ($350.00) protege las instalaciones y el mobiliario. Es 100% reembolsable dentro de las 24 horas posteriores al evento tras verificar que no existan daños ni retrasos mayores a 45 minutos en la entrega del salón.', 1, current_timestamp()),
(2, 'Capacidad y Aforo Máximo (80 Personas)', 'Por seguridad y normativa de Protección Civil, el cupo máximo permitido es de 80 asistentes en total (incluyendo niños y adultos acompañantes).', 1, current_timestamp()),
(3, 'Uso Obligatorio de Calcetines Antideslizantes', 'Todo niño y adulto que ingrese al área de brincolines, alberca de pelotas, túnel oruga o carrusel deberá portar calcetines antideslizantes por higiene y seguridad.', 1, current_timestamp()),
(4, 'Alimentos y Bebidas Exclusivos en Área de Comedor', 'Los alimentos, bebidas, pastel y dulces están permitidos únicamente en la zona de mesas y comedor. No se permite ingresar comida o líquidos a los juegos suaves.', 1, current_timestamp()),
(5, 'Nivel de Sonido Seguro (80 dB) y Puntualidad de Turnos', 'Por bienestar infantil el sonido ambiental no supera los 80 dB. Entre cada turno se reservan 90 a 120 minutos exclusivos para limpieza profunda, desinfección y revisión del salón.', 1, current_timestamp());

INSERT INTO `reservaciones` (`id_reservacion`, `id_cliente`, `fecha_evento`, `hora_inicio`, `hora_fin`, `tipo_evento`, `numero_invitados`, `estado`, `deposito`, `deposito_estado`, `observaciones`, `fecha_registro`) VALUES
(1, 1, '2026-11-21', '15:00:00', '19:00:00', 'Cumpleaños #4 de Lucas • Carnaval de Carrusel y Safari Mágico', 62, 'confirmada', 350.00, 'pagado', 'Activo en Salón Principal • 38 Niños / 24 Adultos • Paquete $1,250.00 Liquidado', '2026-11-05 12:05:00'),
(2, 2, '2026-11-21', '09:30:00', '13:30:00', 'Safari Mágico de Mía', 45, 'finalizada', 350.00, 'devuelto', 'Evento matutino completado e inspeccionado sin daños. Depósito reembolsado al 100%.', '2026-11-06 10:35:00'),
(3, 3, '2026-11-15', '09:30:00', '13:30:00', 'Fiesta de Cumpleaños Mateo', 40, 'finalizada', 350.00, 'devuelto', 'Salón entregado en óptimas condiciones.', '2026-11-01 16:20:00'),
(4, 4, '2026-11-15', '15:00:00', '19:00:00', 'Cumpleaños #5 de Valeria', 55, 'finalizada', 350.00, 'devuelto', 'Inspección post-evento aprobada.', '2026-11-02 11:25:00'),
(5, 5, '2026-11-17', '09:30:00', '13:30:00', 'Bautizo de Santiago', 50, 'pendiente', 350.00, 'pendiente', 'Apartado pendiente de confirmación de pago.', '2026-11-08 09:50:00'),
(6, 6, '2026-11-18', '15:00:00', '19:00:00', 'Baby Shower de Valentina', 60, 'confirmada', 350.00, 'pagado', 'Montaje especial en salón comedor y área de regalos.', '2026-11-09 14:10:00'),
(7, 7, '2026-11-20', '15:00:00', '19:00:00', 'Cumpleaños #3 de Emma • Unicornios', 65, 'confirmada', 350.00, 'pagado', 'Temática Unicornio • Depósito de garantía cubierto.', '2026-11-10 17:35:00'),
(8, 8, '2026-11-20', '20:00:00', '23:30:00', 'Pijamada VIP de Sofía', 30, 'pendiente', 350.00, 'pendiente', 'Apartado nocturno pendiente de confirmación.', '2026-11-12 18:15:00'),
(9, 3, '2026-11-22', '15:00:00', '19:00:00', 'Cumpleaños #2 de Leo • Dinosaurios', 50, 'confirmada', 350.00, 'pagado', 'Paquete Fiesta Carrusel Mágico confirmado.', '2026-11-14 11:00:00'),
(10, 6, '2026-11-28', '09:30:00', '13:30:00', 'Cumpleaños #1 de Regina • Baby Splash', 45, 'confirmada', 350.00, 'pagado', 'Área de estimulación temprana reservada.', '2026-11-15 13:20:00'),
(11, 7, '2026-11-28', '15:00:00', '19:00:00', 'Fiesta Sorpresa de Emiliano #6', 70, 'pendiente', 350.00, 'pendiente', 'Solicitud de apartado fin de semana.', '2026-11-18 16:40:00');

INSERT INTO `reservacion_mobiliario` (`id_reservacion_mobiliario`, `id_reservacion`, `id_mobiliario`, `cantidad`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 12),
(3, 1, 3, 60),
(4, 1, 4, 2),
(5, 1, 5, 1),
(6, 1, 6, 1);

INSERT INTO `checklists` (`id_checklist`, `id_reservacion`, `tipo`, `fecha_revision`, `responsable`, `observaciones`) VALUES
(1, 1, 'pre_evento', '2026-11-21 14:15:00', 'Elena Rodríguez y Javier García', 'Inspección pre-evento aprobada al 100% antes del ingreso de invitados.'),
(2, 1, 'post_evento', '2026-11-21 19:00:00', 'Javier García y Carlos Méndez', 'Protocolo de salida programado a las 19:00 hrs para liberación de depósito.');

INSERT INTO `checklist_detalles` (`id_detalle`, `id_checklist`, `elemento`, `estado`, `observaciones`) VALUES
(1, 1, 'Seguridad Mecánica del Carrusel y Arneses', 'bueno', 'Inspeccionado y verificado por Elena R. a las 14:15 hrs'),
(2, 1, 'Sanitización de Área Suave (Toddlers)', 'bueno', '100% desinfectado con vapor; ciclo UV en alberca de pelotas completado'),
(3, 1, 'Mobiliario Infantil y Sillas Chiavari', 'bueno', '12 mesas infantiles / 60 sillas verificadas sin daños'),
(4, 1, 'Sistema de Audio y Luces LED Ambientales', 'bueno', 'Prueba OK (volumen seguro limitado a 80dB para niños)'),
(5, 1, 'Higiene de Sanitarios, Botiquín y Extintores', 'bueno', 'Sanitarios con cambiador desinfectados y salidas de emergencia libres'),
(6, 2, 'Revisión y Apagado Seguro del Carrusel', 'pendiente', 'Verificar paro de emergencia y desconexión de energía'),
(7, 2, 'Inventario de Mobiliario y Juegos Suaves', 'pendiente', 'Comprobar que no existan piezas dañadas o faltantes'),
(8, 2, 'Limpieza Básica y Desalojo de Salón', 'pendiente', 'Mesas despejadas, retiro de regalos y pertenencias'),
(9, 2, 'Inspección de Brincolines y Redes de Protección', 'pendiente', 'Verificar lonas y costuras sin rasgaduras por objetos'),
(10, 2, 'Entrega de Llaves y Retiro de Brazaletes', 'pendiente', 'Firma de conformidad de salida con el anfitrión');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `checklists`
--
ALTER TABLE `checklists`
  ADD PRIMARY KEY (`id_checklist`),
  ADD KEY `id_reservacion` (`id_reservacion`);

--
-- Indices de la tabla `checklist_detalles`
--
ALTER TABLE `checklist_detalles`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_checklist` (`id_checklist`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id_empleado`);

--
-- Indices de la tabla `mobiliario`
--
ALTER TABLE `mobiliario`
  ADD PRIMARY KEY (`id_mobiliario`);

--
-- Indices de la tabla `reglamento`
--
ALTER TABLE `reglamento`
  ADD PRIMARY KEY (`id_regla`);

--
-- Indices de la tabla `reservaciones`
--
ALTER TABLE `reservaciones`
  ADD PRIMARY KEY (`id_reservacion`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `reservacion_mobiliario`
--
ALTER TABLE `reservacion_mobiliario`
  ADD PRIMARY KEY (`id_reservacion_mobiliario`),
  ADD KEY `id_reservacion` (`id_reservacion`),
  ADD KEY `id_mobiliario` (`id_mobiliario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `checklists`
--
ALTER TABLE `checklists`
  MODIFY `id_checklist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `checklist_detalles`
--
ALTER TABLE `checklist_detalles`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `mobiliario`
--
ALTER TABLE `mobiliario`
  MODIFY `id_mobiliario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `reglamento`
--
ALTER TABLE `reglamento`
  MODIFY `id_regla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reservaciones`
--
ALTER TABLE `reservaciones`
  MODIFY `id_reservacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `reservacion_mobiliario`
--
ALTER TABLE `reservacion_mobiliario`
  MODIFY `id_reservacion_mobiliario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `checklists`
--
ALTER TABLE `checklists`
  ADD CONSTRAINT `checklists_ibfk_1` FOREIGN KEY (`id_reservacion`) REFERENCES `reservaciones` (`id_reservacion`);

--
-- Filtros para la tabla `checklist_detalles`
--
ALTER TABLE `checklist_detalles`
  ADD CONSTRAINT `checklist_detalles_ibfk_1` FOREIGN KEY (`id_checklist`) REFERENCES `checklists` (`id_checklist`);

--
-- Filtros para la tabla `reservaciones`
--
ALTER TABLE `reservaciones`
  ADD CONSTRAINT `reservaciones_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`);

--
-- Filtros para la tabla `reservacion_mobiliario`
--
ALTER TABLE `reservacion_mobiliario`
  ADD CONSTRAINT `reservacion_mobiliario_ibfk_1` FOREIGN KEY (`id_reservacion`) REFERENCES `reservaciones` (`id_reservacion`),
  ADD CONSTRAINT `reservacion_mobiliario_ibfk_2` FOREIGN KEY (`id_mobiliario`) REFERENCES `mobiliario` (`id_mobiliario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
