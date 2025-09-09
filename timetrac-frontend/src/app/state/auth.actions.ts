export class Login {
    static readonly type = '[Auth] Login';
    constructor(public email: string, public password: string) {}
  }
  export class Register {
    static readonly type = '[Auth] Register';
    constructor(public email: string, public password: string) {}
  }
  export class LoadMe {
    static readonly type = '[Auth] Load Me';
  }
  export class Logout {
    static readonly type = '[Auth] Logout';
  }
  