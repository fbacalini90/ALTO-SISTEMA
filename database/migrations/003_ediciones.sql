
CREATE TABLE IF NOT EXISTS ediciones (
    id INT NOT NULL AUTO_INCREMENT,

    torneo_id INT NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    descripcion VARCHAR(500) NULL,

    fecha_inicio DATE NULL,

    fecha_finalizacion DATE NULL,

    estado ENUM(
        'PLANIFICADA',
        'EN_CURSO',
        'FINALIZADA'
    ) NOT NULL DEFAULT 'PLANIFICADA',

    fecha_creacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT uq_ediciones_torneo_nombre
        UNIQUE (torneo_id, nombre),

    CONSTRAINT fk_ediciones_torneo
        FOREIGN KEY (torneo_id)
        REFERENCES torneos (id)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT chk_ediciones_fechas
        CHECK (
            fecha_inicio IS NULL
            OR fecha_finalizacion IS NULL
            OR fecha_finalizacion >= fecha_inicio
        ),

    INDEX idx_ediciones_torneo_estado (
        torneo_id,
        estado
    )

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
