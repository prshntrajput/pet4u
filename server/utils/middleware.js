// unknown route middleware
const unknownEndpoint = (req,res)=>{
   res.status(404).send({error:"invalid route"})
}

//error handler middleware
const errorHandler = (error,req,res,next)=>{
    if(error.name === "CastError"){
        return res.status(400).send({error:"cast error or malfunctioned id"})
    }else if(error.name === "validation error"){
        return res.status(400).send({error: "validation error"})
    }
    next(error)
}

module.exports = {
    unknownEndpoint, errorHandler
}