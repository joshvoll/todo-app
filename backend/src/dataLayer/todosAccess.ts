import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger'
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todosDataAccess');

export class TodosAccess{
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODO_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ){}

    async getUserTodos(userId: string): Promise<TodoItem[]>{
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
        const newId = uuid()
        const item = new TodoItem()
        item.userId= userId
        item.todoId= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
  
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }


    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }

    async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string, userId:string){
	logger.info(`Updating a todo todoid = ${todoId} `);
	logger.info(`Updating a todo user = ${userId} `);
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                todoId: todoId,
		userId: userId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }    

    async deleteTodo(userId:string, todoId:string) {	
       await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
	       userId: userId,
               todoId: todoId
            }
       }).promise()
    }
}
