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
(1, 'Mesas, Sillas, Manteles y Cubremanteles (Paquete 50 / 80 personas)', 10, 'disponible', 'Mobiliario completo para 50 u 80 invitados con mantelería y cubremanteles incluidos.'),
(2, 'Cocina Equipada (Refrigerador, Estufa con Gas y Microondas)', 1, 'disponible', 'Área de cocina con refrigerador, estufa conectada a gas, horno de microondas, tarja y barra.'),
(3, 'Trampolín Circular con Red de Seguridad', 1, 'disponible', 'Brincolín infantil en área de piso verde con malla protectora perimetral.'),
(4, 'Túnel Oruga, Casitas con Resbaladilla y Juegos Infantiles', 1, 'disponible', 'Túnel oruga morado, casitas infantiles con resbaladilla, caballito mecedor y canasta de básquetbol.'),
(5, 'Mesita y Sillitas Infantiles + Mesa de Pastel y Dulces', 2, 'disponible', 'Mesas infantiles con mini sillitas para niños y mesa principal para pastel y regalos.'),
(6, 'Servicio de Internet Wi-Fi y Ventilación del Salón', 1, 'disponible', 'Conexión a internet inalámbrico para invitados y ventiladores de techo en área de comedor.');

INSERT INTO `reglamento` (`id_regla`, `titulo`, `descripcion`, `activo`, `fecha_actualizacion`) VALUES
(1, 'Duración de 7 Horas y Horario Límite (Antes de las 11:00 PM)', 'Cada reservación incluye 7 horas continuas de evento. Por disposición del salón, todos los eventos deben concluir antes de las 11:00 de la noche (23:00 hrs).', 1, current_timestamp()),
(2, 'Dos Modalidades de Capacidad: 50 Personas y 80 Personas', 'El salón maneja dos precios según el aforo contratado: Paquete para 50 personas o Paquete para 80 personas (cupo máximo permitido).', 1, current_timestamp()),
(3, 'Servicios Incluidos en tu Renta', 'Tu reservación incluye mesas, sillas, manteles, cubremanteles, área de juegos infantiles, internet Wi-Fi, refrigerador, microondas, estufa y gas.', 1, current_timestamp()),
(4, 'Garantía de Depósito Reembolsable ($350)', 'El depósito en garantía ($350.00) protege el mobiliario, mantelería, electrodomésticos y juegos. Es 100% reembolsable tras verificar al cierre que las instalaciones se entregan sin daños.', 1, current_timestamp()),
(5, 'Cuidado del Área de Juegos (Piso Verde) y Comedor', 'Se solicita supervisar a los niños en el trampolín, resbaladillas y túnel oruga, así como mantener los alimentos y bebidas dentro del área de comedor.', 1, current_timestamp());

INSERT INTO `reservaciones` (`id_reservacion`, `id_cliente`, `fecha_evento`, `hora_inicio`, `hora_fin`, `tipo_evento`, `numero_invitados`, `estado`, `deposito`, `deposito_estado`, `observaciones`, `fecha_registro`) VALUES
(1, 1, '2026-11-21', '14:00:00', '21:00:00', 'Cumpleaños #4 de Lucas • Paquete 80 Personas (7 Horas)', 62, 'confirmada', 350.00, 'pagado', 'Activo en Salón • Incluye mantelería, cocina con gas, internet y juegos • 7 hrs de evento', '2026-11-05 12:05:00'),
(2, 3, '2026-11-22', '14:00:00', '21:00:00', 'Fiesta de Cumpleaños Mateo • Paquete 80 Personas (7 Horas)', 80, 'confirmada', 350.00, 'pagado', 'Evento de 7 horas confirmado (14:00 a 21:00 hrs).', '2026-11-01 16:20:00'),
(3, 5, '2026-11-24', '15:00:00', '22:00:00', 'Bautizo de Santiago • Paquete 50 Personas (7 Horas)', 50, 'pendiente', 350.00, 'pendiente', 'Solicitud pendiente de confirmación por el dueño.', '2026-11-08 09:50:00'),
(4, 6, '2026-11-25', '14:00:00', '21:00:00', 'Baby Shower de Valentina • Paquete 80 Personas (7 Horas)', 80, 'confirmada', 350.00, 'pagado', 'Montaje completo con manteles rosas y cocina equipada.', '2026-11-09 14:10:00'),
(5, 7, '2026-11-27', '15:00:00', '22:00:00', 'Cumpleaños #3 de Emma • Paquete 80 Personas (7 Horas)', 80, 'confirmada', 350.00, 'pagado', 'Incluye manteles, cubremanteles, juegos y cocina.', '2026-11-10 17:35:00'),
(6, 8, '2026-11-28', '16:00:00', '23:00:00', 'Fiesta Sorpresa de Emiliano #6 • Paquete 80 Personas (7 Horas)', 80, 'pendiente', 350.00, 'pendiente', 'Horario 16:00 a 23:00 hrs (cierre 11:00 PM) pendiente de confirmar.', '2026-11-12 18:15:00');

