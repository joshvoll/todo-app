import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId} from '../../helpers/authHelper'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
//import { TodosAccess } from '../../dataLayer/todosAccess'
import { updateTodo } from '../../businessLogic/todos'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todos')
//const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)

    
    logger.info(`UPDATE TODO ${userId}`) 
    /* 
    const item = await todosAccess.getTodoById(todoId)
  
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non exists todo with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO not exists')
    } 

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update todo does not belong to his account with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to authorized user')
    }
    */


    logger.info(`User ${userId} updating group ${todoId} to be ${updatedTodo}`)
    // await new TodosAccess().updateTodo(updatedTodo,todoId, userId)
    await updateTodo(updatedTodo, todoId, userId)
    logger.info(`after sending the function to update`)
    return apiResponseHelper.generateEmptySuccessResponse(204)
  
}
