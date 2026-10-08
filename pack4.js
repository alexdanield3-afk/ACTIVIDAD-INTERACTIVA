'use strict';
const { Q, TF, W, O, M, G, C, S, B } = require('./helpers');

const historia = {
  id: 'historia', name: 'HISTORIA', emoji: '📜', desc: 'Civilizaciones, revoluciones y grandes personajes.',
  a: '#fbbf24', b: '#ef4444', bg: ['📜', '🏺', '⚔️', '🗿'],
  teams: [
    { n: 'Los Faraones', s: '🏺' }, { n: 'Los Gladiadores', s: '⚔️' }, { n: 'Los Conquistadores', s: '🧭' }, { n: 'Los Exploradores', s: '⛵' },
    { n: 'Los Emperadores', s: '👑' }, { n: 'Los Espartanos', s: '🛡️' }, { n: 'Los Mayas', s: '🗿' }, { n: 'Los Nómadas', s: '🐪' },
  ],
  surprise: ['Un pergamino antiguo aparece…', 'El tiempo da un salto…', 'Un historiador revela un secreto…'],
  bank: {
    quiz: [
      Q('¿En qué año llegó Cristóbal Colón a América por primera vez?', '1492', '1453', '1519', '1588'),
      Q('¿Qué civilización construyó las pirámides de Giza?', 'El Antiguo Egipto', 'El Imperio romano', 'La civilización maya', 'El Imperio persa'),
      Q('¿Qué acontecimiento comenzó en 1789 y cambió la historia de Francia y de Europa?', 'La Revolución francesa', 'La Guerra de los Cien Años', 'La Revolución industrial', 'La Reforma protestante'),
      Q('¿En qué año terminó la Segunda Guerra Mundial?', '1945', '1918', '1939', '1950'),
      Q('¿Qué muro cayó en 1989 y simbolizó el fin de la Guerra Fría?', 'El Muro de Berlín', 'La Muralla china', 'El Muro de Adriano', 'El Muro de las Lamentaciones'),
      Q('¿Qué libertador lideró las campañas independentistas de Venezuela, Colombia, Ecuador, Perú y Bolivia?', 'Simón Bolívar', 'José de San Martín', 'Francisco de Miranda', 'Bernardo O’Higgins', true),
    ],
    tf: [
      TF('La Revolución industrial comenzó en Gran Bretaña.', true, 'A mediados del siglo XVIII.'),
      TF('El Imperio romano de Occidente cayó en el año 1066.', false, 'Cayó en 476; 1066 es la batalla de Hastings.'),
      TF('Colombia proclamó su independencia de España el 20 de julio de 1810.', true, 'Con el Grito de Independencia en Bogotá; la independencia se consolidó en 1819.'),
      TF('Los aztecas y los incas fueron la misma civilización.', false, 'Los aztecas vivieron en México y los incas en los Andes.'),
    ],
    wwyd: [
      W('Eres el líder de una ciudad antigua y llega una sequía muy larga. ¿Qué haces?', 'Racionar el agua, construir depósitos y buscar acuerdos con ciudades vecinas', 'Racionar el agua, pero sin pedir ayuda a nadie', 'Esperar a que llueva', 'Culpar a un grupo de la ciudad', 'Planificar y cooperar es lo que más ayuda a sobrevivir.'),
      W('Un general enemigo ofrece una tregua en plena guerra. ¿Qué haces?', 'Evaluar las condiciones, consultar a tus consejeros y negociar con cautela', 'Pedir tiempo y no responder', 'Aceptarla sin leerla', 'Atacar por sorpresa durante la negociación', 'La cautela y el consejo evitan errores.'),
    ],
    order: [
      O('Ordena estos hechos del más antiguo al más reciente.', ['Construcción de las pirámides de Giza', 'Primeros Juegos Olímpicos de la Antigua Grecia (776 a. C.)', 'Fundación de Roma (753 a. C.)', 'Caída de Roma de Occidente (476)'], ''),
      O('Ordena estos hechos del siglo XX.', ['Primera Guerra Mundial (1914-1918)', 'Crisis económica de 1929', 'Segunda Guerra Mundial (1939-1945)', 'Caída del Muro de Berlín (1989)'], ''),
    ],
    memory: [
      M('Línea de tiempo', ['1492: llegada de Colón a América', '1519: Cortés llega a México', '1532: Pizarro llega al Perú', '1810: inicia la independencia en América'], '¿Qué ocurrió en 1532?', 'Pizarro llega al Perú', 'Cortés llega a México', 'Colón llega a América', 'Inicia la independencia'),
      M('Ficha del faraón', ['Nombre: Ramsés II', 'Reinó unos 66 años', 'Capital: Pi-Ramsés', 'Batalla famosa: Qadesh'], '¿Qué batalla se asocia a este faraón?', 'Qadesh', 'Maratón', 'Hastings', 'Waterloo'),
    ],
    guess: [
      G('Personaje', ['Nació en la isla de Córcega', 'Fue general durante la Revolución francesa', 'Se coronó emperador en 1804', 'Fue derrotado en Waterloo', 'Emperador de los franceses'], ['Napoleón', 'Napoleón Bonaparte', 'Napoleon', 'Napoleon Bonaparte'], ''),
      G('Lugar', ['Fue una gran ciudad antigua', 'Tenía un coliseo', 'Fue capital de un gran imperio', 'Sus calles se llamaban vías', 'Roma'], ['Roma', 'la ciudad de roma'], ''),
    ],
    connection: [
      C(['Pirámides', 'Esfinge', 'Faraón', 'Momia', 'Papiro'], 'Antiguo Egipto', 'Roma antigua', 'Imperio inca', 'Grecia clásica'),
      C(['Cortés', 'Pizarro', 'Colón', 'Magallanes', 'Balboa'], 'Exploradores y conquistadores', 'Libertadores de América', 'Faraones', 'Emperadores romanos'),
      C(['Bolívar', 'San Martín', 'O’Higgins', 'Sucre', 'Miranda'], 'Líderes de la independencia hispanoamericana', 'Presidentes de los Estados Unidos', 'Reyes de la casa de Borbón en España', 'Conquistadores del siglo XVI en América'),
    ],
    quick: [
      Q('¿Qué civilización construyó Machu Picchu?', 'Los incas', 'Los mayas', 'Los aztecas', 'Los romanos'),
      Q('¿Cómo se llamaba el sistema de escritura del Antiguo Egipto?', 'Jeroglíficos', 'Cuneiforme', 'Runas', 'Alfabeto latino'),
      Q('¿Qué país fue gobernado por los zares hasta 1917?', 'Rusia', 'Francia', 'España', 'Alemania'),
      Q('¿Cómo se llamaba la capital del Imperio azteca?', 'Tenochtitlan', 'Cusco', 'Machu Picchu', 'Chichén Itzá'),
    ],
    strategic: [
      S('Tu imperio enfrenta una frontera inestable con recursos limitados.', 'Reforzar los puestos fronterizos y negociar', 'Lanzar una ofensiva total', 'Buscar una alianza con un reino vecino'),
      S('Una caravana comercial ofrece rutas nuevas pero peligrosas.', 'Tomar la ruta conocida y más segura', 'Tomar el atajo por el desierto', 'Contratar guías locales'),
    ],
    boss: [
      B('El Emperador del Tiempo', '¿Qué tratado puso fin a la Primera Guerra Mundial con Alemania en 1919?', 'El Tratado de Versalles', 'El Tratado de Tordesillas', 'La Paz de Westfalia', 'El Tratado de Utrecht'),
      B('La Esfinge', '¿Qué piedra, hallada en 1799, ayudó a descifrar los jeroglíficos egipcios?', 'La piedra de Rosetta', 'La piedra del Sol', 'La inscripción de Behistún', 'La estela de Mesha'),
    ],
  },
};

