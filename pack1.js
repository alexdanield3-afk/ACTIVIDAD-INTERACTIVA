'use strict';
const { Q, TF, W, O, M, G, C, S, B } = require('./helpers');

const vikingos = {
  id: 'vikingos', name: 'VIKINGOS', emoji: '🪓', desc: 'Drakkars, runas, Odín y el Ragnarök.',
  a: '#7dd3fc', b: '#f59e0b', bg: ['⚔️', '🛶', '🪓', '❄️'],
  teams: [
    { n: 'Los Lobos de Fenrir', s: '🐺' }, { n: 'Los Cuervos de Odín', s: '🦅' }, { n: 'Los Hijos de Thor', s: '⚡' }, { n: 'Los Berserkers', s: '🪓' },
    { n: 'Las Valquirias', s: '🛡️' }, { n: 'Los Drakkars', s: '🛶' }, { n: 'Los Jarls', s: '👑' }, { n: 'Los Hijos de Ragnar', s: '⚔️' },
  ],
  surprise: ['Odín te guiña su único ojo…', 'Las nornas tejen tu destino…', 'Un cuervo trae noticias del norte…'],
  bank: {
    quiz: [
      Q('¿Cómo se llamaban los largos barcos de guerra vikingos?', 'Drakkar', 'Galera', 'Carabela', 'Trirreme', false, 'Eran barcos largos y ligeros con proa de dragón.'),
      Q('En la mitología nórdica, ¿cómo se llama el dios del trueno?', 'Thor', 'Odín', 'Loki', 'Baldur'),
      Q('¿Cómo se llamaba el salón donde iban los guerreros caídos en combate?', 'Valhalla', 'Asgard', 'Midgard', 'Helheim'),
      Q('¿Qué sistema de escritura usaban los antiguos pueblos nórdicos en sus inscripciones?', 'Las runas', 'El cirílico', 'Los jeroglíficos', 'La escritura cuneiforme'),
      Q('¿Qué explorador vikingo llegó a Norteamérica hacia el año 1000?', 'Leif Erikson', 'Cristóbal Colón', 'Harald Hardrada', 'Canuto el Grande'),
      Q('¿Qué isla colonizaron los vikingos y allí crearon el Althing, uno de los parlamentos más antiguos del mundo?', 'Islandia', 'Groenlandia', 'Irlanda', 'Islas Feroe', true, 'El Althing se fundó hacia el año 930.'),
    ],
    tf: [
      TF('Los vikingos usaban cascos con cuernos en combate.', false, 'Es un mito: no hay evidencia arqueológica; la imagen se popularizó en el siglo XIX.'),
      TF('Los vikingos llegaron a América casi 500 años antes que Colón.', true, 'Hacia el año 1000 se asentaron en L’Anse aux Meadows, en Terranova.'),
      TF('La palabra «vikingo» servía para llamar a todas las personas de Escandinavia.', false, 'Designaba más bien a quienes hacían expediciones y asaltos por mar.'),
      TF('Las mujeres vikingas solían encargarse de administrar la granja y el hogar cuando los hombres salían de expedición.', true, 'Gestionaban la hacienda familiar y tenían un papel importante en la economía doméstica.'),
    ],
    wwyd: [
      W('Su aldea vikinga sufre una mala cosecha y se acerca el invierno. ¿Qué deciden?', 'Racionar las reservas y combinar pesca y comercio con aldeas aliadas antes de que llegue el hielo', 'Racionar las reservas, pero sin pedir ayuda a nadie', 'Gastar las reservas en un banquete para subir la moral', 'Navegar sin preparación en medio del invierno', 'Anticiparse y repartir el trabajo es lo que más protege a la aldea.'),
      W('Están navegando en un drakkar y estalla una tormenta. ¿Cuál es la mejor decisión?', 'Recoger la vela y mantener la proa contra las olas con remeros coordinados', 'Buscar refugio en la costa más cercana, aunque haya rocas', 'Mantener toda la vela desplegada para llegar antes', 'Soltar los remos y esperar a que pase', 'Reducir vela y orientar la proa evita que las olas vuelquen la nave.'),
    ],
    order: [
      O('Ordena estos hechos de más antiguo a más reciente.', ['Asalto al monasterio de Lindisfarne (793)', 'Fundación del Althing en Islandia (930)', 'Leif Erikson llega a Vinland (hacia el 1000)', 'Batalla de Stamford Bridge (1066)'], 'La era vikinga suele situarse entre 793 y 1066.'),
      O('Ordena de menor a mayor rango social en la sociedad vikinga tradicional.', ['Thrall (esclavo)', 'Karl (hombre libre)', 'Jarl (noble)', 'Rey (konungr)'], 'Así se estructuraba la sociedad nórdica.'),
    ],
    memory: [
      M('Ficha del drakkar', ['Capitán: Ragnar', 'Tripulación: 30 remeros', 'Destino: costa de Inglaterra', 'Carga: 12 escudos'], '¿Cuántos remeros formaban la tripulación?', '30 remeros', '20 remeros', '40 remeros', '50 remeros'),
      M('Tablilla de runas', ['Fehu = riqueza', 'Thurisaz = gigante', 'Ansuz = un dios', 'Algiz = protección'], '¿Qué significaba la runa Algiz?', 'Protección', 'Riqueza', 'Gigante', 'Viaje'),
    ],
    guess: [
      G('Dios', ['Entregó un ojo a cambio de sabiduría', 'Estuvo colgado nueve noches de un árbol para descubrir las runas', 'Sus cuervos Huginn y Muninn le cuentan lo que ocurre en el mundo', 'Su lanza se llama Gungnir', 'Es el padre de los dioses y gobierna Asgard'], ['Odín', 'Odin'], 'Odín era el dios de la sabiduría, la guerra y la poesía.'),
      G('Objeto', ['Era una embarcación de poco calado', 'Los escudos se colgaban a los costados', 'Navegaba por ríos y por mar abierto', 'Solía llevar una figura de proa feroz', 'Barco vikingo alargado, con vela cuadrada y remos'], ['drakkar', 'langskip', 'barco largo', 'barco vikingo'], 'Su poco calado permitía remontar ríos.'),
    ],
    connection: [
      C(['Thor', 'Odín', 'Loki', 'Freya', 'Tyr'], 'Dioses de la mitología nórdica', 'Reyes de Noruega', 'Exploradores medievales', 'Planetas del sistema solar'),
      C(['Mjölnir', 'Gungnir', 'Draupnir', 'Gleipnir', 'Skíðblaðnir'], 'Objetos legendarios de la mitología nórdica', 'Barcos que usaban los vikingos en el mar', 'Reinos y regiones de la antigua Escandinavia', 'Símbolos del alfabeto rúnico futhark'),
      C(['Islandia', 'Groenlandia', 'Normandía', 'Terranova', 'Danelaw'], 'Territorios donde los vikingos se asentaron o gobernaron', 'Colonias fundadas por el Imperio romano en Europa', 'Islas del mar Mediterráneo con puertos antiguos', 'Capitales de países europeos de hoy en día'),
    ],
    quick: [
      Q('¿Cómo se llamaba el martillo de Thor?', 'Mjölnir', 'Excalibur', 'Gungnir', 'Tyrfing'),
      Q('¿Cuántos mundos hay en la cosmología nórdica?', 'Nueve', 'Siete', 'Doce', 'Tres'),
      Q('¿Cómo se llama el lobo gigante hijo de Loki?', 'Fenrir', 'Sköll', 'Garm', 'Hati'),
      Q('¿Qué árbol sagrado une los nueve mundos?', 'Yggdrasil', 'El baobab', 'El roble de Dodona', 'El árbol de la ciencia'),
    ],
    strategic: [
      S('Su drakkar encuentra pieles y plata abandonadas en una costa desconocida, pero se acerca una tormenta.', 'Cargar lo esencial y zarpar de inmediato', 'Cargar todo el botín y desafiar al mar', 'Pedir ayuda a los clanes de la costa'),
      S('Descubren un puente de hielo hacia una isla desconocida.', 'Cruzar con cuerdas, sondeando el hielo', 'Correr a toda velocidad para ganar tiempo', 'Esperar a los exploradores aliados'),
    ],
    boss: [
      B('Fenrir, el lobo gigante', '¿Con qué lograron atar los dioses al lobo Fenrir?', 'Con Gleipnir, una cinta hecha de cosas imposibles', 'Con una cadena de hierro forjada por Thor', 'Con una soga de cabello de Freya', 'Con una red tejida por las nornas', 'Gleipnir parecía fina como la seda pero era irrompible.'),
      B('Jörmungandr, la serpiente del mundo', '¿Quién está destinado a matar a la serpiente Jörmungandr en el Ragnarök?', 'Thor', 'Odín', 'Tyr', 'Freyr', 'Thor y la serpiente se destruyen mutuamente.'),
    ],
  },
};

