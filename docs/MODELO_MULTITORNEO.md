# ALTO-SISTEMA — Modelo multitorneo

Version de referencia: 0.1.3
Estado: Diseño funcional y arquitectonico.

## 1. Objetivo

Administrar multiples torneos de futbol amateur
simultaneamente desde una unica aplicacion y una
unica base de datos.

Los torneos deben conservar su independencia
deportiva, administrativa y estadistica.

La independencia disciplinaria tendra como
excepcion las sanciones DEFINITIVAS, segun
el reglamento establecido.

## 2. Principios generales

- Una unica aplicacion.
- Una unica base de datos.
- Un administrador inicial.
- Multiples torneos simultaneos.
- Multiples ediciones por torneo.
- Multiples categorias por edicion.
- Reglamentos configurables.
- Identidad visual configurable.
- Conservacion del historial.
- Independencia de los datos deportivos.

No deben establecerse cantidades maximas de torneos,
ediciones, categorias, zonas o equipos mediante
constantes arbitrarias en el codigo.

## 3. Jerarquia deportiva

ALTO-SISTEMA
    Torneo
        Edicion
            Categoria de la edicion
                Reglamento
                Configuracion visual
                Equipos inscritos
                Listas de buena fe
                Fases
                Zonas
                Jornadas
                Partidos
                Copas
                Estadisticas
                Disciplina
                Publicaciones

Esta jerarquia representa el modelo conceptual.
Las tablas y relaciones definitivas se diseñaran
durante las historias de usuario correspondientes.

## 4. Torneos

Un torneo representa una competicion institucional
con identidad propia y continuidad en el tiempo.

Ejemplos:

- NOCTURNO.
- DIURNO.

Cada torneo podra disponer de:

- Identificador unico.
- Nombre.
- Descripcion.
- Estado.
- Identidad visual.
- Ediciones.
- Configuraciones particulares.

Los nombres de los torneos no deben formar parte
de las reglas de negocio escritas en el codigo.

## 5. Ediciones

Una edicion representa una realizacion determinada
de un torneo.

Ejemplos ilustrativos:

- NOCTURNO 2027.
- DIURNO 2027.
- NOCTURNO 2028.
- DIURNO 2028.

Cada edicion pertenece a un unico torneo.

Podran existir ediciones simultaneas.

La finalizacion de una edicion no debera eliminar
sus datos ni afectar otras ediciones.

Una edicion no debe identificarse exclusivamente
mediante el año, ya que un torneo podria tener
mas de una edicion durante un mismo año.

## 6. Categorias

Las categorias deben ser configurables.

Ejemplos:

- LIBRE.
- SENIOR.
- FEMENINO.
- MAYORES DE 40.

Cada torneo y edicion podra disponer de diferentes
categorias, sin estar obligado a utilizar todas
las existentes.

Cada categoria dentro de una edicion podra tener:

- Reglamento de edad.
- Equipos participantes.
- Formato de competicion.
- Zonas.
- Calendario.
- Copas.
- Identidad visual.
- Estadisticas independientes.

## 7. Contexto deportivo

El contexto deportivo se determina mediante:

- Identificador del torneo.
- Identificador de la edicion.
- Identificador de la categoria dentro de la edicion.

El frontend debera ofrecer un selector de contexto
deportivo que permita cambiar de competicion
sin cerrar la sesion del administrador.

El contexto seleccionado debera permanecer visible
durante las operaciones deportivas.

El backend debera verificar que los identificadores
recibidos correspondan a relaciones validas.

No se debe confiar exclusivamente en los filtros
aplicados por el frontend.

El cambio de contexto debera impedir que datos
cargados anteriormente se utilicen accidentalmente
en operaciones de otro torneo.

## 8. Equipos e inscripciones

La participacion de un equipo debera vincularse
a una edicion y categoria determinadas.

Un mismo nombre de equipo podra existir en
diferentes competiciones.

El nombre no constituye un identificador unico
global del sistema.

Las inscripciones deberan mantener su identidad
historica para preservar los resultados y las
estadisticas de cada competicion.

## 9. Jugadores y listas de buena fe

Las listas de buena fe constituyen registros
administrativos independientes de las estadisticas
de goleadores.

Un jugador podra participar en distintas
categorias conforme al reglamento aplicable.

No podra representar a diferentes equipos
dentro de una misma edicion y categoria.

Los datos personales deberan protegerse y no
formar parte de las publicaciones deportivas.

Las reglas de identidad y habilitacion deberan
permitir el control disciplinario transversal.

