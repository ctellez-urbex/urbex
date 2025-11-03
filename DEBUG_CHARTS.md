# 🐛 Debug: Gráficas de Estadísticas

## 📋 Instrucciones para Debugging

### **Paso 1: Abre la Consola del Navegador**

1. Abre tu aplicación en el navegador
2. Presiona `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
3. Ve a la pestaña **Console**
4. Navega a la página de `detail_property`

### **Paso 2: Revisa los Mensajes de Log**

Deberías ver estos mensajes en orden:

```
📊 Initializing charts...
📊 Data received: {
  transaccionesData: X,
  avaluoData: X,
  predialData: X,
  listingsData: X,
  tipologiaData: X,
  hasTransaccionesStats: true/false,
  hasAreaStats: true/false
}

🔷 Attempting to initialize ChartBarras...
🔷 ChartBarras canvas element: Found ✅
✅ ChartBarras initialized successfully

🔷 Attempting to initialize byProporcion...
🔷 byProporcion canvas element: Found ✅
✅ byProporcion initialized successfully

🔷 Attempting to initialize BoxTransacciones...
🔷 BoxTransacciones canvas element: Found ✅
✅ BoxTransacciones initialized successfully

🔷 Attempting to initialize BoxArea...
🔷 BoxArea canvas element: Found ✅
✅ BoxArea initialized successfully

🎉 All charts initialization process completed
```

---

## ❌ Problema 1: Chart.js no se carga

**Mensaje:**
```
⏳ Chart.js not loaded yet, retrying...
```

**Solución:**
1. Verifica que el script de Chart.js está en `layout.tsx`
2. Espera unos segundos más
3. Recarga la página (F5)

---

## ❌ Problema 2: Canvas no encontrado

**Mensaje:**
```
❌ ChartBarras canvas not found in DOM
```

**Causas posibles:**
- El componente no se está renderizando
- Los datos están vacíos y el componente no aparece
- Hay un error en el renderizado condicional

**Solución:**
1. Inspecciona el DOM (Elements tab) y busca:
   - `<canvas id="ChartBarras">`
   - `<canvas id="byProporcion">`
   - `<canvas id="BoxTransacciones">`
   - `<canvas id="BoxArea">`

2. Si no encuentras los canvas, verifica que el componente `EstadisticasCharts` se está renderizando

---

## ❌ Problema 3: No hay datos

**Mensaje:**
```
⚠️ No data for ChartBarras
📊 Data received: {
  transaccionesData: 0,
  avaluoData: 0,
  ...
}
```

**Causa:** Los datos no están llegando desde la API

**Solución:**
1. Verifica que la API `getDetailBuilding` está retornando datos
2. Revisa la consola para ver los datos de la API:
   ```javascript
   console.log('Building data:', data);
   ```

3. Verifica la estructura de datos en `Overview.tsx`:
   ```typescript
   transaccionesData={
     transacciones?.annualData?.priceByYear?.map((item: any) => ({
       year: item.year,
       label: 'Transacciones mt2',
       valor: item.valor_mt2
     }))
   }
   ```

---

## 🔍 Debugging Manual

### Ver si Chart.js está cargado:

En la consola del navegador:
```javascript
console.log('Chart.js loaded?', typeof Chart !== 'undefined');
```

### Ver si los canvas existen:

```javascript
console.log('ChartBarras:', document.getElementById('ChartBarras'));
console.log('byProporcion:', document.getElementById('byProporcion'));
console.log('BoxTransacciones:', document.getElementById('BoxTransacciones'));
console.log('BoxArea:', document.getElementById('BoxArea'));
```

### Ver los datos que llegan al componente:

En `Overview.tsx`, agrega un console.log antes de pasar los datos:

```typescript
console.log('Transacciones data:', transacciones);
console.log('Prediales data:', prediales);
console.log('Market data:', market);
console.log('Caracteristicas:', caracteristicas);
```

---

## 📸 Copia y Pégame Estos Datos

**Por favor, copia y pégame todo lo que sale en la consola que empiece con:**
- 📊
- 🔷
- ✅
- ❌
- ⚠️

**Esto me ayudará a identificar exactamente qué está fallando.**

---

## 🧪 Test Rápido

Abre la consola y ejecuta:

```javascript
// 1. Ver si Chart.js está disponible
console.log('Chart.js:', typeof Chart);

// 2. Ver si los canvas existen
['ChartBarras', 'byProporcion', 'BoxTransacciones', 'BoxArea'].forEach(id => {
  const el = document.getElementById(id);
  console.log(`${id}:`, el ? '✅ Exists' : '❌ Not found');
});

// 3. Ver el componente EstadisticasCharts
console.log('EstadisticasCharts component rendered?', 
  document.querySelector('[class*="space-y-6"]')
);
```

---

## 🔧 Solución Temporal: Forzar Recarga

Si nada funciona:

1. Detén el servidor (`Ctrl+C`)
2. Limpia cache:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```
3. Reinicia:
   ```bash
   npm run dev
   ```
4. Abre en modo incógnito (sin cache)
5. F12 > Console > Revisa los mensajes

---

**¿Qué ves en la consola? Compárteme los mensajes y te ayudo a solucionarlo. 🎯**