const ciencia = {
  id: 'ciencia', name: 'CIENCIA', emoji: '🔬', desc: 'Física, química, biología y astronomía.',
  a: '#34d399', b: '#38bdf8', bg: ['🔬', '🧪', '⚛️', '🧬'],
  teams: [
    { n: 'Los Átomos', s: '⚛️' }, { n: 'Los Neutrones', s: '🔵' }, { n: 'Los Genes', s: '🧬' }, { n: 'Los Cuásares', s: '✨' },
    { n: 'Los Electrones', s: '⚡' }, { n: 'Los Químicos', s: '🧪' }, { n: 'Los Astrónomos', s: '🔭' }, { n: 'Los Fotones', s: '💡' },
  ],
  surprise: ['Una reacción inesperada burbujea…', 'El telescopio detecta algo raro…', 'Un experimento sale distinto…'],
  bank: {
    quiz: [
      Q('¿Cuál es el planeta más grande del sistema solar?', 'Júpiter', 'Saturno', 'Neptuno', 'Tierra'),
      Q('¿Qué gas necesitan las plantas para realizar la fotosíntesis?', 'Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Hidrógeno'),
      Q('¿Cuál es el símbolo químico del oro?', 'Au', 'Ag', 'Go', 'Or'),
      Q('¿Qué órgano bombea la sangre por el cuerpo humano?', 'El corazón', 'El hígado', 'El pulmón', 'El riñón'),
      Q('¿Quién formuló la teoría de la relatividad?', 'Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Niels Bohr'),
      Q('¿Qué molécula contiene la información genética de los seres vivos?', 'ADN', 'ATP', 'Hemoglobina', 'Insulina', true),
    ],
    tf: [
      TF('El agua hierve a 100 °C al nivel del mar.', true, ''),
      TF('La luz viaja más rápido que el sonido.', true, 'La luz va a unos 300 000 km/s; el sonido en el aire, a unos 343 m/s.'),
      TF('Los humanos usamos sólo el 10 % del cerebro.', false, 'Es un mito: usamos todo el cerebro, aunque no todas las áreas a la vez.'),
      TF('Los virus son seres formados por una sola célula.', false, 'No son células: necesitan una célula huésped para reproducirse.'),
    ],
    wwyd: [
      W('Están en el laboratorio y se derrama un químico desconocido. ¿Qué hacen?', 'Alejarse, avisar al responsable y seguir el protocolo de seguridad', 'Avisar a un compañero y limpiar con guantes sin revisar la etiqueta', 'Taparlo con papel y seguir trabajando', 'Oler el líquido para identificarlo', 'Nunca se manipula una sustancia desconocida sin protocolo.'),
      W('Su experimento da un resultado distinto al esperado. ¿Qué hacen?', 'Repetirlo, revisar el método y registrar los datos tal como salieron', 'Repetirlo una vez y seguir sin documentar nada', 'Cambiar los datos para que coincidan', 'Ocultar el resultado', 'La honestidad con los datos es la base de la ciencia.'),
    ],
    order: [
      O('Ordena los planetas del más cercano al más lejano del Sol.', ['Mercurio', 'Tierra', 'Saturno', 'Neptuno'], ''),
      O('Ordena las etapas del método científico.', ['Observación', 'Hipótesis', 'Experimentación', 'Conclusiones'], ''),
    ],
    memory: [
      M('Tabla periódica rápida', ['H: hidrógeno', 'O: oxígeno', 'Na: sodio', 'Fe: hierro'], '¿Qué elemento es el Fe?', 'Hierro', 'Sodio', 'Oxígeno', 'Flúor'),
      M('Datos del experimento', ['Temperatura: 25 °C', 'Tiempo: 12 minutos', 'Volumen: 200 ml', 'Muestras: 4'], '¿Cuántas muestras había?', '4', '3', '6', '12'),
    ],
    guess: [
      G('Concepto', ['Todo está hecho de ellos', 'Tienen protones, neutrones y electrones', 'Son muy pequeños', 'Cada elemento se distingue por su número', 'El átomo'], ['átomo', 'atomo', 'el atomo', 'atomos', 'átomos'], ''),
      G('Científico', ['Nació en 1879', 'Recibió el Premio Nobel de Física en 1921', 'Propuso que E = mc²', 'Su teoría explica la gravedad como curvatura del espacio-tiempo', 'Albert Einstein'], ['Einstein', 'Albert Einstein'], ''),
    ],
    connection: [
      C(['Hidrógeno', 'Oxígeno', 'Carbono', 'Nitrógeno', 'Helio'], 'Elementos químicos', 'Planetas', 'Minerales', 'Rocas'),
      C(['Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno'], 'Planetas del sistema solar', 'Elementos químicos', 'Dioses griegos', 'Satélites naturales'),
      C(['Célula', 'Tejido', 'Órgano', 'Sistema', 'Organismo'], 'Niveles de organización de los seres vivos', 'Capas internas del planeta Tierra', 'Tipos de energía renovable y no renovable', 'Estados de la materia en la naturaleza'),
    ],
    quick: [
      Q('¿Cuántos huesos tiene aproximadamente un adulto?', '206', '150', '300', '100'),
      Q('¿Qué planeta se conoce como «el planeta rojo»?', 'Marte', 'Venus', 'Júpiter', 'Mercurio'),
      Q('¿Qué gas respiramos para vivir?', 'Oxígeno', 'Helio', 'Hidrógeno', 'Argón'),
      Q('¿En qué estado de la materia se encuentra el hielo?', 'Sólido', 'Líquido', 'Gaseoso', 'Plasma'),
    ],
    strategic: [
      S('El laboratorio tiene presupuesto para un solo equipo nuevo.', 'Comprar el equipo más fiable y básico', 'Comprar el equipo más avanzado y arriesgado', 'Pedir colaboración a otra universidad'),
      S('Aparece un fenómeno inesperado en las mediciones.', 'Repetir las mediciones con calma', 'Publicar los resultados sin confirmar', 'Pedir revisión a un grupo experto'),
    ],
    boss: [
      B('El Gran Colisionador', '¿Qué partícula se anunció como descubierta en el CERN en 2012?', 'El bosón de Higgs', 'El neutrón', 'El electrón', 'El quark top'),
      B('El Reactor Supremo', '¿Cómo se llama la reacción que une núcleos ligeros para formar uno más pesado, como ocurre en el Sol?', 'Fusión nuclear', 'Fisión nuclear', 'Combustión', 'Oxidación'),
    ],
  },
};

