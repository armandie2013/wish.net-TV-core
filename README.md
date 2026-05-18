# wish.net-TV-core

Backend administrativo y API central del sistema IPTV.

Este proyecto administra usuarios, planes, canales, fuentes M3U, localidades, nodos de streaming, conexiones activas, logs del sistema y autenticación para la app Android/TV.

Está desarrollado con:

- Next.js 14
- React 18
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod
- Tailwind CSS
- Worker interno con `tsx`

---

## 1. Objetivo del sistema

`wish.net-TV-core` funciona como el backend central del sistema IPTV.

Sus tareas principales son:

- Administrar usuarios del sistema.
- Crear y editar planes IPTV.
- Asignar grillas de canales a cada plan.
- Importar canales desde fuentes M3U.
- Sincronizar canales contra la base de datos.
- Suspender o activar canales.
- Eliminar canales limpiando referencias en planes.
- Administrar localidades.
- Asociar localidades con nodos de streaming.
- Administrar nodos origin y edge.
- Resolver qué URL de reproducción debe usar cada cliente.
- Controlar límites de conexiones simultáneas por usuario.
- Registrar presencia y conexiones activas.
- Generar playlists por token.
- Mostrar métricas y logs del sistema.
- Proteger usuarios administradores críticos.

---

## 2. Arquitectura general

El sistema se divide en tres partes principales:

```txt
App Android / TV
        |
        | Login / Live / Play / Presence
        v
wish.net-TV-core
        |
        | Decide estrategia de reproducción
        v
Origin / Edge IPTV
        |
        | Proxy TS / Stream / HLS
        v
Fuente IPTV / Tvheadend / M3U
```

El backend no reproduce video directamente para el usuario final. Su función es autenticar, validar permisos y entregar la mejor ruta de reproducción disponible.

---

## 3. Componentes principales

### Backend administrativo

Panel web disponible desde el navegador.

Permite administrar:

- Dashboard
- Usuarios
- Planes
- Canales
- Fuentes M3U
- Localidades
- Nodos de streaming
- Configuración general
- Logs del sistema

### API para la app

La app Android consume endpoints como:

```txt
POST /api/app/login
GET  /api/app/me
GET  /api/app/live
GET  /api/app/channel/:id/play
POST /api/app/change-password
POST /api/presence
```

### Worker

El proyecto incluye un worker ejecutable con:

```bash
npm run worker
```

El worker está pensado para tareas programadas como:

- Sincronización de fuentes M3U.
- Limpieza de tokens vencidos.
- Limpieza de sesiones.
- Verificación de salud de canales/nodos.

---

## 4. Módulos del sistema

### Usuarios

El módulo de usuarios permite:

- Crear usuarios.
- Editar usuarios.
- Suspender o activar usuarios.
- Resetear contraseñas.
- Borrar usuarios.
- Asignar rol.
- Asignar plan.
- Asignar localidad.
- Definir cantidad de conexiones permitidas.
- Definir duración del token.
- Marcar usuarios como protegidos.

Roles disponibles:

```txt
admin
operador
cliente
```

Estados disponibles:

```txt
activo
suspendido
```

Duraciones de token disponibles:

```txt
8h
12h
24h
48h
10d
20d
30d
60d
```

### Administradores protegidos

El sistema tiene administradores críticos protegidos.

Por defecto se consideran protegidos:

```txt
admin@wishnet.local
armandie2018@gmail.com
```

Reglas aplicadas:

- No se pueden borrar.
- No se pueden suspender.
- No se les puede bajar el rol.
- No pueden resetearse la contraseña a sí mismos desde el CRUD.
- Solo otro administrador protegido puede resetear la contraseña de un administrador protegido.
- Los administradores normales no pueden modificar acciones sensibles sobre administradores protegidos.

Esto se valida tanto en la vista como en el backend.

### Planes

El módulo de planes permite:

- Crear planes.
- Editar planes.
- Activar o suspender planes.
- Definir precio.
- Definir cantidad de canales.
- Crear una grilla ordenada.
- Asignar canales por número.
- Definir nombre visible por canal.
- Habilitar o deshabilitar canales dentro del plan.

