# GVAM MDM Front Dashboard

## Requisitos

- **Node.js 20**
- **npm**

Primero habrá que instalar las dependencias del proyecto, para ello ejecutamos:

```
npm ci
```

En el fichero `src/environments/environment.production.ts` habrá que poner la URL en la que se encuentra el Back:

```
apiUrl: '', // Dirección de la API del Back
```

Una vez configurada la dirección de la API ya se podrá hacer el build, para ello ejecutamos:

```
npm run build
```

Esto nos generará una carpeta `dist/` en la que se encuentran los ficheros para poder servir la aplicación
#   D a s h b o a r d - G v a m - F r o n t  
 