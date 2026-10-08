'use strict';
const { Q, TF, W, O, M, G, C, S, B } = require('./helpers');

const scifi = {
  id: 'scifi', name: 'CIENCIA FICCIÓN', emoji: '🚀', desc: 'Naves, robots, aliens y futuros posibles.',
  a: '#22d3ee', b: '#a855f7', bg: ['🚀', '👽', '🤖', '🪐'],
  teams: [
    { n: 'Los Androides', s: '🤖' }, { n: 'Los Exploradores Estelares', s: '🚀' }, { n: 'Los Xenomorfos', s: '👽' }, { n: 'Los Replicantes', s: '🧬' },
    { n: 'Los Cíborgs', s: '⚙️' }, { n: 'Los Navegantes del Vacío', s: '🛸' }, { n: 'Los Terraformadores', s: '🪐' }, { n: 'Los Viajeros del Tiempo', s: '⏳' },
  ],
  surprise: ['Una señal extraña llega desde el espacio…', 'La IA de la nave tiene una idea…', 'Un agujero de gusano se abre…'],
  bank: {
    quiz: [
      Q('¿Quién escribió la novela «Frankenstein», considerada una de las primeras de ciencia ficción?', 'Mary Shelley', 'Julio Verne', 'H. G. Wells', 'Isaac Asimov'),
      Q('¿Cuáles son las tres leyes que protegen a los humanos en los relatos de robots de Isaac Asimov?', 'Las leyes de la robótica', 'Las leyes de Newton', 'Las leyes de Murphy', 'Las leyes de Kepler'),
      Q('¿Qué novela de H. G. Wells narra una invasión de marcianos a la Tierra?', 'La guerra de los mundos', 'La máquina del tiempo', 'El hombre invisible', 'La isla del doctor Moreau'),
      Q('¿Cómo se llama el planeta desértico donde se desarrolla la novela «Dune» de Frank Herbert?', 'Arrakis', 'Tatooine', 'Pandora', 'Solaris'),
      Q('¿Qué escritor es autor de «Veinte mil leguas de viaje submarino»?', 'Julio Verne', 'Isaac Asimov', 'Arthur C. Clarke', 'Ray Bradbury'),
      Q('¿Cómo se llama la supercomputadora que controla la nave en «2001: Una odisea del espacio»?', 'HAL 9000', 'Skynet', 'Mother', 'Deep Thought', true),
    ],
    tf: [
      TF('El término «robot» procede de una obra de teatro del escritor checo Karel Čapek.', true, 'La obra «R.U.R.» (1920) popularizó la palabra, derivada de «robota», trabajo forzado.'),
      TF('«Blade Runner» está basada en una novela de Philip K. Dick.', true, 'Se basa en «¿Sueñan los androides con ovejas eléctricas?».'),
      TF('Según la física actual, viajar más rápido que la luz ya ha sido logrado en laboratorio con naves.', false, 'No se ha logrado; la relatividad indica que nada con masa puede alcanzar la velocidad de la luz.'),
      TF('Julio Verne imaginó viajes a la Luna en una novela publicada en el siglo XIX.', true, '«De la Tierra a la Luna» se publicó en 1865.'),
    ],
    wwyd: [
      W('Eres capitán de una nave y la IA de a bordo empieza a ignorar órdenes. ¿Qué haces?', 'Aislar los sistemas críticos, revisar sus registros y reiniciarla con supervisión de toda la tripulación', 'Pedirle que se explique y seguir adelante mientras tanto', 'Apagar todos los sistemas de golpe sin plan', 'Ignorar el problema para no retrasar la misión', 'Contener primero y diagnosticar con el equipo es lo más seguro.'),
      W('Descubren una señal alienígena en un planeta deshabitado. ¿Cuál es la mejor decisión?', 'Analizar la señal desde la órbita, avisar a la base y preparar un protocolo de primer contacto', 'Descender de inmediato sin informar a nadie', 'Responder con toda la información de la Tierra', 'Destruir la fuente de la señal', 'Observar y consultar antes de actuar reduce riesgos.'),
    ],
    order: [
      O('Ordena de menor a mayor distancia al Sol.', ['Mercurio', 'Marte', 'Júpiter', 'Neptuno'], 'Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano, Neptuno.'),
      O('Ordena estos hitos de la exploración espacial.', ['Sputnik 1 (1957)', 'Yuri Gagarin en órbita (1961)', 'Llegada a la Luna del Apolo 11 (1969)', 'Primer módulo de la Estación Espacial Internacional (1998)'], ''),
    ],
    memory: [
      M('Bitácora de la nave', ['Nave: Aurora-7', 'Tripulación: 6', 'Destino: Kepler-22b', 'Combustible: 80 %'], '¿Cuál era el destino de la nave?', 'Kepler-22b', 'Proxima b', 'Marte', 'Europa'),
      M('Panel de control', ['Escudos: 90 %', 'Oxígeno: 72 %', 'Motores: 100 %', 'Comunicaciones: 40 %'], '¿Qué porcentaje tenían los escudos?', '90 %', '72 %', '100 %', '40 %'),
    ],
    guess: [
      G('Personaje', ['Fue construido por un científico para ser un ejemplo de inteligencia artificial', 'Aparece en varias novelas de Isaac Asimov', 'Su cerebro positrónico sigue las tres leyes', 'Se parece a un humano pero está hecho de metal y circuitos', 'Un humanoide mecánico: ¡un robot!'], ['robot', 'androide', 'un robot'], ''),
      G('Objeto', ['Permite llegar a lugares inalcanzables', 'Se ha visto en películas y series desde hace décadas', 'Puede viajar por el espacio y por el hiperespacio', 'Tiene motores, escudos y tripulación', 'Nave espacial'], ['nave espacial', 'nave', 'astronave'], ''),
    ],
    connection: [
      C(['Skynet', 'HAL 9000', 'Matrix', 'Ultrón', 'GLaDOS'], 'IAs malvadas o peligrosas de la ficción', 'Planetas imaginarios de novelas famosas', 'Naves espaciales de series de televisión', 'Robots amistosos de películas infantiles'),
      C(['Dune', 'Fundación', 'Neuromante', 'Solaris', 'Ubik'], 'Novelas de ciencia ficción', 'Películas de fantasía medieval', 'Planetas habitables', 'Series de misterio'),
      C(['Tatooine', 'Arrakis', 'Pandora', 'Vulcano', 'Krypton'], 'Planetas ficticios', 'Satélites naturales', 'Constelaciones', 'Galaxias reales'),
    ],
    quick: [
      Q('¿Cuál es el planeta más cercano al Sol?', 'Mercurio', 'Venus', 'Marte', 'Júpiter'),
      Q('¿Cómo se llama el androide dorado de «La guerra de las galaxias»?', 'C-3PO', 'R2-D2', 'BB-8', 'Wall-E'),
      Q('¿Qué nombre tiene la nave del capitán Kirk?', 'Enterprise', 'Millennium Falcon', 'Nostromo', 'Serenity'),
      Q('¿Qué color tiene el planeta Marte?', 'Rojo', 'Azul', 'Verde', 'Amarillo'),
    ],
    strategic: [
      S('Una nave desconocida pide permiso para acercarse a la estación espacial.', 'Mantener los escudos y observar a distancia', 'Dejarla acoplar sin revisión', 'Consultar con la flota aliada'),
      S('Detectan un asteroide con minerales valiosos, pero cerca de un campo de radiación.', 'Extraer sólo la parte exterior, más segura', 'Entrar al núcleo del campo a toda velocidad', 'Pedir un dron minero a los aliados'),
    ],
    boss: [
      B('La IA Suprema', '¿Qué prueba propuso Alan Turing para decidir si una máquina puede pensar como un humano?', 'El test de Turing o «juego de imitación»', 'El test de Voight-Kampff de «Blade Runner»', 'La prueba de manchas de tinta de Rorschach', 'El test de Bechdel para obras de ficción'),
      B('El Gran Agujero Negro', '¿Cómo se llama la frontera de un agujero negro más allá de la cual nada puede escapar?', 'Horizonte de sucesos', 'Órbita geoestacionaria', 'Cinturón de Kuiper', 'Corona solar'),
    ],
  },
};