La identidad disciplinaria del jugador debera
permitir reconocerlo aunque participe en diferentes
torneos, categorias, ediciones o equipos.

## 10. Formatos de competicion

Cada categoria podra disponer de formatos propios.

El modelo debera permitir:

- Fases clasificatorias.
- Zonas.
- Partidos interzonales.
- Jornadas distribuidas en diferentes dias.
- Copas.
- Eliminatorias a partido unico.
- Eliminatorias de ida y vuelta.
- Definiciones mediante penales.

La programacion de los partidos sera manual.

No deben establecerse dias de juego obligatorios
mediante constantes en el codigo.

## 11. Estadisticas

Las estadisticas deberan calcularse utilizando
exclusivamente los partidos correspondientes
al contexto deportivo consultado.

Las tablas de posiciones, goleadores y valla
menos vencida no deberan mezclar informacion
de diferentes torneos, ediciones o categorias.

Los partidos interzonales deberan computarse
segun las reglas deportivas aprobadas.

Las estadisticas acumuladas entre fases y copas
deberan respetar el reglamento de la competicion.

Los resultados y eventos registrados constituiran
la fuente de verdad para los calculos deportivos.

Las correcciones deberan evitar duplicaciones
y permitir recalcular las estadisticas afectadas.

## 12. Disciplina

### 12.1. Independencia disciplinaria

El NOCTURNO y el DIURNO dispondran de sistemas
disciplinarios paralelos e independientes.

Las sanciones temporales aplicadas en un torneo
no afectaran la habilitacion del jugador en el otro.

La unica excepcion sera la sancion DEFINITIVA.

### 12.2. Tipos de sanciones

El sistema contemplara:

- Sanciones por cantidad de fechas.
- Sanciones FIN DE TORNEO.
- Sanciones DEFINITIVAS.

Cada sancion debera conservar su contexto
deportivo de origen.

### 12.3. Sanciones por fechas

Una sancion por cantidad de fechas afectara
exclusivamente al torneo donde fue aplicada.

Dentro de ese torneo, el jugador quedara
inhabilitado en todas sus categorias mientras
la sancion permanezca vigente.

El cumplimiento se computara exclusivamente
en la categoria de origen.

Los partidos disputados en otras categorias
o en otro torneo no descontaran fechas.

Cada partido posterior finalizado del equipo
correspondiente en la categoria de origen
descontara una fecha, incluyendo partidos
resueltos por incomparecencia.

No descontaran fechas:

- El partido donde se produjo la expulsion.
- Las jornadas libres.
- Los partidos pendientes.
- Los partidos de otras categorias.
- Los partidos de otros torneos.

### 12.4. Sanciones FIN DE TORNEO

El jugador quedara inhabilitado en todas las
categorias del torneo donde recibio la sancion
hasta la finalizacion de la edicion correspondiente.

Esta sancion no afectara su habilitacion
en el otro torneo.

### 12.5. Sanciones DEFINITIVAS

Una sancion DEFINITIVA aplicada en el NOCTURNO
o en el DIURNO producira la inhabilitacion
permanente del jugador en ambos torneos.

La inhabilitacion comprendera:

- Todas las categorias.
- Todas las ediciones presentes y futuras.
- Todos los equipos.

La sancion no expirara por el transcurso del tiempo,
la finalizacion de una edicion o el cambio de equipo.

### 12.6. Identidad disciplinaria

Las sanciones deberan vincularse a la identidad
del jugador y no exclusivamente a su inscripcion
en un equipo determinado.

El sistema debera evitar que un cambio de equipo,
categoria o edicion permita eludir una sancion
vigente dentro de su alcance reglamentario.

La identificacion disciplinaria debera contemplar
el DNI como identificador personal, protegiendo
su confidencialidad.

### 12.7. Ejemplos reglamentarios

Sancion de 3 fechas en NOCTURNO LIBRE:

- NOCTURNO LIBRE: suspendido.
- NOCTURNO SENIOR: suspendido.
- DIURNO: no afectado por esta sancion.

Sancion FIN DE TORNEO en NOCTURNO LIBRE:

- NOCTURNO LIBRE: suspendido.
- NOCTURNO SENIOR: suspendido.
- DIURNO: no afectado por esta sancion.

Sancion DEFINITIVA en NOCTURNO LIBRE:

- NOCTURNO LIBRE: inhabilitado.
- NOCTURNO SENIOR: inhabilitado.
- DIURNO: inhabilitado.

Las mismas reglas se aplicaran de manera
reciproca cuando la sancion se origine
en el DIURNO.

