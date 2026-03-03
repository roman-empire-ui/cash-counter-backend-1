import express from 'express'
import { createEmployee, deactivateEmployee, getAllEmployees, getEmployeeById, updateEmployee } from '../controllers/employeeCon.js'

const app = express.Router() 


app.post('/createEm' , createEmployee)
app.get('/getEmps' , getAllEmployees)
app.get('/getEmpById/:id' , getEmployeeById)
app.put('/updateEmp/:id', updateEmployee)
app.delete('/deactivateEmployee/:id' , deactivateEmployee)





export default app



