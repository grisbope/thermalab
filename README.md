# ThermaLab

Laboratorio virtual de transferencia de calor para la asignatura de Transferencia de Calor de Ingenieria Quimica en la Universidad Tecnica de Manabi, periodo Abril-Agosto 2026.

La aplicacion permite explorar conduccion, conveccion y radiacion con entradas modificables, formulas con valores sustituidos, graficos cientificos, diagramas SVG animados, historial de practicas y descarga de resultados.

## Demostracion en vivo

URL de Vercel: pendiente de publicar.

## Tecnologias

- React 18.3.1
- Vite 8.0.16
- TypeScript 5.6.3
- Tailwind CSS 3.4.17
- lucide-react 0.468.0
- recharts 2.15.0
- framer-motion 11.15.0

## Instalacion

```bash
npm install
npm run dev
npm run build
```

## Formulas implementadas

### Conduccion

```text
Q = (k * A * (T_caliente - T_fria)) / L
R = L / (k * A)
R_total = suma(L_i / (k_i * A))
Q_multicapa = (T_caliente - T_fria) / R_total
eta = (1 - Q_aislada / Q_referencia) * 100
```

Nota fisica: la practica P1 con ladrillo `k=0.72 W/m K`, `L=0.20 m`, `A=10 m2`, `T1=30 C` y `T2=18 C` produce `Q = 432 W`. Un resultado de `43.2 W` requeriria `A=1 m2` o un gradiente diez veces menor.

### Conveccion

```text
Q = h * A * (T_superficie - T_fluido)
Re = (rho * v * L) / mu
Nu_laminar = 0.664 * Re^0.5 * Pr^(1/3)
Nu_turbulento = 0.037 * Re^0.8 * Pr^(1/3)
h = Nu * k_fluido / L
Ra = (9.81 * beta * DeltaT * L^3) / (nu * alpha)
Nu_natural = 0.59 * Ra^0.25
```

### Radiacion

```text
sigma = 5.670374419e-8 W/m2 K4
Q_rad = epsilon * sigma * A * (T_superficie^4 - T_ambiente^4)
E_b = sigma * T^4
```

Las temperaturas de radiacion se convierten internamente de Celsius a Kelvin.

## Datos incluidos

### Materiales

Cobre, aluminio, acero inoxidable, hormigon, ladrillo, vidrio, madera de roble, fibra de vidrio, lana de roca, poliuretano y aire estatico.

### Fluidos

Aire, agua, aceite, etanol y glicerina con densidad, viscosidad dinamica, conductividad y numero de Prandtl a 20 C.

### Superficies

Cuerpo negro ideal, pintura negra mate, piel humana, hormigon, ladrillo rojo, acero oxidado, acero pulido, aluminio pulido, cobre pulido, pintura blanca y papel de oro.

## Deploy en Vercel desde GitHub

1. Crear un repositorio en GitHub y subir este proyecto.
2. Entrar a Vercel y seleccionar `Add New Project`.
3. Importar el repositorio.
4. Mantener la configuracion detectada por Vercel:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Hacer deploy.
6. Copiar la URL generada y reemplazar el placeholder de la seccion "Demostracion en vivo".

## Licencia

MIT
