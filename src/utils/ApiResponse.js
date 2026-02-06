class ApiResponse {
  constructor(statusCode, success, message, data = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  // static success(statusCode, message, data = null) {
  //   return new ApiResponse(statusCode, true, message, data);
  // }

  // static error(statusCode, message, data = null) {
  // return new ApiResponse(statusCode, false, message, data);
}


export  {ApiResponse}; 