La grilla usa `grillaCanales`, donde cada fila guarda:

```txt
numero
orden
channelId
nombreVisible
habilitado
logo
categoria
sourceName
```

Si un canal está suspendido, no se entrega a la app aunque exista en la grilla.

### Canales

El módulo de canales permite:

- Crear canales.
- Editar canales.
- Suspender o activar canales.
- Borrar canales.
- Ver estado.
- Ver URL origen.
- Ver categoría.
- Ver fuente de origen.

Cuando un canal se borra:

- Se elimina de la colección `Channel`.
- Se quita de `canalesPermitidos`.
- Se limpia de `grillaCanales`.
- Se marca como no habilitado en los planes donde estaba asignado.

Cuando un canal se suspende:

- Deja de entregarse a clientes.
- Se deshabilita en los planes.
- Permanece visible para administración.

### Fuentes M3U

El módulo de fuentes M3U permite:

- Registrar una URL M3U.
- Importar canales.
- Actualizar canales existentes.
- Crear canales nuevos.
- Suspender canales que ya no vienen en la fuente.
- Sincronizar datos con los planes.

Cuando se importa una fuente:

```txt
Canal nuevo       -> se crea
Canal existente   -> se actualiza
Canal removido    -> se suspende
Canal en planes   -> se sincroniza
```

No se eliminan automáticamente canales removidos de la fuente para evitar romper planes existentes.

### Localidades

El módulo de localidades permite:

- Crear localidades.
- Editar localidades.
- Activar o suspender localidades.
- Asignar nodo principal.
- Asignar nodo fallback.

Cada usuario puede tener una localidad asociada.

La localidad se usa para decidir desde qué edge debe reproducir.

### Nodos de streaming

El módulo de streaming permite administrar nodos:

```txt
origin
edge
```

Cada nodo tiene:

- Nombre.
- Código.
- Tipo.
- URL base.
- Estado.
- Prioridad.
- Health endpoint.
- Estado de salud.
- Último chequeo.
- Última respuesta.
- Tiempo de respuesta.
- Mensaje de error.

El backend usa estos nodos para resolver la mejor estrategia de reproducción.

---

## 5. Resolución de reproducción

Cuando la app pide reproducir un canal:

```txt
GET /api/app/channel/:id/play
```

El backend valida:

1. Token JWT.
2. Usuario activo.
3. Plan asignado.
4. Plan activo.
5. Canal permitido en el plan.
6. Canal activo.
7. Límite de conexiones simultáneas.
8. Localidad del usuario.
9. Nodo edge principal.
10. Nodo edge fallback.
11. Nodo origin global.

Luego devuelve una estrategia de reproducción.

Estrategias posibles:

```txt
edge-main
edge-fallback
origin-main
origin-fallback
origin-global-fallback
direct
```

---

## 6. Soporte Tvheadend / TS proxy

Si la URL origen del canal tiene formato Tvheadend:

```txt
/stream/channelid/<ID>?profile=pass
```

el backend genera una URL proxy TS del nodo correspondiente:

```txt
http://EDGE_IP:PUERTO/proxy/<ID>.ts
```

Ejemplo:

```txt
http://10.254.1.15:5001/proxy/928351928.ts
```

Esto permite que varios clientes consuman desde el edge sin abrir múltiples conexiones innecesarias contra el origen.

---

## 7. Conexiones activas y presencia

El sistema usa la colección `ActiveConnection` para registrar reproducciones activas.

Cada conexión guarda:

```txt
userId
deviceId
channelId
channelName
ip
userAgent
strategy
streamUrl
nodeId
nodeName
nodeCode
startedAt
lastSeenAt
expiresAt
```

El TTL de conexiones activas es de 90 segundos.

El backend crea automáticamente el índice TTL correcto:

```txt
expiresAt_1
expireAfterSeconds: 0
```

Si el índice existe pero no es TTL, el backend lo reemplaza automáticamente.

También limpia conexiones vencidas desde el código.

