const express = require ('express');
const fs = require ('fs');
const path = require ('path');

const app = express ();

app.use (express.json ());
app.use(express.urlencoded({extended:true}));

//Middlewares to check if book exists 

const checkIfBookExists = (req, res, next) => {
    const books = JSON.parse(fs.readFileSync("./books.json", {encoding:"utf-8"}));
    const id = parseInt(req.params.id);
    const bookIndex = books.findIndex(book => book.id === id);
    if(bookIndex === -1){
        return res.status(404).json({message: 
            "Book not found"
        })
    }
    req.books = books;
    req.bookIndex = bookIndex;
    next();
}
//payload validation middleware
const validatePayload= (req, res, next => {
    if (!req.body || Object.keys(req.body).length === 0){
        return res.status(400).json({message: "Paylod is empty"})
    }
    next();
})
//hascontent function 
function hasContent (str){
    return typeof str === 'string' && str.length>0 
} 

//get all books 

app.get("/books", async (req,res) => {
    try {
        let books = JSON.parse(fs.readFileSync("./books.json", {encoding:"utf-8"}));
        const { author, category, search } = req.query;

        if (hasContent (author)){
            books = books.filter(book => book.author.toLowerCase() === author.toLowerCase());
        }
        if (hasContent(category)){
            books = books.filter(book => book.category.toLowerCase() === category.toLowerCase());
        }
        if (hasContent(search)) {
            const lowerSearch = search.toLowerCase();
            books = books.filter(book => {
                const strBook = JSON.stringify(book).toLowerCase();
                return strBook.includes(lowerSearch);
            });
        }
        res.json(books);
       
    }
    catch (err){
        res.status(500).json({message: "Server Error"});
    }
});
//get book by id 
app.get("/books/:id", checkIfBookExists, async (req, res)=> {
    res.json(req.books[req.bookIndex]);
}) 
//update book by id 
app.put("/books/:id", validatePayload,checkIfBookExists, async (req, res) => {
    const  {body, books, bookIndex} = req;
    const updatedBook = {...books[bookIndex], ...body, id: books[bookIndex].id};
    books[bookIndex] = updatedBook;
    fs.writeFileSync("./books.json", JSON.stringify(books, null, 2 ));
    res.json(updatedBook);
});
//create a new book 
app.post("/books", validatePayload, async (req,res)=> {
    const {body} = req; 
    const books = JSON.parse(fs.readFileSync("./books.json", {encoding: "utf-8"}))
    const newBook = {...body, id: books.length > 0 ? books[books.length-1].id + 1 : 1};
    books.push(newBook);
    fs.writeFileSync("./books.json", JSON.stringify(books, null, 2));
    res.status(201).json(newBook);

})
//delete a book by id 
app.delete("/books/:id", checkIfBookExists, async (req, res) => {
    const {books, bookIndex}= req; 
    books.splice(bookIndex, 1);
    fs.writeFileSync("./books.json", JSON.stringify(books, null, 2));
    res.json({message: "Book deleted successfully"});
})

app.listen(9000, () => console.log("Server is running on port 9000"))
