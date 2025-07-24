# Módulo de Administración de Usuarios

## Descripción

El módulo de administración de usuarios permite gestionar los usuarios registrados en AWS Cognito desde una interfaz web intuitiva y funcional.

## Características

### 1. Listado de Usuarios
- **Paginación**: Muestra 10 usuarios por página con navegación
- **Filtros avanzados**: Búsqueda por nombre, email o teléfono
- **Filtros por estado**: Activo, Inactivo, Pendiente
- **Filtros por plan**: Mensual, Anual, Gratis
- **Estadísticas en tiempo real**: Total de usuarios, usuarios activos, etc.

### 2. Gestión de Usuarios
- **Edición de información**: Nombre, apellido, teléfono
- **Cambio de estado**: Activar/Desactivar usuarios
- **Gestión de planes**: Asignar plan mensual, anual o gratis
- **Email de solo lectura**: El email no se puede modificar por ser único

### 3. Interfaz de Usuario
- **Diseño responsivo**: Funciona en desktop y móvil
- **Tema oscuro/claro**: Compatible con el sistema de temas
- **Iconos intuitivos**: Badges de estado y plan con colores distintivos
- **Modal de edición**: Interfaz limpia para editar usuarios

## Estructura de Archivos

```
src/
├── app/
│   └── admin/
│       └── users/
│           └── page.tsx                 # Página principal de administración
├── components/
│   └── admin/
│       ├── UserList.tsx                 # Tabla de usuarios con paginación
│       ├── UserFilters.tsx              # Filtros de búsqueda
│       ├── UserStats.tsx                # Estadísticas de usuarios
│       └── UserEditModal.tsx            # Modal de edición
├── types/
│   └── user.ts                          # Tipos TypeScript compartidos
└── app/api/admin/users/
    ├── route.ts                         # API para listar usuarios
    └── [id]/
        ├── route.ts                     # API para actualizar usuario
        └── status/
            └── route.ts                 # API para cambiar estado
```

## Tipos de Datos

### User
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  plan: 'monthly' | 'yearly' | 'free'
  createdAt: string
  lastLogin?: string
}
```

### UserFilters
```typescript
interface UserFilters {
  search: string
  status: string
  plan: string
}
```

## API Endpoints

### GET /api/admin/users
Lista usuarios con filtros y paginación.

**Parámetros:**
- `filters`: Objeto con filtros de búsqueda
- `pagination`: Objeto con configuración de paginación

### PUT /api/admin/users/[id]
Actualiza la información de un usuario específico.

### PUT /api/admin/users/[id]/status
Cambia el estado de un usuario (activo/inactivo).

## Integración con AWS Cognito

El módulo está diseñado para trabajar con AWS Cognito y utiliza:

- **User Pool**: Para autenticación y gestión de usuarios
- **Custom Attributes**: Para almacenar información adicional como el plan
- **Admin APIs**: Para operaciones de administración

### Atributos de Cognito
- `email`: Email del usuario (único)
- `given_name`: Nombre
- `family_name`: Apellido
- `phone_number`: Teléfono
- `custom:plan`: Plan contratado (monthly/yearly/free)

## Configuración Requerida

### Variables de Entorno
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_USER_POOL_ID=your_user_pool_id
```

### Dependencias
```json
{
  "aws-sdk": "^2.1000.0",
  "lucide-react": "^0.263.1"
}
```

## Uso

1. **Acceso**: Desde el dashboard principal, hacer clic en "Gestionar Usuarios"
2. **Filtrado**: Usar la barra de búsqueda o filtros avanzados
3. **Edición**: Hacer clic en el icono de editar en cualquier fila
4. **Cambio de estado**: Usar el botón de activar/desactivar en el modal

## Características Técnicas

- **TypeScript**: Tipado completo para mejor desarrollo
- **React Hooks**: useState, useEffect para gestión de estado
- **Tailwind CSS**: Estilos responsivos y tema oscuro
- **Next.js API Routes**: Backend serverless
- **AWS SDK**: Integración nativa con Cognito

## Próximas Mejoras

- [ ] Exportación a CSV/Excel
- [ ] Creación de usuarios desde la interfaz
- [ ] Historial de cambios
- [ ] Notificaciones en tiempo real
- [ ] Filtros adicionales (fecha de registro, último acceso)
- [ ] Bulk operations (activar/desactivar múltiples usuarios) 