import AWS from 'aws-sdk'
import WError from 'verror'
import { ServiceComponentTable, IncidentTable } from './const'
import generateID from './generateID'

export const getComponents = () => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB({ region })

  return new Promise((resolve, reject) => {
    const params = {
      TableName: ServiceComponentTable,
      ProjectionExpression: 'componentID, description, #nm, #st',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#st': 'status'
      }
    }
    awsDynamoDb.scan(params, (err, scanResult) => {
      if (err) {
        return reject(new WError(err, 'DynamoDB'))
      }
      let components = []
      scanResult.Items.forEach((component) => {
        const {
          componentID: {
            S: compID
          },
          name: {
            S: compName
          },
          status: {
            S: compStatus
          },
          description: {
            S: compDesc
          }
        } = component
        components.push({
          componentID: compID,
          name: compName,
          status: compStatus,
          description: compDesc
        })
      })

      resolve(components)
    })
  })
}

export const updateComponent = (id, name, description, status) => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB.DocumentClient({ region })
  const idLength = 12

  return new Promise((resolve, reject) => {
    if (!id) {
      id = generateID(idLength)
    }
    const params = {
      Key: {
        componentID: id
      },
      UpdateExpression: 'set #n = :n, description = :d, #s = :s',
      ExpressionAttributeNames: {
        '#n': 'name',
        '#s': 'status'
      },
      ExpressionAttributeValues: {
        ':n': name,
        ':d': description,
        ':s': status
      },
      TableName: ServiceComponentTable,
      ReturnValues: 'ALL_NEW'
    }
    awsDynamoDb.update(params, (err, data) => {
      if (err) {
        return reject(new WError(err, 'DynamoDB'))
      }
      resolve(data)
    })
  })
}

export const deleteComponent = (id) => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB.DocumentClient({ region })

  return new Promise((resolve, reject) => {
    const params = {
      Key: {
        componentID: id
      },
      TableName: ServiceComponentTable,
      ReturnValues: 'NONE'
    }
    awsDynamoDb.delete(params, (err, data) => {
      if (err) {
        return reject(new WError(err, 'DynamoDB'))
      }
      resolve(data)
    })
  })
}

export const getIncidents = () => {
  const { AWS_REGION: region } = process.env
  const awsDynamoDb = new AWS.DynamoDB({ region })

  return new Promise((resolve, reject) => {
    const params = {
      TableName: IncidentTable,
      ProjectionExpression: 'incidentID, #nm, #st, updatedAt',
      ExpressionAttributeNames: {
        '#nm': 'name',
        '#st': 'status'
      }
    }
    awsDynamoDb.scan(params, (err, scanResult) => {
      if (err) {
        return reject(new WError(err, 'DynamoDB'))
      }

      let incidents = []
      scanResult.Items.forEach((incident) => {
        const {
          incidentID: {
            S: incidentID
          },
          name: {
            S: incidentName
          },
          status: {
            S: incidentStatus
          },
          updatedAt: {
            S: incidentUpdatedAt
          }
        } = incident
        incidents.push({
          incidentID: incidentID,
          name: incidentName,
          status: incidentStatus,
          updatedAt: incidentUpdatedAt
        })
      })

      resolve(incidents)
    })
  })
}