const dinos = {
  id: 'dinos', name: 'DINOSAURIOS', emoji: '🦖', desc: 'El mundo de los gigantes del Mesozoico.',
  a: '#84cc16', b: '#f59e0b', bg: ['🦖', '🦕', '🌴', '🥚'],
  teams: [
    { n: 'Los Tiranosaurios', s: '🦖' }, { n: 'Los Velociraptores', s: '🦎' }, { n: 'Los Triceratops', s: '🦏' }, { n: 'Los Braquiosaurios', s: '🦕' },
    { n: 'Los Pterodáctilos', s: '🦅' }, { n: 'Los Estegosaurios', s: '🐊' }, { n: 'Los Anquilosaurios', s: '🐢' }, { n: 'Los Espinosaurios', s: '🌋' },
  ],
  surprise: ['La tierra tiembla bajo pasos gigantes…', 'Un huevo gigante empieza a romperse…', 'Un meteorito ilumina el cielo…'],
  bank: {
    quiz: [
      Q('¿En qué era geológica vivieron los dinosaurios no avianos?', 'Mesozoico', 'Paleozoico', 'Cenozoico', 'Precámbrico'),
      Q('¿Cómo se llama la ciencia que estudia los fósiles?', 'Paleontología', 'Arqueología', 'Geología', 'Antropología'),
      Q('¿Qué dinosaurio carnívoro es famoso por sus cortos brazos y su enorme mandíbula?', 'Tyrannosaurus rex', 'Triceratops', 'Stegosaurus', 'Diplodocus'),
      Q('¿Qué evento se asocia con la extinción de los dinosaurios hace unos 66 millones de años?', 'El impacto de un gran asteroide', 'Una glaciación', 'Un virus', 'Una explosión de la Luna'),
      Q('¿Qué grupo de animales actuales desciende de los dinosaurios?', 'Las aves', 'Los reptiles marinos', 'Los mamíferos', 'Los anfibios'),
      Q('¿Qué dinosaurio tenía tres cuernos y un gran collar óseo en la cabeza?', 'Triceratops', 'Velociraptor', 'Ankylosaurus', 'Spinosaurus', true),
    ],
    tf: [
      TF('Los dinosaurios y los humanos convivieron hace millones de años.', false, 'Los dinosaurios se extinguieron hace unos 66 millones de años; los humanos aparecieron mucho después.'),
      TF('Muchos dinosaurios tenían plumas.', true, 'Hay fósiles con plumas, sobre todo en los terópodos.'),
      TF('El pterodáctilo era un dinosaurio.', false, 'Era un reptil volador (pterosaurio), no un dinosaurio en sentido estricto.'),
      TF('El Tyrannosaurus rex vivió en el período Cretácico.', true, 'Vivió al final del Cretácico, hace unos 68-66 millones de años.'),
    ],
    wwyd: [
      W('Eres paleontólogo y encuentras un fósil enorme en una excavación. ¿Qué haces?', 'Documentar su posición con fotos y mapas, excavar con cuidado y avisar a las autoridades científicas', 'Sacarlo rápido con maquinaria para llevarlo al museo', 'Llevarte los huesos más bonitos de recuerdo', 'Dejarlo sin avisar a nadie', 'Documentar y excavar con cuidado conserva el valor científico.'),
      W('Una expedición se topa con un nido de huevos de dinosaurio. ¿Cuál es la mejor decisión?', 'Observar a distancia, registrar el hallazgo y no alterar el sitio', 'Recoger un huevo para estudiarlo en el campamento', 'Mover los huevos a otro lugar para protegerlos', 'Romper uno para ver qué hay dentro', 'No alterar el sitio permite estudiarlo bien.'),
    ],
    order: [
      O('Ordena los períodos del Mesozoico del más antiguo al más reciente.', ['Triásico', 'Jurásico', 'Cretácico'], ''),
      O('Ordena de menor a mayor tamaño (aproximado).', ['Compsognathus', 'Velociraptor', 'Tyrannosaurus rex', 'Argentinosaurus'], 'El Argentinosaurus es de los mayores dinosaurios conocidos.'),
    ],
    memory: [
      M('Ficha del dinosaurio', ['Nombre: Rexito', 'Dieta: carnívoro', 'Longitud: 12 metros', 'Hábitat: bosque húmedo'], '¿Qué longitud tenía?', '12 metros', '8 metros', '20 metros', '5 metros'),
      M('Campamento de excavación', ['Fósil A: costilla', 'Fósil B: diente', 'Fósil C: garra', 'Fósil D: cráneo'], '¿Qué fósil era el C?', 'Una garra', 'Una costilla', 'Un diente', 'Un cráneo'),
    ],
    guess: [
      G('Dinosaurio', ['Vivió en el Cretácico', 'Se cree que cazaba en manada', 'Era pequeño, ágil y con una garra curva en cada pie', 'Su nombre significa «ladrón veloz»', 'Famoso por «Jurassic Park»'], ['Velociraptor', 'raptor'], ''),
      G('Objeto', ['Permite saber la edad de las rocas', 'Se forma cuando restos de seres vivos se mineralizan', 'Se estudia en la paleontología', 'Puede ser un hueso, una huella o una pluma', 'Resto de un ser vivo conservado en la roca'], ['fósil', 'fosil'], ''),
    ],
    connection: [
      C(['Triásico', 'Jurásico', 'Cretácico', 'Mesozoico'], 'Divisiones del tiempo geológico', 'Tipos de rocas', 'Capas de la atmósfera', 'Eras de la humanidad'),
      C(['Tiranosaurio', 'Velociraptor', 'Alosaurio', 'Espinosaurio'], 'Dinosaurios carnívoros', 'Dinosaurios herbívoros', 'Reptiles marinos', 'Aves actuales'),
      C(['Triceratops', 'Estegosaurio', 'Anquilosaurio', 'Diplodocus'], 'Dinosaurios herbívoros', 'Dinosaurios carnívoros', 'Pterosaurios', 'Mamíferos prehistóricos'),
    ],
    quick: [
      Q('¿Cómo se llama el dinosaurio con placas en la espalda y púas en la cola?', 'Estegosaurio', 'Triceratops', 'Velociraptor', 'Diplodocus'),
      Q('¿Qué comían los dinosaurios herbívoros?', 'Plantas', 'Carne', 'Insectos', 'Peces'),
      Q('¿Cómo se llaman las huellas fosilizadas de pisadas de animales?', 'Icnitas', 'Estalactitas', 'Géiseres', 'Meteoritos'),
      Q('¿De qué película viene «Isla Nublar»?', 'Jurassic Park', 'Godzilla', 'King Kong', 'Avatar'),
    ],
    strategic: [
      S('Encuentran huellas recientes de un gran carnívoro cerca del campamento.', 'Reforzar el campamento y vigilar por turnos', 'Seguir las huellas para fotografiarlo', 'Pedir ayuda a los guardabosques aliados'),
      S('Un río bloquea el camino y se ve un puente de troncos viejos.', 'Construir una balsa y cruzar con calma', 'Cruzar corriendo por los troncos', 'Pedir cuerdas al equipo aliado'),
    ],
    boss: [
      B('El Gran Tiranosaurio', '¿Qué evidencia geológica se asocia al impacto de asteroide del final del Cretácico?', 'Una capa de iridio y el cráter de Chicxulub', 'Una capa de carbón repartida por toda la Tierra', 'El cráter volcánico del monte Vesubio en Italia', 'Una capa de sal marina que cubrió los continentes'),
      B('El Rey del Cretácico', '¿Cuál de estos animales NO es un dinosaurio?', 'Dimetrodon', 'Velociraptor', 'Triceratops', 'Diplodocus', 'El Dimetrodon es un sinápsido, más cercano a los mamíferos.'),
    ],
  },
};