INSERT INTO `reservacion_mobiliario` (`id_reservacion_mobiliario`, `id_reservacion`, `id_mobiliario`, `cantidad`) VALUES
(1, 1, 1, 10),
(2, 1, 2, 1),
(3, 1, 3, 1),
(4, 1, 4, 1),
(5, 1, 5, 2),
(6, 1, 6, 1);

INSERT INTO `checklists` (`id_checklist`, `id_reservacion`, `tipo`, `fecha_revision`, `responsable`, `observaciones`) VALUES
(1, 1, 'pre_evento', '2026-11-21 13:15:00', 'Elena Rodríguez y Javier García', 'Inspección pre-evento aprobada al 100% antes del ingreso de invitados.'),
(2, 1, 'post_evento', '2026-11-21 21:00:00', 'Javier García y Carlos Méndez', 'Protocolo de salida al concluir las 7 horas de evento.');

INSERT INTO `checklist_detalles` (`id_detalle`, `id_checklist`, `elemento`, `estado`, `observaciones`) VALUES
(1, 1, 'Trampolín con Red, Túnel Oruga y Casitas con Resbaladilla', 'bueno', 'Juegos infantiles en piso verde limpios y verificados'),
(2, 1, 'Mesas, Sillas, Manteles y Cubremanteles Instalados', 'bueno', 'Montaje completo de acuerdo al paquete contratado (50 u 80 personas)'),
(3, 1, 'Cocina: Refrigerador, Estufa con Gas y Microondas', 'bueno', 'Electrodomésticos funcionando y suministro de gas verificado'),
(4, 1, 'Internet Wi-Fi, Iluminación y Ventiladores de Techo', 'bueno', 'Red Wi-Fi activa y ventilación lista en área de comedor'),
(5, 1, 'Higiene de Sanitarios, Botiquín y Extintor', 'bueno', 'Sanitarios limpios con insumos completos y extintor en cocina'),
(6, 2, 'Revisión de Trampolín, Resbaladillas y Juegos Infantiles', 'pendiente', 'Verificar que la malla y los juegos plásticos no presenten daños'),
(7, 2, 'Conteo de Mesas, Sillas, Manteles y Cubremanteles', 'pendiente', 'Comprobar que la mantelería y sillas estén completas y sin roturas'),
(8, 2, 'Revisión de Cocina: Estufa (Gas Cerrado), Refri y Microondas', 'pendiente', 'Verificar llave de gas cerrada y electrodomésticos limpios'),
(9, 2, 'Limpieza General y Retiro de Pertenencias', 'pendiente', 'Comedor y barra despejados antes del límite de las 11:00 PM'),
(10, 2, 'Entrega del Salón y Liberación de Depósito ($350)', 'pendiente', 'Conformidad de cierre con el anfitrión');

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