const geografia = {
  id: 'geografia', name: 'GEOGRAFÍA', emoji: '🌍', desc: 'Países, ríos, montañas y océanos.',
  a: '#22c55e', b: '#0ea5e9', bg: ['🌍', '🗺️', '🏔️', '🌊'],
  teams: [
    { n: 'Los Exploradores', s: '🧭' }, { n: 'Los Montañeros', s: '🏔️' }, { n: 'Los Navegantes', s: '⛵' }, { n: 'Los Cartógrafos', s: '🗺️' },
    { n: 'Los Volcanes', s: '🌋' }, { n: 'Los Glaciares', s: '🧊' }, { n: 'Los Desiertos', s: '🏜️' }, { n: 'Los Archipiélagos', s: '🏝️' },
  ],
  surprise: ['Un mapa antiguo se despliega…', 'Una brújula gira sin control…', 'Un viento nuevo cambia el rumbo…'],
  bank: {
    quiz: [
      Q('¿Cuál es el río más caudaloso de Sudamérica?', 'El Amazonas', 'El Orinoco', 'El Paraná', 'El Magdalena'),
      Q('¿Cuál es la capital de Colombia?', 'Bogotá', 'Medellín', 'Cali', 'Cartagena'),
      Q('¿Cuál es el océano más grande del planeta?', 'El Pacífico', 'El Atlántico', 'El Índico', 'El Ártico'),
      Q('¿Qué cordillera recorre Sudamérica de norte a sur?', 'Los Andes', 'Los Alpes', 'Los Apalaches', 'Los Pirineos'),
      Q('¿En qué continente está Egipto?', 'África', 'Asia', 'Europa', 'Oceanía'),
      Q('¿Cuál es el país más grande del mundo por superficie?', 'Rusia', 'Canadá', 'China', 'Estados Unidos', true),
    ],
    tf: [
      TF('El monte Everest es la montaña más alta del mundo sobre el nivel del mar.', true, ''),
      TF('Australia es a la vez un continente y un país.', true, ''),
      TF('El desierto del Sahara está en Asia.', false, 'Está en el norte de África.'),
      TF('Colombia tiene costas en el mar Caribe y en el océano Pacífico.', true, ''),
    ],
    wwyd: [
      W('Eres explorador y te quedas sin agua en el desierto. ¿Qué haces?', 'Racionar el agua que queda, descansar a la sombra en las horas de calor y avanzar de noche hacia un punto conocido', 'Quedarte quieto a la sombra esperando rescate sin racionar nada', 'Seguir caminando al mediodía', 'Beber agua salada', 'Reducir el esfuerzo en el calor ahorra agua.'),
      W('Su barco entra en una zona de niebla densa cerca de la costa. ¿Cuál es la mejor decisión?', 'Reducir la velocidad, usar radar y brújula y mantener vigías', 'Detener el barco y esperar sin avisar a nadie', 'Acelerar para salir pronto', 'Apagar los instrumentos', 'Con poca visibilidad se reduce la velocidad y se usan todos los instrumentos.'),
    ],
    order: [
      O('Ordena estos continentes por superficie, del más grande al más pequeño.', ['Asia', 'África', 'América del Norte', 'Oceanía'], ''),
      O('Ordena estas ciudades de oeste a este.', ['Los Ángeles', 'Bogotá', 'Londres', 'Tokio'], ''),
    ],
    memory: [
      M('Datos de un país', ['País: Perú', 'Capital: Lima', 'Cordillera: Los Andes', 'Moneda: sol'], '¿Cuál es la capital?', 'Lima', 'Cusco', 'Arequipa', 'Quito'),
      M('Mapa del tesoro', ['Isla A: 3 palmeras', 'Isla B: un faro', 'Isla C: una cueva', 'Isla D: un volcán'], '¿Qué había en la isla B?', 'Un faro', '3 palmeras', 'Una cueva', 'Un volcán'),
    ],
    guess: [
      G('Lugar', ['Es el río más caudaloso del mundo', 'Atraviesa varios países de Sudamérica', 'Su cuenca alberga la mayor selva tropical', 'Desemboca en el océano Atlántico', 'El Amazonas'], ['Amazonas', 'río amazonas', 'el amazonas'], ''),
      G('Lugar', ['Es una cordillera', 'Tiene volcanes activos', 'Atraviesa varios países', 'El Aconcagua es su cima más alta', 'Los Andes'], ['los andes', 'Andes', 'cordillera de los andes'], ''),
    ],
    connection: [
      C(['Bogotá', 'Lima', 'Quito', 'Caracas', 'Santiago'], 'Capitales de Sudamérica', 'Capitales de Europa', 'Ciudades de Asia', 'Puertos del Caribe'),
      C(['Nilo', 'Amazonas', 'Misisipi', 'Yangtsé', 'Danubio'], 'Ríos importantes del mundo', 'Cordilleras', 'Mares', 'Lagos'),
      C(['Sahara', 'Atacama', 'Gobi', 'Kalahari', 'Mojave'], 'Desiertos del mundo', 'Montañas', 'Lagos', 'Selvas'),
    ],
    quick: [
      Q('¿Cuál es el continente más poblado?', 'Asia', 'África', 'Europa', 'América'),
      Q('¿Cómo se llama el mayor desierto cálido del mundo?', 'Sahara', 'Gobi', 'Atacama', 'Kalahari'),
      Q('¿Qué país tiene forma de bota?', 'Italia', 'España', 'Grecia', 'Portugal'),
      Q('¿En qué país está la torre Eiffel?', 'Francia', 'Italia', 'Reino Unido', 'Alemania'),
    ],
    strategic: [
      S('Una expedición debe cruzar una cordillera con clima cambiante.', 'Acampar y esperar un día despejado', 'Cruzar enseguida por el paso más corto', 'Contratar guías de la zona'),
      S('Su barco puede tomar un canal largo y seguro o un atajo con corrientes.', 'Tomar la ruta larga y segura', 'Tomar el atajo con corrientes', 'Consultar el mapa con un navegante aliado'),
    ],
    boss: [
      B('El Titán de los Océanos', '¿Cuál es el punto más profundo de los océanos, ubicado en el Pacífico?', 'La fosa de las Marianas', 'La fosa de Puerto Rico', 'La fosa de Atacama', 'El cañón de Monterrey'),
      B('El Coloso de los Andes', '¿Cuál es la montaña más alta de América?', 'El Aconcagua', 'El Chimborazo', 'El Denali', 'El Huascarán'),
    ],
  },
};