const edadmedia = {
  id: 'edadmedia', name: 'EDAD MEDIA', emoji: '🏰', desc: 'Castillos, caballeros, feudos y cruzadas.',
  a: '#fbbf24', b: '#b45309', bg: ['🏰', '⚔️', '🛡️', '👑'],
  teams: [
    { n: 'Los Dragones', s: '🐉' }, { n: 'Los Guardianes', s: '🛡️' }, { n: 'Los Lobos', s: '🐺' }, { n: 'Los Titanes', s: '🗡️' },
    { n: 'Los Cuervos', s: '🐦' }, { n: 'Los Leones', s: '🦁' }, { n: 'Los Caballeros', s: '🏇' }, { n: 'Los Alquimistas', s: '⚗️' },
  ],
  surprise: ['El mago de la corte hace un conjuro…', 'Un trovador canta tu destino…', 'El rey envía un mensajero…'],
  bank: {
    quiz: [
      Q('¿En qué año cayó el Imperio romano de Occidente, hecho que suele marcar el inicio de la Edad Media?', '476', '1066', '1453', '800'),
      Q('¿Cómo se llamaba el sistema social basado en la relación entre señores y vasallos?', 'Feudalismo', 'Capitalismo', 'Mercantilismo', 'Esclavismo'),
      Q('¿Qué epidemia devastó Europa a mediados del siglo XIV?', 'La peste negra', 'La viruela', 'El cólera', 'La gripe española'),
      Q('¿Cómo se llamaba la torre principal y más fuerte de un castillo medieval?', 'Torre del homenaje', 'Atalaya', 'Campanario', 'Barbacana'),
      Q('¿Quién fue coronado emperador por el papa León III en el año 800?', 'Carlomagno', 'Clodoveo', 'Otón I', 'Carlos Martel'),
      Q('¿Qué documento firmó el rey Juan sin Tierra en 1215, limitando el poder real en Inglaterra?', 'La Carta Magna', 'La Bula de Oro', 'La Declaración de Derechos', 'El Edicto de Nantes', true),
    ],
    tf: [
      TF('Los caballeros medievales se hacían caballeros automáticamente al cumplir 18 años.', false, 'Debían pasar por un largo aprendizaje: paje, escudero y finalmente ser armados caballeros.'),
      TF('La imprenta de tipos móviles de Gutenberg se desarrolló antes de que terminara la Edad Media.', true, 'Hacia 1450; la Edad Media suele cerrarse en 1453 o 1492.'),
      TF('Todos los castillos medievales estaban hechos de piedra.', false, 'Muchos de los primeros eran de madera y tierra.'),
      TF('La Reconquista fue el proceso por el que los reinos cristianos recuperaron territorios de la península ibérica dominados por al-Ándalus.', true, 'Duró siglos, hasta la toma de Granada en 1492.'),
    ],
    wwyd: [
      W('Son los señores de un feudo y llega un invierno muy duro con escasez de alimentos. ¿Qué deciden?', 'Racionar los graneros para todo el feudo y pedir ayuda a señores vecinos', 'Racionar la comida sólo para el castillo y los soldados', 'Aumentar los impuestos en grano', 'Esperar la primavera sin hacer nada', 'Proteger a todos evita revueltas y muertes.'),
      W('Un ejército enemigo se acerca a su castillo. ¿Qué hacen?', 'Cerrar las puertas, reforzar las defensas y enviar mensajeros pidiendo refuerzos', 'Negociar una rendición con condiciones favorables', 'Salir a combatir en campo abierto con pocos soldados', 'Abrir las puertas sin negociar', 'Resistir con refuerzos suele ser mejor que salir en inferioridad.'),
    ],
    order: [
      O('Ordena la formación de un caballero.', ['Paje', 'Escudero', 'Caballero armado'], 'Se empezaba como paje hacia los 7 años.'),
      O('Ordena estos hechos de más antiguo a más reciente.', ['Caída de Roma de Occidente (476)', 'Coronación de Carlomagno (800)', 'Batalla de Hastings (1066)', 'Toma de Constantinopla (1453)'], ''),
    ],
    memory: [
      M('Escudo de armas', ['Fondo: azul', 'Figura: un león dorado', 'Lema: «Honor y fuerza»', 'Corona: de tres picos'], '¿Qué figura tenía el escudo?', 'Un león dorado', 'Un dragón rojo', 'Un águila negra', 'Un lobo plateado'),
      M('Mercado del pueblo', ['Pan: 2 monedas', 'Queso: 5 monedas', 'Vino: 7 monedas', 'Espada: 40 monedas'], '¿Cuánto costaba el queso?', '5 monedas', '2 monedas', '7 monedas', '40 monedas'),
    ],
    guess: [
      G('Personaje histórico', ['Nació hacia 1412 en un pueblo de Francia', 'Dijo escuchar voces de santos desde adolescente', 'Lideró al ejército francés y levantó el sitio de Orleans', 'Fue capturada por los borgoñones y entregada a los ingleses', 'Fue quemada en Ruan en 1431: la Doncella de Orleans'], ['Juana de Arco', 'Santa Juana de Arco'], 'Fue canonizada en 1920.'),
      G('Lugar', ['Solía estar rodeado por un foso', 'Su puente se levantaba con cadenas', 'Tenía almenas y troneras', 'Era la residencia fortificada de un señor feudal', 'Construcción militar medieval con muralla y torre del homenaje'], ['castillo', 'fortaleza'], ''),
    ],
    connection: [
      C(['Almena', 'Foso', 'Puente levadizo', 'Torre del homenaje', 'Muralla'], 'Partes de un castillo', 'Piezas de ajedrez', 'Armas de asedio', 'Prendas de armadura'),
      C(['Yelmo', 'Coraza', 'Escudo', 'Guantelete', 'Greba'], 'Piezas de armadura', 'Partes de un barco', 'Instrumentos musicales', 'Cargos de la corte'),
      C(['Catapulta', 'Ariete', 'Trabuquete', 'Torre de asedio', 'Ballesta'], 'Máquinas y armas de asedio', 'Herramientas agrícolas', 'Barcos medievales', 'Instrumentos de navegación'),
    ],
    quick: [
      Q('¿Cómo se llamaba el escudo de armas de una familia noble?', 'Blasón', 'Cetro', 'Pendón', 'Gonfalón'),
      Q('¿Cuál era la lengua de la Iglesia y la cultura en la Europa medieval?', 'Latín', 'Griego antiguo', 'Inglés', 'Francés'),
      Q('¿Cómo se llamaba el campesino ligado a la tierra de un señor?', 'Siervo', 'Gladiador', 'Cónsul', 'Pretoriano'),
      Q('¿Qué ciudad era la capital del Imperio bizantino?', 'Constantinopla', 'Roma', 'Atenas', 'Alejandría'),
    ],
    strategic: [
      S('Un torneo ofrece un gran premio, pero su mejor campeón está herido.', 'Inscribirse en la prueba de tiro con arco', 'Hacer competir al campeón herido en la justa', 'Pedir apoyo al gremio de herreros'),
      S('Encuentran el mapa de un tesoro en las ruinas de una abadía.', 'Explorar sólo el camino marcado como seguro', 'Cruzar el bosque prohibido por el atajo', 'Contratar a un guía local'),
    ],
    boss: [
      B('El Rey Oscuro de la Peste', '¿Qué causó la peste negra del siglo XIV y cómo se transmitía principalmente?', 'La bacteria Yersinia pestis, transmitida por pulgas de rata', 'Un virus parecido a la gripe, transmitido por el aire', 'Un hongo que crecía en los graneros húmedos', 'Un parásito presente en el agua contaminada'),
      B('El Dragón de las Cruzadas', '¿Qué ciudad fue el objetivo de la Primera Cruzada y fue conquistada en 1099?', 'Jerusalén', 'Constantinopla', 'El Cairo', 'Damasco'),
    ],
  },
};

