'use strict';
// Constructores compactos para escribir contenido.
// En todos los constructores de opciones la PRIMERA opción es la correcta;
// el motor las baraja en cada partida (nunca se envía el orden original al cliente).

// Quiz de 4 opciones. hard=true => reto difícil (+200)
const Q = (q, right, w1, w2, w3, hard = false, why = '') => ({ q, o: [right, w1, w2, w3], a: 0, hard: !!hard, why });

// Verdadero / Falso
const TF = (q, a, why = '') => ({ q, a: !!a, why });

// ¿Qué harías? Opciones ordenadas de mejor a peor: puntajes 100 / 50 / 0 / 0
const W = (q, best, ok, bad1, bad2, why = '') => {
  const o = [best, ok, bad1];
  const s = [100, 50, 0];
  if (bad2) { o.push(bad2); s.push(0); }
  return { q, o, s, why };
};

// Ordena: los elementos se escriben en el orden CORRECTO.
const O = (q, items, why = '') => ({ q, items, why });

// Memoria: se muestra `title` + `lines` unos segundos y luego se oculta.
const M = (title, lines, q, right, w1, w2, w3) => ({ title, lines, q, o: [right, w1, w2, w3], a: 0 });

// Adivina: pistas de la más difícil a la más fácil (5 pistas). ans = respuestas aceptadas.
const G = (cat, clues, ans, why = '') => ({ cat, clues, ans, why });

// Conexión: palabras y ¿qué tienen en común?
const C = (words, right, w1, w2, w3, why = '') => ({ words, o: [right, w1, w2, w3], a: 0, why });

// Elección estratégica: tres caminos con riesgo distinto.
const S = (q, safe, risk, ally) => ({ q, safe, risk, ally });

// Jefe final
const B = (boss, q, right, w1, w2, w3, why = '') => ({ boss, q, o: [right, w1, w2, w3], a: 0, hard: true, why });

module.exports = { Q, TF, W, O, M, G, C, S, B };
