import { HttpContext } from '@adonisjs/core/http'
import UserDeviceMapping from '#models/user_device_mapping'
import SmartDevice from '#models/smart_device'

interface TreeNode {
  name: string
  children?: TreeNode[]
  deviceSerial?: string
  isConnected?: boolean
  updatedAt?: string | null
  sensors?: any[]
}

export default class DeviceMappingController {
  private filterTreeByDevices(tree: TreeNode[], userDevices: Set<string>): TreeNode[] {
    return tree
      .map((node) => {
        // Si c'est un device
        if (node.deviceSerial) {
          return userDevices.has(node.deviceSerial) ? node : null
        }

        // Si c'est un nœud avec des enfants
        if (node.children) {
          const filteredChildren = this.filterTreeByDevices(node.children, userDevices)
          return filteredChildren.length > 0 ? { ...node, children: filteredChildren } : null
        }

        return null
      })
      .filter((node): node is TreeNode => node !== null)
  }

  private findOrphanedDevices(userDevices: Set<string>, mappingDevices: Set<string>): string[] {
    return Array.from(userDevices).filter((device) => !mappingDevices.has(device))
  }

  private extractDeviceSerials(tree: TreeNode[]): Set<string> {
    const devices = new Set<string>()

    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.deviceSerial) {
          devices.add(node.deviceSerial)
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(tree)
    return devices
  }

  private async enrichTreeWithDeviceDetails(tree: TreeNode[]): Promise<TreeNode[]> {
    const enrichNode = async (node: TreeNode): Promise<TreeNode> => {
      if (node.deviceSerial) {
        const device = await SmartDevice.query()
          .where('device_serial', node.deviceSerial)
          .preload('sensors')
          .first()

        if (device) {
          return {
            ...node,
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
          }
        }
      }

      if (node.children) {
        const enrichedChildren = await Promise.all(node.children.map(enrichNode))
        return { ...node, children: enrichedChildren }
      }

      return node
    }

    return Promise.all(tree.map(enrichNode))
  }

  async getDeviceMapping({ response, auth }: HttpContext) {
    try {
      const user = await auth.use('api').getUserOrFail()

      if (!user.organisationName) {
        return response.badRequest({
          message: 'User has no organisation',
        })
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

        return response.ok(rootDevices.length > 0 ? rootDevices : [])
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

      return response.ok(finalTree.length > 0 ? finalTree : [])
    } catch (error) {
      console.error('Error getting device mapping:', error)
      return response.badRequest({
        message: 'Error getting device mapping',
        error: error.message,
      })
    }
  }

  async updateDeviceMapping({ request, response, auth }: HttpContext) {
    try {
      const { mapping } = request.only(['mapping'])
      const user = await auth.use('api').getUserOrFail()

      if (!user.organisationName) {
        return response.badRequest({
          message: 'User has no organisation',
        })
      }

      // Vérifier si le mapping est un JSON valide
      try {
        JSON.parse(mapping)
      } catch (e) {
        return response.badRequest({
          message: 'Invalid JSON format for device mapping',
        })
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
        message: 'Device mapping updated successfully',
        deviceMapping: mapping,
      })
    } catch (error) {
      console.error('Error updating device mapping:', error)
      return response.badRequest({
        message: 'Error updating device mapping',
        error: error.message,
      })
    }
  }
}
