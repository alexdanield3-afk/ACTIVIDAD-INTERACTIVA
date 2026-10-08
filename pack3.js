'use strict';
const { Q, TF, W, O, M, G, C, S, B } = require('./helpers');

const videojuegos = {
  id: 'videojuegos', name: 'VIDEOJUEGOS', emoji: '🎮', desc: 'Consolas, mascotas, clásicos y esports.',
  a: '#a78bfa', b: '#22d3ee', bg: ['🎮', '🕹️', '👾', '🏆'],
  teams: [
    { n: 'Los Píxeles', s: '👾' }, { n: 'Los Speedrunners', s: '⚡' }, { n: 'Los Jefes Finales', s: '👹' }, { n: 'Los Respawn', s: '🔄' },
    { n: 'Los Guerreros 8-bit', s: '🕹️' }, { n: 'Los Combos', s: '💥' }, { n: 'Los Gamers Élite', s: '🏆' }, { n: 'Los Aventureros', s: '🗡️' },
  ],
  surprise: ['Aparece un cofre secreto…', 'Se activa un nivel bonus…', 'Un glitch extraño cambia las reglas…'],
  bank: {
    quiz: [
      Q('¿Quién es el fontanero más famoso de los videojuegos, creado por Nintendo?', 'Mario', 'Sonic', 'Link', 'Pac-Man'),
      Q('¿En qué videojuego se construyen mundos con bloques y se sobrevive a los monstruos de la noche?', 'Minecraft', 'Fortnite', 'Tetris', 'Among Us'),
      Q('¿Cómo se llama la princesa de «The Legend of Zelda»?', 'Zelda', 'Peach', 'Samus', 'Daisy'),
      Q('¿Cuál es la consola portátil de Nintendo lanzada en 1989?', 'Game Boy', 'Nintendo Switch', 'PSP', 'Game Gear'),
      Q('¿Qué empresa desarrolló la consola PlayStation?', 'Sony', 'Sega', 'Microsoft', 'Atari'),
      Q('¿En qué año se lanzó «Super Mario Bros.» en Japón?', '1985', '1981', '1990', '1977', true),
    ],
    tf: [
      TF('Pong es considerado uno de los primeros videojuegos comerciales de éxito.', true, 'Lo lanzó Atari en 1972.'),
      TF('Sonic the Hedgehog es la mascota de Nintendo.', false, 'Es la mascota de Sega.'),
      TF('Minecraft fue creado originalmente por Markus «Notch» Persson.', true, 'Se publicó en 2009 y Microsoft lo adquirió en 2014.'),
      TF('Los deportes electrónicos (esports) incluyen competiciones profesionales con grandes premios.', true, ''),
    ],
    wwyd: [
      W('Su equipo juega una partida competitiva y un jugador se desconecta a mitad de la ronda. ¿Qué hacen?', 'Reorganizar la estrategia con quienes quedan y comunicarse con calma', 'Seguir exactamente con el plan original', 'Culparlo en el chat del equipo', 'Abandonar la partida', 'Adaptarse en equipo es la mejor respuesta.'),
      W('Descubren un bug que les da una ventaja injusta en el juego. ¿Qué hacen?', 'No explotarlo y reportarlo a los desarrolladores', 'Ignorarlo y no decir nada', 'Usarlo sólo una vez para probar', 'Usarlo hasta que lo arreglen', 'Jugar limpio y reportar ayuda a toda la comunidad.'),
    ],
    order: [
      O('Ordena estas consolas de Nintendo por fecha de lanzamiento.', ['NES', 'Super Nintendo', 'Nintendo 64', 'Wii'], ''),
      O('Ordena estos videojuegos por año de lanzamiento.', ['Pong (1972)', 'Pac-Man (1980)', 'Super Mario Bros. (1985)', 'Minecraft (2011)'], ''),
    ],
    memory: [
      M('Inventario del héroe', ['Espada de hierro', 'Escudo de madera', '3 pociones', '12 monedas de oro'], '¿Cuántas pociones tenía?', '3', '5', '12', '1'),
      M('Mapa del nivel', ['Llave roja: en la cueva', 'Puerta azul: en el castillo', 'Jefe: en la torre', 'Tesoro: en el lago'], '¿Dónde estaba la llave roja?', 'En la cueva', 'En el castillo', 'En la torre', 'En el lago'),
    ],
    guess: [
      G('Personaje', ['Tiene un bigote muy característico', 'Salta sobre los enemigos para vencerlos', 'Su hermano se llama Luigi', 'Rescata a la princesa Peach', 'El fontanero de Nintendo'], ['Mario', 'Super Mario'], ''),
      G('Objeto', ['Se usa para jugar', 'Tiene botones y a veces palancas', 'Se conecta a una consola o a un computador', 'Los hay inalámbricos', 'El mando'], ['mando', 'control', 'joystick', 'gamepad', 'controlador'], ''),
    ],
    connection: [
      C(['Mario', 'Sonic', 'Link', 'Pac-Man', 'Kirby'], 'Personajes de videojuegos', 'Consolas', 'Empresas desarrolladoras', 'Géneros de juegos'),
      C(['PlayStation', 'Xbox', 'Switch', 'Wii', 'Dreamcast'], 'Consolas de videojuegos', 'Sistemas operativos', 'Juegos de rol', 'Lenguajes de programación'),
      C(['Zelda', 'Metroid', 'Donkey Kong', 'Pikmin', 'Kirby'], 'Franquicias de Nintendo', 'Franquicias de Sony', 'Juegos de Capcom', 'Juegos de Sega'),
    ],
    quick: [
      Q('¿Cómo se llama el hermano de Mario?', 'Luigi', 'Wario', 'Toad', 'Yoshi'),
      Q('¿Cómo se llama el erizo azul veloz de Sega?', 'Sonic', 'Tails', 'Knuckles', 'Shadow'),
      Q('¿En qué juego explotan los «creepers»?', 'Minecraft', 'Fortnite', 'Roblox', 'Among Us'),
      Q('¿De qué color es el fantasma Blinky en Pac-Man?', 'Rojo', 'Azul', 'Rosa', 'Naranja'),
    ],
    strategic: [
      S('Están en el nivel final con poca vida y un tesoro enorme al lado de un jefe.', 'Curarse primero y avanzar con cuidado', 'Atacar directo al jefe para llegar al tesoro', 'Pedir ayuda a un aliado de otro servidor'),
      S('Encuentran un cofre misterioso con una trampa y un posible premio raro.', 'Desactivar la trampa con calma', 'Abrirlo sin pensar', 'Llamar al mago aliado'),
    ],
    boss: [
      B('Bowser', '¿Qué personaje es el eterno villano de la saga Super Mario y suele secuestrar a la princesa Peach?', 'Bowser', 'Ganon', 'Eggman', 'Wario'),
      B('Ganon', '¿Cómo se llama la espada legendaria de Link en «The Legend of Zelda»?', 'La Espada Maestra (Master Sword)', 'Excalibur', 'La Buster Sword', 'La Keyblade'),
    ],
  },
};