const marvel = {
  id: 'marvel', name: 'MARVEL / VENGADORES', emoji: '🦸', desc: 'Superhéroes, gemas del infinito y mucho más.',
  a: '#ef4444', b: '#3b82f6', bg: ['🦸', '⚡', '🛡️', '💥'],
  teams: [
    { n: 'Los Vengadores', s: '🦸' }, { n: 'Los Guardianes de la Galaxia', s: '🌌' }, { n: 'Los Asgardianos', s: '⚡' }, { n: 'Los Defensores', s: '🛡️' },
    { n: 'Los Wakandianos', s: '🐆' }, { n: 'Los Centinelas', s: '🤖' }, { n: 'Los Eternos', s: '💎' }, { n: 'Los Inhumanos', s: '🔥' },
  ],
  surprise: ['Nick Fury aparece con una misión secreta…', 'Una gema del infinito brilla un instante…', 'Un portal se abre sobre la ciudad…'],
  bank: {
    quiz: [
      Q('¿Cómo se llama el alter ego de Iron Man?', 'Tony Stark', 'Bruce Banner', 'Steve Rogers', 'Peter Parker'),
      Q('¿De qué material está hecho el escudo del Capitán América?', 'Vibranio', 'Adamantium', 'Uru', 'Titanio'),
      Q('¿Cuántas Gemas del Infinito existen en el universo cinematográfico de Marvel?', 'Seis', 'Cinco', 'Siete', 'Ocho'),
      Q('¿Cómo se llama el reino del que proviene Thor?', 'Asgard', 'Xandar', 'Sakaar', 'Titán'),
      Q('¿Quién es el villano principal de «Vengadores: Infinity War»?', 'Thanos', 'Ultrón', 'Loki', 'Hela'),
      Q('¿Cómo se llama la nación africana gobernada por T’Challa, la Pantera Negra?', 'Wakanda', 'Genosha', 'Latveria', 'Sokovia', true),
    ],
    tf: [
      TF('Hulk es el alter ego del científico Bruce Banner.', true, 'Se transforma tras una exposición a rayos gamma.'),
      TF('Peter Parker obtiene sus poderes tras la picadura de una araña radiactiva.', true, 'Así nace Spider-Man.'),
      TF('Loki es hermano biológico de Thor, hijo de Odín y Frigga.', false, 'Loki fue adoptado: es hijo de Laufey, rey de los gigantes de hielo.'),
      TF('Nick Fury dirige la organización S.H.I.E.L.D. en gran parte de las películas.', true, ''),
    ],
    wwyd: [
      W('Son los Vengadores y una IA hostil amenaza con controlar las redes del mundo. ¿Qué hacen primero?', 'Aislar sus sistemas, proteger a los civiles y coordinar un plan entre todos los equipos', 'Buscar a su creador para entender cómo funciona antes de actuar', 'Atacarla sin saber exactamente qué hace', 'Dividirse y que cada uno actúe por su cuenta', 'Contener el daño y coordinarse es lo primero.'),
      W('Su líder cae herido en plena misión de rescate de rehenes. ¿Cuál es la mejor decisión?', 'Estabilizarlo, relevar el mando y completar el rescate con un plan alternativo', 'Retirar al líder y pedir refuerzos antes de continuar', 'Seguir exactamente igual como si nada hubiera pasado', 'Abandonar a los rehenes para salvar sólo al líder', 'Hay que proteger al líder sin abandonar la misión.'),
    ],
    order: [
      O('Ordena estas películas por fecha de estreno.', ['Iron Man', 'Thor', 'Capitán América: El primer vengador', 'Los Vengadores'], 'Iron Man (2008), Thor y Capitán América (2011), Los Vengadores (2012).'),
      O('Ordena las películas de Spider-Man con Tom Holland.', ['Spider-Man: Homecoming', 'Spider-Man: Lejos de casa', 'Spider-Man: Sin camino a casa'], '2017, 2019 y 2021.'),
    ],
    memory: [
      M('Archivo de misión', ['Código: Operación Cielo Rojo', 'Líder: Capitana Brooks', 'Ubicación: Base Ártica 7', 'Equipo: 5 agentes'], '¿Cómo se llamaba la operación?', 'Operación Cielo Rojo', 'Operación Escarcha', 'Operación Trueno Negro', 'Operación Fénix'),
      M('Ficha de héroe', ['Nombre en clave: Centella', 'Poder: supervelocidad', 'Debilidad: el frío extremo', 'Base: Torre Atlas'], '¿Cuál era su debilidad?', 'El frío extremo', 'El fuego', 'El agua', 'La oscuridad'),
    ],
    guess: [
      G('Personaje', ['Fue soldado en la Segunda Guerra Mundial', 'Estuvo congelado durante décadas', 'Su arma defensiva es circular', 'Su mejor amigo de la infancia es Bucky', 'El primer Vengador, con un escudo con una estrella'], ['Capitán América', 'Capitan America', 'Steve Rogers'], ''),
      G('Personaje', ['Su nombre real es Natasha Romanoff', 'Es una agente entrenada en espionaje', 'No tiene superpoderes, pero es una gran combatiente', 'Se une a los Vengadores junto a Ojo de Halcón', 'La Viuda Negra'], ['Viuda Negra', 'Black Widow', 'Natasha Romanoff'], ''),
    ],
    connection: [
      C(['Mente', 'Poder', 'Realidad', 'Espacio', 'Alma'], 'Gemas del Infinito', 'Planetas de Marvel', 'Armaduras de Iron Man', 'Hermanos de Thor'),
      C(['Thor', 'Hulk', 'Iron Man', 'Capitán América', 'Ojo de Halcón'], 'Miembros de los Vengadores originales', 'Guardianes de la Galaxia', 'Cuatro Fantásticos', 'X-Men'),
      C(['Wakanda', 'Asgard', 'Titán', 'Xandar', 'Sakaar'], 'Lugares del universo Marvel', 'Capitales europeas', 'Reinos de Narnia', 'Planetas del sistema solar'),
    ],
    quick: [
      Q('¿Cómo se llama el martillo de Thor?', 'Mjölnir', 'Gungnir', 'Stormbreaker', 'Excalibur'),
      Q('¿Cómo se llama el árbol que habla en los Guardianes de la Galaxia?', 'Groot', 'Rocket', 'Drax', 'Mantis'),
      Q('¿Qué animal es Rocket en los Guardianes de la Galaxia?', 'Un mapache', 'Un zorro', 'Un lobo', 'Un gato'),
      Q('¿Quién interpreta a Nick Fury en el universo cinematográfico de Marvel?', 'Samuel L. Jackson', 'Morgan Freeman', 'Denzel Washington', 'Idris Elba'),
    ],
    strategic: [
      S('Un villano ofrece liberar a un rehén a cambio de la ubicación de su base secreta.', 'Rechazar el trato y buscar otra vía', 'Aceptar y rescatar al rehén por sorpresa', 'Llamar a un aliado de otro equipo'),
      S('Detectan una energía desconocida en un edificio abandonado.', 'Vigilar a distancia con drones', 'Entrar sin plan para llegar primero', 'Pedir apoyo a científicos aliados'),
    ],
    boss: [
      B('Thanos, el Titán Loco', '¿Qué objeto usa Thanos para reunir las Gemas del Infinito?', 'El Guantelete del Infinito', 'El Cetro de Loki', 'El martillo Mjölnir', 'El Cubo Cósmico'),
      B('Ultrón', '¿Quiénes crean a Ultrón en «Vengadores: La era de Ultrón»?', 'Tony Stark y Bruce Banner', 'Nick Fury y Maria Hill', 'Thor y Loki', 'Hank Pym y Bill Foster'),
    ],
  },
};

