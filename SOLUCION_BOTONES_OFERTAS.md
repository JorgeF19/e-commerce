# Solución: Botón "Ver Todas las Ofertas" no funcionaba correctamente

## Problema Identificado

El botón "Ver Todas las Ofertas" (y otros botones similares como "Ver Todos los Populares", "Ver Todos los Destacados") no funcionaban correctamente porque:

1. **En `Home.js`**: Los botones generaban URLs con parámetros como:

   ```javascript
   <Link to="/tienda?onSale=true">
     <Button variant="outline-danger">Ver Todas las Ofertas</Button>
   </Link>
   ```

2. **En `Store.js`**: El componente no procesaba estos parámetros de URL, solo manejaba:
   - `selectedCategory` (state local)
   - `searchTerm` (state local)
   - Pero **NO** los parámetros `onSale`, `featured`, `popular` de la URL

## Solución Implementada

### 1. Importaciones actualizadas en `Store.js`

```javascript
import { useSearchParams, useNavigate } from "react-router-dom";
```

### 2. Lectura de parámetros de URL

```javascript
function Store() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // ... resto del código
}
```

### 3. Función `fetchProducts` actualizada

```javascript
const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    let url = "http://localhost:5000/api/products";
    const params = new URLSearchParams();

    // Filtros locales existentes
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }
    if (searchTerm) {
      params.append("search", searchTerm);
    }

    // ✅ NUEVO: Parámetros de URL para filtros especiales
    if (searchParams.get("onSale")) {
      params.append("onSale", "true");
    }
    if (searchParams.get("featured")) {
      params.append("featured", "true");
    }
    if (searchParams.get("popular")) {
      params.append("popular", "true");
    }

    if (params.toString()) {
      url += "?" + params.toString();
    }

    const response = await axios.get(url);
    setProducts(response.data);
    // ...
  }
  // ...
}, [selectedCategory, searchTerm, searchParams]);
```

### 4. Título dinámico basado en filtros

```javascript
const getPageTitle = () => {
  if (searchParams.get("onSale")) {
    return "🔥 Productos en Oferta";
  }
  if (searchParams.get("featured")) {
    return "⭐ Productos Destacados";
  }
  if (searchParams.get("popular")) {
    return "👑 Productos Populares";
  }
  if (selectedCategory && categories.length > 0) {
    const category = categories.find((c) => c.id === selectedCategory);
    return `📦 ${category?.name || "Categoría"}`;
  }
  if (searchTerm) {
    return `🔍 Resultados para: "${searchTerm}"`;
  }
  return "Tienda";
};
```

### 5. Badges de filtros activos actualizados

```javascript
{
  /* Active Filters */
}
{
  (selectedCategory ||
    searchTerm ||
    searchParams.get("onSale") ||
    searchParams.get("featured") ||
    searchParams.get("popular")) && (
    <Row className="mb-3">
      <Col>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span>Filtros activos:</span>
          {/* Filtros existentes */}
          {selectedCategory && (
            <Badge bg="primary">
              Categoría:{" "}
              {categories.find((c) => c.id === selectedCategory)?.name}
            </Badge>
          )}
          {searchTerm && <Badge bg="primary">Búsqueda: "{searchTerm}"</Badge>}

          {/* ✅ NUEVO: Badges para filtros especiales */}
          {searchParams.get("onSale") && <Badge bg="danger">En Oferta</Badge>}
          {searchParams.get("featured") && (
            <Badge bg="primary">Destacados</Badge>
          )}
          {searchParams.get("popular") && <Badge bg="success">Populares</Badge>}

          <Button variant="link" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </Col>
    </Row>
  );
}
```

### 6. Función `clearFilters` mejorada

```javascript
const clearFilters = () => {
  setSearchTerm("");
  setSelectedCategory("");
  // ✅ NUEVO: Limpiar también los parámetros de la URL
  navigate("/tienda");
};
```

## Flujo de Funcionamiento

1. **Usuario en Home.js** hace clic en "Ver Todas las Ofertas"
2. **Navegación** a `/tienda?onSale=true`
3. **Store.js** detecta el parámetro `onSale=true` usando `useSearchParams`
4. **API call** incluye `onSale=true` en la petición: `/api/products?onSale=true`
5. **Backend** filtra productos con `enDescuento: true`
6. **Frontend** muestra:
   - Título: "🔥 Productos en Oferta"
   - Badge: "En Oferta"
   - Solo productos en descuento

## Resultados de Pruebas

✅ **API Endpoints probados:**

- `GET /api/products?onSale=true` → 200 OK
- `GET /api/products?featured=true` → 200 OK
- `GET /api/products?popular=true` → 200 OK

✅ **Funcionalidad verificada:**

- Botones de navegación funcionan
- Filtros se aplican correctamente
- Títulos dinámicos se muestran
- Badges indican filtros activos
- Botón "Limpiar filtros" funciona

## Archivos Modificados

- ✅ `src/pages/Store.js` - Componente principal actualizado

## Beneficios de la Solución

1. **Funcionalidad completa**: Los botones ahora funcionan correctamente
2. **UX mejorada**: Títulos y badges indican claramente qué filtro está activo
3. **Navegación clara**: URLs reflejan el estado de los filtros
4. **Escalable**: Fácil agregar nuevos tipos de filtros especiales
5. **Consistente**: Mantiene el patrón existente de filtros

La solución es robusta y mantiene la compatibilidad con los filtros existentes (categoría y búsqueda).
