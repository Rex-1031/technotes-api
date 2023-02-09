const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

//@Desc Get all notes   
//@Route GET /notes
//@Access private

const getAllNotes = asyncHandler(async (req,res)=>{
    //get all notes from mongoDB
    const notes = await Note.find().lean()
    if(!notes?.length){
        return res.status(400).json({message: 'No notes found!'})
    }

    //Add the user(s) that are attached to the notes into the responese
    const notesWithUser = await Promise.all(notes.map(async (note)=>{
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username}
    }))
    res.json(notesWithUser)
})


//@Desc Create new Note
//@Route POST /notes
//@Access private
const createNewNote = asyncHandler(async (req, res)=>{
    const { user, title, text} = req.body

    //Data Confirmation
    if(!user || !title || !text){
        return res.status(400).json({ message: 'All fields are required'})
    }

    //Check for title duplicates
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title.'})
    }

    //Create and store new user
    const note = await Note.create({user, title, text})

    if(note){
        return res.status(201).json({ message: 'New note created'})
    }else{
        return res.status(400).json({ message: 'Invalid note for data received'})
    }
})

//@Desc Update note
//@Route PATCH /notes
//@Access private
const updateNote = asyncHandler(async (req,res)=>{
    const { id, user, title, text, completed} = req.body

    //Data Confirmation
    if( !id || !user || !title || !text || typeof completed !== 'boolean' ){
        return res.status(400).json({ message: 'All Fields are required'})
    }

    //Confirm note exists
    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({ message: 'Note not Found'})
    }

    //Check for title duplicate
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if(duplicate && duplicate?.id !== id){
        return res.status(409).json({ message: 'Duplicate note title'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})

//@Desc Delete Note
//@Route DELETE /note
//@Access private
const deleteNote = asyncHandler(async (req, res)=>{
    const { id } = req.body

    //Data confirmation
    if(!id){
        return res.status(400).json({ message: 'Note ID required' })
    }

    //Confirm note exists
    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({ message: 'Note not found'})
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports ={
    getAllNotes, 
    createNewNote,
    updateNote,
    deleteNote
}