La habilitacion efectiva del jugador dependera
tambien de otras sanciones vigentes y de los
requisitos reglamentarios correspondientes.

### 12.8. Escalabilidad disciplinaria

El alcance de las sanciones debera formar parte
del modelo de configuracion reglamentaria.

No se deberan utilizar los nombres NOCTURNO
y DIURNO como condiciones fijas del codigo.

La incorporacion de futuros torneos requerira
definir expresamente su vinculacion con los
regimenes disciplinarios existentes.

### 12.9. Pruebas disciplinarias obligatorias

La futura implementacion debera comprobar:

- Independencia de sanciones temporales entre torneos.
- Bloqueo transversal entre categorias del mismo torneo.
- Cumplimiento de fechas en la categoria de origen.
- Ausencia de descuentos por partidos de otro torneo.
- Expiracion correcta de sanciones FIN DE TORNEO.
- Inhabilitacion DEFINITIVA en ambos torneos.
- Persistencia de la inhabilitacion DEFINITIVA.
- Control de identidad ante cambios de equipo.
- Conservacion del historial disciplinario.

No se deberan implementar excepciones
disciplinarias sin una regla aprobada.

## 13. Identidad visual

La identidad visual no debe estar fijada
directamente en el codigo.

El sistema debera permitir configurar:

- Logos.
- Colores mediante valores HEX.
- Identidad del torneo.
- Identidad de la edicion.
- Identidad de las categorias.
- Identidad de las copas.

Las publicaciones deberan utilizar la identidad
visual del contexto deportivo correspondiente.

La exportacion de placas debera realizarse
en formato PNG, con ancho uniforme y altura
adaptable al contenido.

## 14. Integridad de los datos

El diseño de la base de datos debera utilizar:

- Claves primarias.
- Claves foraneas.
- Restricciones de unicidad contextual.
- Indices apropiados.
- Transacciones cuando corresponda.
- Validaciones de relaciones.
- Migraciones versionadas.

Las operaciones de escritura deberan verificar
el contexto deportivo de todos los registros
involucrados.

Una operacion sobre un torneo no debera modificar
accidentalmente los datos de otro torneo.

Las excepciones disciplinarias expresamente
aprobadas deberan aplicarse mediante operaciones
controladas, verificables y documentadas.

## 15. Historial

La finalizacion de un torneo o edicion no debera
implicar la eliminacion automatica de sus datos.

El sistema debera permitir consultar:

- Ediciones anteriores.
- Equipos participantes.
- Resultados.
- Clasificaciones.
- Goleadores.
- Campeones.
- Sanciones.
- Publicaciones historicas.

La politica de archivo y conservacion se definira
en las historias de usuario correspondientes.

Las sanciones DEFINITIVAS deberan conservarse
independientemente del estado de la edicion
donde fueron aplicadas.

## 16. Escalabilidad funcional

La incorporacion de un nuevo torneo, edicion
o categoria debera realizarse mediante operaciones
administrativas de la aplicacion.

No debera requerir:

- Duplicar el proyecto.
- Crear otra base de datos.
- Modificar el codigo fuente.
- Crear una nueva instalacion.
- Reiniciar el sistema por cada torneo creado.

La arquitectura debera permitir nuevas modalidades
de competicion mediante ampliaciones controladas.

## 17. Criterios de aceptacion arquitectonica

Las futuras implementaciones deberan demostrar:

- Creacion de multiples torneos.
- Gestion simultanea del Nocturno y el Diurno.
- Independencia de sus ediciones.
- Independencia de sus categorias.
- Separacion de equipos inscritos.
- Separacion de resultados y estadisticas.
- Seleccion segura del contexto deportivo.
- Conservacion del historial.
- Rechazo de relaciones deportivas incompatibles.
- Independencia disciplinaria temporal.
- Aplicacion transversal de sanciones DEFINITIVAS.

Deberan incorporarse pruebas automatizadas que
comprueben expresamente que las operaciones
sobre un torneo no alteran indebidamente otro.

Las sanciones DEFINITIVAS constituiran una
excepcion reglamentaria controlada y deberan
contar con pruebas especificas.

## 18. Estado de implementacion

En la version 0.1.3 se dispone de la infraestructura
tecnica necesaria para comenzar el modelo deportivo.

Las entidades, relaciones, selectores de contexto
y funcionalidades multitorneo todavia no estan
implementadas.

Su desarrollo comenzara en la ETAPA 02.

El reglamento disciplinario documentado sera
implementado en la etapa correspondiente.

Este documento constituye una referencia obligatoria
para las futuras historias de usuario.