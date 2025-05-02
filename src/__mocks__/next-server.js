class NextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.init = init;
    this.headers = new Map();
  }

  static json(data) {
    return new NextResponse(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' }
    });
  }

  static next() {
    return new NextResponse(null);
  }

  get(name) {
    return this.headers.get(name);
  }

  set(name, value) {
    this.headers.set(name, value);
  }

  clone() {
    const response = new NextResponse(this.body, this.init);
    this.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

class NextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
}

module.exports = {
  NextResponse,
  NextRequest
}; 