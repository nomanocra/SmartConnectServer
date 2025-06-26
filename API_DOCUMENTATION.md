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
  "id": 1,
  "deviceSerial": "http://192.168.1.100",
  "isConnected": true,
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
}
```

**Codes de statut / Status Codes:**

- `200` : Device trouvé / Device found
- `404` : Device non trouvé ou accès refusé / Device not found or access denied

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
  "startYear": "2024",
  "startMonth": "01",
  "startDay": "15",
  "startHour": "10",
  "startMin": "30",
  "startSec": "00"
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
- `401` : Identifiants invalides ou device injoignable / Invalid credentials or device unreachable
- `500` : Erreur serveur / Server error

**Fonctionnalités / Features:**

- Création automatique de sensors basée sur les données CSV / Automatic sensor creation from CSV data
- Détection et stockage des unités / Unit detection and storage
- Gestion des timestamps / Timestamp handling
- Statistiques de traitement / Processing statistics

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

## Codes de statut HTTP / HTTP Status Codes

- `200` : Succès / Success
- `201` : Créé avec succès / Created successfully
- `400` : Requête invalide / Bad request
- `401` : Non autorisé / Unauthorized
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
    "startYear": "2024",
    "startMonth": "01",
    "startDay": "15",
    "startHour": "10",
    "startMin": "30",
    "startSec": "00",
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

## Notes importantes / Important Notes

- Toutes les dates sont au format ISO 8601 / All dates are in ISO 8601 format
- Les tokens d'authentification expirent après un certain temps / Authentication tokens expire after a certain time
- Les opérations de suppression sont irréversibles / Delete operations are irreversible
- Les données CSV sont automatiquement traitées et stockées dans la base de données / CSV data is automatically processed and stored in the database
- Le traitement CSV crée automatiquement les sensors basés sur les noms des devices / CSV processing automatically creates sensors based on device names
- Les unités sont détectées et stockées automatiquement / Units are automatically detected and stored
- La hiérarchie des devices supporte une structure flexible (régions, bâtiments, étages, etc.) / Device hierarchy supports flexible structure (regions, buildings, floors, etc.)
- **Structure des capteurs / Sensor Structure :** Le champ `sensor_id` contient maintenant l'ID numérique du capteur (égal à `id`), et le champ `type` contient le nom/type du capteur (ex: "Humidity", "Temperature") / The `sensor_id` field now contains the numeric ID of the sensor (equal to `id`), and the `type` field contains the sensor name/type (e.g., "Humidity", "Temperature")

## Gestion des erreurs / Error Handling

Toutes les APIs retournent des messages d'erreur explicites en cas de problème :

All APIs return explicit error messages in case of issues:

```json
{
  "status": "error",
  "message": "Description de l'erreur / Error description"
}
```

## Sécurité / Security

- Toutes les requêtes sensibles nécessitent une authentification / All sensitive requests require authentication
- Les mots de passe sont hashés / Passwords are hashed
- Les tokens JWT sont utilisés pour l'authentification / JWT tokens are used for authentication
- Les données CSV sont validées avant traitement / CSV data is validated before processing
- Les accès aux devices sont vérifiés par utilisateur / Device access is verified per user
