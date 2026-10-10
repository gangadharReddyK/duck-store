export const SCHEMA_SQL = `CREATE TABLE IF NOT EXISTS duck (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  color       ENUM('Red','Green','Yellow','Black') NOT NULL,
  size        ENUM('XLarge','Large','Medium','Small','XSmall') NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED NOT NULL,
  deleted     TINYINT(1) NOT NULL DEFAULT 0,
  version     INT NOT NULL DEFAULT 0,
  active_key  TINYINT GENERATED ALWAYS AS (IF(deleted = 0, 1, NULL)) STORED,
  UNIQUE KEY uq_active_duck (color, size, price_cents, active_key)
)`;