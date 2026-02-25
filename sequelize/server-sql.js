const express = require('express');
const fs = require('fs');
const path = require('path');

const {Sequelize, DataTypes, Op} = require('sequelize');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
const conn = new Sequelize('books_db','root', 'root', {
    host: 'localhost',
    dialect: 'mysql', 
})
const Category = conn.define(
    'Category', 
    {
        name:{
            type:DataTypes.STRING, 
            allowNull: false,
            unique: true, 
        }
    }, { timestamps: false })
const Book = conn.define(
    'Books', 
    {
        title:{
            type:DataTypes.STRING,
            allowNull: false,
        }, 
        author:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        price:{
            type: DataTypes.FLOAT,
        }, 
        category_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {});

Category.hasMany(Book, {foreignKey: 'category_id'});
Book.belongsTo(Category, {foreignKey: 'category_id'});

async function fillInCategories(){
    try {
        const data = JSON.parse(fs.readFileSync('../books.json', {encoding: 'utf-8'}));
        const books = data.books || [];
        const categories = [...new Set(books.map(book => book.category))];
        for (const catName of categories){
            await Category.findOrCreate({where: { name: catName}})
        }

        
    } catch (error) {
        console.error('Error filling in categories:', error);
        
    }
}

conn.sync({force: true}).then(() => {
    console.log('Database synced');
    fillInCategories();
}).catch((error) => {
    console.error('Error syncing database:', error);
});

//CRUD operations for books

//check if exists middleware

const checkIfBookExists = async (req, res, next) => {
    const {id} = req.params; 
    try {
        const book = await Book.findByPk(id);
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

app.get('/books', async (req, res)=>{
    const {author,category,search}= req.query;
    try{
        const where={};
        const include = [
            {model: Category,
            attributes: ['name']
            }
        ];
        if(hasContent(author)){
            where.author = author;
        }
        if(hasContent(category)){
            include[0].where = { name: category };
        }
        if (hasContent(search)) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } }
            ];
        }
        
        const books = await Book.findAll({ where, include });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
})
//Get book by id 
app.get('/books/:id', checkIfBookExists, async (req, res)=>{
    res.json(req.dbBook);
})
//update book by id 
app.put('/books/:id', payloadCheck, validateBookFields, checkIfBookExists, async (req, res)=>{
    try {
        const { category, title, author, price } = req.body;
        
        // Find or create the category to ensure we have a valid ID
        const [catEntry] = await Category.findOrCreate({ where: { name: category } });
        
        await req.dbBook.update({
            title,
            author,
            price,
            category_id: catEntry.id
        });
        
        res.json(req.dbBook);
    } catch (error) {
        res.status(500).json({ message: "Error updating book" });
    }
});