---

## 8. Normalización de IP

El backend normaliza IPs antes de guardarlas.

Ejemplos:

```txt
::ffff:10.254.1.51 -> 10.254.1.51
::1                -> 127.0.0.1
```

Esto evita mostrar direcciones IPv6 mapeadas cuando en realidad son IPv4 normales.

---

## 9. Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wishnet_tv_core
JWT_SECRET=CAMBIAR_POR_UNA_CLAVE_SEGURA
APP_NAME=Mi Empresa IPTV
NODE_ENV=development
```

Variables principales:

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `APP_NAME` | Nombre mostrado en el panel |
| `NODE_ENV` | Entorno de ejecución |

En producción, `JWT_SECRET` debe ser una clave larga y segura.

---

## 10. Instalación en desarrollo

### Requisitos

- Node.js 20 LTS o superior.
- npm.
- MongoDB.
- Git.

### Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd wish.net-TV-core
```

### Instalar dependencias

```bash
npm install
```

### Crear archivo `.env`

```bash
cp .env.example .env
```

Editar `.env` con los valores correctos.

### Crear administradores iniciales

```bash
npm run seed
```

El seed crea o asegura estos administradores protegidos:

```txt
admin@wishnet.local
armandie2018@gmail.com
```

Contraseña inicial por defecto:

```txt
Admin123456!
```

Se recomienda cambiarla luego del primer ingreso.

### Ejecutar en desarrollo

```bash
npm run dev
```

El sistema queda disponible en:

```txt
http://localhost:3000
```

---

## 11. Comandos disponibles

```bash
npm run dev
```

Levanta Next.js en modo desarrollo.

```bash
npm run build
```

Compila el proyecto para producción.

```bash
npm run start
```

Levanta el proyecto compilado.

```bash
npm run seed
```

Crea o actualiza los administradores iniciales protegidos.

```bash
npm run worker
```

Ejecuta el worker de tareas programadas.

---

## 12. Endpoints principales

### Autenticación panel

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

### API app Android

```txt
POST /api/app/login
GET  /api/app/me
GET  /api/app/live
GET  /api/app/channel/:id/play
GET  /api/app/channel/:id/stream
POST /api/app/change-password
```

### Presencia

```txt
POST /api/presence
```

### Dashboard

```txt
GET /api/dashboard
```

### Usuarios

```txt
GET  /api/users
POST /api/users
GET  /api/users/:id
POST /api/users/:id
POST /api/users/:id/toggle-status
POST /api/users/:id/reset-password
POST /api/users/:id/delete
POST /api/users/:id/playlist-token
```

### Planes

```txt
GET  /api/planes
POST /api/planes
GET  /api/planes/:id
POST /api/planes/:id
POST /api/planes/:id/toggle-status
```

### Canales

```txt
GET  /api/canales
POST /api/canales
GET  /api/canales/:id
POST /api/canales/:id
POST /api/canales/:id/toggle-status
POST /api/canales/:id/delete
```

### Fuentes M3U

```txt
GET  /api/configuracion/m3u-sources
POST /api/configuracion/m3u-sources
GET  /api/configuracion/m3u-sources/:id
POST /api/configuracion/m3u-sources/:id
POST /api/configuracion/m3u-sources/:id/import
POST /api/configuracion/m3u-sources/:id/toggle-status
```

### Localidades

```txt
GET  /api/configuracion/localidades
POST /api/configuracion/localidades
GET  /api/configuracion/localidades/:id
POST /api/configuracion/localidades/:id
POST /api/configuracion/localidades/:id/toggle-status
```

### Nodos de streaming

```txt
GET  /api/configuracion/streaming
POST /api/configuracion/streaming
GET  /api/configuracion/streaming/:id
POST /api/configuracion/streaming/:id
POST /api/configuracion/streaming/:id/toggle-status
POST /api/configuracion/streaming/:id/refresh-health
```

### Playlist

```txt
GET /api/playlist/me
GET /api/playlist/:token
```

### Logs

```txt
GET /api/logs
```

### Health

