# SmartConnect IoT Server - API Documentation

## Vue d'ensemble / Overview

Cette documentation décrit toutes les APIs disponibles dans le serveur SmartConnect IoT.

This documentation describes all available APIs in the SmartConnect IoT server.

## Authentification / Authentication

La plupart des APIs nécessitent une authentification via token Bearer :

Most APIs require Bearer token authentication:

```
Authorization: Bearer <token>
```

## Base URL

```
http://localhost:3333
```

## Gestion des erreurs RFC 7807 / RFC 7807 Error Handling

Le serveur utilise le standard RFC 7807 "Problem Details for HTTP APIs" pour toutes les réponses d'erreur.

The server uses RFC 7807 "Problem Details for HTTP APIs" standard for all error responses.

### Format de réponse d'erreur / Error Response Format

```json
{
  "type": "/problems/error-type",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed error description",
  "instance": "/api/endpoint",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "resourceType": "SmartDevice",
  "deviceId": 123,
  "field": "email",
  "value": "invalid-email"
}
```

### Types d'erreur disponibles / Available Error Types

- `validation-error` : Erreur de validation des paramètres / Parameter validation error
- `authentication-error` : Erreur d'authentification / Authentication error
- `authorization-error` : Erreur d'autorisation / Authorization error
- `not-found-error` : Ressource non trouvée / Resource not found
- `conflict-error` : Conflit de ressource / Resource conflict
- `device-error` : Erreur de device IoT (connexion, authentification) / IoT device error (connection, authentication)
- `internal-server-error` : Erreur interne du serveur / Internal server error
- `database-error` : Erreur de base de données / Database error

## Endpoints

### 🔐 Authentification / Authentication

#### POST /auth/login

Connexion utilisateur et récupération du token.

User login and token retrieval.

**Paramètres / Parameters:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse de succès / Success Response:**

