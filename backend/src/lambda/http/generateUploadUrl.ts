import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import 'source-map-support/register'


const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const signedUrlExpireSeconds = 60 * 5

    console.log(todoId)
    const bucket = process.env.IMAGES_BUCKET
    const todosTable = process.env.TODO_TABLE

    // const imageId = uuid.v4()

    const s3 = new AWS.S3({
        signatureVersion: 'v4'
    })

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    const url = s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: `${todoId}.png`,
        Expires: signedUrlExpireSeconds
    })

    const imageUrl = `https://${bucket}.s3.amazonaws.com/${todoId}.png`

    const updateUrlOnTodo = {
        TableName: todosTable,
        Key: { "todoId": todoId },
        UpdateExpression: "set attachmentUrl = :a",
        ExpressionAttributeValues: {
            ":a": imageUrl
        },
        ReturnValues: "UPDATED_NEW"
    }

    await docClient.update(updateUrlOnTodo).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            iamgeUrl: imageUrl,
            uploadUrl: url
        })
    }
}
