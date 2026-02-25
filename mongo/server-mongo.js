const express = require('express');
const moongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

moongoose.connect('mongodb://localhost:27017/books_db');

const bookSchema = new moongoose.Schema({
    title: {
        type: String, 
        required: true,

    },
    author:{
        type: String, 
        required: true,
        unique: true,

    }, 
    category:{
        type: String, 
        required: true,
        unique:true,
    

    },
    price:{
        type: Number,

    }

});
const Book = moongoose.model('Book', bookSchema);
module.exports = Book;

//CRUD operations for books

//check if exists middleware
const checkIfBookExists = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);    
        if (!book){
            return res.status(404).json({message: "Book not found"})
        }           
        req.dbBook = book;
        next();
    } catch (error) {
        return res.status(500).json({message: "Db error"})
    }

}
//payload validation middleware
const payloadCheck = (req, res, next)=>{
    if (!req.body  || Object.keys(req.body).length === 0){
        return res.status(400).json({message: "Payload is empty"})
    }
    next()
};
//hascontent function
function hasContent (str){
    return typeof str === 'string' && str.length>0 
} 

//validate fields middleware
const validateBookFields = (req, res, next) => {
    const { title, author, category, price } = req.body;    
    if (!hasContent(title) || !hasContent(author) || !hasContent(category) || typeof price !== 'number') {
        return res.status(400).json({ message: "Invalid or missing fields (title, author, category, price)" });
    }
    next();
}

//Get all books with filters

app.get('/books', async (req,res)=>{
    const {author,category,search}= req.query;
    try {
        const query = {};
        if (hasContent(author)){
            query.author = author;
        }
        if (hasContent(category)){
            query.category = category;
        }
        if (hasContent(search)) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ title: regex }, { author: regex }];
        }
        const books = await Book.find(query);
        res.json(books);
    } catch (error) {
        res.status(500).json({message: "Db error"})
        
    }

})
//Get book by id
app.get('/books/:id', checkIfBookExists, async (req,res)=>{
    res.json(req.dbBook)
})  
//Create a new book
app.post('/books', payloadCheck, validateBookFields, async (req,res)=>{
    const {title, author, category, price} = req.body;
    try {
        const book = await Book.create({title, author, category, price});
        res.status(201).json(book);     
    } catch (error) {
        res.status(500).json({message: "Db error"})
    }   
})
//Update a book 
app.put('/books/:id', checkIfBookExists, payloadCheck, validateBookFields, async (req,res)=>{
    const {title, author, category, price} = req.body;          
    try {
        await req.dbBook.update({title, author, category, price});
        res.json(req.dbBook);   
    } catch (error) {
        res.status(500).json({message: "Db error"})
    }
})
//Delete a book'
app.delete('/books/:id', checkIfBookExists, async (req,res)=>{
    try {
        await req.dbBook.delete();
        res.json({message: "Book deleted"})     
    } catch (error) {
        res.status(500).json({message: "Db error"})
    }
})



app.listen(9000, () => console.log("Server is running on port 9000"))