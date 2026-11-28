import {
    House,
    Trophy,
    Shield,
    ClipboardList,
    CalendarDays,
    ChartNoAxesColumn,
    Medal,
    ShieldCheck,
    GitMerge,
    Gavel,
    Image,
    History,
    Settings,
    LayoutGrid
} from 'lucide-react';

/* ICONOGRAFÍA OFICIAL DE LOS MÓDULOS */

export const ICONOS_MODULOS = Object.freeze({
    inicio: House,
    torneos: Trophy,
    equipos: Shield,
    listas: ClipboardList,
    partidos: CalendarDays,
    posiciones: ChartNoAxesColumn,
    goleadores: Medal,
    valla: ShieldCheck,
    playoffs: GitMerge,
    disciplina: Gavel,
    publicaciones: Image,
    historial: History,
    configuracion: Settings
});

/* OBTENER ICONO DE UN MÓDULO */

export function obtenerIconoModulo(id) {

    return Object.hasOwn(ICONOS_MODULOS, id)
        ? ICONOS_MODULOS[id]
        : LayoutGrid;

}