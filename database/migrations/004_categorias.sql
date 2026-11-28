-- ============================================================
-- ALTO-SISTEMA
-- Migración 004 - Gestión de categorías
-- Historia de usuario: HU-006
-- Versión objetivo: v0.4.0
-- ============================================================

CREATE TABLE categorias (

    id INT NOT NULL AUTO_INCREMENT,

    edicion_id INT NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    descripcion VARCHAR(500) DEFAULT NULL,

    estado ENUM(
        'ACTIVA',
        'ARCHIVADA'
    ) NOT NULL DEFAULT 'ACTIVA',

    fecha_creacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Clave primaria
    PRIMARY KEY (id),

    -- Nombre único dentro de cada edición
    CONSTRAINT uq_categorias_edicion_nombre
        UNIQUE (edicion_id, nombre),

    -- Índice para búsquedas y filtros
    INDEX idx_categorias_edicion_estado (
        edicion_id,
        estado
    ),

    -- Integridad referencial
    CONSTRAINT fk_categorias_edicion
        FOREIGN KEY (edicion_id)
        REFERENCES ediciones (id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT

) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;