const crypto = require("crypto");

export const order_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "OR/"+idempotency_key.substring(1, 7);
};

export const locker_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "LO/"+idempotency_key.substring(1, 7);
};

export const dropbox_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "DR/"+idempotency_key.substring(1, 7);
};

export const locker_code_generator = () => {
  var code =  getRandomInt(0, 9999);
  if(code < 1000){
      return  ('0000'+code).slice(-4);
  }else{
      return code.toString();
  }
};