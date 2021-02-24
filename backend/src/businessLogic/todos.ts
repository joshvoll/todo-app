// import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { createLogger } from '../utils/logger'

//const logger = createLogger('auth')

const todosAccess = new TodosAccess()

// const bucketName = process.env.IMAGES_BUCKET


export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getUserTodos(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest,userId: string): Promise<TodoItem> {
	return await todosAccess.createTodo(createTodoRequest,userId)
}

