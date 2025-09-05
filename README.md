# 🌤️ Microservicio de Clima con Elysia.js

Un microservicio moderno y eficiente para obtener datos meteorológicos con cache, construido con **Elysia.js** sobre **Bun**.

## ✨ Características

- **API REST** con endpoints para consultas individuales y en lote
- **Cache inteligente** con TTL de 10 minutos (SQLite o Redis)
- **Datos en tiempo real** de OpenWeatherMap
- **TypeScript** con tipos seguros
- **Middleware de logging** para monitoreo
- **Graceful shutdown** y manejo de errores robusto
- **Health check** endpoint

## 📁 Estructura del Proyecto

```
weather-microservice/
├── src/
│   ├── config/
│   │   └── env.ts           # Configuración de variables de entorno
│   ├── db/
│   │   ├── schema.ts        # Esquema Drizzle ORM
│   │   └── connection.ts    # Conexión SQLite con Drizzle
│   ├── lib/
│   │   └── redis.ts         # Cliente Redis dedicado
│   ├── middleware/
│   │   └── logging.ts       # Middleware de logging
│   ├── routes/
│   │   ├── health.ts        # Ruta de health check
│   │   └── weather.ts       # Rutas de clima
│   ├── services/
│   │   ├── cache.ts         # Gestor de cache (Redis + SQLite)
│   │   └── weather.ts       # Servicio de clima
│   └── types/
│       └── weather.ts       # Tipos TypeScript
├── drizzle/                 # Migraciones generadas
├── index.ts                 # Archivo principal
├── drizzle.config.ts        # Configuración Drizzle
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Instalación Rápida

### Prerrequisitos

- [Bun](https://bun.sh)
- [Bun sqlite](https://bun.com/docs/api/sqlite)
- [Redis](https://redis.io)
- API Key de [OpenWeatherMap](https://openweathermap.org/api) (gratuita)

### Paso a paso

1. **Crear estructura de carpetas:**

```bash
mkdir -p src/{config,db,lib,middleware,routes,services,types}
```

2. **Instalar dependencias:**

```bash
# Instalar dependencias
bun add elysia axios redis drizzle-orm
bun add -d drizzle-kit bun-types
```

3. **Configurar Redis:**

```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt update && sudo apt install redis-server

# Iniciar Redis
redis-server

# O usando Docker
docker run -d --name redis -p 6379:6379 redis:alpine
```

4. **Configurar variables de entorno:**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos
OPENWEATHER_KEY=tu_api_key_de_openweathermap
PORT=3000
REDIS_URL=redis://localhost:6379
```

5. **Ejecutar el servidor:**

```bash
# Desarrollo (con auto-reload)
bun run dev

# Producción
bun run start
```

El servidor estará corriendo en `http://localhost:3000`

## 📡 Endpoints API

### 🏥 Health Check

```bash
GET /health
```

Respuesta con estadísticas detalladas:

```json
{
  "status": "healthy",
  "service": "weather-microservice",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "cache": {
    "redis_connected": true,
    "sqlite_enabled": true,
    "total_entries": 25,
    "valid_entries": 20,
    "expired_entries": 5
  },
  "version": "2.0.0"
}
```

### 🌍 Clima de una ciudad

```bash
GET /weather/:city
```

**Ejemplo:**

```bash
curl http://localhost:3000/weather/Madrid
```

**Respuesta (sin cambios):**

```json
{
  "success": true,
  "data": {
    "city": "Madrid",
    "country": "ES",
    "temperature": 22,
    "feels_like": 24,
    "humidity": 65,
    "pressure": 1013,
    "description": "cielo claro",
    "icon": "01d",
    "wind_speed": 3.2,
    "visibility": 10000,
    "timestamp": 1705312200000
  }
}
```

### 🗺️ Clima de múltiples ciudades (Batch)

```bash
GET /weather?cities=city1,city2,city3
```

**Ejemplo:**

```bash
curl "http://localhost:3000/weather?cities=Madrid,Paris,Tokyo"
```

## ⚡ Sistema de Cache Híbrido

### **Flujo de Cache:**

1. **Consulta** → Buscar en Redis (ultra rápido)
2. **Si no existe** → Buscar en SQLite (respaldo)
3. **Si no existe** → Llamar API → Guardar en Redis + SQLite
4. **Cache hit** → Respuesta inmediata

### **Ventajas:**

✅ **Velocidad** - Redis para consultas frecuentes
✅ **Persistencia** - SQLite mantiene datos después de reiniciar
✅ **Redundancia** - Doble respaldo de datos
✅ **Auto-healing** - Si Redis falla, SQLite sigue funcionando

## 🛠️ Scripts de Base de Datos

```bash
# Generar migraciones Drizzle
bun run db:generate

# Aplicar migraciones
bun run db:push

# Ver schema actual
bunx drizzle-kit studio
```

## 📊 Monitoreo Avanzado

### **Logs del Sistema:**

```
🚀 GET /weather/Madrid - 2024-01-15T10:30:00.000Z
📦 Redis cache hit for Madrid
✅ GET /weather/Madrid - 200 (2ms)
```

### **Cache Stats en /health:**

- Total de entradas en cache
- Entradas válidas vs expiradas
- Estado de conexión Redis
- Uptime del servicio

## 📄 License

MIT License - úsalo como quieras 🎉

---

**Hecho con ❤️ usando Elysia.js y Bun**
