class ApiError extends Error {
    constructor(
        message="something went wrong", 
        statusCode,
        error =[],
        stack = ""       
        ) 
        {
        super(message);
        this.statusCode = statusCode;
        this.data = null;  
        this.message = message;
        this.error = error; 
        
        if(stack) {
            this.stack = stack; // custom stack trace
        } else {
            Error.captureStackTrace(this, this.constructor);
        } // to exclude constructor from stack trace
        
    }
}
export  {ApiError};