const harry = {
  id: 'harry', name: 'HARRY POTTER', emoji: '🪄', desc: 'Magia, Hogwarts, hechizos y criaturas fantásticas.',
  a: '#fbbf24', b: '#8b5cf6', bg: ['🪄', '🦉', '⚡', '📜'],
  teams: [
    { n: 'Los Leones Valientes', s: '🦁' }, { n: 'Las Serpientes Astutas', s: '🐍' }, { n: 'Los Tejones Leales', s: '🦡' }, { n: 'Las Águilas Sabias', s: '🦅' },
    { n: 'Los Fénix', s: '🔥' }, { n: 'Los Hipogrifos', s: '🐴' }, { n: 'Los Dragones de Cola Cornuda', s: '🐉' }, { n: 'Los Centauros', s: '🏹' },
  ],
  surprise: ['Una lechuza deja una carta misteriosa…', 'El Sombrero Seleccionador susurra algo…', 'Un hechizo sale disparado de la nada…'],
  bank: {
    quiz: [
      Q('¿Cómo se llama el colegio de magia al que asiste Harry Potter?', 'Hogwarts', 'Beauxbatons', 'Durmstrang', 'Ilvermorny'),
      Q('¿Qué objeto usan los magos para volar en el quidditch?', 'Una escoba', 'Una alfombra', 'Un caldero', 'Un hipogrifo'),
      Q('¿Cómo se llama el guardián de las llaves y terrenos de Hogwarts?', 'Hagrid', 'Dumbledore', 'Snape', 'Lupin'),
      Q('¿Qué criatura custodia la Cámara de los Secretos?', 'Un basilisco', 'Un dragón', 'Un hipogrifo', 'Un troll'),
      Q('¿Qué hechizo se usa para desarmar a un oponente?', 'Expelliarmus', 'Lumos', 'Accio', 'Alohomora'),
      Q('¿En qué libro de la saga aparece el Torneo de los Tres Magos?', 'El cáliz de fuego', 'El prisionero de Azkaban', 'La Orden del Fénix', 'El misterio del príncipe', true),
    ],
    tf: [
      TF('Harry Potter tiene una cicatriz con forma de rayo en la frente.', true, 'Se la dejó la maldición de Voldemort cuando era un bebé.'),
      TF('En el quidditch, atrapar la snitch dorada vale 150 puntos y termina el partido.', true, ''),
      TF('Los padres de Hermione Granger son magos.', false, 'Son muggles (dentistas).'),
      TF('Los dementores se alimentan de la felicidad de las personas.', true, 'La defensa principal contra ellos es el hechizo Patronus.'),
    ],
    wwyd: [
      W('Descubren que un compañero practica un hechizo prohibido que podría hacerle daño. ¿Qué hacen?', 'Hablar con él para que pare y, si no lo hace, avisar a un profesor', 'Avisar enseguida a un profesor sin hablar con él', 'Ignorarlo para no meterse en problemas', 'Probar el hechizo ustedes también', 'Ayudar a tiempo evita que alguien salga herido.'),
      W('Se pierden en el Bosque Prohibido de noche. ¿Cuál es la mejor decisión?', 'Mantenerse juntos, usar Lumos y volver por el camino conocido', 'Quedarse quietos hasta que amanezca', 'Separarse para cubrir más terreno', 'Perseguir unas luces misteriosas', 'Juntos y con luz es lo más seguro.'),
    ],
    order: [
      O('Ordena estos libros de la saga.', ['La piedra filosofal', 'La cámara secreta', 'El prisionero de Azkaban', 'El cáliz de fuego'], ''),
      O('Ordena estos sucesos tal como ocurren en los libros.', ['Harry descubre que es mago y llega a Hogwarts', 'Se abre la Cámara de los Secretos', 'Sirius Black escapa de Azkaban', 'Se celebra el Torneo de los Tres Magos'], ''),
    ],
    memory: [
      M('Lista de materiales', ['Varita', 'Caldero de peltre', 'Libro de pociones', 'Túnica negra'], '¿Qué libro aparecía en la lista?', 'Libro de pociones', 'Libro de runas', 'Libro de adivinación', 'Libro de criaturas'),
      M('Horario del lunes', ['9:00 Pociones', '11:00 Transformaciones', '14:00 Herbología', '16:00 Defensa contra las Artes Oscuras'], '¿Qué clase había a las 11:00?', 'Transformaciones', 'Pociones', 'Herbología', 'Defensa contra las Artes Oscuras'),
    ],
    guess: [
      G('Personaje', ['Dirige un colegio de magia', 'Tiene una barba larguísima', 'Su mascota es un fénix llamado Fawkes', 'Es mentor de Harry Potter', 'Director de Hogwarts durante la mayor parte de la saga'], ['Dumbledore', 'Albus Dumbledore'], ''),
      G('Criatura', ['Es una criatura mágica con alas', 'Es orgullosa y exige una reverencia', 'Buckbeak es uno de ellos', 'Hagrid los presenta en clase de Cuidado de Criaturas Mágicas', 'Mitad águila, mitad caballo'], ['hipogrifo', 'hipogrifos'], ''),
    ],
    connection: [
      C(['Expelliarmus', 'Lumos', 'Accio', 'Alohomora', 'Protego'], 'Hechizos de la saga', 'Casas de Hogwarts', 'Pociones', 'Criaturas mágicas'),
      C(['Hedwig', 'Crookshanks', 'Scabbers', 'Trevor', 'Fawkes'], 'Animales de la saga', 'Profesores de Hogwarts', 'Ingredientes de pociones', 'Objetos de Gringotts'),
      C(['Snitch', 'Quaffle', 'Bludger', 'Golpeador', 'Buscador'], 'Elementos del quidditch', 'Clases de Hogwarts', 'Hechizos', 'Criaturas mágicas'),
    ],
    quick: [
      Q('¿Cómo se llama el mejor amigo pelirrojo de Harry?', 'Ron Weasley', 'Neville Longbottom', 'Draco Malfoy', 'Seamus Finnigan'),
      Q('¿En qué estación de tren está el andén 9¾?', "King's Cross", 'Paddington', 'Victoria', 'Waterloo'),
      Q('¿Qué animal es Hedwig?', 'Una lechuza', 'Un gato', 'Un sapo', 'Un fénix'),
      Q('¿Qué banco mágico guarda las fortunas de los magos?', 'Gringotts', 'Hogsmeade Bank', 'Borgin & Burkes', 'Zonko'),
    ],
    strategic: [
      S('Encuentran un pasadizo secreto que lleva a un aula con un libro prohibido.', 'Informar del pasadizo a un profesor', 'Leer el libro prohibido sin permiso', 'Consultar con un prefecto de confianza'),
      S('Un torneo mágico ofrece una copa, pero la prueba final es peligrosa.', 'Entrenar hechizos básicos y participar con prudencia', 'Probar un hechizo muy avanzado que no dominan', 'Pedir consejo a un profesor experimentado'),
    ],
    boss: [
      B('Lord Voldemort', '¿Cuál es el nombre de nacimiento de Lord Voldemort?', 'Tom Marvolo Riddle', 'Tom Morfin Riddle', 'Thomas Gaunt Riddle', 'Tom Salazar Riddle'),
      B('El Basilisco', '¿Con qué destruye Harry el diario de Tom Riddle?', 'Con un colmillo de basilisco', 'Con la varita de saúco', 'Con una poción de Snape', 'Con el hechizo Incendio'),
    ],
  },
};

module.exports = [vikingos, edadmedia, marvel, harry];
