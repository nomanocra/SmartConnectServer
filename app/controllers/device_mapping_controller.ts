import { HttpContext } from '@adonisjs/core/http'
import UserDeviceMapping from '#models/user_device_mapping'
import SmartDevice from '#models/smart_device'
import ErrorResponseService from '../services/error_response_service.js'

interface TreeNode {
  name: string
  children?: TreeNode[]
  deviceSerial?: string
  isConnected?: boolean
  updatedAt?: string
  sensors?: Array<{
    id: string
    name: string
    nom: string
    type: string
    value: string
    unit: string | null
    isAlert: boolean
    lastUpdate: string | null
  }>
}

export default class DeviceMappingController {
  private filterTreeByDevices(tree: TreeNode[], userDevices: Set<string>): TreeNode[] {
    return tree
      .map((node) => {
        if (node.deviceSerial) {
          // C'est un device, vérifier s'il appartient à l'utilisateur
          if (userDevices.has(node.deviceSerial)) {
            return node
          }
          return null
        } else if (node.children) {
          // C'est un nœud parent, filtrer ses enfants
          const filteredChildren = this.filterTreeByDevices(node.children, userDevices)
          if (filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren,
            }
          }
          return null
        }
        return node
      })
      .filter((node): node is TreeNode => node !== null)
  }

  private extractDeviceSerials(tree: TreeNode[]): Set<string> {
    const devices = new Set<string>()

    const extractFromNode = (node: TreeNode) => {
      if (node.deviceSerial) {
        devices.add(node.deviceSerial)
      }
      if (node.children) {
        node.children.forEach(extractFromNode)
      }
    }

    tree.forEach(extractFromNode)
    return devices
  }

  private findOrphanedDevices(userDevices: Set<string>, mappingDevices: Set<string>): string[] {
    return Array.from(userDevices).filter((device) => !mappingDevices.has(device))
  }

  private async enrichTreeWithDeviceDetails(tree: TreeNode[]): Promise<TreeNode[]> {
    const enrichedTree: TreeNode[] = []

    for (const node of tree) {
      if (node.deviceSerial) {
        // C'est un device, enrichir avec les détails
        const device = await SmartDevice.query()
          .where('device_serial', node.deviceSerial)
          .preload('sensors')
          .first()

        if (device) {
          enrichedTree.push({
            ...node,
            name: device.name || node.name,
            isConnected: device.isConnected,
            updatedAt: device.updatedAt?.toISO() || undefined,
            sensors: device.sensors.map((sensor) => ({
              id: sensor.sensor_id,
              name: sensor.name,
              nom: sensor.nom,
              type: sensor.type,
              value: sensor.value,
              unit: sensor.unit,
              isAlert: sensor.isAlert,
              lastUpdate: sensor.lastUpdate?.toISO() || null,
            })),
          })
        } else {
          enrichedTree.push(node)
        }
      } else if (node.children) {
        // C'est un nœud parent, enrichir récursivement
        enrichedTree.push({
          ...node,
          children: await this.enrichTreeWithDeviceDetails(node.children),
        })
      } else {
        enrichedTree.push(node)
      }
    }

    return enrichedTree
  }

  async getDeviceMapping({ response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').getUserOrFail()

      if (!user.organisationName) {
        return ErrorResponseService.validationError(
          { response, auth } as HttpContext,
          'User has no organisation',
          'organisationName'
        )
      }

      // Récupérer le mapping de l'organisation
      const deviceMapping = await UserDeviceMapping.query()
        .where('organisation_name', user.organisationName)
        .first()

      // Récupérer les devices auxquels l'utilisateur a accès
      const userDevices = await SmartDevice.query()
        .whereHas('users', (query) => {
          query.where('users.id', user.id)
        })
        .select('device_serial', 'name')

      const userDeviceSerials = new Set(userDevices.map((d) => d.deviceSerial))

      if (!deviceMapping?.mapping) {
        // Si pas de mapping, retourner juste les devices de l'utilisateur à la racine avec leurs détails
        const rootDevices = await Promise.all(
          Array.from(userDeviceSerials).map(async (serial) => {
            const device = await SmartDevice.query()
              .where('device_serial', serial)
              .preload('sensors')
              .first()

            return {
              deviceSerial: serial,
              name: device?.name || serial,
              isConnected: device?.isConnected,
              updatedAt: device?.updatedAt?.toISO() || undefined,
              sensors: device?.sensors.map((sensor) => ({
                id: sensor.sensor_id,
                name: sensor.name,
                nom: sensor.nom,
                type: sensor.type,
                value: sensor.value,
                unit: sensor.unit,
                isAlert: sensor.isAlert,
                lastUpdate: sensor.lastUpdate?.toISO() || null,
              })),
            }
          })
        )

        return response.ok({
          status: 'success',
          data: rootDevices.length > 0 ? rootDevices : [],
        })
      }

      // Parser le mapping JSON
      const mappingTree: TreeNode[] = JSON.parse(deviceMapping.mapping)

      // Extraire tous les devices du mapping
      const mappingDevices = this.extractDeviceSerials(mappingTree)

      // Trouver les devices orphelins (accès mais pas dans le mapping)
      const orphanedDevices = this.findOrphanedDevices(userDeviceSerials, mappingDevices)

      // Filtrer l'arbre en fonction des devices de l'utilisateur
      const filteredTree = this.filterTreeByDevices(mappingTree, userDeviceSerials)

      // Enrichir l'arbre avec les détails des devices
      const enrichedTree = await this.enrichTreeWithDeviceDetails(filteredTree)

      // Ajouter les devices orphelins à la racine avec leurs détails
      const orphanedDevicesWithDetails = await Promise.all(
        orphanedDevices.map(async (serial) => {
          const device = await SmartDevice.query()
            .where('device_serial', serial)
            .preload('sensors')
            .first()

          return {
            deviceSerial: serial,
            name: device?.name || serial,
            isConnected: device?.isConnected,
            updatedAt: device?.updatedAt?.toISO() || undefined,
            sensors: device?.sensors.map((sensor) => ({
              id: sensor.sensor_id,
              name: sensor.name,
              nom: sensor.nom,
              type: sensor.type,
              value: sensor.value,
              unit: sensor.unit,
              isAlert: sensor.isAlert,
              lastUpdate: sensor.lastUpdate?.toISO() || null,
            })),
          }
        })
      )

      const finalTree = [...enrichedTree, ...orphanedDevicesWithDetails]

      return response.ok({
        status: 'success',
        data: finalTree.length > 0 ? finalTree : [],
      })
    } catch (error) {
      console.error('Error getting device mapping:', error)
      return ErrorResponseService.internalServerError(
        { response, auth } as HttpContext,
        'Error getting device mapping'
      )
    }
  }

  async updateDeviceMapping({ request, response, auth }: HttpContext) {
    try {
      const { mapping } = request.only(['mapping'])
      const user = await auth.use('api').getUserOrFail()

      if (!user.organisationName) {
        return ErrorResponseService.validationError(
          { request, response, auth } as HttpContext,
          'User has no organisation',
          'organisationName'
        )
      }

      // Vérifier si le mapping est un JSON valide
      try {
        JSON.parse(mapping)
      } catch (e) {
        return ErrorResponseService.validationError(
          { request, response, auth } as HttpContext,
          'Invalid JSON format for device mapping',
          'mapping',
          mapping
        )
      }

      // Mettre à jour ou créer le device mapping
      const deviceMapping = await UserDeviceMapping.query()
        .where('organisation_name', user.organisationName)
        .first()

      if (deviceMapping) {
        deviceMapping.mapping = mapping
        await deviceMapping.save()
      } else {
        await UserDeviceMapping.create({
          organisationName: user.organisationName,
          mapping,
        })
      }

      return response.ok({
        status: 'success',
        message: 'Device mapping updated successfully',
        data: {
          deviceMapping: mapping,
        },
      })
    } catch (error) {
      console.error('Error updating device mapping:', error)
      return ErrorResponseService.internalServerError(
        { request, response, auth } as HttpContext,
        'Error updating device mapping'
      )
    }
  }
}