const tecnologia = {
  id: 'tecnologia', name: 'TECNOLOGÍA', emoji: '💻', desc: 'Computación, redes, seguridad e Internet.',
  a: '#38bdf8', b: '#34d399', bg: ['💻', '📱', '🔌', '🛰️'],
  teams: [
    { n: 'Los Bits', s: '💾' }, { n: 'Los Procesadores', s: '⚙️' }, { n: 'Los Algoritmos', s: '🧮' }, { n: 'Los Servidores', s: '🖥️' },
    { n: 'Los Hackers Éticos', s: '🛡️' }, { n: 'Los Píxeles', s: '🟦' }, { n: 'Los Nanobots', s: '🤖' }, { n: 'Los Satélites', s: '🛰️' },
  ],
  surprise: ['Una actualización inesperada aparece…', 'La red se vuelve ultrarrápida…', 'Un bug misterioso llega al sistema…'],
  bank: {
    quiz: [
      Q('¿Qué significa la sigla «CPU»?', 'Unidad central de procesamiento', 'Computador personal universal', 'Control principal de usuario', 'Centro de programas y utilidades'),
      Q('¿Qué lenguaje se usa para estructurar el contenido de las páginas web?', 'HTML', 'Python', 'SQL', 'Java'),
      Q('¿Cuál de estos es un sistema operativo móvil?', 'Android', 'Excel', 'Chrome', 'Photoshop'),
      Q('¿Qué tecnología permite conectar dispositivos a una red local sin cables?', 'Wi-Fi', 'HDMI', 'USB', 'Ethernet'),
      Q('¿Qué significa «URL»?', 'Localizador uniforme de recursos', 'Unidad remota de lectura', 'Usuario registrado en línea', 'Unión de redes locales'),
      Q('¿Qué protocolo cifra la comunicación segura en la web (el candado del navegador)?', 'HTTPS (TLS)', 'FTP', 'SMTP', 'DHCP', true),
    ],
    tf: [
      TF('Un byte equivale a 8 bits.', true, ''),
      TF('Wi-Fi e Internet son exactamente lo mismo.', false, 'Wi-Fi es una forma de conectarse a una red; Internet es la red global de redes.'),
      TF('Usar una contraseña larga y distinta en cada servicio es más seguro que reutilizar la misma.', true, ''),
      TF('«La nube» es un lugar físico que flota en el aire.', false, 'Son centros de datos con servidores accesibles por Internet.'),
    ],
    wwyd: [
      W('Reciben un correo que dice ser de su banco y les pide sus claves en un enlace. ¿Qué hacen?', 'No abrir el enlace, verificar con el banco por un canal oficial y reportar el correo como phishing', 'Ignorar y borrar el correo sin avisar a nadie', 'Entrar al enlace para ver si es real', 'Responder con sus datos para evitar un bloqueo', 'Verificar por un canal oficial es lo más seguro.'),
      W('Su computador está muy lento y aparecen ventanas extrañas. ¿Cuál es la mejor decisión?', 'Desconectarlo de la red, analizarlo con un antivirus confiable y cambiar las contraseñas desde otro equipo', 'Reiniciarlo y ver si mejora', 'Instalar cualquier programa «limpiador» que aparezca en las ventanas', 'Seguir usándolo como si nada', 'Aislar y analizar reduce el daño.'),
    ],
    order: [
      O('Ordena estas unidades de almacenamiento de menor a mayor.', ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte'], ''),
      O('Ordena estos hitos de la informática.', ['ENIAC (1945)', 'Primer correo electrónico (1971)', 'La World Wide Web (1989-1991)', 'Primer iPhone (2007)'], ''),
    ],
    memory: [
      M('Datos de red', ['Red: AulaWifi', 'Canal: 6', 'Seguridad: WPA3', 'Velocidad: 300 Mbps'], '¿Qué seguridad tenía la red?', 'WPA3', 'WEP', 'WPA', 'Sin seguridad'),
      M('Configuración del equipo', ['Procesador: 8 núcleos', 'Memoria RAM: 16 GB', 'Disco: 512 GB', 'Sistema: Linux'], '¿Cuánta memoria RAM tenía?', '16 GB', '8 GB', '32 GB', '4 GB'),
    ],
    guess: [
      G('Objeto', ['Tiene teclas con letras y números', 'Se conecta a un computador', 'Existe en versión física y en pantalla táctil', 'La distribución más común empieza por QWERTY', 'El teclado'], ['teclado'], ''),
      G('Concepto', ['Es una secuencia de pasos para resolver un problema', 'Los programas están hechos de ellos', 'Se puede representar con un diagrama de flujo', 'Las redes sociales usan uno para recomendar contenido', 'Algoritmo'], ['algoritmo', 'algoritmos'], ''),
    ],
    connection: [
      C(['Python', 'Java', 'JavaScript', 'C++', 'Ruby'], 'Lenguajes de programación', 'Sistemas operativos', 'Navegadores', 'Redes sociales'),
      C(['Windows', 'Linux', 'macOS', 'Android', 'iOS'], 'Sistemas operativos', 'Lenguajes de programación', 'Marcas de computadores', 'Navegadores'),
      C(['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'], 'Navegadores web', 'Buscadores', 'Sistemas operativos', 'Redes sociales'),
    ],
    quick: [
      Q('¿Qué dispositivo guarda datos de forma permanente en un computador?', 'El disco (HDD o SSD)', 'La memoria RAM', 'El procesador', 'La tarjeta gráfica'),
      Q('¿Qué extensión tienen normalmente las imágenes JPEG?', '.jpg', '.docx', '.mp3', '.xlsx'),
      Q('¿Cuál es el buscador más usado del mundo?', 'Google', 'Bing', 'DuckDuckGo', 'Yahoo'),
      Q('¿Qué símbolo separa el usuario del dominio en un correo electrónico?', '@', '#', '&', '%'),
    ],
    strategic: [
      S('Su servidor recibe un tráfico enorme e inesperado.', 'Activar el plan de contención y escalar con calma', 'Apagar todos los servicios de golpe', 'Pedir ayuda al equipo de infraestructura aliado'),
      S('Hay una herramienta nueva muy prometedora, pero sin documentación.', 'Probarla en un entorno de pruebas', 'Instalarla directamente en producción', 'Consultar a otra empresa que ya la usa'),
    ],
    boss: [
      B('El Hacker Supremo', '¿Qué es un ataque de «phishing»?', 'Un engaño para obtener datos personales suplantando a una entidad confiable', 'Un virus que se copia a sí mismo y borra el disco duro', 'Un exceso de tráfico enviado para tumbar un servidor', 'Una falla física del procesador por sobrecalentamiento'),
      B('La Gran Red', '¿Qué hace un servidor DNS?', 'Traduce nombres de dominio a direcciones IP', 'Cifra los correos electrónicos de los usuarios', 'Almacena las contraseñas de los usuarios', 'Elimina los virus de las redes locales'),
    ],
  },
};

const ia = {
  id: 'ia', name: 'INTELIGENCIA ARTIFICIAL', emoji: '🧠', desc: 'Modelos, datos, prompts, ética y futuro.',
  a: '#a78bfa', b: '#22d3ee', bg: ['🧠', '🤖', '✨', '📊'],
  teams: [
    { n: 'Las Redes Neuronales', s: '🧠' }, { n: 'Los Algoritmos', s: '🧮' }, { n: 'Los Modelos', s: '🤖' }, { n: 'Los Datos', s: '📊' },
    { n: 'Los Transformers', s: '⚡' }, { n: 'Los Agentes', s: '🕵️' }, { n: 'Los Prompts', s: '✍️' }, { n: 'Los Tokens', s: '🔤' },
  ],
  surprise: ['Un modelo nuevo entra en línea…', 'Los datos llegan en tiempo récord…', 'Un algoritmo toma una decisión inesperada…'],
  bank: {
    quiz: [
      Q('¿Qué significa la sigla IA?', 'Inteligencia artificial', 'Información avanzada', 'Interfaz automática', 'Internet aplicado'),
      Q('¿Cómo se llama el área de la IA en la que los sistemas aprenden patrones a partir de datos?', 'Aprendizaje automático (machine learning)', 'Computación cuántica de alto rendimiento', 'Realidad virtual y aumentada', 'Ciberseguridad y protección de redes'),
      Q('¿Qué es un «prompt»?', 'La instrucción o pregunta que se le da a un modelo de IA', 'Un tipo de virus que ataca modelos de lenguaje', 'Una pieza de hardware para entrenar redes neuronales', 'Un lenguaje de programación para bases de datos'),
      Q('¿Cómo se llaman los modelos de IA que generan texto, como los asistentes conversacionales actuales?', 'Modelos de lenguaje', 'Hojas de cálculo', 'Compiladores', 'Bases de datos relacionales'),
      Q('¿Cómo se llama el fenómeno en que un modelo inventa información que suena creíble pero es falsa?', 'Alucinación', 'Overclocking', 'Compilación', 'Encriptación'),
      Q('¿Qué arquitectura, presentada en 2017 en el artículo «Attention Is All You Need», es la base de muchos modelos de lenguaje actuales?', 'Transformer', 'Perceptrón simple', 'Red de Hopfield', 'Máquina de Boltzmann', true),
    ],
    tf: [
      TF('Un modelo de IA siempre dice la verdad.', false, 'Puede equivocarse o inventar datos; conviene verificar lo importante.'),
      TF('La calidad de los datos de entrenamiento influye en los resultados de un modelo.', true, ''),
      TF('Los sesgos presentes en los datos pueden reflejarse en las respuestas de un modelo.', true, ''),
      TF('La IA generativa sólo puede crear texto.', false, 'También puede generar imágenes, audio, código y más.'),
    ],
    wwyd: [
      W('Un estudiante quiere usar IA para su trabajo final. ¿Cuál es la mejor práctica?', 'Usarla como apoyo para entender y mejorar, verificar la información y declarar su uso según las reglas del curso', 'Usarla sólo para corregir la ortografía', 'Copiar la respuesta tal cual y entregarla', 'Entregar todo sin revisar y ocultar que la usó', 'La IA es una ayuda, no un sustituto del criterio propio.'),
      W('La IA les da una cifra que no coincide con su fuente. ¿Qué hacen?', 'Contrastar con la fuente original y corregir el dato', 'Preguntarle de nuevo a la IA hasta que coincida', 'Confiar en la IA porque es más rápida', 'Publicar la cifra sin revisar', 'Siempre prevalece la fuente verificable.'),
    ],
    order: [
      O('Ordena estas etapas típicas de un proyecto de aprendizaje automático.', ['Recolectar los datos', 'Limpiar y preparar los datos', 'Entrenar el modelo', 'Evaluar y poner el modelo en uso'], ''),
      O('Ordena estos hitos de la IA.', ['Alan Turing propone su test (1950)', 'Deep Blue vence a Kasparov (1997)', 'AlphaGo vence a Lee Sedol (2016)', 'Aparece el artículo del Transformer (2017)'], ''),
    ],
    memory: [
      M('Ficha del modelo', ['Nombre: Atlas', 'Datos: 2 millones de ejemplos', 'Precisión: 92 %', 'Idioma: español'], '¿Qué precisión tenía el modelo?', '92 %', '82 %', '98 %', '75 %'),
      M('Pasos de un buen prompt', ['1. Contexto', '2. Tarea', '3. Formato', '4. Ejemplo'], '¿Cuál era el paso 3?', 'Formato', 'Contexto', 'Tarea', 'Ejemplo'),
    ],
    guess: [
      G('Concepto', ['Se entrena con muchísimos datos', 'Está formada por capas de nodos conectados', 'Se inspira en el cerebro humano', 'Es la base del aprendizaje profundo', 'La red neuronal'], ['red neuronal', 'redes neuronales', 'red neuronal artificial'], ''),
      G('Concepto', ['Es una unidad en la que un modelo procesa el texto', 'Puede ser una palabra o parte de una palabra', 'Los modelos de lenguaje los cuentan para medir el largo de un texto', 'Se predice uno tras otro al generar texto', 'El token'], ['token', 'tokens'], ''),
    ],
    connection: [
      C(['Texto', 'Imagen', 'Audio', 'Código', 'Video'], 'Tipos de contenido que puede generar una IA', 'Tipos de procesadores que usan las computadoras', 'Tipos de redes de comunicación informáticas', 'Tipos de licencias de software libre'),
      C(['Sesgo', 'Alucinación', 'Privacidad', 'Transparencia', 'Derechos de autor'], 'Desafíos éticos y de uso de la IA', 'Componentes de hardware', 'Lenguajes de programación', 'Tipos de contratos'),
      C(['Supervisado', 'No supervisado', 'Por refuerzo', 'Profundo', 'Por transferencia'], 'Enfoques del aprendizaje automático', 'Tipos de redes sociales', 'Métodos de cifrado', 'Sistemas de archivos'),
    ],
    quick: [
      Q('¿Qué significa «ML» en inteligencia artificial?', 'Machine learning (aprendizaje automático)', 'Módulo lógico de memoria dinámica', 'Multi-lenguaje de programación', 'Memoria lenta de almacenamiento'),
      Q('¿Qué se necesita para entrenar un modelo de IA?', 'Datos', 'Sólo electricidad', 'Un teclado especial', 'Un escáner'),
      Q('¿Cómo se llama la práctica de diseñar buenas instrucciones para un modelo?', 'Ingeniería de prompts', 'Ingeniería civil', 'Ingeniería de sonido', 'Minería de datos'),
      Q('¿Qué hace un «chatbot»?', 'Conversa con personas mediante texto o voz', 'Compila programas escritos en código', 'Enfría el procesador del computador', 'Imprime documentos en papel'),
    ],
    strategic: [
      S('Su equipo debe analizar un informe de 40 páginas con IA en poco tiempo.', 'Dividirlo en partes y revisar cada resumen', 'Pedir un solo resumen y confiar sin revisar', 'Consultar a un colega experto para validar'),
      S('Un modelo da resultados distintos cada vez que lo usan.', 'Ajustar las instrucciones y probar con ejemplos', 'Usar el primer resultado sin más', 'Pedir ayuda a otro equipo técnico'),
    ],
    boss: [
      B('El Oráculo de los Datos', '¿Cómo se llama el problema en que un modelo memoriza los datos de entrenamiento y funciona mal con datos nuevos?', 'Sobreajuste (overfitting)', 'Compresión', 'Fragmentación', 'Desbordamiento de pila'),
      B('La Gran Red Neuronal', '¿Qué técnica entrena a un modelo con recompensas y penalizaciones?', 'Aprendizaje por refuerzo', 'Aprendizaje supervisado', 'Clustering', 'Compresión de datos'),
    ],
  },
};

const claude = {
  id: 'claude', name: 'CLAUDE AI', emoji: '✨', desc: 'Prompts, archivos, educación, código e investigación con Claude.',
  a: '#fb923c', b: '#a78bfa', bg: ['✨', '💬', '📄', '🧩'],
  teams: [
    { n: 'Los Prompts', s: '✍️' }, { n: 'Los Artifacts', s: '🧩' }, { n: 'Los Proyectos', s: '📁' }, { n: 'Los Analistas', s: '📊' },
    { n: 'Los Redactores', s: '📝' }, { n: 'Los Programadores', s: '💻' }, { n: 'Los Investigadores', s: '🔎' }, { n: 'Los Creadores', s: '🎨' },
  ],
  surprise: ['Claude sugiere una idea inesperada…', 'Un archivo nuevo llega a la conversación…', 'Se abre una pestaña de investigación…'],
  bank: {
    quiz: [
      Q('Un profesor tiene una lectura de 30 páginas y necesita convertirla en una actividad para sus estudiantes. ¿Cuál es la mejor estrategia con Claude?', 'Adjuntar el documento y pedir una actividad indicando objetivos, nivel del grupo, duración y formato', 'Escribir sólo el título de la lectura y confiar en que Claude adivine lo que se necesita', 'Pedir una actividad cualquiera sin decir el tema, el nivel ni el objetivo del grupo', 'Pedir un resumen de «algo sobre educación» sin adjuntar ni mencionar la lectura', false, 'Cuanto más contexto y claridad, mejor resultado.'),
      Q('Para obtener mejores respuestas de Claude, ¿qué conviene incluir en el prompt?', 'Contexto, objetivo, audiencia y formato esperado', 'Una sola palabra clave y nada más', 'Mensajes lo más cortos posibles, sin detalles', 'Ninguna instrucción: Claude lo adivina todo'),
      Q('¿Qué puede hacer Claude con un PDF adjunto a la conversación?', 'Leerlo para resumirlo, responder preguntas y extraer información', 'Sólo contar cuántas páginas tiene el documento', 'Nada: sólo acepta texto escrito directamente en el chat', 'Sólo traducirlo, sin poder responder preguntas sobre él'),
      Q('¿Qué son los «Artifacts» en Claude?', 'Contenidos que Claude crea junto al chat y que se pueden editar o compartir', 'Una copia de seguridad automática que guarda todos tus chats antiguos', 'Un tipo de suscripción que ofrece más mensajes diarios que el plan gratuito', 'Un antivirus que revisa uno por uno los archivos que adjuntas al chat'),
      Q('¿Para qué sirven los «Proyectos» en Claude?', 'Para organizar chats y archivos de un mismo tema, con instrucciones propias', 'Para borrar de una vez todo el historial de conversaciones', 'Para cambiar el idioma de toda la aplicación y del teclado', 'Para actualizar el navegador y los complementos instalados'),
      Q('Si una respuesta de Claude parece dudosa, ¿cuál es la mejor práctica?', 'Pedir explicación o fuentes y contrastar con referencias confiables', 'Aceptarla siempre sin revisar porque Claude nunca se equivoca', 'Borrar el chat entero y no volver a usar Claude nunca más', 'Repetir la misma pregunta hasta que la respuesta cambie de idea', true),
    ],
    tf: [
      TF('Claude puede ayudar a escribir y depurar código.', true, ''),
      TF('Claude puede analizar imágenes que se adjuntan a la conversación.', true, 'Por ejemplo gráficos, fotos de apuntes o capturas de pantalla.'),
      TF('Un buen prompt siempre debe ser lo más corto posible.', false, 'Con más contexto y claridad suele mejorar el resultado.'),
      TF('Claude puede equivocarse, por eso conviene revisar los datos importantes.', true, ''),
    ],
    wwyd: [
      W('Eres docente y quieres crear un banco de preguntas sobre un tema. ¿Qué haces con Claude?', 'Indicar tema, nivel y tipo de preguntas, pedir también las respuestas correctas y revisarlas tú', 'Pedir las preguntas y revisar sólo las primeras', 'Pedir «preguntas de algo» y usarlas sin leerlas', 'Copiar preguntas de cualquier sitio sin revisarlas', 'La revisión humana es clave en material educativo.'),
      W('Tienes una hoja de cálculo con las notas de 50 estudiantes y quieres detectar quiénes están en riesgo. ¿Cuál es la mejor estrategia?', 'Adjuntar el archivo sin datos personales innecesarios, explicar el criterio de riesgo y pedir una tabla con el análisis', 'Adjuntar el archivo y pedir un análisis general sin indicar el criterio', 'Pegar todos los datos personales sin pensar en la privacidad', 'Pedirle que adivine quiénes están en riesgo', 'Cuida la privacidad y define el criterio.'),
      W('Quieres que Claude te ayude a preparar una presentación de clase. ¿Qué haces?', 'Indicar el tema, la audiencia y la duración, y pedir un esquema para ajustarlo juntos', 'Pedir un esquema general y rehacerlo después', 'Pedir «haz una presentación» sin más datos', 'No explicar nada sobre la clase', 'Un esquema colaborativo ahorra tiempo.'),
    ],
    order: [
      O('Ordena los pasos de una buena conversación con Claude.', ['Explicar el contexto y el objetivo', 'Dar la instrucción concreta y el formato esperado', 'Revisar la respuesta', 'Pedir ajustes con comentarios específicos'], ''),
      O('Ordena un flujo para crear un material educativo con Claude.', ['Definir el objetivo de aprendizaje', 'Adjuntar o describir el contenido base', 'Pedir un borrador del material', 'Revisar, ajustar y adaptar al grupo'], ''),
    ],
    memory: [
      M('Recomendaciones de prompt', ['Rol: «actúa como tutor»', 'Tarea: crear 5 preguntas', 'Nivel: primer semestre', 'Formato: tabla con respuesta'], '¿Qué formato se pedía?', 'Tabla con respuesta', 'Lista numerada', 'Párrafo largo', 'Esquema visual'),
      M('Material del taller', ['Archivo: lectura.pdf', 'Páginas: 30', 'Duración: 60 minutos', 'Grupo: 25 estudiantes'], '¿Cuántos estudiantes tenía el grupo?', '25', '30', '20', '15'),
    ],
    guess: [
      G('Concepto', ['Se escribe en lenguaje natural', 'Puede incluir contexto, tarea y formato', 'Es lo primero que Claude recibe de ti', 'Mientras más claro, mejor es la respuesta', 'El prompt'], ['prompt', 'instruccion', 'el prompt'], ''),
      G('Función', ['Aparece junto al chat', 'Puede contener un documento, código o una página', 'Puedes editarlo y compartirlo', 'Se guarda para volver a él', 'El artifact'], ['artifact', 'artifacts', 'artefacto', 'artefactos'], ''),
    ],
    connection: [
      C(['PDF', 'Word', 'Excel', 'CSV', 'TXT'], 'Formatos de documentos que se pueden adjuntar a Claude', 'Lenguajes de programación para crear páginas web', 'Sistemas operativos de computadores personales', 'Navegadores web para entrar a Internet'),
      C(['Resumir', 'Traducir', 'Redactar', 'Explicar', 'Corregir'], 'Tareas de texto que Claude puede hacer', 'Partes de un archivo', 'Tipos de gráficos', 'Funciones del teclado'),
      C(['Contexto', 'Objetivo', 'Audiencia', 'Formato', 'Ejemplos'], 'Elementos de un buen prompt', 'Tipos de archivos', 'Partes de un computador', 'Fases de una investigación'),
    ],
    quick: [
      Q('¿Cómo se llama la instrucción que le das a Claude?', 'Prompt', 'Cookie', 'Router', 'Firewall'),
      Q('¿Qué conviene hacer con los datos importantes que da Claude?', 'Verificarlos', 'Ignorarlos', 'Borrarlos', 'Imprimirlos sin leerlos'),
      Q('¿Qué empresa creó a Claude?', 'Anthropic', 'Google', 'Meta', 'Apple'),
      Q('¿En qué idioma puedes conversar con Claude?', 'En varios, incluido el español', 'Sólo en inglés', 'Sólo en código', 'Sólo en latín'),
    ],
    strategic: [
      S('Tienes 3 horas para preparar un taller y 40 páginas de material.', 'Pedir un resumen por secciones y armar el taller con calma', 'Pedir todo en una sola instrucción sin revisar', 'Pedir a un colega que valide el borrador de Claude'),
      S('Quieres investigar un tema nuevo para tu clase.', 'Pedir un panorama general y luego fuentes para verificar', 'Usar la primera respuesta como definitiva', 'Preguntar a un experto de tu facultad'),
    ],
    boss: [
      B('El Gran Prompt', 'Una profesora quiere corregir 30 ensayos con una rúbrica. ¿Cuál es el mejor enfoque con Claude?', 'Compartir la rúbrica y los ensayos sin datos personales, pedir comentarios por criterio y revisarlos', 'Pedir una nota final automática para cada ensayo y publicarla sin revisarla ni comentarla', 'Pedir «corrige esto» sin compartir la rúbrica ni explicar qué se quiere evaluar', 'Pegar los 30 ensayos en un solo mensaje sin dar ninguna instrucción ni criterio'),
      B('El Laberinto de Datos', 'Tienes un archivo CSV con las respuestas de una encuesta a estudiantes. ¿Qué enfoque es mejor?', 'Adjuntar el CSV, explicar qué quieres saber y pedir tablas y gráficos para validarlos', 'Pedirle a Claude que invente los resultados que mejor queden en el informe', 'Pegar sólo la primera fila de datos y pedir conclusiones generales', 'Pedir conclusiones sin adjuntar ni describir los datos reales'),
    ],
  },
};

module.exports = [videojuegos, tecnologia, ia, claude];