```txt
GET /api/health
```

---

## 13. Producción en Ubuntu Server

Referencia recomendada:

- Ubuntu Server 24.04 LTS.
- Node.js 20 LTS.
- MongoDB.
- Servicio systemd.

### Instalar dependencias base

```bash
sudo apt update
sudo apt install -y curl git build-essential
```

### Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verificar:

```bash
node -v
npm -v
```

### Clonar proyecto

```bash
sudo mkdir -p /opt/wish.net-TV-core
sudo chown -R $USER:$USER /opt/wish.net-TV-core

cd /opt
git clone <URL_DEL_REPOSITORIO> wish.net-TV-core
cd /opt/wish.net-TV-core
```

### Instalar dependencias

```bash
npm install
```

### Configurar `.env`

```bash
nano .env
```

Ejemplo:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wishnet_tv_core
JWT_SECRET=CAMBIAR_POR_UNA_CLAVE_LARGA_SEGURA
APP_NAME=Mi Empresa IPTV
NODE_ENV=production
```

### Crear administradores iniciales

```bash
npm run seed
```

### Compilar

```bash
npm run build
```

### Probar manualmente

```bash
npm run start
```

---

## 14. Servicio systemd para producción

Crear servicio:

```bash
sudo nano /etc/systemd/system/wishnet-tv-core.service
```

Contenido sugerido:

```ini
[Unit]
Description=wish.net-TV-core Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/wish.net-TV-core
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable wishnet-tv-core
sudo systemctl start wishnet-tv-core
```

Ver estado:

```bash
sudo systemctl status wishnet-tv-core
```

Ver logs:

```bash
sudo journalctl -u wishnet-tv-core -f
```

---

## 15. Servicio systemd para worker

Crear servicio:

```bash
sudo nano /etc/systemd/system/wishnet-tv-worker.service
```

Contenido sugerido:

```ini
[Unit]
Description=wish.net-TV-core Worker
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/wish.net-TV-core
ExecStart=/usr/bin/npm run worker
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable wishnet-tv-worker
sudo systemctl start wishnet-tv-worker
```

Ver logs:

```bash
sudo journalctl -u wishnet-tv-worker -f
```

---

## 16. Actualización en producción

Proceso recomendado:

```bash
cd /opt/wish.net-TV-core
git pull
npm install
npm run build
sudo systemctl restart wishnet-tv-core
sudo systemctl restart wishnet-tv-worker
sudo systemctl status wishnet-tv-core
sudo systemctl status wishnet-tv-worker
```

Verificar:

```bash
curl http://localhost:3000/api/health
```

---

## 17. Seguridad recomendada

Antes de poner en producción:

- Cambiar `JWT_SECRET`.
- Cambiar contraseñas por defecto.
- Ejecutar `npm run seed` solo para asegurar admins iniciales.
- Verificar que los administradores protegidos estén correctamente marcados.
- No compartir `.env`.
- No subir `.env` al repositorio.
- Usar HTTPS si el panel queda expuesto.
- Limitar acceso al panel administrativo por firewall o VPN si corresponde.
- Usar contraseñas fuertes.
- Revisar periódicamente logs del sistema.

---

## 18. Flujo recomendado de administración

### Alta inicial

1. Crear o importar canales.
2. Crear nodos origin/edge.
3. Crear localidades.
4. Asociar cada localidad con su edge principal y fallback.
5. Crear planes.
6. Asignar grilla de canales al plan.
7. Crear usuarios.
8. Asignar plan y localidad a cada usuario.
9. Probar login desde la app.
10. Probar reproducción.
11. Verificar conexiones activas en dashboard.

---

## 19. Reglas importantes del sistema

### Canales suspendidos

Un canal suspendido:

- No se entrega a clientes.
- No entra en `canalesPermitidos`.
- No se puede habilitar desde la grilla del plan.
- Puede quedar visible como referencia administrativa.

### Plan suspendido

Un plan suspendido:

- No debería entregar canales a la app.
- Bloquea la reproducción asociada a usuarios que lo tengan asignado.

### Usuario suspendido

Un usuario suspendido:

- No puede ingresar.
- No puede consumir la app.
- No debe renovar presencia.

### Conexiones activas

Una conexión activa vence por TTL si no renueva presencia.

Tiempo actual:

```txt
90 segundos
```

---

## 20. Troubleshooting

### El panel muestra una conexión vieja

El backend limpia conexiones vencidas y asegura índice TTL automáticamente.

Revisar logs al iniciar:

```txt
[DB INDEX] Reemplazando índice expiresAt_1 por TTL expireAfterSeconds: 0
[DB INDEX] Creando índice TTL expiresAt_1
[DB CLEANUP] Conexiones activas vencidas eliminadas: X
```

Si una conexión sigue apareciendo, probablemente hay una app real enviando presencia.

### Aparece IP con `::ffff:`

El backend normaliza IPs.

Ejemplo:

```txt
::ffff:10.254.1.51 -> 10.254.1.51
```

Si aparece una IP vieja con `::ffff`, debería desaparecer al vencer el TTL.

### No se puede reproducir un canal

Revisar:

1. Usuario activo.
2. Usuario con plan asignado.
3. Plan activo.
4. Canal activo.
5. Canal habilitado en la grilla del plan.
6. Localidad asignada.
7. Nodo edge/origin activo.
8. Health del nodo online.
9. Límite de conexiones disponible.
10. URL origen del canal correcta.

### La app no puede iniciar sesión

Revisar:

1. Email correcto.
2. Contraseña correcta.
3. Usuario activo.
4. Token JWT válido.
5. `JWT_SECRET` igual después de reinicios.
6. Si `mustChangePassword` está activo, la app debe completar cambio de contraseña.

### MongoDB no conecta

Revisar:

```bash
sudo systemctl status mongod
```

Revisar `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wishnet_tv_core
```

---

## 21. Estructura del proyecto

```txt
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
  config/
  controllers/
  lib/
  models/
  services/
  types/
  validations/

