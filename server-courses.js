const express = require('express');
const fs = require('fs')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlenconder({extended: true}))

const path = './courses.json'
const getData = ()=>JSON.parse(fs.readFileSync(path, {encoding:'utf-8'}))
const saveData = ()=> fs.writeFileSync(path, JSON.stringify(data,null,2))
 //id generation 
 const nextId = (list) => list.length> 0 ? Math.max(...list.map(i=i.id))+1 : 1
 
 //middlewares 

 //payload validation
 const validatePayload = (req,res,next)=>{
    if (!req.body || Object.keys(req.body).length === 0){
        return res.status(400).json({message: "Payload is empty"})
    }
    next()
 }
 function hasContent(str){
    return typeof str === 'string' && str.length > 0
 }
 const validateFields = (req,res,next)=> {
    const {title,description, instructor, category, credits, isElective} = req.body
    if (!hasContent(title) || !hasContent(description) || !hasContent(instructor) || !hasContent(category) || typeof credits !== 'number' || typeof isElective !== 'boolean'){
        return res.status(400).json({message: "Invalid payload"})
    }
    next()
 }
  const checkifExists = (req,res,next)=>{
    const data = getData()
    const id = parseInt(req.params.id)
    const index = courses.findIndex(course=> course.id === id)
    if (index === -1){
        return res.status(404).json({message: "Course not found"})
    }
    req.courses = courses
    req.index = index
    next()
 }
 //get all + filter
 app.get('/courses', (req,res)=>{
   try{
      let courses = getData()
      const {instructor,category, search } = req.query
      if (hasContent (instructor)){
         courses = courses.filter(course=> course.instructor.toLowercase() === instructor.toLowerCase())

      }
      if(hasContent(category)){
         courses = courses.filter(course => course.category.toLowerCase() === category.toLowerCase())
      }
      if (hasContent(search)){
         const lowerSearch = search.toLowerCase()
         courses = courses.filter(course=>{
            const strCourse = JSON.stringify(course).toLowerCase()
            return strCourse.includes(lowerSearch)}

         )
         res.json(courses)

      }
   }catch (err){
      res.status(500).json({message: "Error"})
   }
   
})
app.get('/courses/:id', checkifExists, async (req,res)=>{
   res.json(req.course[req.index])

})
app.put('/courses', validatePayload, checkifExists, async (req,res)=>{
   const {body, courses, index}=req
   const updatedCourse = {...courses[index], ...body, id: courses[index].id  }
   courses[index]= updatedCourse
   fs.writeFileSync("./courses.json", JSON.stringify(courses, null, 2))
   res.json(updatedCourse)
})
app.post 