const educacion = {
  id: 'educacion', name: 'EDUCACIÓN', emoji: '🎓', desc: 'Pedagogía, evaluación, didáctica y aprendizaje.',
  a: '#f59e0b', b: '#8b5cf6', bg: ['🎓', '📚', '✏️', '🏫'],
  teams: [
    { n: 'Los Aprendices', s: '📚' }, { n: 'Los Pedagogos', s: '🎓' }, { n: 'Los Docentes', s: '✏️' }, { n: 'Los Tutores', s: '🧭' },
    { n: 'Los Investigadores', s: '🔎' }, { n: 'Los Estrategas', s: '♟️' }, { n: 'Los Innovadores', s: '💡' }, { n: 'Los Mentores', s: '🌟' },
  ],
  surprise: ['Suena el timbre de una sorpresa…', 'El rector pasa por el salón…', 'Una idea didáctica ilumina el aula…'],
  bank: {
    quiz: [
      Q('¿Qué autor propuso las etapas del desarrollo cognitivo (sensoriomotora, preoperacional, operaciones concretas y formales)?', 'Jean Piaget', 'Lev Vygotsky', 'B. F. Skinner', 'Paulo Freire'),
      Q('¿Cómo se llama el concepto de Vygotsky sobre lo que un estudiante logra con ayuda?', 'Zona de desarrollo próximo', 'Aprendizaje memorístico', 'Educación bancaria', 'Inteligencia emocional'),
      Q('¿Qué es una rúbrica de evaluación?', 'Una tabla con criterios y niveles de desempeño', 'Un examen de selección múltiple con clave', 'Un horario semanal de clases del grupo', 'Un formato para planear las actividades'),
      Q('¿Qué significan las siglas TIC en educación?', 'Tecnologías de la información y la comunicación', 'Técnicas de investigación científica', 'Talleres de integración curricular', 'Trabajo individual constante'),
      Q('¿Cómo se llama la evaluación que se realiza durante el proceso para mejorar la enseñanza y el aprendizaje?', 'Evaluación formativa', 'Evaluación sumativa', 'Evaluación diagnóstica', 'Evaluación final'),
      Q('¿Qué autor brasileño escribió «Pedagogía del oprimido»?', 'Paulo Freire', 'Jean Piaget', 'John Dewey', 'María Montessori', true),
    ],
    tf: [
      TF('La evaluación sumativa se realiza al final de un proceso para valorar los resultados.', true, ''),
      TF('Todas las personas aprenden de la misma manera y al mismo ritmo.', false, 'Existen diferencias individuales que conviene considerar.'),
      TF('El aprendizaje colaborativo implica que los estudiantes trabajen juntos hacia metas comunes.', true, ''),
      TF('Dar retroalimentación específica ayuda más al aprendizaje que sólo poner una nota.', true, ''),
    ],
    wwyd: [
      W('Un estudiante casi nunca participa en clase. ¿Qué haces como docente?', 'Conversar en privado para entender su situación y ofrecerle formas de participar que le resulten cómodas', 'Ignorarlo mientras entregue sus tareas', 'Llamarlo constantemente delante de todos', 'Bajarle la nota por no participar', 'Conocer la situación permite apoyar mejor.'),
      W('Más de la mitad del grupo falla un examen. ¿Cuál es la mejor decisión?', 'Analizar qué temas no se entendieron y volver a trabajarlos con otra estrategia', 'Dar una clase de repaso rápida sin analizar el resultado', 'Culpar al grupo por no estudiar', 'Aprobar a todos sin revisar nada', 'El resultado es información para mejorar la enseñanza.'),
    ],
    order: [
      O('Ordena los pasos para planear una clase.', ['Definir el objetivo de aprendizaje', 'Diseñar las actividades', 'Elegir cómo evaluar', 'Reflexionar y ajustar después de la clase'], ''),
      O('Ordena los niveles de la taxonomía de Bloom revisada, de menor a mayor complejidad.', ['Recordar', 'Comprender', 'Aplicar', 'Crear'], ''),
    ],
    memory: [
      M('Plan de la sesión', ['Tema: fracciones', 'Duración: 90 minutos', 'Actividad: trabajo en parejas', 'Evaluación: ticket de salida'], '¿Cuánto duraba la sesión?', '90 minutos', '60 minutos', '45 minutos', '120 minutos'),
      M('Lista de grupos', ['Grupo A: 24 estudiantes', 'Grupo B: 28 estudiantes', 'Grupo C: 22 estudiantes', 'Grupo D: 30 estudiantes'], '¿Cuántos estudiantes tenía el grupo B?', '28', '24', '22', '30'),
    ],
    guess: [
      G('Concepto', ['Es una tabla', 'Tiene criterios y niveles', 'Ayuda a calificar con claridad', 'Conviene compartirla con el estudiante antes de la tarea', 'La rúbrica'], ['rúbrica', 'rubrica', 'una rubrica'], ''),
      G('Persona', ['Fue una médica italiana', 'Creó un método basado en la autonomía de los niños', 'Sus aulas usan materiales manipulativos', 'Su método lleva su apellido', 'María Montessori'], ['Montessori', 'María Montessori', 'Maria Montessori'], ''),
    ],
    connection: [
      C(['Piaget', 'Vygotsky', 'Freire', 'Montessori', 'Dewey'], 'Pedagogos y teóricos de la educación', 'Científicos', 'Filósofos griegos', 'Matemáticos'),
      C(['Diagnóstica', 'Formativa', 'Sumativa', 'Autoevaluación', 'Coevaluación'], 'Tipos o enfoques de evaluación', 'Estilos de enseñanza', 'Niveles educativos', 'Materiales didácticos'),
      C(['Pizarra', 'Proyector', 'Tableta', 'Libro', 'Cuaderno'], 'Recursos didácticos', 'Tipos de evaluación', 'Modelos pedagógicos', 'Niveles escolares'),
    ],
    quick: [
      Q('¿Cómo se llama el instrumento que lista criterios para evaluar un trabajo?', 'Rúbrica', 'Crucigrama', 'Boletín', 'Telegrama'),
      Q('¿Cómo se llama el documento donde se organiza una clase?', 'Plan de clase', 'Plano', 'Pronóstico', 'Panfleto'),
      Q('¿Cómo se llama el aprendizaje que se logra trabajando en equipo?', 'Colaborativo', 'Memorístico', 'Pasivo', 'Aislado'),
      Q('¿Qué debe responder un buen objetivo de aprendizaje?', '¿Qué podrán hacer los estudiantes al terminar?', '¿Cuántos libros hay en la biblioteca?', '¿A qué hora termina la jornada escolar?', '¿Quién llegó tarde a la primera clase?'),
    ],
    strategic: [
      S('Debes enseñar un tema difícil en sólo 50 minutos.', 'Priorizar los conceptos clave y usar un ejemplo claro', 'Intentar cubrir todo el tema a gran velocidad', 'Pedir apoyo a un colega con experiencia'),
      S('El grupo está muy disperso después del recreo.', 'Empezar con una actividad corta que capte su atención', 'Seguir con la explicación sin cambiar nada', 'Pedir ayuda al orientador escolar'),
    ],
    boss: [
      B('El Gran Examen', '¿Qué propone el Diseño Universal para el Aprendizaje (DUA)?', 'Ofrecer varias formas de presentar, expresar y motivar para que todos aprendan', 'Dar la misma actividad y el mismo material a todos los estudiantes por igual', 'Separar a los estudiantes en grupos fijos según su nivel de rendimiento', 'Eliminar las evaluaciones y los trabajos para no presionar al grupo'),
      B('El Laberinto del Currículo', '¿Qué plantea la evaluación auténtica?', 'Valorar el desempeño en tareas reales y significativas', 'Medir sólo la memoria con exámenes escritos', 'Evaluar únicamente al final del año escolar', 'Comparar a los estudiantes entre sí con un ranking'),
    ],
  },
};

module.exports = [historia, ciencia, geografia, educacion];