scripts/
  seed.ts

worker/
  index.ts
  jobs/
```

---

## 22. Convenciones del proyecto

El proyecto sigue una estructura por capas:

```txt
Vista / Page
    ↓
Route API
    ↓
Controller
    ↓
Service
    ↓
Model
    ↓
MongoDB
```

Regla recomendada para nuevas funcionalidades:

- Crear modelo si corresponde.
- Crear validación Zod.
- Crear service.
- Crear controller.
- Crear route.
- Crear vista.
- Registrar logs si es acción importante.
- Proteger rutas administrativas con `requireAdminFromRequest`.
- Validar reglas críticas también en backend, no solo en la vista.

---

## 23. Estado actual

El proyecto actualmente incluye:

- Login administrativo.
- Login para app Android.
- Usuarios con roles.
- Usuarios protegidos.
- Cambio obligatorio de contraseña.
- Duración configurable de token por usuario.
- CRUD completo de usuarios.
- CRUD completo de canales.
- CRUD de planes.
- Grilla de canales por plan.
- Importación y sincronización M3U.
- CRUD de localidades.
- CRUD de nodos streaming.
- Health check de nodos.
- Resolución automática edge/origin/fallback.
- Control de conexiones simultáneas.
- Presencia de clientes.
- Limpieza automática de conexiones vencidas.
- Normalización de IP.
- Logs del sistema.
- Playlist por token.

---

## 24. Notas importantes

Este backend es el centro de decisión del sistema IPTV.

Los nodos origin/edge deben estar correctamente configurados para que las URLs generadas funcionen.

El backend decide qué ruta entregar, pero la disponibilidad real del stream depende de:

- Fuente IPTV.
- Tvheadend.
- Origin.
- Edge.
- Red entre cliente y edge.
- Estado del canal.
- Estado del plan.
- Estado del usuario.

---

## 25. Autor / mantenimiento

Proyecto desarrollado y mantenido por Diego Armando Cardenes.

Sistema orientado a administración IPTV multiusuario con soporte para nodos origin/edge, planes comerciales, control de conexiones y app Android/TV.