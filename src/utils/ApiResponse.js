class ApiResponse {
  constructor(statusCode, success, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(statusCode, message, data = null) {
    return new ApiResponse(statusCode, true, message, data);
  }

  static error(message, data = null) {
    return new ApiResponse(false, message, data);
  }
}

export default ApiResponse; 