const mitologia = {
  id: 'mitologia', name: 'MITOLOGÍA', emoji: '🏛️', desc: 'Dioses, héroes y monstruos de Grecia, Roma y más.',
  a: '#f59e0b', b: '#6366f1', bg: ['🏛️', '⚡', '🔱', '🦉'],
  teams: [
    { n: 'Los Olímpicos', s: '⚡' }, { n: 'Los Titanes', s: '🏛️' }, { n: 'Los Argonautas', s: '⛵' }, { n: 'Los Centauros', s: '🏹' },
    { n: 'Las Amazonas', s: '🛡️' }, { n: 'Los Minotauros', s: '🐂' }, { n: 'Los Cíclopes', s: '👁️' }, { n: 'Los Semidioses', s: '🔱' },
  ],
  surprise: ['Los dioses del Olimpo te observan…', 'Las Moiras tejen tu destino…', 'Un oráculo susurra una profecía…'],
  bank: {
    quiz: [
      Q('¿Quién era el rey de los dioses en la mitología griega?', 'Zeus', 'Poseidón', 'Hades', 'Apolo'),
      Q('¿Cómo se llamaba el monstruo con cabeza de toro encerrado en el laberinto de Creta?', 'El Minotauro', 'Cerbero', 'La Hidra', 'La Quimera'),
      Q('¿Qué diosa griega nació de la cabeza de Zeus y representa la sabiduría?', 'Atenea', 'Afrodita', 'Hera', 'Artemisa'),
      Q('¿Qué héroe griego realizó doce trabajos como penitencia?', 'Heracles (Hércules)', 'Aquiles', 'Odiseo', 'Perseo'),
      Q('¿Quién era el dios romano equivalente a Zeus?', 'Júpiter', 'Marte', 'Neptuno', 'Vulcano'),
      Q('¿Qué ciudad fue cercada durante diez años en la Ilíada y cayó gracias a un caballo de madera?', 'Troya', 'Esparta', 'Atenas', 'Micenas', true),
    ],
    tf: [
      TF('Medusa tenía serpientes en lugar de cabello y convertía en piedra a quien la mirara.', true, ''),
      TF('Poseidón era el dios griego del fuego y la forja.', false, 'Poseidón era el dios del mar; el dios de la forja era Hefesto.'),
      TF('Pegaso era un caballo alado de la mitología griega.', true, 'Nació de la sangre de Medusa.'),
      TF('Odiseo (Ulises) tardó unos diez años en volver a Ítaca tras la guerra de Troya.', true, 'Su viaje de regreso se narra en la Odisea.'),
    ],
    wwyd: [
      W('Un oráculo les advierte que un viaje en barco acabará mal si zarpan hoy. ¿Qué hacen?', 'Escuchar el consejo, preparar el barco y esperar el mejor momento para partir', 'Zarpar de inmediato para demostrar que no les da miedo', 'Pedir otro oráculo y hacer lo que prefieran', 'Quemar el templo del oráculo', 'Prudencia y preparación son virtudes de los héroes.'),
      W('Encuentran a un monstruo dormido que custodia un tesoro. ¿Cuál es la mejor decisión?', 'Idear un plan con trampas y distracciones antes de acercarse', 'Atacarlo directamente mientras duerme', 'Despertarlo para negociar', 'Robar el tesoro haciendo mucho ruido', 'Un plan evita acciones temerarias.'),
    ],
    order: [
      O('Ordena los trabajos de Heracles según su orden tradicional.', ['El león de Nemea', 'La hidra de Lerna', 'La cierva de Cerinea', 'El jabalí de Erimanto'], ''),
      O('Ordena estos hechos del mito de Troya.', ['Paris rapta a Helena', 'Comienza el sitio de Troya', 'Los griegos entran con el caballo', 'Troya es incendiada'], ''),
    ],
    memory: [
      M('Panteón', ['Zeus: rayo', 'Poseidón: tridente', 'Hades: casco de invisibilidad', 'Ares: lanza'], '¿Qué objeto tenía Poseidón?', 'Un tridente', 'Un rayo', 'Un casco', 'Una lanza'),
      M('Las musas', ['Clío: historia', 'Talía: comedia', 'Urania: astronomía', 'Terpsícore: danza'], '¿De qué era musa Urania?', 'Astronomía', 'Historia', 'Comedia', 'Danza'),
    ],
    guess: [
      G('Héroe', ['Su talón era su único punto débil', 'Era hijo de una nereida', 'Luchó en la guerra de Troya', 'Mató al príncipe Héctor', 'El héroe del talón'], ['Aquiles', 'Achilles'], ''),
      G('Monstruo', ['Vivía en el inframundo', 'Era hijo de Tifón y Equidna', 'Tenía varias cabezas', 'Guardaba la puerta de Hades', 'Perro de tres cabezas'], ['Cerbero', 'cerbero'], ''),
    ],
    connection: [
      C(['Zeus', 'Hera', 'Poseidón', 'Atenea', 'Apolo'], 'Dioses del Olimpo', 'Titanes', 'Héroes de Troya', 'Monstruos del mar'),
      C(['Hidra', 'Quimera', 'Cerbero', 'Medusa', 'Minotauro'], 'Monstruos de la mitología griega', 'Héroes de la Odisea', 'Dioses romanos', 'Planetas'),
      C(['Marte', 'Venus', 'Júpiter', 'Mercurio', 'Neptuno'], 'Nombres de dioses romanos que dan nombre a planetas', 'Dioses egipcios representados con cabezas de animales', 'Titanes derrotados por Zeus en la Titanomaquia', 'Héroes griegos que participaron en la guerra de Troya'),
    ],
    quick: [
      Q('¿Cómo se llama el dios griego del mar?', 'Poseidón', 'Hades', 'Hermes', 'Ares'),
      Q('¿Qué diosa es la de la belleza y el amor?', 'Afrodita', 'Atenea', 'Deméter', 'Hestia'),
      Q('¿Dónde vivían los dioses griegos?', 'Monte Olimpo', 'Monte Everest', 'Monte Sinaí', 'Monte Fuji'),
      Q('¿Qué héroe mató a Medusa?', 'Perseo', 'Teseo', 'Jasón', 'Heracles'),
    ],
    strategic: [
      S('Una sirena les ofrece guiarlos por un canal peligroso a cambio de un favor.', 'Rechazar y rodear por la ruta larga', 'Aceptar el trato y cruzar el canal', 'Pedir consejo a un sabio del puerto'),
      S('Encuentran el hilo de Ariadna para salir de un laberinto, pero hay otro pasillo con un tesoro.', 'Seguir el hilo y salir', 'Arriesgarse a buscar el tesoro', 'Pedir ayuda a los marineros aliados'),
    ],
    boss: [
      B('La Hidra de Lerna', '¿Qué ocurría cuando se cortaba una cabeza de la Hidra de Lerna?', 'Le crecían dos nuevas', 'Moría al instante', 'Se volvía invisible', 'Se transformaba en piedra'),
      B('Cronos, el Titán del Tiempo', '¿Quién derrotó a Cronos y a los titanes en la Titanomaquia, liderando a los olímpicos?', 'Zeus', 'Hades', 'Apolo', 'Prometeo'),
    ],
  },
};

