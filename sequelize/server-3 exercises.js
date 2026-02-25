//FS 
 const express = require('express')
 const fs= require ('fs')
 const sequelize = requiere ('sequelize')
 const mongoose = require('mongoose')

 const app = express()
 app.use(express.json())
 app.use(express.urlencoded({extended:true}))

 //fs 
function hasContent (str){
        return typeof str === 'string' && str.length>0 

}
 app.get('/courses',hasContent, async(re,res)=>{
    let books = JSON.parse(fs.readFileSync('./courses.json', {encoding: 'utf-8'}))
    const {q}= req.query
    try {
        if (hasContent(q)){
            books= books.filter(books=> books.title)

        }
    } catch (error) {
        
    }
 })
 /*Problem 2: Sequelize - The "Category Creation"

Task: Create a POST route /books using Sequelize.

The request body will contain: title, author, price, and categoryName (a string).

In your route, check if the Category exists in the database. If it doesn't, create it.

Then, create the Book and link it to the Category ID.

Return the new book with a 201 status code.*/
app.post('/books', async (req, res) => {
    const { title, author, price, categoryName } = req.body;
    try {
        const [category] = await Category.findOrCreate({ 
            where: { name: categoryName } 
        });
        const book = await Book.create({ 
            title, author, price, categoryId: category.id 
        });
        res.status(201).json(book);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
/**Problem 3: Mongoose - The "Toggle Logic"

Task: Create a PUT route /users/:id/toggle-status.

Find the user by ID.

Switch their isActive boolean value (if it's true, make it false; if false, make it true).

Save the document and return the updated user.

Ensure you handle the case where the ID format is invalid (CastError). */
app.put('/users/:id/toggle-status', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.isActive = !user.isActive;
        await user.save();
        res.json(user);
    } catch (e) {
        if (e.name === 'CastError') return res.status(400).json({ msg: "Invalid ID" });
        res.status(500).json({ error: "Server error" });
    }
});