```json
{
  "type": "bearer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "admin",
    "organisationName": "My Company",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**Codes de statut / Status Codes:**

- `200` : Connexion réussie / Login successful
- `401` : Identifiants invalides / Invalid credentials

**Exemple d'erreur / Error Example:**

```json
{
  "type": "/problems/authentication-error",
  "title": "Authentication Error",
  "status": 401,
  "detail": "Invalid email or password",
  "instance": "/auth/login",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### POST /auth/logout

Déconnexion utilisateur.

User logout.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Réponse / Response:**

```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me

Récupération des informations de l'utilisateur connecté.

Get current user information.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Réponse / Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "admin",
    "organisationName": "My Company",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 👤 Utilisateurs / Users

#### POST /users

Création d'un nouvel utilisateur.

Create a new user.

**Paramètres / Parameters:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Jane Doe",
  "role": "user",
  "organisationName": "My Company"
}
```

**Réponse de succès / Success Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "fullName": "Jane Doe",
    "role": "user",
    "organisationName": "My Company"
  }
}
```

**Codes de statut / Status Codes:**

- `201` : Utilisateur créé / User created
- `400` : Erreur de validation / Validation error
- `409` : Utilisateur existe déjà / User already exists

**Exemple d'erreur de validation / Validation Error Example:**

```json
{
  "type": "/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The email field must be a valid email address",
  "instance": "/users",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "field": "email",
  "value": "invalid-email"
}
```

#### PUT /users/update

Mise à jour des informations utilisateur.

Update user information.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

```json
{
  "fullName": "Updated Name",
  "organisationName": "Updated Company",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### 🗺️ Mapping des devices / Device Mapping

#### GET /users/device-mapping

Récupération de la hiérarchie des devices de l'utilisateur.

Get user's device hierarchy.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Réponse / Response:**

```json
[
  {
    "name": "Paris",
    "children": [
      {
        "name": "Hangar A",
        "children": [
          {
            "name": "Étage 1",
            "children": [
              {
                "deviceSerial": "http://192.168.1.100",
                "name": "Device 1",
                "isConnected": true,
                "updatedAt": "2024-01-15T10:30:00.000Z",
                "sensors": [
                  {
                    "id": 141,
                    "sensor_id": "141",
                    "name": "Humidity",
                    "nom": "Humidité",
                    "type": "Humidity",
                    "value": "45",
                    "unit": "%",
                    "isAlert": false,
                    "lastUpdate": "2024-01-15T10:30:00.000Z"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
```

#### PUT /users/device-mapping

Mise à jour de la hiérarchie des devices.

Update device hierarchy.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

```json
{
  "mapping": "[{\"name\":\"Paris\",\"children\":[{\"name\":\"Hangar A\",\"children\":[{\"name\":\"Étage 1\",\"children\":[{\"deviceSerial\":\"http://192.168.1.100\",\"name\":\"Device 1\"}]}]}]}]"
}
```

**Réponse / Response:**

```json
{
  "message": "Device mapping updated successfully",
  "deviceMapping": "[{\"name\":\"Paris\",\"children\":[...]}]"
}
```

### 📱 SmartDevices

#### GET /devices

Liste de tous les devices de l'utilisateur.

List all user's devices.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Réponse / Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "deviceSerial": "http://192.168.1.100",
      "name": "Device 1",
      "isConnected": true,
      "autoPull": false,
      "updateStamp": 10,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "sensors": [
        {
          "id": 141,
          "sensor_id": "141",
          "name": "Humidity",
          "nom": "Humidité",
          "type": "Humidity",
          "value": "45",
          "unit": "%",
          "isAlert": false,
          "lastUpdate": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

#### GET /devices/:id

Détails d'un device spécifique.

Get specific device details.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

- `id` : ID du device / Device ID

**Réponse / Response:**

```json
{
  "status": "success",
  "message": "Smart device retrieved successfully",
  "data": {
    "id": 1,
    "deviceSerial": "http://192.168.1.100",
    "name": "Device 1",
    "isConnected": true,
    "autoPull": false,
    "updateStamp": 10,
    "sensors": [
      {
        "id": 141,
        "sensor_id": "141",
        "name": "Humidity",
        "nom": "Humidité",
        "type": "Humidity",
        "value": "45",
        "unit": "%",
        "isAlert": false,
        "lastUpdate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Codes de statut / Status Codes:**

- `200` : Device trouvé / Device found
- `404` : Device non trouvé ou accès refusé / Device not found or access denied

**Exemple d'erreur / Error Example:**

```json
{
  "type": "/problems/not-found-error",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Device not found or access denied",
  "instance": "/devices/123",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "resourceType": "SmartDevice"
}
```

#### POST /device/pull-data

Récupération et traitement des données CSV d'un device IoT.

Retrieve and process CSV data from an IoT device.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres requis / Required Parameters:**

```json
{
  "deviceAddress": "http://192.168.1.100",
  "username": "admin",
  "password": "password123",
  "deviceName": "My IoT Device",
  "startYear": 2024,
  "startMonth": 1,
  "startDay": 15,
  "startHour": 10,
  "startMin": 30,
  "startSec": 0
}
```

**Validation des paramètres de date / Date Parameters Validation:**

- `startYear` (number) : Année entre 1900 et 2100 / Year between 1900 and 2100
- `startMonth` (number) : Mois entre 1 et 12 / Month between 1 and 12
- `startDay` (number) : Jour entre 1 et 31 / Day between 1 and 31
- `startHour` (number) : Heure entre 0 et 23 / Hour between 0 and 23
- `startMin` (number) : Minute entre 0 et 59 / Minute between 0 and 59
- `startSec` (number) : Seconde entre 0 et 59 / Second between 0 and 59

**Exemples de validation / Validation Examples:**

```json
// ✅ Valide / Valid
{
  "startYear": 2024,
  "startMonth": 12,
  "startDay": 31,
  "startHour": 23,
  "startMin": 59,
  "startSec": 59
}

// ❌ Invalide / Invalid
{
  "startYear": 1899,        // Trop petit / Too small
  "startMonth": 13,         // Trop grand / Too large
  "startDay": 32,           // Jour inexistant / Non-existent day
  "startHour": 24,          // Heure invalide / Invalid hour
  "startMin": 60,           // Minute invalide / Invalid minute
  "startSec": 60            // Seconde invalide / Invalid second
}
```

**Paramètres optionnels / Optional Parameters:**

```json
{
  "autoPull": false,
  "updateStamp": 10
}
```

**Description des paramètres optionnels / Optional Parameters Description:**

- `autoPull` (boolean, défaut: `false`) : Active la récupération automatique des données / Enables automatic data retrieval
- `updateStamp` (number, défaut: `10`) : Intervalle en minutes entre les récupérations automatiques (5-240 minutes) / Interval in minutes between automatic retrievals (5-240 minutes)

**Réponse de succès / Success Response:**

```json
{
  "status": "success",
  "message": "Device successfully created and data processed",
  "deviceInfo": {
    "id": 1,
    "name": "My IoT Device",
    "deviceSerial": "http://192.168.1.100",
    "action": "created",
    "autoPull": {
      "enabled": false,
      "interval": 10,
      "started": false
    }
  },
  "processingStats": {
    "processedLines": 1250,
    "sensorsCreated": 5
  }
}
```

**Codes de statut / Status Codes:**

- `200` : Données traitées avec succès / Data processed successfully
- `400` : Paramètres manquants / Missing parameters
- `401` : Identifiants invalides pour le device IoT / Invalid credentials for IoT device
- `503` : Device injoignable / Device unreachable
- `409` : Device déjà associé / Device already associated
- `500` : Erreur serveur / Server error

**Exemple d'erreur de conflit / Conflict Error Example:**

```json
{
  "type": "/problems/conflict-error",
  "title": "Resource Conflict",
  "status": 409,
  "detail": "This device is already associated with your account",
  "instance": "/device/pull-data",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "resourceType": "SmartDevice",
  "deviceId": 18
}
```

**Exemple d'erreur d'authentification de device / Device Authentication Error Example:**

```json
{
  "type": "/problems/device-error",
  "title": "Device Error",
  "status": 401,
  "detail": "Invalid credentials for the IoT device. Please check username and password.",
  "instance": "/device/pull-data",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "deviceAddress": "http://192.168.1.100"
}
```

**Exemple d'erreur de connexion device / Device Connection Error Example:**

```json
{
  "type": "/problems/device-error",
  "title": "Device Error",
  "status": 503,
  "detail": "Device unreachable. Please check the device address and network connectivity.",
  "instance": "/device/pull-data",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "deviceAddress": "http://192.168.1.100"
}
```

**Fonctionnalités / Features:**

- Création automatique de sensors basée sur les données CSV / Automatic sensor creation from CSV data
- Détection et stockage des unités / Unit detection and storage
- Gestion des timestamps / Timestamp handling
- Statistiques de traitement / Processing statistics

#### PUT /devices/:id

Mise à jour de la configuration d'un device.

Update device configuration.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

- `id` : ID du device / Device ID

**Corps de la requête / Request Body:**

```json
{
  "deviceName": "Updated Device Name",
  "autoPull": true,
  "updateStamp": 15
}
```

**Validation / Validation:**

- `updateStamp` : Doit être entre 5 et 240 minutes / Must be between 5 and 240 minutes

**Réponse / Response:**

```json
{
  "status": "success",
  "message": "Device updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Device Name",
    "autoPull": true,
    "updateStamp": 15
  }
}
```

**Exemple d'erreur de validation / Validation Error Example:**

```json
{
  "type": "/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "updateStamp must be between 5 and 240 minutes",
  "instance": "/devices/1",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "field": "updateStamp",
  "value": 300
}
```

#### DELETE /devices/:id

Suppression d'un device et de toutes ses données associées.

Delete a device and all its associated data.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

- `id` : ID du device / Device ID

**⚠️ ATTENTION :** Cette opération est irréversible et supprime :

**⚠️ WARNING :** This operation is irreversible and deletes:

- Le SmartDevice / The SmartDevice
- Tous les Sensors associés / All associated Sensors
- Toutes les SensorHistories (historiques) / All SensorHistories (history)

**Réponse / Response:**

```json
{
  "status": "success",
  "message": "Device and all associated data deleted successfully",
  "deletedDevice": {
    "id": 1,
    "name": "Device Name",
    "deviceSerial": "device_serial_123"
  },
  "deletedData": {
    "sensorsCount": 5,
    "sensorHistoriesCount": 1250
  }
}
```

**Codes de statut / Status Codes:**

- `200` : Device supprimé avec succès / Device deleted successfully
- `404` : Device non trouvé ou accès refusé / Device not found or access denied
- `500` : Erreur serveur / Server error

### 🔄 Auto-Pull Management / Gestion de l'auto-pull

#### GET /devices/:id/auto-pull/status

Récupération du statut de l'auto-pull pour un device spécifique.

Get auto-pull status for a specific device.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

- `id` : ID du device / Device ID

**Réponse / Response:**

```json
{
  "status": "success",
  "data": {
    "deviceId": 1,
    "deviceName": "My IoT Device",
    "autoPull": {
      "enabled": true,
      "interval": 15,
      "isActive": true,
      "lastRun": "2024-01-15T10:30:00.000Z",
      "nextRun": "2024-01-15T10:45:00.000Z"
    }
  }
}
```

**Codes de statut / Status Codes:**

- `200` : Statut récupéré / Status retrieved
- `404` : Device non trouvé / Device not found

#### GET /devices/auto-pull/status

Récupération du statut de l'auto-pull pour tous les devices de l'utilisateur.

Get auto-pull status for all user devices.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Réponse / Response:**

```json
{
  "status": "success",
  "data": [
    {
      "deviceId": 1,
      "deviceName": "Device 1",
      "deviceSerial": "http://192.168.1.100",
      "autoPull": {
        "enabled": true,
        "interval": 15,
        "isActive": true,
        "lastRun": "2024-01-15T10:30:00.000Z",
        "nextRun": "2024-01-15T10:45:00.000Z"
      }
    },
    {
      "deviceId": 2,
      "deviceName": "Device 2",
      "deviceSerial": "http://192.168.1.101",
      "autoPull": {
        "enabled": false,
        "interval": 10,
        "isActive": false,
        "lastRun": null,
        "nextRun": null
      }
    }
  ]
}
```

### 📊 Données des capteurs / Sensor Data

#### GET /sensor-history

Récupération de l'historique des valeurs des capteurs.

Retrieve sensor value history.

**Headers requis / Required Headers:**

```
Authorization: Bearer <token>
```

**Paramètres / Parameters:**

- `sensor_ids` : Array des IDs des capteurs / Array of sensor IDs
- `start_date` : Date de début (optionnel) / Start date (optional)
- `end_date` : Date de fin (optionnel) / End date (optional)

**Exemple de requête / Request Example:**

```
GET /sensor-history?sensor_ids[]=141&sensor_ids[]=142&start_date=2024-01-01T00:00:00Z&end_date=2024-01-15T23:59:59Z
```

**Réponse / Response:**

```json
[
  {
    "sensor_id": "141",
    "id": 141,
    "history": [
      {
        "value": "45.2",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "value": "45.5",
        "timestamp": "2024-01-15T10:31:00.000Z"
      }
    ]
  },
  {
    "sensor_id": "142",
    "id": 142,
    "history": [
      {
        "value": "23.5",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
]
```

**Codes de statut / Status Codes:**

- `200` : Données récupérées / Data retrieved
- `400` : Paramètres invalides / Invalid parameters
- `404` : Aucun capteur trouvé / No sensors found

### 📚 Documentation des erreurs / Error Documentation

#### GET /problems

Documentation complète de tous les types d'erreur.

Complete documentation of all error types.

**Réponse / Response:**

```json
{
  "title": "SmartConnect IoT API - Error Problems Documentation",
  "description": "Documentation complète des types d'erreur retournés par l'API SmartConnect IoT",
  "version": "1.0.0",
  "baseUrl": "/problems",
  "problems": {
    "validation-error": {
      "title": "Validation Error",
      "description": "Erreur de validation des paramètres de la requête",
      "status": "400",
      "detail": "Les données fournies ne respectent pas les règles de validation",
      "fields": ["field", "value"],
      "example": {
        "type": "/problems/validation-error",
        "title": "Validation Error",
        "status": 400,
        "detail": "Le champ \"email\" doit être une adresse email valide",
        "field": "email",
        "value": "invalid-email",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    },
    "conflict-error": {
      "title": "Resource Conflict",
      "description": "Conflit de ressource - ressource déjà existante",
      "status": "409",
      "detail": "La ressource existe déjà ou est en conflit",
      "fields": ["resourceType", "deviceId"],
      "example": {
        "type": "/problems/conflict-error",
        "title": "Resource Conflict",
        "status": 409,
        "detail": "Un device avec cette adresse existe déjà",
        "resourceType": "SmartDevice",
        "deviceId": 18,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

#### GET /problems/:type

Documentation d'un type d'erreur spécifique.

Documentation for a specific error type.

**Paramètres / Parameters:**

- `type` : Type d'erreur / Error type (ex: `validation-error`, `conflict-error`, etc.)

**Réponse / Response:**

```json
{
  "title": "Validation Error",
  "description": "Erreur de validation des paramètres de la requête",
  "status": "400",
  "detail": "Les données fournies ne respectent pas les règles de validation",
  "fields": ["field", "value"],
  "example": {
    "type": "/problems/validation-error",
    "title": "Validation Error",
    "status": 400,
    "detail": "Le champ \"email\" doit être une adresse email valide",
    "field": "email",
    "value": "invalid-email",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Codes de statut / Status Codes:**

- `200` : Documentation trouvée / Documentation found
- `404` : Type d'erreur non trouvé / Error type not found

## Codes de statut HTTP / HTTP Status Codes

- `200` : Succès / Success
- `201` : Créé avec succès / Created successfully
- `400` : Requête invalide / Bad request
- `401` : Non autorisé / Unauthorized
- `403` : Accès interdit / Forbidden
- `404` : Ressource non trouvée / Not found
- `409` : Conflit / Conflict
- `500` : Erreur serveur / Server error

## Exemples d'utilisation / Usage Examples

### Connexion utilisateur / User Login

```bash
curl -X POST \
  http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Suppression d'un device / Delete a Device

```bash
curl -X DELETE \
  http://localhost:3333/devices/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Récupération des données d'un device / Retrieve Device Data

```bash
curl -X POST \
  http://localhost:3333/device/pull-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceAddress": "http://192.168.1.100",
    "username": "admin",
    "password": "password123",
    "deviceName": "My IoT Device",
    "startYear": 2024,
    "startMonth": 1,
    "startDay": 15,
    "startHour": 10,
    "startMin": 30,
    "startSec": 0,
    "autoPull": false,
    "updateStamp": 10
  }'
```

### Récupération de l'historique des capteurs / Retrieve Sensor History

```bash
curl -X GET \
  "http://localhost:3333/sensor-history?sensor_ids[]=141&sensor_ids[]=142&start_date=2024-01-01T00:00:00Z&end_date=2024-01-15T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Mise à jour du mapping des devices / Update Device Mapping

```bash
curl -X PUT \
  http://localhost:3333/users/device-mapping \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "mapping": "[{\"name\":\"Paris\",\"children\":[{\"name\":\"Hangar A\",\"children\":[{\"name\":\"Étage 1\",\"children\":[{\"deviceSerial\":\"http://192.168.1.100\",\"name\":\"Device 1\"}]}]}]}]"
  }'
```

### Récupération du statut auto-pull / Get Auto-Pull Status

```bash
# Pour un device spécifique / For a specific device
curl -X GET \
  http://localhost:3333/devices/1/auto-pull/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Pour tous les devices / For all devices
curl -X GET \
  http://localhost:3333/devices/auto-pull/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Consultation de la documentation des erreurs / Error Documentation

```bash
# Documentation complète / Complete documentation
curl -X GET http://localhost:3333/problems

# Documentation d'un type spécifique / Specific type documentation
curl -X GET http://localhost:3333/problems/validation-error
```

## Notes importantes / Important Notes

- Toutes les dates sont au format ISO 8601 / All dates are in ISO 8601 format
- Les tokens d'authentification expirent après un certain temps / Authentication tokens expire after a certain time
- Les opérations de suppression sont irréversibles / Delete operations are irreversible
- Les données CSV sont automatiquement traitées et stockées dans la base de données / CSV data is automatically processed and stored in the database
- Le traitement CSV crée automatiquement les sensors basés sur les noms des devices / CSV processing automatically creates sensors based on device names
- Les unités sont détectées et stockées automatiquement / Units are automatically detected and stored
- La hiérarchie des devices supporte une structure flexible (régions, bâtiments, étages, etc.) / Device hierarchy supports flexible structure (regions, buildings, floors, etc.)
- **Structure des capteurs / Sensor Structure :** Le champ `sensor_id` contient maintenant l'ID numérique du capteur (égal à `id`), et le champ `type` contient le nom/type du capteur (ex: "Humidity", "Temperature") / The `sensor_id` field now contains the numeric ID of the sensor (equal to `id`), and the `type` field contains the sensor name/type (e.g., "Humidity", "Temperature")
- **Gestion des erreurs RFC 7807 / RFC 7807 Error Handling :** Toutes les erreurs suivent le standard RFC 7807 avec des informations contextuelles / All errors follow RFC 7807 standard with contextual information
- **Auto-pull :** Les devices peuvent être configurés pour récupérer automatiquement les données à intervalles réguliers / Devices can be configured to automatically retrieve data at regular intervals

## Gestion des erreurs / Error Handling

Toutes les APIs retournent des messages d'erreur explicites conformes au standard RFC 7807 :

All APIs return explicit error messages compliant with RFC 7807 standard:

```json
{
  "type": "/problems/error-type",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed error description",
  "instance": "/api/endpoint",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "resourceType": "SmartDevice",
  "deviceId": 123
}
```

### Champs contextuels disponibles / Available Contextual Fields

- `resourceType` : Type de ressource concernée / Type of resource involved
- `deviceId` : ID du device concerné / ID of device involved
- `deviceAddress` : Adresse du device / Device address
- `field` : Champ en erreur / Field in error
- `value` : Valeur problématique / Problematic value
- `operation` : Opération de base de données / Database operation
- `errorId` : ID d'erreur unique / Unique error ID

## Sécurité / Security

- Toutes les requêtes sensibles nécessitent une authentification / All sensitive requests require authentication
- Les mots de passe sont hashés / Passwords are hashed
- Les tokens JWT sont utilisés pour l'authentification / JWT tokens are used for authentication
- Les données CSV sont validées avant traitement / CSV data is validated before processing
- Les accès aux devices sont vérifiés par utilisateur / Device access is verified per user
- Les messages d'erreur sont sanitisés pour éviter la fuite d'informations / Error messages are sanitized to prevent information leakage
- La validation des paramètres est stricte / Parameter validation is strict