const futbol = {
  id: 'futbol', name: 'FÚTBOL', emoji: '⚽', desc: 'Mundiales, ligas, leyendas y reglas del juego.',
  a: '#22c55e', b: '#facc15', bg: ['⚽', '🏆', '🥅', '👟'],
  teams: [
    { n: 'Los Cracks', s: '⚽' }, { n: 'Los Goleadores', s: '🥅' }, { n: 'Los Cañoneros', s: '🔥' }, { n: 'Los Titanes del Balón', s: '⚡' },
    { n: 'Los Capitanes', s: '🎖️' }, { n: 'Los Cóndores', s: '🦅' }, { n: 'Los Tigres', s: '🐯' }, { n: 'Los Campeones', s: '🏆' },
  ],
  surprise: ['El árbitro saca una tarjeta sorpresa…', 'La hinchada se vuelve loca…', 'Un gol en el último minuto…'],
  bank: {
    quiz: [
      Q('¿Cuántos jugadores de cada equipo están en el campo en un partido oficial?', '11', '9', '10', '12'),
      Q('¿Qué país ha ganado más Copas del Mundo masculinas?', 'Brasil', 'Alemania', 'Italia', 'Argentina'),
      Q('¿Qué país organizó la primera Copa del Mundo en 1930 y la ganó?', 'Uruguay', 'Brasil', 'Argentina', 'Italia'),
      Q('¿Cada cuántos años se juega el Mundial de fútbol masculino?', 'Cuatro', 'Dos', 'Tres', 'Cinco'),
      Q('¿Cómo se llama el trofeo que se entrega al campeón del Mundial desde 1974?', 'Copa del Mundo de la FIFA', 'Copa Jules Rimet', 'Balón de Oro', 'Copa Libertadores'),
      Q('¿Qué selección ganó el Mundial de Catar 2022?', 'Argentina', 'Francia', 'Croacia', 'Marruecos', true),
    ],
    tf: [
      TF('Un partido de fútbol dura 90 minutos más el tiempo añadido.', true, 'Dos tiempos de 45 minutos.'),
      TF('El portero puede usar las manos en cualquier parte del campo.', false, 'Sólo dentro de su propia área de penal.'),
      TF('Un jugador puede estar en fuera de juego si, al recibir el pase, está más cerca de la línea de gol rival que el balón y que el penúltimo defensor.', true, 'Es una explicación simplificada de la regla.'),
      TF('Colombia ha ganado una Copa del Mundo masculina.', false, 'Su mejor resultado fue llegar a cuartos de final en 2014.'),
    ],
    wwyd: [
      W('Son el capitán y el equipo va perdiendo 0-1 al entrar al segundo tiempo. ¿Qué hacen?', 'Mantener la calma, ajustar la táctica y motivar al equipo para buscar el empate con orden', 'Atacar con todos los jugadores dejando la defensa sola', 'Discutir con el árbitro sin parar', 'Rendirse y esperar el pitido final', 'Una reacción ordenada suele ser mejor que la desesperación.'),
      W('Un compañero comete una falta violenta y el rival cae lesionado. ¿Cuál es la mejor decisión?', 'Pedir calma, interesarse por el rival y aceptar la decisión del árbitro', 'Defender la falta diciendo que fue accidental', 'Provocar al rival lesionado', 'Pedir al árbitro que ignore la acción', 'El juego limpio es parte del deporte.'),
    ],
    order: [
      O('Ordena estos campeones del Mundial de más antiguo a más reciente.', ['Uruguay (1930)', 'Brasil (1958)', 'Argentina (1986)', 'Francia (1998)'], ''),
      O('Ordena las etapas de un torneo mundialista.', ['Fase de grupos', 'Octavos de final', 'Cuartos de final', 'Final'], ''),
    ],
    memory: [
      M('Alineación del equipo', ['Portero: Rojas', 'Capitán: Díaz', 'Delantero: Mora', 'Camiseta del delantero: número 9'], '¿Quién era el capitán?', 'Díaz', 'Rojas', 'Mora', 'Pérez'),
      M('Tabla de posiciones', ['1.º Tigres: 12 puntos', '2.º Cóndores: 10 puntos', '3.º Cracks: 9 puntos', '4.º Cañoneros: 5 puntos'], '¿Cuántos puntos tenían los Cóndores?', '10', '12', '9', '5'),
    ],
    guess: [
      G('Objeto', ['Es redondo', 'Suele tener 32 paneles', 'Se patea y se cabecea', 'Se usa en los estadios', 'El balón'], ['balón', 'balon', 'pelota'], ''),
      G('Competición', ['Participan selecciones nacionales', 'Se juega cada cuatro años', 'Su trofeo es dorado', 'Se juega con 32 equipos desde 1998 hasta 2022', 'El Mundial de fútbol'], ['mundial', 'copa del mundo', 'el mundial'], ''),
    ],
    connection: [
      C(['Portero', 'Defensa', 'Mediocampista', 'Delantero', 'Lateral'], 'Posiciones en el fútbol', 'Competiciones', 'Equipos de la Liga', 'Penales'),
      C(['Tarjeta amarilla', 'Tarjeta roja', 'Silbato', 'Línea de meta', 'Fuera de juego'], 'Elementos del arbitraje y las reglas', 'Elementos de la táctica', 'Partes del estadio', 'Posiciones'),
      C(['Camp Nou', 'Maracaná', 'Wembley', 'Estadio Azteca', 'Bombonera'], 'Estadios famosos de fútbol', 'Torneos de selecciones', 'Ligas europeas', 'Premios individuales'),
    ],
    quick: [
      Q('¿Qué color de tarjeta expulsa a un jugador?', 'Roja', 'Amarilla', 'Verde', 'Azul'),
      Q('¿Cuántos minutos dura cada tiempo reglamentario?', '45', '30', '40', '60'),
      Q('¿Cómo se llama el tiro desde los once metros?', 'Penal', 'Córner', 'Saque de banda', 'Tiro libre indirecto'),
      Q('¿Cómo se llama el torneo de clubes más importante de Europa?', 'Champions League', 'Copa América', 'Eurocopa', 'Copa Libertadores'),
    ],
    strategic: [
      S('Quedan 5 minutos y van empatando: hay un tiro libre peligroso para ustedes.', 'Pasarla corto y buscar mejor ángulo', 'Disparar directo a la portería', 'Pedir consejo al técnico asistente'),
      S('Van ganando 1-0 al minuto 85 contra un rival presionando.', 'Cerrar espacios y controlar el balón', 'Salir al contraataque a toda velocidad', 'Pedir un cambio defensivo al técnico'),
    ],
    boss: [
      B('El Árbitro del VAR', '¿Qué significan las siglas VAR en el fútbol?', 'Video Assistant Referee (árbitro asistente de vídeo)', 'Validación Arbitral Rápida de jugadas dudosas', 'Vigilancia Automática de las Reglas del juego', 'Vista Alternativa Rápida de las jugadas'),
      B('El Rey del Balón', '¿Qué jugador es el máximo goleador histórico de los Mundiales masculinos con 16 goles?', 'Miroslav Klose', 'Pelé', 'Ronaldo Nazário', 'Gerd Müller', 'Klose marcó 16 goles entre 2002 y 2014.'),
    ],
  },
};

module.exports = [scifi, dinos, mitologia, futbol];
